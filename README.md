# Street Tag

Mobile-first GPS tag game. Pick an avatar, share a game code with friends, and hunt each other down on a realtime map. Get within tag radius (adjustable, default 10 ft), hit the TAG button, run. Tagged players get 15s of safety. **First to 10 tags wins.**

## Play
Open the site on your phone, allow location, and use the same game code as your friends. Play outdoors — phone GPS accuracy is ~15–30 ft, so a 30 ft+ radius is recommended.

No GPS? Practice mode gives you three bots and tap-to-run movement.

## Notes
- Single static HTML file, Leaflet + OpenStreetMap tiles
- Multiplayer sync uses `window.storage` (Claude artifact API) — for standalone hosting, swap the `store` object for your own backend (a small WebSocket relay or Firebase both work)
