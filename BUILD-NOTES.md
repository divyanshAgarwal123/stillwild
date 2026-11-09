# Stillwild Studio

An image-led wallpaper studio with twelve bundled photographs and private imports. Start from the photographic gallery, then work with regions of the image. Import your own photographs, work with layers and masks, move regions of the image, and export a still or a video loop, silent by default with optional project sound. No account, backend, paid API, or upload is required.

## Run locally

Validated with Node 25.9. Node 24+ is recommended for the TypeScript unit tests.

```sh
npm ci
npm run dev -- --port 5173
```

Open **http://127.0.0.1:5173/**. To start/reuse a detached preview with an HTTP check:

```sh
python3 scripts/start-preview.py
```

The script honors `ASYNCLY_VISUAL_PREVIEW_PORT`; logs and its owned PID are under `.asyncly/visual-captures/`. The supervisor handles publication. `.openai/hosting.json` retains the existing Sites identity.

```sh
npm run build          # TypeScript + Vite production bundle
npm test               # v1/v2 compatibility + v3 schema/motion/WebM tests
npm run test:e2e        # photo editor browser acceptance
npm run test:e2e:render # render magnitudes, loop boundaries, 4K parity, video
npm run test:e2e:edges  # touch, import races, isolation, quotas, loading
npm run test:e2e:final  # scrub parity, audio, video seeking, cleanup
npm run test:e2e:v2     # retained Classic browser acceptance
```

Browser checks use installed Google Chrome, a temporary profile, and the running localhost app. Runners close their pages, contexts, recording tracks and browsers. Evidence lives under `.asyncly/visual-captures/v3/`; [QA-V3](docs/QA-V3.md) records the tested scope and boundaries.

## Work in the studio

The start gallery contains 12 locally bundled photographic scenes across Nature, Cities, Coast, Space and Minimal, with search, favorites and My wallpapers. Choose image creates a new wallpaper identity; navigation preserves work as drafts without consuming named slots. The canvas dock opens scene generation, Look automation, Sound and Advanced local retouch. Look, Motion and Sound open in an on-demand inspector. Advanced retains layers, legacy atmosphere, painted flow, pins and detailed timing. Fresh gallery selections have no legacy overlays enabled. The layer stack supports up to 12 image, video, text, shape and gradient layers (up to 3 videos). Select, rename, lock, hide, duplicate, reorder or remove a layer. Blend modes are normal, multiply, screen and overlay. The Layer inspector provides opacity, position, size, rotation, flips, depth and photo reframing. Drag on the canvas to move; corner handles scale about the center and the top handle rotates. Numeric fields provide keyboard alternatives.

Grade applies to the selected photograph: exposure, contrast, highlights, shadows, whites/blacks, saturation, vibrance, temperature, tint, hue, blur, sharpness, vignette and grain. Tone, color and detail each reset independently. Before shows the composition without photo grading, visibility masks, motion or weather. Text and shape layers remain part of the composition.

For a regional grade, duplicate a photograph, grade the copy, and paint its visibility mask. Erase reveals the layers below; Restore brings pixels back. Size and softness control the brush. Red mask guides are excluded from exports. Motion and freeze masks are separate from visibility masks.

Motion pins define local image flow. Drag a pin to reposition it; edit its direction, strength and falloff in Motion. The flow brush paints larger moving regions; the blue freeze brush anchors regions that should stay still. Pins and strokes can be removed, and each brush stroke or gesture is one undo step. This is image deformation, not semantic object extraction or hidden-background reconstruction.

Camera drift/zoom and per-layer depth are independent of local flow. Air adds cyclic rain, fog, dust or rays with amount, direction, cycle count, size and color. The timeline plays, pauses, scrubs, returns to the start, and selects a 4, 8 or 12-second loop. All motion is computed from project state and time. Pause, reduced motion and hidden tabs stop animation redraws. Reduced motion holds camera, flow and weather at time zero, including shared moments and PNGs. Video requires an explicit checkbox to override that preference.

Space plays/pauses. ⌘/Ctrl+Z undoes; Shift+Z redoes. Arrow keys nudge the selected layer; Shift nudges farther. Delete removes an unlocked selection. V selects Move, P selects pins. Shortcuts leave text fields alone. History holds 30 vector/reference snapshots, without copying image bytes.

Fullscreen hides every editing control and guide. Escape or the visible Back to studio button returns. On touch screens, the inspector is a bottom sheet. Paint collapses it into a compact toolbar; Done painting restores the selected region. The guide is labelled and can be hidden, and never appears in exports.

