# Motion Plus QA · 9 November 2026

Baseline: published v13 `c88d35db62e3f752ec741ed1234047cdb6033a93`. Work stays in this repository. No live generation, real keys, account/billing action, commit or deployment by this task. All browser contexts were disposable and blocked unmocked external traffic. Existing public/private projects were not opened in their original storage or deleted. The supervisor inventoried 19 public projects; publication/restoration verification stays with them.

## What changed

- Animate scene opens twelve different editable prompts and sound recommendations. Dune requests fine windblown sand with fixed ridges/camera; space is explicitly artistic. Existing API auto-apply remains in place, preserving latest tracks, grade, crop, masks and project sound through replacement and Undo.
- Main Motion exposes exposure, temperature, selective hue/strength and existing-highlight bloom automation, with bounded keys/easing and linked endpoints. Linked end edits the start; separate end keys are removed when linking, recoverable with Undo. The gentle light preset creates a meaningful interior key. Base settings remain unchanged, and Before/reduced motion bypass automation. Video timing is available in main Motion. Static bloom is no longer described as a live loop; idle preview stops redraw.
- Nine procedural sound choices, up to eight layers, scene recommendations and private WAV/MP3/OGG import (16 MB / 60s / stereo). Waveform, trim, offset, crossfade, per-layer/master levels, mute, selected-only preview and sleep timer are editable. Synthesis is labelled honestly. Edits crossfade at the continuing audio position; selected preview stays isolated. Reload/share/import do not start audio.
- Optional Include sound is off by default. A shared deterministic mix feeds local VP9/Opus export. Source clip audio stays muted. The application adds final Opus DiscardPadding and rebuilds cluster/cue positions so the decoded audio and container end at the project duration. Video packets are unchanged. Unsupported chosen audio gives a recovery message and cannot silently fall back to a silent file.

## All-scene audit

The v13 region renderer was measured before implementation; it remains unchanged. Fresh compositions were also rendered at each recommended tool's default and maximum amount, at 960 × 540, including the imported user mountain. Metrics, original/each-tool-default/maximum JPEGs and a contact sheet are in `baseline-audit/`. Coverage alone does not establish a correct semantic matte or natural motion.

| Scene | Suggested matte coverage | Assessment |
| --- | --- | --- |
| Alpine quiet | cloud 21%; foliage 5%; water 6% | cloud: weak local retouch; foliage: weak local retouch; water: weak local retouch |
| After the rain | bloom 4%; water 15% | bloom: static-only; water: visible local retouch |
| Tidal studies | water 52%; cloud 47% | water: visible local retouch; cloud: visible local retouch |
| Quiet reflections | water 19%; cloud 21% | water: visible local retouch; cloud: weak local retouch |
| Above the pines | cloud 9%; foliage 2%; water 4% | cloud: weak local retouch; foliage: negligible matte; water: weak local retouch |
| Woodland water | water 10%; cloud 13% | water: visible local retouch; cloud: weak local retouch |
| Venice at dusk | bloom 14%; water 5% | bloom: static-only; water: weak local retouch |
| Dune light | bloom 25% | bloom: static-only |
| Sand rhythm | bloom 33% | bloom: static-only |
| Stellar nursery | bloom 5% | bloom: static-only |
| Pacific edge | water 40%; cloud 6% | water: visible local retouch; cloud: weak local retouch |
| Galactic dust | bloom 4% | bloom: static-only |
| Imported user mountain | water 13%; cloud 2% | water: visible local retouch; cloud: negligible matte |

Several mattes are weak or negligible. Dune, sand and space recommendations were static bloom. Even measurable local deformation is retouch, not professional scene animation. The app now keeps those tools explicitly optional in Advanced and explains empty/weak mattes rather than increasing global warps to manufacture a pass. Coarse colour/texture heuristics can mistake foam, cliffs or sky; inspect/correct the matte. Professional generated motion quality across all photographs is **not established**.

## Focused checks and evidence

Evidence root: `.asyncly/visual-captures/motion-plus/`.

