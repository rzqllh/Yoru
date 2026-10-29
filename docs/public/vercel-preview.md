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

Local `configs/providers.local.json` and `configs/stremio.local.json` are not deployment configuration. In Vercel, the gitignored local JSON files are not present; do not assume local Stremio mappings work in hosted previews. Any future hosted mapping mechanism requires a separate change with threat-model review.

## Release gates

This preview does **not** close issue #20. Validate: `/api/health`, catalog routes, deep links, service worker and demo media; separately verify real video streams, provider credentials/subtitle download, device Safari, traffic limits, and deployment observability before production release.

Do not deploy the `main` branch to production without an explicit owner release decision.