## Image regions

Select a region on the photograph or its dock to inspect the suggested matte. Enable the treatment explicitly. Paint, erase and feather the matte; a stroke is one Undo. Choose All tools or correct Scene interpretation to work beyond the suggestions. Region guide is an editing aid, hidden in exports. On mobile, painting leaves the whole artwork reachable and Done returns to its controls.

Cloud motion advects existing pixels. Water flow uses a periodic local ripple/flow field; foliage uses bottom-anchored sway. Direction, detail, amount and whole-loop cycles affect their rendered pixels. Light bloom thresholds existing highlights, then blends several soft scales in the highlights' own colours. These are local image treatments, without scene reconstruction. Reduced motion disables region motion while keeping static bloom. Existing video can also carry these editable treatments.

Analysis reads a small decoded crop locally: palette, luminance, contrast, highlights, colour and edge evidence. Twelve curated profiles supply content-grounded notes and relevant tool subsets. Imports use coarse pixel suggestions with an explicit correction control. Mattes are inspectable suggestions, not semantic object detection; water-coloured mountains or bright ground may need erasing. Suggested effects stay off until Apply & preview enables them and hides the guide. Apply preserves Pause, Before and reduced-motion preferences; the inspector offers a separate eligible Play action. Readiness follows the current crop without discarding the stored matte. The palette disclosure shows an explicit source/target pair and Apply; greys have no hue and use Look instead.

Optional v3 scene metadata preserves regions in source/crop coordinates through transforms, local saves, portable projects and built-in-photo links. Generated video receives the current matte rebased to validated output dimensions, with latest appearance/crop retained and no baked double treatment. Bounded limits are six regions, twenty strokes per region, 160 points per stroke and 1,600 total points per region. Large detailed shares retain the existing portable-backup alternative.

The post-grade region operation is shared by WebGL and Canvas fallback, retaining source alpha and applying layer placement/opacity afterwards. Its work surfaces cap at a 960px longest edge and 518,400 pixels; masks are 96×54 editable mattes. Analysis keeps at most eight decoded summaries. Renderer matte caches cap at 24 MiB and harmonic field tables at 256 KiB. Movement samples one displaced source location per pixel and tapers the displacement at matte boundaries, preserving destination alpha. This bounds CPU/memory work; tiny details can soften within a moving region. Original media remain intact. [Scene-studio QA and limitations](docs/SCENE-STUDIO-QA.md) records actual checks and output evidence.

## Save, import and share

Projects and private media blobs save in IndexedDB. Name a wallpaper in the top bar and use Save wallpaper, or Save named project in the collection drawer. Load/delete named projects from Saved projects. Autosave errors are visible. Imports suspend pending autosaves, serialize writes, and reject replacement if edits occurred while decoding. Failed/cancelled imports keep the current project. Existing v1/v2 localStorage and recovery keys are untouched by the photo workspace.

Import genuine JPEG, PNG or WebP files up to 16 MB and 40 megapixels, with a maximum source edge of 16384 pixels. Headers, MIME and decoded dimensions are checked; SVG, arbitrary remote URLs and disguised content are rejected. Images larger than a 4096-pixel edge are downsampled locally. Transparent PNGs are supported. A processed blob must remain below 16 MB; large downsampled PNGs use bounded WebP encoding or are rejected before saving. The inspector credit reports imported and stored dimensions.

Each project permits 10 distinct private media assets, 16 named projects per collection, 16 motion pins and 48 strokes per layer, with 160 points per stroke. A project’s complete portable representation must fit 144 MB before it can be saved. Vector JSON is capped at 2 MB. Raster/texture caches are bounded; unused layer textures and renderer resources are released.

Download a **Stillwild portable project** to retain editable settings and private image bytes. Import project / theme validates the entire file before replacing work. Imported images and the project receive fresh IDs, so another saved project cannot be overwritten by a reused identifier. This is a Stillwild JSON format, not PSD support. Keep a portable backup: browser storage can be cleared by the browser or user.

Built-in-photo projects share through a validated self-contained URL. The link restores layers, grades, masks, motion, crop, weather and a frozen time. Sound starts off. Private-image projects instead offer a successful portable-file download; images are never silently omitted or uploaded to create a link. Large detailed built-in projects may also need a portable file. Localhost links work only where this app is running; public links use the deployed origin.

## Wan, Your API and editable video

