# Stillwild living interface motion · 9 November 2026

Implemented over published v15 `e44bd59a99124f0ca95e19368cfe189084dc6cbf`. Existing Manrope, charcoal workspace and licensed photographs are retained. No dependency, asset download, backend or generation request was added. Source publication remains with the supervisor.

## Motion map

| Surface | Behavior / budget |
| --- | --- |
| Buttons, icons and selected controls | 100ms compression; 150ms release. Pointer-only card-image hover. Native selects remain native. |
| Welcome create/explore/import, Back/Resume | Immediate action, then 240ms incoming settle / 160ms inert retirement. Back adds directional depth and at most 5px blur. Actual mounted work is revealed. |
| Welcome replay / featured scene | Original first 720ms decoded-image reveal; later scene choices dissolve in 240ms over the last decoded photograph. One retained image; one current atmosphere. |
| Gallery/editor, chosen or loaded wallpaper | 240ms presentation shift, preserving the mounted canvas, history and task state. Duplicate scene-open operations are guarded. |
| Inspector, task tabs, Advanced and mobile drawer | 180ms transform/opacity; repeated changes start from their current presentation. Slider/drag/paint/scrub values and renderer frames never trigger this motion. |
| Guide open/step/close | 180ms presentation; focus returns to the trigger when closed. |
| Share/use dialogs and delivery success | 220ms dialog / 180ms success presentation; trap and native download behavior stay in place. |
| Classic/photo | Both workspaces remain mounted after first use. Inactive visual playback is suspended; sound stops and requires a new explicit start. |
| Fullscreen | Native request stays in the original click task. Only artwork and exit chrome remain; a short artwork settle is permitted. Rejected-native CSS fallback is retained. |

Strong UI ease-out: `cubic-bezier(.23,1,.32,1)`; drawers: `cubic-bezier(.32,.72,0,1)`. Keyboard actions are immediate. OS **or** studio reduced motion removes translation, blur and ambient animation, retaining at most a 100ms opacity transition. No View Transition API is required; WAAPI has a CSS fallback. Outgoing snapshots are bounded to one, inert, hidden from accessibility, scoped to the original typography, and removed on completion/cancellation/fullscreen/hidden/unmount.

## Living photographs

The welcome-only canvas caps its longest edge at **640 pixels**, independent of device DPR. RAF follows the browser refresh schedule; heavy drawing is capped at **20 draws/s**. There is no per-frame React state loop.

- **Alpine:** local advection of existing low-saturation, bright cloud pixels; dark green foreground remains outside the matte.
- **Dune:** slow diffuse light/shadow over the sand, with fixed ridges and sky. No geometry warp or universal fog.
- **Tokyo:** restrained colour-preserving gain on existing signs, reflection shimmer on coloured lower highlights, and fine rain. No full-frame colour film.

These are local image treatments, not AI video or reconstructed 3D. Decode epochs reject late scenes. The previous decoded photograph bridges loading/failure, with Continue/Retry/Skip usable. Pause and hidden state retain the current atmosphere frame and stop scheduling. Resume continues its clock without counting hidden time. Image/scene changes, reduction and unmount release buffers/listeners/RAF; StrictMode cleanup is bounded.

## Required correction batch

The supervisor identified an early Tokyo defect: changing alpha over identical original RGB did not change the final signs. The retained finding is `Tokyo-early-composite-finding.json` in the evidence directory. Final sign gain now changes RGB proportionally and bounds clipping.

`corrections-report.json` confirms all three scoped gates:

