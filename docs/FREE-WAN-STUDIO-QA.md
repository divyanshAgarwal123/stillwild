# Free Wan studio upgrade — local acceptance

Application source is frozen for supervisor testing and publication. The checked source digest is `3bead0a3274254fd6a4ffbfbb06489f5c4732b6e995307f7729ab5d7ef873c6e`. The frozen file inventory and evidence live under `.asyncly/visual-captures/free-wan-studio/`.

The default AI option is Free Wan. Google remains an explicit paid alternative. The studio now prepares the correct padded 832 × 480 crop, uses the official Gradio SDK, waits for explicit insertion, fits whole source repeats to the project, and offers reversible source-frame blending with an explicit FPS control. No existing project format was replaced. Missing new fields retain old manual timing and rendering.

## Verified locally

| Check | Result | Evidence |
| --- | --- | --- |
| Unit tests | 48 passed, none skipped | `unit.log`; `tests/wan.test.mjs` adds provider, cancellation, bounds, timing, migration and interpolation cases |
| New provider/UI checks | 11 groups passed | `browser-report.json` |
| Real Wan pixel/media checks | 6 groups passed | `media-report.json`, `pixel-metrics.json` |
| Padded source framing | 4 transformed/cropped aspect cases passed | `framing-report.json` |
| Existing photo regressions | 16 main + 9 edge + 5 render + 6 final-media groups passed | `regressions.json`, corresponding logs |
| Production build | Passed | `build.log` |
| Sites identity | SHA-256 equals HEAD | `.openai/hosting.json`: `e6ebdfb66856f275dfddd32d12de8ec70308377c2ac5736a720097883071e381` |

The existing render suite ran before its dependent final-media reader. No Classic implementation changed, so its full standalone suite was not repeated. The photo regression still checks legacy-link entry and switching without rewriting old work.

## Provider and data handling

Browser tests use the actual installed `@gradio/client@2.7.2` with intercepted transport and the saved official Gradio 6.1.0 / `sse_v3` config and endpoint schema. They exercise `/config`, `/gradio_api/info`, JPEG upload, one queue submission, SSE status/data, media download, cancel/reset and cleanup. The exact nine positional inputs use 6 steps, guidance 1/1, seed 1708 and no randomization. All four duration choices, including 0.5s, are validated; 4s remains the default.

Fetch inspection checks `credentials:omit`, absence of authorization, and SDK stream aborts after success, provider switch and component unmount. The instance wrapper merges existing SDK request signals with the app signal. Cancel/reset keep a separate bounded signal and omit credentials. Browser storage checks found neither the test-only Google key nor SDK generation history. No source/prompt history is recorded by the SDK.

The UI suite verifies double-click prevention, explicit Add, real decoded preview, grade/mask/transform, undo/redo, selected-video reload, portable field retention and exact source SHA. A result keeps its original provider label after switching. Pending generation preserves newer project edits. Quota errors are redacted and never resubmit. Decode and simulated storage failures leave the original bytes downloadable and keep the project intact. The 390px touch controls and quick-check CTA were inspected in separate top/bottom panel captures. Optional Google generation/insertion passes mocked REST and retains manual timing with unknown FPS.

These are **mocked transport checks**, not a new live Wan generation. This task submitted no live jobs or uploads, used no real credentials, and consumed no provider quota. The supervisor reports that upload/queue/status CORS preflights passed for the deployed origin. That report is distinct from the local intercepted transport tests. The supervisor owns the one finished-UI live request and publication; its result is pending in this note until reported.

## Timing, pixels and memory

Fit first normalizes project phase, then derives an integer number of source repeats nearest the preferred speed. This avoids floating-modulo errors at exact project ends for fractional spans such as 0.3s and 0.7s. Units cover exact and nearby endpoints at 4/8/12s, changed trims/crossfades and legacy manual semantics. A crossfade of zero still permits a visible content jump in arbitrary footage.