Choose **Animate scene**. **Wan · free shared quota** is the default free trial: no key or card, with a shared queue, variable daily limits and availability. No allocation is guaranteed. Choose 0.5s, 1s, 2s or 4s. The pinned official `@gradio/client@2.7.2` handles upload, queue events and cancellation with `credentials:'omit'` and `record_history:false`. Each click submits at most one job, without automatic retries, quota workarounds or paid fallback. Stop waiting ends local waiting; remote cancellation is not guaranteed.

**Your API** connects to a visitor-owned, browser-accessible JSON video REST service. Enter its HTTPS generation endpoint, session-only key and optional model. Expand **API format** to configure the authentication header/prefix, JSON request template, response field paths, status values and job URL templates. A key alone cannot identify a service. The endpoint must match the selected contract and permit browser CORS; multipart and other service-specific protocols require another adapter. No universal or live-service compatibility is claimed. See the [default contract, security limits and QA](docs/CUSTOM-API-QA.md).

Connection settings and keys stay in the mounted page's memory through panel changes. Reload or **Clear connection** removes them and stops local waiting. They never enter projects, links, browser storage or portable backups. Authenticated polling/result requests stay within the configured endpoint origin and API directory; an explicit path can change that boundary. External media downloads carry no auth or cookies. Redirects are disabled, responses are bounded and a submitted job may still run or be charged after waiting stops.

Wan receives an at-most-750 KB neutral JPEG fitted with matte padding into **832 × 480**, with known **16 fps** source cadence. Your API receives a neutral **1280 × 720** crop and duration from 0.1–30s, subject to its own contract. Its source FPS remains unknown. The service must preserve the prepared framing. Insertion removes padding and keeps rotation, flips, grading, masks and other layers editable. Validated results apply automatically to the same wallpaper. Reanimation replaces linked motion using the latest editable appearance and video crop; Undo retains the previous version. Changed projects, removed/locked sources or changed source crops block attachment, keeping the original and an explicit recovery action. Original download remains available after decode or storage failure.

New personal-API results use `custom` provenance. Legacy `google`/`kling` video metadata remains readable, editable and exportable, and can regenerate from its retained original through the current choices. The retired branded adapters and manual website workflow are removed from Animate. Earlier provider QA and browser scripts describe historical releases; use `scripts/verify-custom-api.mjs` for the current mocked UI contract. No new dependency was added.

Import MP4 or WebM clips up to 32 MB, 0.1–30s and 4096 × 2160. Videos support transforms, crop, flips, grading, visibility masks, opacity, undo, saved projects and portable media. Still-photo flow/pin/freeze tools remain separate. Source clip sound stays muted. Chosen project sound is separate; exports are silent unless Include sound is selected.

In **Motion**, choose **Fit whole repeats to project** to align the effective repeat with a 4/8/12s project. Fit chooses an integer repeat count nearest the preferred speed, then displays the effective speed and repeat count. Trim and crossfade changes recalculate it. New Wan layers start with a restrained fitted crossfade; old projects retain their previous manual timing. **Use original / manual timing** restores the complete clip, speed 1, no crossfade and no blending. Matching timing does not make arbitrary footage visually seamless.

**Source-frame blending** mixes adjacent decoded source frames to soften low-fps stepping. Wan results carry their known 16fps setting. For older/imported studies, choose **Known source FPS** explicitly; unknown cadence is never guessed. Blending is reversible and may ghost fast movement. It is not AI optical flow or motion reconstruction. Its trim-bounded cache holds at most four frames plus two surfaces per active layer, all capped at 1280 × 720 (at most 21.1 MiB per layer, excluding the browser decoder). Larger clips are downsampled only while this optional setting is on. Disabling it releases those caches and restores native source detail.

[Free Wan QA](docs/FREE-WAN-STUDIO-QA.md) records local mocked-provider and real-media checks separately from the supervisor's live UI request. [Earlier Google QA](docs/GEMINI-MOTION-QA.md) retains historical billing/API evidence for the retired adapter. Classic and local editing still need no provider.

## Output and sound

PNG output is exactly 1920 × 1080, 2560 × 1440 or **3840 × 2160**, with 4K selected by default. Preview, scrubbing, PNG and video use the same compositing renderer. Exports contain artwork only. Source detail remains limited by the photograph, crop and stored image size; output dimensions do not invent detail.

