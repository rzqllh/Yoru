# Yoru Glass Premium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Yoru's catalog and playback feel like one polished native application while retaining real provider availability semantics.

**Architecture:** Preserve existing React/Hono engine. Add browser-only local subtitle parser, integrate custom playback transport, consolidate subtitle menu and embedded fallback, add responsive glass design language.

**Tech Stack:** React/TypeScript, Vite, Hono, hls.js, Playwright, Node.js tests.

**Spec:** docs/internal/yoru-glass-premium-20261029.md

## Tasks
- [ ] 1. Add RED unit tests for strict SRT/VTT parser (valid conversions, size, type, unsafe markup); verify red on CI; implement `frontend/src/lib/local-subtitles.ts` and verify green.
- [ ] 2. Add browser RED assertions for first-party playback controls, subtitles upload, and embed fallback; implement `Player.tsx` playback state and UI; verify Chromium/WebKit.
- [ ] 3. Implement token-led glass style in `frontend/src/styles.css` (hero, cards, modal, responsive player, focus and motion); refine viewer-facing labels in App.
- [ ] 4. Run full CI lint, TS check, unit, build and browser E2E; fix regressions, inspect diff, deploy protected Vercel Preview from feature branch. Never merge to production/main or promote without release gate.