Real forest and street fixtures are the supervisor's earlier anonymous Wan results in `.asyncly/visual-captures/free-wan-api/`. They were reused locally; none were added to public/tracked assets. Their known cadence is 16fps, with native 832 × 480 detail. The older saved forest project initially has unknown FPS in the new control. Explicitly choosing 16fps enables blending without rewriting other settings.

At 320 × 180, actual decoded adjacent-frame blending has a mean error of **0.165/255** from the arithmetic intermediate image. Sampling one second at the 24fps studio cadence produced **8 repeated adjacent samples without blending and 0 with it**. This establishes temporal blending, not reconstructed detail or optical flow.

At trim 0..4, both real clips' blended tails match included frame 63 exactly (MAD 0). The excluded frame 64 at 4.0s cannot enter interpolation. Actual frames immediately before/after the project boundary, at ±1/240s, show MAD **0.026–0.124/255** across 4/8/12s and two trim/crossfade settings. These nearby-frame measurements are stronger evidence than comparing only time zero with exact duration. They do not prove every generated scene is seamless.

Preview media and an independently generated frozen PNG match exactly at 640 × 360. Reduced motion and Before use the same time-zero media frame. Disabling blending releases frame/sample caches. Three simultaneous local 4096 × 2160 test videos keep each smoothing surface at 1280 × 675 and each layer's four-frame/two-surface storage at **20,736,000 bytes**. The general 1280 × 720 ceiling is **22,118,400 bytes (21.1 MiB)** per layer, excluding the browser's decoder. No full clip is predecoded.

Four source-crop comparisons cover narrow and wide layers, nonuniform resizing, rotation, both flips and crop zoom/offset. Rendered mean RGB differences are **1.07–1.59/255**, including JPEG/H.264 loss. Wan preparation is 832 × 480 and insertion applies the crop once. The Google preparation remains 1280 × 720.

## Inspected output

Fresh desktop AI, fitted-video, 390px top/CTA, motion frames, framing review, 4K review and decoded-video screenshots were inspected. The artwork and relevant controls are visible. Camera drift and some ghosting remain visible in the real model footage; the controls soften stepping and the join without promising to remove those source defects.

The actual UI exported a **3840 × 2160 PNG** and a **1920 × 1080 VP9 WebM**, which fully decodes, seeks and has finite **4.000s** duration. The latest Wan export contains **93 encoded frames**. An earlier local run contained 94. The exporter targets 24 rendered frames/s; MediaRecorder may encode fewer frames under load, so a guaranteed 96-frame constant cadence is not claimed. Output resolution does not turn the 832 × 480 source into native HD or 4K. Audio remains silent.

- `wan-default-desktop.jpg`: provider default, disclosure and Generate control.
- `real-wan-fitted-studio.jpg`: real saved study with whole-repeat fit and explicit 16fps blending.
- `wan-touch-390.jpg`, `wan-touch-cta-390.jpg`: narrow touch layout and reachable 0.5s Generate control.
- `wan-fitted-4k.png`, `4k-review.jpg`: full export and bounded review copy.
- `wan-fitted-1080p.webm`, `decoded-export-review.jpg`: real export and decoded frame.
- `motion-0.jpg` through `motion-4.jpg`: five captured live canvas frames; `motion-frames.json` records the capture plan.
- `replay.html`: local export playback at its encoded timing, once per click, with a static poster.

## Resolved validation issues and remaining handoff

Initial browser assertions needed to read Fetch `Request` objects as well as init options. Two tool names were corrected in the harness, and a final Classic selector was made exact. The first framing fixture failed because FFmpeg requires `0.25`, not `.25`; its error log is retained as `framing-ffmpeg-argument-failure.log`. Those test setup issues are resolved, and the affected suites pass. `browser-before-selector-fix.json`/`.log` retain the final selector failure. No failing check was skipped or hidden with retries/expected-failure annotations.

No app-source edits followed the supervisor's freeze. The preview remains at `http://127.0.0.1:5173/`; restart with `python3 scripts/start-preview.py` if stopped. Final detached-server HTTP and digest checks are recorded in the evidence manifest. No commit, push, deployment or submission was performed. Live provider availability/quota and publication remain supervisor-owned.