Video export uses pinned **Mediabunny 1.65.2** and the browser's WebCodecs encoder to write each prepared canvas at its explicit project timestamp, with awaited backpressure. The 1920 × 1080 VP9 WebM represents one whole selected cycle; preparation can take longer than playback. Unsupported browsers retain a guarded MediaRecorder fallback: output is rejected when recording cannot preserve timing. Actual WebM packet timestamps are checked before any duration metadata is added or a download is offered. Exports are **silent by default**, with progress and Cancel; hiding the tab cancels. Explicit Include sound uses a deterministic local mix and Opus. Unsupported audio encoding gives a recovery message rather than dropping the chosen sound. The application trims Opus tail padding with DiscardPadding and rebuilds cues; the unmodified Mediabunny library remains pinned. PNG remains available when video encoding is unsupported. The observed frame counts in QA describe those runs, not a universal encoding guarantee.

Photo projects offer nine procedural sources: rain, wind, ocean, stream, birds, crickets, city hum, fire and tones. They are synthesis, not field recordings. Add private WAV/MP3/OGG audio (16 MB / 60 seconds / stereo), inspect its waveform and edit trim, offset, loop crossfade and level. Sound assets/settings persist in named projects and private editable backups. Master/layer edits crossfade at the continuing audio position; selected-only preview stays isolated. Classic retains its original mixer. Sound is always off on a fresh visit, reload and newly opened share; stored levels cannot start it. Artwork pause does not mute audio. Hidden tabs fade/suspend sound; Stop and unmount release nodes and contexts.

## Classic and provenance

**Classic** opens the original Shadow Garden/Rainprint atelier, with Paper, Ink, Natural and Future collections. Old `#art=` links select Classic automatically. Its v1/v2 migration, saved moments, sound and PNG exports remain available; [the historical v2 README](docs/V2-README.md) documents those controls. New visitors open the wallpaper gallery.

All application code was written through Codex in this same Asyncly task during the event. The original v3 renderer added no runtime dependencies; the Wan upgrade adds the official Gradio client, and the release retest adds Mediabunny for correct timestamped video output. Its WebGL grading/deformation shader, bounded Canvas mesh fallback, masks, IndexedDB storage and WebM metadata handling are written here. The supplied photographs are reused assets, not generated art or photographs taken by the builder:

