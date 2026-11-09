# Stillwild Atelier

**Living art for your desktop.** A local-first wallpaper studio with two scenes, four material families, movable light, atmosphere, and optional generative sound. Built in React and TypeScript. No account, backend, API key, or paid service is required.

## Run

Validated with Node.js 25.9. Use Node 24+ for the native TypeScript support used by the unit tests.

```sh
npm ci
npm run dev -- --port 5173
```

Open **http://127.0.0.1:5173/**. For a detached preview with a startup/readback check:

```sh
python3 scripts/start-preview.py
```

The script reuses an existing Stillwild server and honors `ASYNCLY_VISUAL_PREVIEW_PORT`. Logs and an owned server PID are under `.asyncly/visual-captures/`. Check that the recorded PID still belongs to this preview before stopping it.

```sh
npm run build       # TypeScript + Vite production bundle in dist/
npm run preview     # serve the production bundle
npm test            # schema, migration, recovery, presets, and backups
npm run test:e2e    # v2 browser acceptance against the running dev server
```

The browser runner uses an isolated headless Chrome profile. Set `STILLWILD_CHROME` to a Chromium executable or `STILLWILD_URL` to a different local origin. It closes browser contexts and recording streams, and writes compact assertions and SHA-256 digests under `.asyncly/visual-captures/v2/`.

## A working atelier

Shadow Garden and Rainprint each have three presets in every family, for 24 curated starting compositions:

| Family | Material and composition |
| --- | --- |
| Paper | Original botanical silhouettes, cut paper, warm grain, and watercolor blooms; entirely procedural. |
| Natural | Generated forest/conservatory environment, quiet pool, shaded edge foliage, filtered light, atmospheric rain, mist, and water rings. The default leaves the open center clear. |
| Ink | Procedural charcoal washes, expressive layered strokes, ink rain, and cotton-paper grain; entirely procedural. |
| Future | Generated dark lake and monumental arch, subtle aurora, fine particles, cinematic light, rain, and reflections. Extra sculpture is added deliberately. |

Natural opens on a genuinely fresh install. Existing v1 work migrates into Paper with its original objects, seeds, time, palette, wind, rain, and pigment intact. The original Paper style remains available in the collection.

The artwork stays central. Five compact inspector tabs hold the controls:

- **Art:** palettes and bounded elements. Add, duplicate, remove, resize, rotate, or drag. Select an element and use its canvas handle for a larger touch target. Arrow keys move the selection; Shift moves farther.
- **Light:** daylight, golden hour, overcast, moonlight, studio beam, or neon; movable source, intensity, exposure, warmth, softness, and beam strength. Softness also changes the light falloff when a scene has no foreground shadows.
- **Air:** independent mist, motes/particles, grain, bloom, wind, motion speed, and Rainprint rainfall/pigment. Optional storm light is slow and off by default. Reduced motion suppresses storm light consistently in the preview and exported/shared moments.
- **Sound:** rain, forest air, and soft tones with separate channel levels, master volume, Start/Stop, Mute, and a sleep timer. Sound is made locally with Web Audio. No sound files are downloaded.
- **Saved:** up to 24 named moments on this device. Load/delete favorites and download/import validated composition JSON files up to 128 KB. Names and JSON are treated as plain text.

Space pauses/resumes the artwork. Pause and sound mute are independent. Undo/redo groups an entire drag or slider gesture into one edit; use the buttons, ⌘/Ctrl + Z, Shift + Z, or Ctrl + Y. Reset restores the active preset and can be undone. History holds 40 edits in the current session.

Paused, reduced-motion, and hidden canvases stop their animation work. Hidden tabs fade and suspend audio. Stop disconnects audio nodes and closes the context. Sound always starts off on first visit, reload, and a newly opened shared link, regardless of stored mixer values. Imports cannot enable sound. An already playing soundscape remains independently controllable.

