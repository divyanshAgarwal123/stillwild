# Stillwild v3 local acceptance

Completed locally on 8 November 2026 (Asia/Kolkata). Individual reports use UTC timestamps. Preview: **http://127.0.0.1:5173/**. Source: `/Users/divyanshagarwal/Asyncly/Projects/My-Project-9d99088f/project-files`.

## Result and scope

All required v3 stages are implemented: three photographic directions; private imports; layered transforms, blending, grading and visibility masks; localized image flow and freeze tools; timeline/camera/weather; IndexedDB projects and portable files; frozen links; silent video export; optional sound; fullscreen and touch layout. Classic remains available with v1/v2 data and links.

The original v3 acceptance checks passed **20 unit tests**, **36 v3 browser acceptance groups**, the **27-group Classic regression suite**, the production build and whitespace checks. Additional image-budget, transparent-PNG, hidden-export, decoded-video and real-time gallery checks passed. These are local agent-run checks and inspected evidence, not a claim of Asyncly host verification or deployment.

| Runner / evidence | Coverage |
| --- | --- |
| `npm test` | Classic schema/migration/recovery; v3 links, bounds, guide IDs, localized motion and WebM duration metadata |
| `scripts/verify-v3.mjs` / `browser-report.json` | 16 groups: editor/layers/type/shapes, masks/history, locked-layer selection, pins/freeze, 15 actual grade changes, save/reload, sharing, private file round-trip, invalid imports, fullscreen, motion/visibility, audio and old links |
| `scripts/v3-render-checks.mjs` / `render-report.json` | 5 groups: localized warp/freeze, masked grade, fallback, loop boundaries/weather, 4K link/export parity, reduced motion, encoder failure/cancel cleanup, real UI video export |
| `scripts/v3-edge-checks.mjs` / `edge-report.json` | 9 groups: 1280×720 fit, failed-photo retry, concurrent import edit, A/B image isolation, file/pixel/budget guards, quota failure, 390px touch/history, touch pin/freeze and fullscreen exit |
| `scripts/v3-final-checks.mjs` / `final-report.json` | 6 groups: scrub/render parity, transformed mask coordinates, reduced sharing, measured mixer channels/silence, finite video seeking and export-unmount cleanup |
| `scripts/v3-image-bounds.mjs` / `image-bounds-report.json` | Actual 5000×3000 JPEG downsampling, final MIME/size bound and exact portable round-trip, including an untyped genuine image |
| `scripts/v3-alpha-hidden-check.mjs` / `alpha-hidden-report.json` | Transparent PNG blends to the expected RGBA values; hiding an active export cancels and ends its tracks |
| `scripts/v3-still-recheck.mjs` / `still-recheck-report.json` | Post-hardening fresh 4K exports match fresh shared projects in all directions; pixel differences from earlier evidence are recorded |
| `scripts/v3-video-proof.mjs` / `video-proof.json` | Full FFmpeg decode, ffprobe dimensions/duration/frame count, monotonic timestamps and distinct sampled frames |
| `scripts/v3-motion-gallery.mjs` / `motion-gallery-report.json` | Five distinct frames and a three-second real-time replay for each direction; final desktop/mobile screenshots |
| `scripts/verify-v2.mjs` / `../v2/browser-report.json` | 27 Classic groups, including corrupt-v2/valid-v1 recovery, all themes, old links, real touch, audio, frozen PNG parity, reduced storm and bounded caches |

Reports and captures are in `../.asyncly/visual-captures/v3/`. `build.log` and `unit.log` retain the final command results. No test skips, expected-failure annotations or automatic retries were added.

## Visible adjustments and motion

The grade checks compare frozen, neutral-rendered photo pixels with an extreme setting, without animation as a confounder. Mean absolute RGB change is measured on a 0–255 scale; area is the fraction changing by more than eight RGB levels. Representative results:

