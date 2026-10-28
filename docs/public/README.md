# Yoru — Quick start

Run `npm install`, `npm run check`, then `npm run dev`. Open http://127.0.0.1:5173.

Watchlist and resume use browser IndexedDB. To check playback without any anime source, open Settings → Test player for the bundled original HLS clip and Indonesian sample captions. To play anime, create `configs/providers.local.json` from the example and provide valid HTTPS media URLs and MAL/episode IDs.

For a service-worker PWA, run `npm run build && npm start`; open the local site, then install from the browser UI. Browser local HTTP may count as a secure context; a remote iPhone requires HTTPS when not using localhost.

Build and iOS playback have not been verified on the original development environment. Read the root README for the manual verification checklist.