Wallpaper view hides the studio and fits the whole 16:9 composition without stretching. Escape returns on desktop; a small Back to studio control remains visible on touch devices. When browser fullscreen is unavailable, the artwork-only in-tab view remains usable.

## Saving, sharing, and export

The current composition saves locally. Storage failure/quota errors are visible; the interface does not claim success when a write fails. V1 storage and share URLs migrate through a retained legacy validator. Each stored candidate is read independently, so damaged v2 JSON cannot block recovery of valid v1 work. Legacy raw data stays intact. Unreadable candidates are copied to bounded recovery keys before replacement; if that copy cannot be written, automatic overwrite is blocked and the interface recommends a JSON backup.

Version 2 links include the theme, palette, composition, seeds, deterministic time, all visual light/effect fields, and a frozen flag. They open paused and cannot enable sound. Validation rejects unsupported types/enums and nonfinite values, clamps finite numeric bounds, and limits objects to 18. Procedural shape caches hold at most 128 shapes and one paper texture.

Share links use the app's current origin. A `127.0.0.1` link needs the app on that machine; public links use the deployed site. The existing Sites identity in `.openai/hosting.json` is preserved. The supervising session handles deployment after checks.

PNG exports use the **same Canvas renderer** as the live preview, at exact **1920 × 1080**, **2560 × 1440**, or **3840 × 2160** dimensions. 4K is the default. A separate canvas contains artwork only, without controls or selection handles. Image-backed exports wait for the selected enabled environment to decode, with bounded waits and deterministic fallback. Paper and Ink do not wait for unrelated images. Same-origin asset paths are fixed in code, so imported compositions cannot taint a canvas with an arbitrary URL.

## Build, assets, and reuse

All application code for v1 and v2 was written through Codex in this same Asyncly thread during the event. V2 extends the Git-backed v1 baseline, rather than replacing the project. Original procedural shapes, icons, and grain from this project's v1 are reused. No application template, stock artwork, remote font, downloaded audio, analytics, backend, or paid API was added.

The supervising session generated and delivered two original environment images during the event with the built-in image tool:

| Asset | Actual source dimensions | Bytes |
| --- | --- | --- |
| `public/art/natural-conservatory.png` | 1672 × 941 | 2,592,172 |
| `public/art/future-nocturne.png` | 1672 × 941 | 1,945,994 |

These are generated artwork, **not photographs or native 4K images**. The real 3840 × 2160 export combines resampled environment pixels with procedural layers; output dimensions do not create additional native source detail. Both backplates use an aspect-preserving cover crop. See `public/art/provenance.json` and `docs/V2-BUILD.md` for the full disclosure. Paper and Ink use no backplate images. Typography uses system sans-serif and Georgia.

| Dependency | Role | License |
| --- | --- | --- |
| React / React DOM | UI and lifecycle | MIT |
| TypeScript / React types | Static checking | Apache-2.0 / MIT |
| Vite | Local server and production build | MIT |
| Playwright Test | Browser checks, screenshots, export/audio evidence | Apache-2.0 |

Exact resolved versions are recorded in `package-lock.json`. V2 adds no runtime dependencies. The mixer uses filtered seeded noise, slow modulation, quiet sine tones, smooth gain ramps, and a compressor. Local diagnostics measure the post-master signal and can capture a short WAV without using a microphone.

## Review and scope

Fresh v2 screenshots, exports, audio evidence, browser results, and their manifest are under `.asyncly/visual-captures/v2/`. `docs/QA-V2.md` records the completed verification and its scope. `docs/SUBMISSION.md` contains a local draft entry explanation. Historical v1 evidence remains under `.asyncly/visual-captures/`.

This is a browser atelier with generated environment art and stylized procedural weather. It does not claim photorealism, physical simulation, or native desktop-host compatibility. Plash/Lively integration remains future and untested. This task does not submit an entry, accept legal terms, create account access, publish a deployment, or install native wallpaper hosts.
