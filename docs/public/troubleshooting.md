# Troubleshooting and Safe Recovery

Use this runbook before opening an issue. Record the exact commit, browser/OS, sanitized symptom, reproduction steps, relevant HTTP status and whether the issue occurs with the local demo. **Never share API keys, protected stream URLs, subtitle grants or complete private backups.**

## Application does not start

1. Confirm `node --version` is 22.12+ and `npm ci` succeeds without modifying the committed lockfile.
2. Run `npm run check` to distinguish lint/typecheck/unit/build failures.
3. Run `npm run dev` for development or `npm run build && npm start` for local built mode.
4. Verify `http://127.0.0.1:8787/api/health` when using `npm start`. Port conflicts and Node errors should be fixed before investigating the browser.

## Catalogue missing or search fails

Check browser network diagnostics for `/api/anime/*` failures. External metadata systems may return errors, rate limits or incomplete mappings. A blank provider response is different from an upstream request failure; record the status but do not claim an anime is globally unavailable.

## Video fails to play

- First try the shipped demo fixture. If the demo works, inspect the **configured source**, not the app installer.
- Confirm the exact season/episode mapping and whether the candidate is directly HTTPS HLS/MP4.
- Check browser console/network for CORS, codec, MIME, certificate, expired signatures, missing HLS segments or blocked redirects.
- If an addon returns only `infoHash`, it is torrent metadata and cannot be passed as an MP4/HLS URL.
- External iframe success cannot be inferred from the existence of an embed URL. Fallback must stay opt-in.

## Subtitles missing, styled incorrectly or out of sync

Confirm the track really belongs to the selected episode, edition and media release. A provider API key marked configured does not prove search/download health. Ensure WebVTT requests succeed and check native browser styling limitations; hardsubs and third-party iframes cannot use native subtitle styling. HTTP 429 implies request budget exhaustion; honor `Retry-After` and inspect gateway limits.

## Local library, resume or offline shell

Progress lives in browser IndexedDB. Before clearing caches, site storage, PWA data or upgrading across devices, **export a backup**. Offline shell support does not cache or authorize all media. Browser private mode or storage eviction may erase progress. Import must validate schema and report errors rather than overwrite silently.

## Hosted preview issues

A READY deployment does not establish that its Git SHA matches the latest branch. Confirm exact deployment SHA, authenticated HTTPS API health, SPA deep-link rewrites and active preview access restrictions. Vercel quota failures (including HTTP 402 on free plans) require an operator decision, not bypassing protections.

## Escalation

For suspected security incidents, avoid public disclosure of exploit details and use the operator's approved private security channel. For correctness defects, file a sanitized issue with expected/observed states, affected version and reproduction. See [Operations](operations.md), [Security](security.md) and [Quality gates](quality-gates.md).

## Hosted catalog: distinguish routing from upstream failure

Check the deployment's Git SHA first. A READY build from before the API adapter was added cannot prove the current catalog works. `/api/health` must return HTTP 200 JSON with `service: anime-pwa-api` and `version: 1`; this verifies the API, not Tenrai or video providers. A 404 or HTML response indicates a missing function/rewrite, wrong project root or stale deployment. Check `vercel.json` routes `/api/:path*` to `/api/index?__yoru_route=:path*` before the SPA fallback.

Only after health succeeds, inspect `/api/anime/discover?kind=top&page=1`. It must return actual `items`, numeric `page` and boolean `hasNext`. HTTP 503 means catalog upstream failure or an invalid upstream payload; a valid empty result is different. The server does not cache failed/malformed responses, and the client ends stalled requests after 18 seconds so retry remains available. Direct Tenrai reachability from a workstation does not prove reachability from Vercel.

After the deployment quota permits an explicitly requested preview, first confirm its immutable URL and exact Git SHA in Vercel, then run:

```bash
node scripts/verify-hosted-catalog.mjs https://EXACT-DEPLOYMENT.vercel.app
```

This read-only command checks the shell, API and a nonempty metadata sample; it creates no deployment and never retries. Protected previews require authorized access through Vercel tooling; do not disable protection to make this script pass. A protection response is BLOCKED, not a catalog failure. A successful metadata check does not verify streams/subtitles or release gate #20.