| Adjustment | Mean change | Changed area |
| --- | ---: | ---: |
| Exposure +2 | 108.44 | 99.83% |
| Contrast +100 | 35.84 | 95.48% |
| Highlights +100 | 29.92 | 69.59% |
| Shadows +100 | 68.49 | 86.25% |
| Saturation −100 | 7.14 | 24.36% |
| Temperature +100 | 30.37 | 100% |
| Hue +100° | 10.26 | 74.61% |
| Blur 20 | 6.42 | 27.98% |
| Sharpness 100 | 2.10 | 5.73% |
| Vignette 100 | 32.05 | 62.49% |

`grade-magnitudes.json` includes all 15 controls. [Exposure](../.asyncly/visual-captures/v3/exposure-comparison.jpg) and [color](../.asyncly/visual-captures/v3/color-comparison.jpg) sheets show before on the left and after on the right. Main changes are visibly substantial, not accepted on a hash difference alone.

With weather and camera disabled, the strong-flow fixture changes its moving region by **26.73/255** on average across **82.71%** of the region. The painted freeze core and distant edge both change by **zero**. [Motion comparison](../.asyncly/visual-captures/v3/motion-comparison.jpg) shows the same photograph at 0s and 2s. Its deliberately high deformation setting demonstrates the tool; curated defaults are quieter. A masked bright duplicate changes the revealed left sample by zero and the graded right sample by **111.76/255**.

The native renderer is exactly equal at 0 and one full duration. Adjacent samples immediately before/after the boundary were also compared, rather than relying on phase modulo equality alone. The strong-flow fixture’s boundary mean is 0.88/255. Dust follows a periodic path; rain, fog and rays have bounded adjacent-boundary differences recorded in `render-metrics.json`.

Real keyboard scrubbing to 0.25s matches the displayed canvas and a fresh renderer pixel for pixel (844×475, mean difference zero). At 150% canvas zoom with width .71, height .83 and rotation 24°, painting the intended local coordinate (.6, .45) records (.600000012, .450000025). The runner waits for and asserts the stored transform before computing that target.

## PNG and video

All three 4K PNGs are exact **3840×2160**, were inspected through 1600px review copies, and contain artwork without controls or guides. Each representative built-in link recreates an identical PNG in the tested renderer:

| File | SHA-256 |
| --- | --- |
| `nature-4k.png` | `e48e1de79fd2607eee1bf9eabbf4ce0189b49c440f8da8455e8613c33f100042` |
| `urban-4k.png` | `9bb447b0c1a6fc192a630097d03abf2e125830f8929c0ff8deb399a954f8ad70` |
| `editorial-4k.png` | `d77d3c083089e734efa22a7717a7526b5dcb26bb9be3c102fcf150b39c16a297` |

After straight-alpha decode hardening, fresh forest/urban PNGs retain their earlier bytes. Editorial changes two pixels by a total of three channel levels in the 8.29-million-pixel output; the replacement was captured and its fresh share matches exactly. The earlier cross-version hash assertion was replaced with current/share parity plus an explicit old/new pixel comparison, rather than treating different revisions as identical.

The urban PNG deliberately uses a rotated, non-uniform frame/crop to stress composition parity. It is not the untouched urban preset. Native image cover crop uses layer-world aspect, and buffer resolution caps share one scale factor. All three output sizes use 16:9. Classic 1080p/1440p and all-family 4K outputs passed too.

The actual UI-exported `urban-4s-1080p-silent.webm` is **VP9, 1920×1080, 4.000 seconds, 96 decoded frames**. FFmpeg decoded every frame. Six sampled frames are valid and distinct. Packet timestamps increase monotonically; real-time encoding has small scheduling variation rather than an offline constant timestamp cadence. The decoded loop-edge mean difference is 1.59/255; the native cyclic renderer has an exact endpoint match. WebM duration metadata is finite and browser seeks at .1, 1.1, 2.1 and 3.8 seconds produce four distinct frames. No audio track is included.

