# Stillwild functional audit — 8 November 2026

The reported rain problem was reproduced on the public site, then repaired in the existing Codex task inside Asyncly. All application source changes were made there. The supervisor independently tested the live and local UI, reviewed the source and reports, assembled this QA note, and owns packaging/publication. After implementation and the checks finished, the build run was stopped during its remaining documentation handoff; no application implementation was moved outside Asyncly.

## Repairs

- Rain at its default amount was nearly invisible at normal preview sizes. The renderer now uses layered rain with a clearer light-rain-to-downpour range. Fog and dust have stronger upper ranges. Off/default/maximum screenshots and fixed-time pixel comparisons were checked at desktop, compact and mobile sizes.
- Controlled number fields dropped intermediate minus signs, decimals and cleared values. Typing `-1.5` became `+1.5`; clearing Width before typing `15` could produce `400`. A shared draft-aware number field preserves normal editing, bounds committed values and keeps motion/weather cycles integral.
- Adding a layer and undoing it left selection at a removed ID, disabling photo tools. Structural Undo/Redo now reconciles layer and pin selection, including theme changes and empty-canvas recovery.
- Replacing a sole-reference private image at the ten-image limit was incorrectly rejected. Replacement now validates the resulting composition; an actual eleventh distinct image remains rejected without overwriting work.
- Centered zoom overflow made the left side unreachable. Safe alignment makes both edges reachable at 150%/200%, with mouse and emulated touch panning.
- Classic offered a rain source in Shadow Garden although it rendered only in Rainprint. The option is now restricted to Rainprint, with a scene-switch reset and add guard. Existing saved compositions remain accepted.
- Paused, reduced-motion and Before states now explain why motion or grading may appear inactive. Tool-specific controls were tested.

The earlier range `fill()` observation was an automation limitation: Master volume works with real pointer dragging and keyboard input. It was not counted as an application defect.

## Results

**193 focused control/effect rows passed**, plus **21 unit tests**, **36 broad photo regression groups**, **27 Classic regression groups**, **5 cycle regression groups**, image-budget/alpha/hidden-export checks, TypeScript production build and whitespace validation. The complete matrix records the input method and evidence for each row, with the unverified platforms separated explicitly. These are local agent-run checks and supervisor observations, not independent certification.

| Evidence | Rows | Result |
| --- | ---: | --- |
| `matrix-numbers.json` | 18 | PASS |
| `matrix-grades.json` | 20 | PASS |
| `matrix-layers.json` | 29 | PASS |
| `matrix-motion.json` | 9 | PASS |
| `matrix-weather.json` | 8 | PASS |
| `matrix-saved.json` | 6 | PASS |
| `matrix-audio.json` | 7 | PASS |
| `files-responsive-report.json` | 13 | PASS |
| `atmosphere-report.json` | 12 | PASS |
| `zoom-report.json` | 12 | PASS |
| `classic-controls-report.json` | 53 | PASS |
| `recovery-video-report.json` | 6 | PASS |

[Complete control matrix](../.asyncly/visual-captures/functional-audit/complete-matrix.json) · [Photo regression](../.asyncly/visual-captures/functional-audit/photo-regressions.json) · [Classic regression](../.asyncly/visual-captures/functional-audit/classic-regressions.json) · [Supervisor findings](../.asyncly/visual-captures/functional-audit/supervisor-findings.json)

Coverage includes all offered presets and palettes, layers/text/shapes/gradients, transforms/crop/blends, grading resets and Before, masks, pins/flow/freeze, camera/depth, all weather knobs, timeline, reduced motion, sound/mute/levels/timers, history, autosave/named projects, actual JPEG/transparent-PNG/WebP imports and replacement, portable files, sharing/copy/recovery, actual PNG downloads at all three sizes, video/error/cancel cleanup, zoom, fullscreen, short windows and touch layouts. Saved settings and named/portable recovery were checked with isolated disposable fixtures. The supervisor kept a named and portable backup of the existing public composition and preserved the local Coast overlay study.

## Encoded video evidence

The supervisor used the actual studio export controls for max-rain 4/8/12-second loops. Each file fully decodes, has strictly increasing original packet timestamps and finite duration. Full decoding used a millisecond output time base so an inferred-frame-rate null muxer does not introduce quantization warnings.

| Selected loop | Format | Container duration | Decoded frames | Result |
| --- | --- | ---: | ---: | --- |
| 4s | 1920 × 1080 VP9 | 4.000s | 95 | PASS |
| 8s | 1920 × 1080 VP9 | 8.000s | 192 | PASS |
| 12s | 1920 × 1080 VP9 | 12.000s | 288 | PASS |

MediaRecorder is a real-time encoder. Twenty-four render requests per second is a target; encoded frame count and cadence can vary by host/load. The observed 95-frame 4-second export is retained rather than replaced with a universal 96-frame claim.

The reduced-motion test records identical raw source frames. VP9's first decoded frame differs more while compression settles (about 1.525/255); later frozen decoded frames differ by 0.034/255. The explicit motion override records four distinct native samples and visibly changing decoded frames (mean 1.136/255). The corrected test checks source constancy and settled decoded frames, rather than confusing encoder variation with motion. Early FFmpeg filter quoting and test synchronization failures are retained in attempts; they are not reported as application fixes.

## Scope and limits

Verification used Google Chrome on this Mac, WebGL plus forced Canvas fallback, actual pointer/keyboard input and touch emulation. Responsive cases include 1280×720, 1024×768, 847×787, 390×844 and 390×600; zoom also covered 1440/847/390 widths. Rotation's −180° and +180° endpoints represent the same orientation; a false endpoint hash difference flag is not a failure by itself. Motion speed likewise requires playback for a visible effect.

Safari/Firefox, physical phones, browser-native MP4 on other engines, native Plash/Lively integration and OS wallpaper installation were not tested. Video exports are silent. Image imports stay local, and source detail remains limited by the image. There is no semantic scene reconstruction, PSD compatibility or physical relighting. No hackathon submission, legal acceptance, new account access or native-host installation occurred.

Publication receipt and live follow-up evidence are recorded separately under the ignored functional-audit evidence directory. The source review and tests were complete before publishing.
