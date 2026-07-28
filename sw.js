/* Street Tag service worker — offline app shell, live map tiles with cache fallback */
const CACHE = "streettag-v4";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
];
const TILE_CACHE = "streettag-tiles-v1";
const TILE_LIMIT = 400; // ~ a neighborhood's worth of tiles

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== TILE_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

async function trimTiles(){
  const c = await caches.open(TILE_CACHE);
  const keys = await c.keys();
  if (keys.length > TILE_LIMIT){
    for (const k of keys.slice(0, keys.length - TILE_LIMIT)) await c.delete(k);
  }
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Map tiles: network-first so the map stays fresh, cached copy if offline
  if (url.hostname.endsWith("tile.openstreetmap.org")){
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(TILE_CACHE).then(c => c.put(e.request, copy)).then(trimTiles);
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // App shell + libraries: cache-first, network fallback
  if (e.request.mode === "navigate"){
    e.respondWith(
      caches.match("./index.html").then(hit => hit || fetch(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && (url.origin === location.origin || ["cdnjs.cloudflare.com","cdn.jsdelivr.net","unpkg.com"].includes(url.hostname))){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
