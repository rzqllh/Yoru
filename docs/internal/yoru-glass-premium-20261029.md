# Yoru premium player and interface — design contract

**Owner decisions (2026-10-29):** Glass premium, dedicated watch screen, embedded video as explicit fallback, unified subtitle controls, local SRT/VTT upload, simplified source labels, cinematic hybrid catalog, Yoru-owned mobile controls. Earlier architecture Q1–Q12 is retained unless these UI decisions supersede it.

**Implementation approach:** Keep the existing React/Vite/Hono stack and native HLS/MP4 engine. Turn its full-screen player view into a Yoru-branded watch surface, with accessible custom transport/seek/volume controls that work on touch and keyboard. Browser native fullscreen is a deliberate fallback on iOS. Do not attempt to customize cross-origin embedded iframe internals: embed remains a clearly identified alternate mode, with unavailable capabilities explained in a consistent Yoru panel rather than silently hidden.

**Subtitle behavior:** Keep external provider fetching server-side, preserve saved language/Off and per-anime timing. Add safe, size-limited per-session SRT/VTT upload into an object URL for native playback; never upload file bytes to Yoru APIs or persist as a cross-episode track. On embed show subtitle options as unavailable rather than pretending Yoru controls third-party playback. Validate VTT and SRT input; do not render markup as HTML.

**Visual:** Retain current branding (dark base + lime accent) with restrained frosted panels, high-contrast controls, responsive card/hero layout, 44px touch targets, reduced-motion support. Prioritize legibility over heavy blur. Language is nontechnical and positive; detailed diagnostics stay out of the viewing flow.

**Verification:** RED/GREEN tests for subtitle parser, Chromium + WebKit tests for transport/subtitles/embedded fallback, CI lint/typecheck/build/smoke, Vercel PREVIEW deployment (no production), release gate #20 stays open. Real subtitle credentials, real video availability and physical iPhone Safari remain externally blocked.