| Check | Result / evidence |
| --- | --- |
| Legacy + focused units | 92 pass, zero skips: `final-units.log`. Includes the prior 83 plus bounded automation/sound/handoff and audio-aware WebM checks. |
| Connected workflow | `functional/report.json`: truthful Dune idle/no redraw, editable prompt, actual Look pixels, Before, Undo/Redo, named reload, measured start/mute/unmute/Stop, nine distinct audible sources, actual WAV/waveform/trim/offset/crossfade, named reload and portable reimport with exact audio bytes; default silent and sound off on reload. |
| Raster controls | `pixels/report.json`: all five parameters affect real urban photographic pixels in WebGL and CPU fallback; exact disabled/reduced/Before identities and closed endpoints. Exposure also checked on actual Dune pixels. These metrics establish functionality, not aesthetic quality. |
| Provider handoff | `handoff-check/report.json`: fully mocked fal transport with real local Dune decoding; one POST for double click; latest track/sound edits apply automatically; repeated generation replaces one linked video; Undo/Redo; wrong-project recovery and invalid media; isolated Google/Kling key fields and keyless Wan. No live jobs. Existing provider adapter units remain passing. |
| Media formats / export failures | `media/report.json`: actual WAV/MP3/OGG decode; malformed, oversized and pre-aborted rejection; main video timing; chosen-audio unsupported/cancel recovery. |
| Finish review fixes | `finish-confirmed/report.json` and four `Review-{desktop,mobile}-{motion,sound}.jpg`: inspector task heading/actions and mobile key value/Update fully visible; return + Update preserves 0.3; Undo synchronizes the draft. Scene/quality explanations are collapsed. |
| Audio continuity | `audio-finish.log`: recognizable transient starts audibly, then stays quiet at its continuing playhead through master/layer edits; selected-only preview remains isolated. Hidden suspend/resume, sleep cleanup and reload quiet verified. |
| Output decoding | `media/decode-report.json`: actual UI 4K PNG = 3840 × 2160. Silent and final sound-enabled WebM fully decode at 1920 × 1080, VP9, 24 fps, 96 frames, 4.000s. Final Opus decodes to exactly 192,000 stereo samples at 48 kHz; RMS 0.01624, peak 0.04834. |
| Final gates | `final-build.log`, `whitespace.log`; build succeeds, whitespace clean. Vite retains a >500 kB chunk advisory; no dependency churn. |

The first bounded gallery/desktop batch also exercised search/favorites and actual explicit sound start/stop. Its fullscreen assertion used the obsolete class `wallpaper-mode`; the observed DOM was the working `is-wallpaper` view. This was a test-selector failure, not a fullscreen failure. The finish request superseded further broad reruns. Historical v13 coverage stays in `SCENE-STUDIO-QA.md` with its original provenance.

## Resolved attempts retained honestly

Initial idle assertion raced the final image/analysis render; it now waits for decoding/settling before measuring zero idle redraw. The first functional run passed its five groups then failed teardown because the evidence environment variable was missing; the report is retained, the runner now sets its output directory. A signed-zero audio endpoint assertion was corrected in the mixer. The first endpoint test read storage before its asynchronous save; the poll now waits for the saved track. The first provider mismatch check sampled the old project before the new gallery choice saved; the corrected check waits for Pacific edge and passes all invariants. The initial mobile finish capture found the Update button clipped; the combined spacing fix and four confirmation captures pass. None of these assertions were weakened or skipped.

The first sound export had 13.5 ms of decoded Opus tail padding and a 4.020s container. The original failed-duration artifact remains `media/dune-sound-4s.webm`. The final UI export is `media/dune-final-sound-4s.webm`; it trims codec padding through container metadata, not changed source frames, and fully decodes to exactly 4s. The silent file remains 4.000s.

## Real Kling fixture and quality boundary

Supervisor supplied `Kling-2.6-Dune-original.mp4`: one consumer website job, 25 existing credits, balance 41 → 16, source first/last anchors, native audio off. H.264 1920 × 1080 / 24 fps, 122 frames, 5.083333s, 983120 bytes. SHA-256 independently matched `a75ffee7e330de9e6c33a1462d385b2cf2e4a00eeb41fc4b89e1d3d16264c813`. This is website evidence, **not API success**. The watermark stays visible. Motion is very restrained and has not been endorsed as professional quality. The task used the supplied clip offline only.

## Limits

Local effects do not reconstruct hidden scenery or simulate physical water/clouds. Generated results may drift, ghost or have joins. An open/unlinked parameter track can jump at the loop boundary; linked smooth easing is the default. Bloom needs an enabled region; selective tracks require enabled Selective colour. Audio crossfade shortens each source repeat by its fade span, and project edges have 20 ms fades. Browser decoding can finish after cancellation, but its result cannot apply. Large mixes can take preparation time. Imported originals remain immutable and private in editable backups; built-in links reject private sound. Browser sound/export support varies; use the explicit recovery path. Native wallpaper-host compatibility is not claimed.

## Finish verdict and detector scope

The supervisor reports **SHIP on the four listed finish fixes only**: key-draft return/Update, desktop/mobile task access, continuing sound with explicit isolation, and product wording. This is separate from the functional and decoded-export results above and does not endorse generated motion quality. The single installed design-detector pass found 0 P0, 4 P1 and 11 P2 heuristic flags. Its report is `design-detector.json`; existing glyphs, metadata and styling flags are retained within the approved visual world. No further design batch was opened.
