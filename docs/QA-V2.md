# Stillwild v2 — completed local validation

Validated at 2026-11-07T21:32:34.952Z against **http://127.0.0.1:5173/**. The existing Git-backed app was upgraded in this same Asyncly Codex task.

- Production build passed: TypeScript + Vite, 38 modules, no required-check failures.
- Unit tests: **10 passed, 0 failed**.
- Browser acceptance: **27 groups passed, 0 errors**.
- Final gallery/palette and initially-hidden startup checks: passed.
- Export-during-load probe: passed; selected decode finished while the unused image was still loading, and the repeated decoded PNG hash matched.
- Motion capture: four 3-second, artwork-only WebM clips, five sampled frames each. Streams, pages, contexts, and browsers were closed.

## Coverage

All 24 presets across four families and both scenes; four distinct frozen palette digests per family; all six light modes and visible intensity/exposure/warmth/softness/beam changes; softness in rain scenes without foreground shadows; movable source; deterministic atmosphere changes; motion/reduced motion and idle draw suppression; mouse dragging and real slider pointer capture; real touch arch and rain-source dragging; add/duplicate/remove; grouped undo/redo; named favorites/reload/load/delete; backup/import with malformed/oversized/invalid-file rejection; storage quota/disabled-storage failures; v1 storage/link migration; corrupt-v2 plus valid-v1 recovery with raw data retained; frozen share restoration; desktop/touch fullscreen exit; exact 1080p, 1440p, and 4K dimensions; all four representative 4K original/shared pairs; storm suppression at 25s when reduced motion was already on, including a later import; bounded caches and empty botanical scenes; decode and deterministic asset failure/fallback.

The final screenshots are settled captures of the default compositions with the Art tab selected, plus both scenes, mobile layouts, and the Light/Air/Sound/Saved tabs. Exports are the representative compositions from acceptance; the Paper export includes an edited circle, and Ink export uses Rainprint. Screenshots and exports need not depict the same edit.

## Audio evidence

The normal StrictMode development app generated and measured the actual post-master Web Audio signal. Mixer playing RMS: 0.002148; muted RMS: 0; stopped context: none, nodes: 0. Rain, air, and tones each produced isolated nonzero signal. Master zero and all-channel zero were silent. Rapid start/stop cleaned up, reload stayed off, and hidden document events faded/suspended/resumed audio while visual drawing stopped. The generated 1.5-second WAV is `ambient-mix.wav` (RMS 0.016311, SHA-256 fe609ae673462b42838e24ed60748cebb4c987e6ad45ad2408f8446000c3ab94).

These are signal measurements and a saved WAV; they do not claim a human listening assessment or physical-device audio testing. Sleep-timer configuration and cleanup are implemented; the acceptance run did not wait 15 real minutes for expiry.

## 4K export parity

Each original/shared pair is an artwork-only 3840 × 2160 PNG with identical bytes. The preview and all exports call the same Canvas renderer.

| Material family | Original/shared SHA-256 |
| --- | --- |
| paper | cb6f98cf7043dbbaee2003060e4856b8d0de3f7687859128198b162f10e5ddcf |
| natural | 9fb27824baf4eeac88002e369282d164db9c83242d499d4a0ba5fc668c4685f8 |
| ink | 4d354770ea8e150dc226a65b2ddca2ab6915ea4e488875f9744a23b306d3b6a5 |
| future | 63ef2d260d3d87834d94bfb0561e796a2119bb72124091c3926a29e450729435 |

## Assets and scope

Natural/Future backplates were generated during this event and have actual source dimensions **1672 × 941**, independently checked from PNG headers. They are not photographs or native 4K sources. 4K output is a larger Canvas render with resampled environment art and procedural layers. Paper/Ink remain fully procedural. Full provenance is in `public/art/provenance.json`, `docs/ART_ASSETS.md`, and `docs/V2-BUILD.md`.

Tests used isolated headless Chrome at 1× device scale: desktop **1440 × 1180**, touch **390 × 844**. Visibility callbacks were tested with a controlled document-hidden fixture; native OS minimize and background throttling across other engines were not assessed. Physical devices, Safari/Firefox, and Plash/Lively/native wallpaper hosts remain untested. No native compatibility, photorealism, or physical simulation is claimed.

Sites identity `.openai/hosting.json` is unchanged (SHA-256 e6ebdfb66856f275dfddd32d12de8ec70308377c2ac5736a720097883071e381). No deployment, entry submission, legal acceptance, credentials, or native host installation occurred in this task. The supervising session handles deployment.

## Evidence files

All fresh v2 evidence is in `.asyncly/visual-captures/v2/`. `evidence-manifest.json` contains absolute source/evidence paths, image hashes, original asset sizes, and links to the browser/gallery/loading/motion reports. `motion-replay.html` plays each saved clip once per user play. Historical v1 evidence remains outside this v2 directory.

The detached preview was left running. A fresh HTTP request after all validation browsers closed returned **200** at http://127.0.0.1:5173/. Restart command: `python3 scripts/start-preview.py`.