1. **Final Tokyo composite, 0s versus 6s:** 17,619 of 19,340 measured upper coloured-sign pixels change. Mean absolute RGB-channel difference is **1.933/255**; summed difference **112,139**. All 304 sampled neutral upper pixels remain exact (**zero** difference). The comparison composites the overlay over the actual photograph, rather than comparing raw alpha. Deterministic JPEGs are `tokyo-final-composite-0s.jpg` and `tokyo-final-composite-6s.jpg`.
2. **Mid-flight repeat and reverse:** new starting opacity, transform and blur match the currently rendered values across three interruptions. Four commands each clean up once, including repeated cancellation. This uses one isolated module fixture; the real navigation and final recording exercise the application controls.
3. **Exact pause hold:** the native click capture records the pre-handler canvas, frame count and dimensions. Post-pause and 350ms later match it exactly. Hidden-state hold also matches, and both paths resume drawing. The visibility event uses an explicit local `document.hidden` fixture; it is not a claim about a physical screen recording of tab occlusion.

## Validation and provenance

Baseline **99/99 units** ran once. Focused checks cover motion policy, scheduling, scene masks, final Tokyo compositing and existing journey contracts. Final **13/13 focused units** and production build/whitespace are indexed in `handoff.json`.

The supervisor reviewed the original navigation, permissions, legacy, edge and export gates as passing. Their original logs remain available; no broad provider/media audit was repeated after scope closure. Coverage includes:

- Real create/import, repeated gallery/editor/tab/guide/modal navigation, Escape/focus, Classic/photo, preserved canvas/Undo and retained animation-prompt/sound-choice drafts.
- Actual native file-picker import; native and rejected-native fullscreen; direct photo-share/Classic URLs.
- Touch at 390×844, desktop 1280×900 and short 1280×720; forced absence of both WAAPI and View Transition; reduced/static and immediate keyboard paths.
- Dynamic OS reduction despite a stored false setting; explicit studio reduction; user-started audio stopping in an inactive workspace without automatic restart.
- A disposable legacy **20-project** IndexedDB fixture restoring quietly and surviving replay. This preserves existing records; the existing limit for creating new named saves remains 16. Operator/public browser data was not accessed.
- A real **3840×2160 PNG** from an imported licensed thumbnail, with SHA-256 parity against the independent artwork renderer. No welcome, transition chrome or atmosphere enters export. The small fixture proves flow/output size, not 4K source detail. Existing video/provider engines are unchanged; their prior decoded-media evidence remains historical.

All browser contexts block unmocked external requests. UI recordings are genuine production-time Playwright recordings, distinct from wallpaper exports. The corrected Tokyo recording is 12.24s; retained Alpine/Dune excerpts are 15s at original timing, with no interpolation or speed change. Raw originals and media probes remain in the evidence directory. Replays have controls and do not loop indefinitely.

Observed early samples under recording load: Alpine **18.96 draws/s**, mean **7.92ms**, maximum **22.20ms** per atmosphere draw; Tokyo **18.92 draws/s**, mean **2.84ms**, maximum **21.20ms**. These are bounded samples on this host, before the final sign correction, not a 60fps claim or a universal smoothness guarantee. The corrected Tokyo sample recorded 136 atmosphere draws, mean **1.62ms** and maximum **7.80ms** per draw; its own timings are retained in `corrections-report.json`.

## Historical failures and limits

Failed runs are retained. The initial harness read autosave before its producer completed; later runs waited for saved status. Inert retired clones required live-surface selectors. A cached image bypassed the failed-request fixture; a fresh context confirmed recovery. A 20-project seed initially used the current 16-save API limit, then the wrong out-of-line key shape; the corrected legacy fixture passed. A direct import of a hot-reloaded module gave an ambiguous retarget probe; the isolated fixture and final repeat/reverse test close that gate. The first multi-scene recorder hit its overall finalization limit after saving Alpine; independent/current recordings complete the evidence. None of those partial runs is labelled as a clean full-suite pass.

The full-quality photographs remain static underneath a lower-resolution atmospheric layer. Motion is deliberately restrained and does not establish cinematic realism or physical simulation. Browser/storage/hardware performance varies. The supervisor’s final motion disposition is **APPROVE**: current source, all three correction gates, actual-panel confirmation, the scoped functional results, recordings and documentation were independently reviewed. The three review findings are resolved. Public 20-project verification, packaging and publication remain supervisor-owned. No provider call, key, account/terms action, commit, push, deployment or submission occurred.