[Replay gallery](../.asyncly/visual-captures/v3/motion-replay.html) contains real-time three-second captures for all directions and the exported loop. Replays do not autoplay or loop indefinitely. Encoder unsupported/constructor-failure probes, cancellation, hidden-tab cancellation logic and unmount cleanup retain the PNG alternative and release recording tracks. The constructor-failure and cancellation probes read back `ended` tracks; unmounting a live UI export also leaves only ended tracks.

## Persistence, private files and sound

A genuine private JPEG import survives reload. Its portable file embeds the stored bytes and restores them with the same SHA-256. An A/B test deliberately imports a second, different photo under A’s identifier: import assigns fresh image/project IDs, B gets the new bytes, and named A retains its original coast bytes. Corrupt JSON, disguised SVG, excessive file size/pixels, 11 private assets, an oversized processed blob and excessive aggregate portable size are rejected before replacing work.

A 6,191,251-byte, 5000×3000 noisy JPEG fixture becomes a **4096×2458 WebP, 7,374,692 bytes**, and a 9,834,401-byte portable project. The processed image remains below 16 MB and returns byte for byte through import. Empty MIME on genuine data is normalized; that case round-trips too. Every accepted project is checked against its complete 48 MB portable budget before saving. Decoded dimensions receive a second bound check after header validation.

A decode-time project edit rejects the stale import; the newer name and layers survive reload. Import writes and autosaves are serialized. Injected IndexedDB write failure is visible in the save status and recovers after restoring storage and making another edit. Browser storage remains device-local and can be cleared; portable backup is the recovery path.

In the normal React StrictMode development app, each mixer channel produces measured output: representative RMS values are rain .0200, air .0456 and tone .0197. Master zero is below .0001; hidden audio is suspended with zero measured RMS; Stop leaves zero nodes and no context. Mute, rapid toggles, reload sound-off and [a one-second WAV capture](../.asyncly/visual-captures/v3/ambient-audio-v3.wav) were checked. Sound does not become enabled from imported data or links. Artwork pause and sound remain independent.

## Screens and fixes during acceptance

Final reviewed screenshots: [forest](../.asyncly/visual-captures/v3/nature-desktop.jpg), [urban](../.asyncly/visual-captures/v3/urban-desktop.jpg), [editorial](../.asyncly/visual-captures/v3/editorial-desktop.jpg), [390px mobile](../.asyncly/visual-captures/v3/nature-mobile.jpg), [touch editing](../.asyncly/visual-captures/v3/mobile-touch.jpg) and [short desktop](../.asyncly/visual-captures/v3/desktop-1280x720.jpg). The canvas/label fits between the toolbar and timeline at 1280×720. Touch fullscreen has a visible exit and no editing guides.

Earlier checks exposed issues that were repaired: a Retry click intercepted by the artboard pointer handler, weak maximum dust visibility, streaming WebM without finite Duration, import/autosave races, and a legacy hover color leaking into dark editor controls, and premultiplied transparent image pixels darkening twice. The corrected straight-alpha path composites half-transparent red over blue to [128, 0, 127, 255], with fully transparent pixels leaving [0, 0, 255, 255]. The rotated-mask test initially read stale debounced storage; it now waits for Saved and asserts the transform, without changing correct production coordinates. Classic runner URLs now explicitly select Classic. One Classic run overlapped a source hot reload and lost gesture history; the completed frozen-source rerun passed all 27 groups. These earlier attempts are not reported as final passes.

## Boundaries

Verification used local headless Google Chrome on macOS, WebGL and forced Canvas fallback, plus browser touch emulation through real browser input events. Physical iOS/Android devices, Safari, Firefox, cross-GPU pixel identity and MP4 encoding on other engines were not tested. The fallback’s grading is an approximation of the accelerated path; parity is asserted within the tested renderer, not across unrelated GPU/browser implementations. Maximum-layer projects can encode more slowly on weaker hardware; MediaRecorder targets 24 fps in real time.

