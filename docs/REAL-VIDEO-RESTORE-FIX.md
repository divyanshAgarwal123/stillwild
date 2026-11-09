# Real-video restore selection defect — 8 November 2026

Continue this SAME Stillwild Codex thread inside Asyncly. This is a bounded confirmed bug fix discovered during the user's requested real testing. Inspect existing code before editing. Preserve all existing work, API/asset/storage contracts, Sites identity, and the existing renderer. No redesign or new generation integration.

## Real evidence

The user requires no API billing setup. A Pro subscription does not supply an external video API entitlement. Supervisor used their already signed-in Google Flow Pro UI, generated exactly one real 4s 720p Omni 1.2 Flash clip (12 existing credits, no billing setup/new key), and downloaded it. This is a real generated video, not the synthetic fixture. It retains Flow's mandatory regional watermark. It has 1280x720 H.264, 96 frames at24fps, AAC, container4.032s, 2,243,895bytes. No provider keys/cookies/tokens belong in source. Do not attempt API calls or extract subscription authentication.

Real clip: `/Users/divyanshagarwal/Downloads/Rain_falling_on_city_street_0bf62131.mp4`, SHA256 `d99a7a6726e796f494e837b696e63da44e218955bac5939cc2a16e0ac4d63acb`.

Exact portable reproduction: `.asyncly/visual-captures/pro-video-live/real-video-repro.stillwild.json`. Keep it and the video ignored, not public/tracked fixtures.

Supervisor tested the DEPLOYED v6 studio through actual UI. Imported clip above the original After the Rain photograph; hid the original photo and disabled all procedural weather/camera movement. Set clip0..4s, speed1, project4s. Real screenshot pixel comparisons passed: source .5s exactly matches timeline1 atspeed.5; trim-in.5 atproject0 exactly matches that same source frame; exposure1 changes mean RGB53/255 and Undo/Redo restore pixels exactly; painted video mask changes a local area and Undo restores exactly; play changes frames while pause freezes; reduced motion matches source frame0 exactly. Evidence JSON/JPEGs under `.asyncly/visual-captures/pro-video-live/`.

## Confirmed defect

Reload the above valid project. The visible video and its settings survive, but Studio automatically selects the hidden original photo (bottom layer), enables still-photo motion tools, and inspector says IMAGE. Changing Exposure0→1 then makes **zero visible pixel difference** because it edits the hidden source. Supervisor restored that test edit with Undo.

Evidence: `restore-selection-defect.json`, `reload-selected-hidden-photo.jpg`, `reloaded-before-hidden-edit.jpg`, `reloaded-hidden-exposure-1.jpg`. This explains controls appearing ineffective after restoring a video project. The same first-layer selection logic is used by portable import/named loading/hash/initial selection/fallbacks in `src/photo/Studio.tsx`.

## Required bounded fix

- On initial load/new project/restore/portable import/named load and when an old selected ID no longer exists, select a useful visible editable layer. Prefer the topmost visible, positive-opacity, unlocked image/video; otherwise a sensible topmost visible editable layer, then visible/any fallback (so all-hidden/locked compositions remain recoverable), or null for empty projects. A visible top video must beat a hidden or covered bottom photo.
- Apply the rule consistently to the existing default/fallback sites; do not override a valid deliberate manual selection during normal edits, including manually selecting hidden/locked layers.
- A manually selected hidden layer should have concise visible HIDDEN status in the inspector, so users understand why its edits are not visible. Keep wording small and consistent; no new modal or approval flow.
- Preserve structural undo/redo selection repair and explicit add/duplicate selection. Keep old v3 image projects/Classic usable. No schema migration or new dependencies.

## Verify and hand off

Add meaningful small unit coverage for the default-selection policy and a focused real browser regression exercising reload, portable restore and named load with a visible top video above a hidden photo, plus a visible video above a visible covered photo. Assert VIDEO inspector, photo-only pins disabled, and that a real grade edit changes visible pixels after restore. Verify valid manual hidden-layer selection stays selected and carries HIDDEN feedback; check deleted-layer undo/redo and empty/all-hidden/locked fallbacks. Use the real ignored clip or existing fixture; do not send any real generation requests.

Run units, focused restore-selection tests, and the relevant photo/video acceptance after the app code stabilizes; run production build. Do not repeat untouched Classic suites or expand unrelated features. Update a concise QA note separating real Pro UI generation/testing from still-unverified/billed API generation. Leave localhost5173 responding. Freeze source and give a final handoff promptly; supervisor will publish the exact tested source and finish export/persistence checks on the real clip. Do not commit/push/deploy or submit anything yourself.
