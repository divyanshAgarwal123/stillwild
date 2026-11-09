# Stillwild release retest — 8 November 2026

The studio was retested and three confirmed defects were repaired through Codex in the existing Asyncly project and chat. Application source was frozen before publication. Final live-site checks are recorded separately in `.asyncly/visual-captures/release-retest-supervisor/production-checks.json`.

## Repairs

- **Animate photograph:** the explicit action now keeps an eligible photo or selects a visible, unlocked, nonzero-opacity photo. Text/video selections no longer lead to a disabled generation panel when an eligible photo exists. If none exists, the studio gives recovery instructions. Opening the AI tab itself keeps deliberate selections.
- **Photo credits:** text, shape and gradient layers show local-layer context instead of inheriting an unrelated forest photographer credit.
- **Video timing and cancellation:** a real public 4-second Wan export had 7.612 seconds of packet timestamps while its metadata said 4.000. The new local encoder assigns project timestamps to every frame, awaits backpressure and validates the resulting packet timeline. Slow rendering can take longer than playback. An unsupported/overloaded recorder fallback rejects invalid timing instead of offering a mislabeled file. Cancellation, unmount and hidden-tab cleanup prevent downloads and close encoder resources, including during final blob inspection.

## Coverage matrix

| Area | Final result | Coverage |
| --- | --- | --- |
| Unit tests | PASS | 51 passed, none failed or skipped |
| Themes and layers | PASS | Three photo directions, image/video/text/shape/gradient operations, transforms, crop, masking and blend modes |
| Grading and history | PASS | All 15 grading controls, real signed/decimal typing, sliders, resets, before view, Undo/Redo and structural selection |
| Motion and effects | PASS | Pins, flow/freeze, camera, rain/fog/dust/rays, timeline,4/8/12s fitting, trims, explicit FPS/frame blending and reduced motion |
| Sound | PASS | Start/stop/mute, all channels/master, measured signal/silence, timer, reload-off and cleanup |
| Files and persistence | PASS | Autosave, named projects, image/video imports, replacement, limits, invalid/cancel/recovery cases, portable retention and restored selection |
| Sharing | PASS | Built-in recipient composition, paused and sound-off defaults, copy/failure feedback; private media uses portable files |
| PNG export | PASS | Actual 1920x1080,2560x1440 and3840x2160 artwork-only outputs and renderer/share parity |
| Video export | PASS | Decoding, seeking, reduced-motion control and override, timing, cancellation/failure/hidden cleanup |
| Responsive and Classic | PASS | Desktop/short-window/390px touch emulation, zoom/scroll/fullscreen/Escape; Classic controls and v1/v2 migration |
| AI integration | PASS with test transport | Actual installed Gradio SDK plus mocked Google, options, queue/cancel/timeout/errors, explicit insertion, bounds and key isolation |
| Live Wan availability | QUOTA BLOCKED | One new 0.5s public request reached daily quota; no retry, key, card or paid fallback |
| Production build / whitespace | PASS | Fresh TypeScript/Vite build and git diff check |

The machine-readable feature matrix retains individual passed cases and source evidence. Original failed attempts remain in ignored audit evidence. General UI/Classic passes are retained where unaffected by the later exporter repair; affected media checks were rerun. The source-selection and credit defects were reproduced before repair. A startup stall, the old Google-default mobile assumption, and encoder-specific test assumptions were resolved separately from app defects. Reduced-motion rendered hashes remain exact; lossy decoding is compared against an independently encoded constant-image control.

## Output evidence

- Local automated 4/8/12s exports contain 96/192/288 decoded frames, with actual packet ends at 4/8/12 seconds. A deliberately slowed 4s frame-encoding case also preserves its 4s timeline.
- The supervisor's independent local studio export of the real Wan composition fully decodes as 1920x1080 VP9,96 frames, firstPTS0,lastPTS3.958,last packet end4.000 and duration4.000.
- Existing real Wan source remains 832x480 at 16fps. Export dimensions and blending do not create native image detail or remove all model drift/ghosting. Exports remain silent.

## Reuse and limits

The existing React/TypeScript/Vite application now uses unmodified Mediabunny 1.65.2 for local timestamped encoding/muxing. Its MPL-2.0 license and pinned-source/upstream notices ship in public/THIRD-PARTY-NOTICES.txt and public/third-party/mediabunny-1.65.2-LICENSE.txt. Existing asset and library disclosures remain in README and build notes.

No live Google paid request or new successful Wan generation was performed in this retest. Current Wan availability is quota-limited; the earlier real generated video was reused for media checks. Browser coverage is desktop Chrome and touch emulation. Safari/Firefox, physical phones and Plash/Lively remain unverified. The user's Tidal composition was backed up before live tests; edits were undone and the five existing named projects were preserved. No hackathon submission was made.
