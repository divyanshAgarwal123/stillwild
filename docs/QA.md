# Local validation

Validated at 2026-11-07T20:14:25.911Z against http://127.0.0.1:5173/ in isolated headless Chrome, at 1× device scale. All browser contexts and recording streams were closed. A fresh HTTP request after browser closure returned **200**. The existing operator-started server was reused and left running.

- Production build: passed (TypeScript + Vite).
- Unit tests: 4 passed, 0 failed.
- Browser acceptance groups: 24 passed, 0 errors.
- Final focused touch fullscreen check: passed; return button stays visible after the desktop hint fade duration and tap exits correctly.
- Desktop viewports: 1440 × 1100 (garden), 1440 × 1250 (rain). Mobile/touch: 390 × 844.

Coverage includes both scenes and all presets; real paper/cloud pointer hit tests; size, rotation, and keyboard movement; moving light/cast-shadow pixel changes; palettes, rain/pigment/wind; pause/resume and zero continuous redraws while paused/reduced; system reduced motion; reset/undo; reload persistence; invalid-link recovery; new-tab frozen composition and preview equality independent of local play; native fullscreen/Escape; real touch events and no mobile horizontal overflow; artwork-only 4K exports.

## Export checks

Both original/shared pairs are real 3840 × 2160 PNG files with identical SHA-256 hashes. The renderer used for the canvas also produces the exports. The saved images were inspected as downscaled review copies.

| Scene | SHA-256 of original and shared PNG |
| --- | --- |
| Shadow Garden | abc3163aa6ba879e0f79700af929a188b3892ad1f33f71a5a8c6f8a4bf2272f3 |
| Rainprint | fbafaea2052c725ae5785640077346ee3c35266bda94676115199f4c95869ce3 |

Reports, screenshots, exports, five deterministic motion frames per scene, and three-second artwork-only WebM replays are under `.asyncly/visual-captures/`. `evidence-manifest.json` lists absolute evidence paths. `motion-replay.html` provides once-per-play review videos. Screenshot review reused unchanged studio presentation after the final touch-only fullscreen rule; the changed touch wallpaper has its own fresh capture.

## Boundaries

Native desktop hosts (including Plash/Lively) and non-Chromium browser engines were not tested. No native compatibility claim is made. The Asyncly implementation task did not submit an entry or publish a deployment. Its supervising Codex session published the same static application at https://stillwild-studio.divyansh104agarwal.chatgpt.site/ and verified both scenes, the public share-link origin, and restoration of a frozen shared composition. Sites reports public access and successful deployment. No hackathon entry has been submitted. `.openai/hosting.json` remained unchanged (SHA-256 e6ebdfb66856f275dfddd32d12de8ec70308377c2ac5736a720097883071e381).
