# Stillwild v3 build and reuse disclosure

The v3 source was written in this existing Asyncly Codex task, on top of the working v1/v2 React/TypeScript/Vite application. No application implementation was moved to another session. The supervisor supplied the brief, licensed photographs, independent review and hosting context. Deployment remains the supervisor’s responsibility.

The default workspace is a charcoal photo editor. `src/photo/model.ts` owns the version-3 schema, presets, strict bounds and links. `storage.ts` validates images, uses IndexedDB transactions and serialized writes, and creates portable files with private image bytes. `useProject.ts` handles bounded gesture history, autosave and guarded import replacement. `Canvas.tsx` maps pointer/touch coordinates through layer transforms. `Studio.tsx` contains the editing workspace, timeline and export flows.

`render.ts` is the shared preview/export compositor. A locally written WebGL shader grades and deforms image pixels. Cached, bounded flow/visibility textures preserve deterministic rendering; layer transforms and blend modes compose in Canvas 2D. A bounded triangle mesh and CPU grading path retain editing when WebGL is unavailable. `webm.ts` adds finite Duration metadata to supported streaming WebM outputs without changing encoded frames. MediaRecorder and Canvas capture provide silent local video; no cloud video synthesis or microphone is used.

Classic is the prior application copied into `src/ClassicApp.tsx`, using its original model, renderer, hooks and saved data. `#art=` URLs and `?workspace=classic` select it. The new photo store has a separate IndexedDB database and never rewrites Classic’s v1/v2 keys. The existing mixer, icons and procedural Classic assets are reused from work written in this thread. Sound is mounted/disposed symmetrically under React StrictMode.

The new default art uses three reused real photographs under the supplied Unsplash License records. See [PHOTO_ASSETS](PHOTO_ASSETS.md) and [machine-readable provenance](../public/photos/provenance.json) for photographers, source pages, dimensions, bytes and SHA-256 values. The local copies are 4096 × 2726, 4096 × 6141 and 4096 × 2732. User imports stay local and may be downsampled to a 4096-pixel edge. Neither a 4K canvas nor deformation creates new source detail. No source photograph was generated or taken by the builder. Pinterest imagery was reference-only.

Classic’s two generated 1672 × 941 environments remain available and separately disclosed in [ART_ASSETS](ART_ASSETS.md). Paper/Ink are procedural. There is no claim of semantic layer extraction, unseen-background reconstruction, physical simulation or native wallpaper-host compatibility.

No runtime packages were added for v3. React/React DOM (MIT), TypeScript (Apache-2.0), React types (MIT), Vite (MIT) and Playwright (Apache-2.0) remain recorded in `package-lock.json`. FFmpeg/ffprobe are used outside the application to decode and inspect QA video and make an MP4 review copy of the browser-exported WebM. `/brag` was assessed for deterministic compositions and validated output; its Hyperframes runtime and promotional-film workflow were not reused.

`.openai/hosting.json` and the Sites project identity are preserved. No hosting action, legal acceptance, hackathon submission, account setup or native-host installation is part of this source task.