| Photograph | Photographer | Supplied source dimensions |
| --- | --- | --- |
| [Misty forest, Falcade](https://unsplash.com/photos/misty-forest-covering-a-mountain-slope-5Rdwb97xdWQ) | Luca Bravo | 4096 × 2726 |
| [Wet street, Tokyo](https://unsplash.com/photos/wet-street-at-night-in-tokyo-yVUQlyRlJSw) | Valentin BEAUVAIS | 4096 × 6141 |
| [Monochrome coast](https://unsplash.com/photos/a-black-and-white-photo-of-waves-in-the-ocean-yN1lXxg5oKk) | Annie Spratt | 4096 × 2732 |

The original three copies were supplied by the supervisor under the Unsplash License. Nine additional reusable photographs and local thumbnails were bundled for the wallpaper gallery; all twelve have source/license links in the shipped [photo credits](public/PHOTO-CREDITS.html). Exact source links, hashes and license records are in [photo provenance](public/photos/provenance.json) and [asset disclosure](docs/PHOTO_ASSETS.md). Pinterest references were not copied. Classic retains two generated 1672 × 941 backplates, disclosed in [ART_ASSETS](docs/ART_ASSETS.md); they are not photographs or native 4K images. Paper and Ink remain procedural.

| Dependency | Use | License |
| --- | --- | --- |
| React / React DOM | Interface and lifecycle | MIT |
| @gradio/client 2.7.2 | Anonymous Wan upload, queue/SSE and cancellation | ISC |
| Mediabunny 1.65.2 (unmodified) | Timestamped local canvas encoding / WebM muxing | MPL-2.0 |
| fetch-event-stream 0.1.6 (transitive) | Gradio fetch-based SSE | MIT |
| TypeScript / React types | Static checking | Apache-2.0 / MIT |
| Vite | Local server/build | MIT |
| Playwright Test | Browser verification | Apache-2.0 |
| [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope), Manrope Project Authors | Self-hosted variable UI font; [bundled license](public/fonts/Manrope-OFL.txt) | SIL OFL 1.1 |

Mediabunny’s preserved [MPL-2.0 license](public/third-party/mediabunny-1.65.2-LICENSE.txt), [shipped notice](public/THIRD-PARTY-NOTICES.txt), [pinned package source](https://registry.npmjs.org/mediabunny/-/mediabunny-1.65.2.tgz) and [upstream source](https://github.com/Vanilagy/mediabunny) identify the reused, unmodified library. Exact versions are in `package-lock.json`. FFmpeg/ffprobe are local QA tools, not shipped runtime dependencies. No remote fonts, audio downloads, backend or analytics were added. The default free Wan route sends the selected crop/prompt to its public Hugging Face demo. The configurable Your API route uses browser REST fetch and a visitor-owned session key; service charges and browser compatibility depend on that connection. No new dependency was added for it. Public provider config/schema snapshots in `scripts/fixtures/` support isolated SDK transport tests. Real generated test clips stay in ignored `.asyncly/visual-captures/`, outside shipped assets. Local editing and exports still need no paid API. `/brag` informed deterministic timing/output validation; Hyperframes and a promotional film were not added.

Native wallpaper hosts, semantic photo segmentation and physical relighting are outside this browser editor. Plash/Lively remain untested. Publishing is handled separately from the Asyncly implementation task; no hackathon entry, terms acceptance or new account access is part of this work.

The [8 November functional audit](docs/FUNCTIONAL-AUDIT.md) records the repaired rain visibility, numeric editing, structural Undo/Redo, image replacement, zoom reachability and Classic rain-source controls, with the complete test matrix and verification limits.

Current wallpaper workflow validation and limits: [WALLPAPER-WORKFLOW-QA](docs/WALLPAPER-WORKFLOW-QA.md). No runtime dependency was added for this redesign.

## Scene-studio UI font

Manrope variable UI font is self-hosted from the [Google Fonts Manrope package](https://github.com/google/fonts/tree/main/ofl/manrope), by the Manrope Project Authors, under [SIL OFL 1.1](public/fonts/Manrope-OFL.txt). The license is bundled beside the font. No new npm dependency or remote font request was added. Authored SVG controls extend the existing icon component. Photographic reuse remains documented in [photo assets](docs/PHOTO_ASSETS.md).

## Motion Plus

Animate scene supplies a different editable motion prompt for each of the twelve photographs. Dune asks for fine windblown sand with fixed ridges/camera; space prompts are labelled artistic. Existing generation providers and automatic editable insertion are unchanged. Local retouch remains in Advanced and is not advertised as realistic scene generation.

Motion includes non-destructive exposure, temperature, selective hue/strength and highlight-bloom tracks. Add/update/remove keys at the playhead, choose easing, or use the gentle light loop. Linked endpoints edit the start key and remove separate end keys with Undo; use interior keys for visible change. Before/reduced motion bypass automation, preserving base settings. Video trim/speed/fit/seam controls are in main Motion.

[Motion Plus QA, all-scene audit, checks and limits](docs/MOTION-PLUS-QA.md). No new npm dependency, downloaded audio or backend was added.

## Guest entry and optional guide

First visits open a photographic welcome with immediate guest access, featured scene selection, private image import and a gallery route. Existing local work and direct studio/share/Classic links open quietly. Welcome can be replayed from the gallery or Guide without resetting edits.

Guide connects Choose → optional Animate → Customize → Use wallpaper through the real controls. Successful downloads offer an editable backup, local save and desktop setup instructions. PNG completion follows the exported frame; failed or cancelled exports never mark the journey complete. The first default composition is saved only after an actual choice/edit. Storage recovery keeps unread work intact and labels new bundled work as session only.

No dependency or asset was added. See [guest journey QA](docs/GUEST-JOURNEY-QA.md) for scope, recovery behavior, evidence and limitations.

## Living welcome and interface motion

Welcome keeps its three licensed photographs gently moving after the opening, with an explicit Pause/Play background control. OS or studio reduced motion uses static photography; hidden pages and paused backgrounds stop rendering. Back to workspace uses a short directional blur/depth shift. Gallery, inspector, guide, dialogs and workspace changes share brief CSS/WAAPI transitions without remounting projects or delaying native actions. These effects stay outside exported artwork. No dependency or asset was added. See [motion QA and evidence](docs/LIVING-MOTION-QA.md).

The [motion efficacy retest](docs/MOTION-EFFICACY-QA.md) records the fourteen-source before/after audit, corrected foliage edges, post-grade bloom guidance, cropped-matte readiness, real control recordings and decoded default-motion exports. Workspace suspension retains the current artwork/playhead; navigation transforms do not change canvas backing size.