There is no semantic segmentation, hidden-background reconstruction, PSD compatibility or physical relighting. User imagery stays local. Video is deliberately silent. Native wallpaper-host integration remains future and untested. Photo/source dimensions and reused/generated assets are disclosed in README, PHOTO_ASSETS and V3-BUILD. `.openai/hosting.json` still hashes to `e6ebdfb66856f275dfddd32d12de8ec70308377c2ac5736a720097883071e381`. No deployment, entry submission, terms acceptance or account/native-host setup occurred.

## Final cycle consistency correction

Resolved locally on 8 November 2026. `normalizeCycleCount()` now rounds and clamps Motion cycles and all weather cycle counts to integers 1–4 before they enter live preview state. Saved/shared validation uses the same helper. Other controls and the accepted design are unchanged.

Fresh checks after this correction:

| Check | Result |
| --- | --- |
| `npm test` | 21 passed; fractional values, bounds, invalid inputs and validator/link consistency covered |
| `node scripts/v3-cycle-checks.mjs` | 5 browser groups passed |
| `npm run test:e2e:render` | 5 groups passed; all three 4K share/export pairs match within each render run |
| `npm run test:e2e:final` | 6 groups passed; scrub pixels, rotated mask coordinates, reduced sharing, audio cleanup, seeking and export unmount checked |
| `node scripts/v3-video-proof.mjs` | Full decode passed: 1920×1080 VP9, 4.000s, 96 frames |
| `npm run build` | TypeScript and Vite production build passed |

The targeted runner uses actual browser number-input edits, with no production state injection. Pasting `1.5` shows `2` in the number and range controls **before blur** for Motion, rain, fog, dust and rays. At 2s/8s, the live canvas matches a fresh renderer of saved data exactly (mean difference zero). A new-tab share opens paused with identical settings and pixels; reload retains them. The fractional-input fixture’s original and shared 3840×2160 PNG hash is `ecc8128975097136e1a9c84eae91e616dab96198cabdd8ddc9e007d36d5d3673`.

Boundary checks cover motion, each weather type and their combination at every integer count 1–4, comparing 7.99s with 0.01s as well as exact endpoints. Maximum adjacent-boundary mean RGB difference is **1.284/255**; exact endpoints match. Five distinct live frames and a three-second production-speed replay provide motion evidence.

[Targeted report](../.asyncly/visual-captures/v3/final-fix/cycle-report.json) · [Motion control screenshot](../.asyncly/visual-captures/v3/final-fix/motion-cycles.jpg) · [Weather controls](../.asyncly/visual-captures/v3/final-fix/weather-cycles.jpg) · [Boundary samples](../.asyncly/visual-captures/v3/final-fix/loop-boundaries.jpg) · [Motion replay](../.asyncly/visual-captures/v3/final-fix/motion-replay.html). The replay plays once per activation. Logs and the correction evidence manifest are in the same directory.

The latest render report records nature `e48e1de79fd2607eee1bf9eabbf4ce0189b49c440f8da8455e8613c33f100042`, urban `9bb447b0c1a6fc192a630097d03abf2e125830f8929c0ff8deb399a954f8ad70` and editorial `ecfe048ad5d30b65f89c2b88bd0f279725eb7cd8fe54d20c19b7c34d669d8f6e`. These identify this run’s files; the earlier accepted editorial hash above remains historical evidence. Each fresh original/share pair matches exactly. Fresh outputs were inspected through 1600px JPEG copies.

Classic code is unchanged; its accepted 27-group report is retained, not claimed as a fresh run. Earlier photo reports are copied to `final-fix/accepted-reports/` before the render/final reruns. After this handoff, the supervisor regenerated the MP4 review copy from the newly exported WebM. The application’s tested output is WebM; no browser-native MP4 claim is made.

The existing preview remains at **http://127.0.0.1:5173/**. `.openai/hosting.json` retains SHA-256 `e6ebdfb66856f275dfddd32d12de8ec70308377c2ac5736a720097883071e381`. No deployment or submission occurred.
