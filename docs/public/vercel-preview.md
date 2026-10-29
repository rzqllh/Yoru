# Yoru on Vercel — Preview

This is a full-stack **preview**, not the final public streaming release.

## Runtime

- React/Vite PWA is built into `frontend/dist` and served as static CDN assets.
- All `/api/*` requests are routed into a Node.js Vercel Function running the existing Hono application.
- Local development remains `npm run dev`; local production remains `npm start`.
- `npm run check` must pass before creating a preview from this branch.

## Environment

Basic metadata browsing, search, library, offline demo player, and source diagnostics need no additional API key.

Provider integrations are opt-in: `SUBDL_API_KEY`, `SUBSOURCE_API_KEY`, `OPENSUBTITLES_API_KEY`, `OPENSUBTITLES_ACCESS_TOKEN`, and `MIRURO_API_BASE`. Store credentials in Vercel server-side environment variables and never expose them through `VITE_*`.

Set a persistent, high-entropy `YORU_SUBTITLE_SIGNING_SECRET` **before enabling subtitle downloads**. Never rely on per-instance fallback signing secrets in production. Missing provider credentials mean those providers remain unavailable, not that they have been tested.

Local \`configs/providers.local.json\` and \`configs/stremio.local.json\` are gitignored and **not** included in Vercel deployments. For explicitly approved Stremio-compatible HTTPS addons, set the optional server-side \`STREMIO_ADDONS_JSON\` environment variable containing the same validated shape as \`configs/stremio.local.json.example\`: an \`addons\` array with \`id\`, \`name\`, HTTPS \`manifestUrl\`, and explicit \`anime\` entries mapping MAL ID, addon media ID, season and available episodes. Keep provider credentials out of this variable unless the addon explicitly requires them and a separate credentials review has been completed.

Yoru supports the standard Stremio \`/stream/series/...\` and \`/subtitles/series/...\` resource paths **for explicitly mapped anime episodes**. Remote subtitle files must be on public HTTPS hosts, use SRT/VTT/ASS/SSA extensions, pass DNS pinning and bounded download validation, and be converted to WebVTT before browser playback. This is not automatic subtitle-addon discovery, Nuvio QuickJS plugin support, or proof that a particular subtitle file exists. Subtitles are never dubbed or automatically translated. The separate configured providers SubDL/OpenSubtitles/SubSource remain opt-in.

## Release gates

This preview does **not** close issue #20. Validate: `/api/health`, catalog routes, deep links, service worker and demo media; separately verify real video streams, provider credentials/subtitle download, device Safari, traffic limits, and deployment observability before production release.

Do not deploy the `main` branch to production without an explicit owner release decision.
