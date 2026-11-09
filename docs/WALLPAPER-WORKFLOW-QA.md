# Wallpaper workflow · 8 November 2026

Baseline: published v11 `1ed6bab8effe2b891a33f2b48bb1073c6d200ba5`. Implementation stays in the existing React/TypeScript/Vite/CSS app, with no dependency change. Sites identity and original media files are preserved.

## What changed

The working gallery has twelve distinct bundled photographs, local thumbnails, categories, search, favorites and My wallpapers. Source IDs and old shared links remain valid. Credits ship at `/PHOTO-CREDITS.html`; [asset disclosure](PHOTO_ASSETS.md) and `public/photos/provenance.json` identify every source, photographer/agency, license, dimensions and hash. No runtime third-party image requests are needed. Cold loading the website still requires its files to be available; no installable offline shell is claimed.

The studio gives the artwork more space, with Choose image, Animate, Customize and one Use wallpaper action. Look, Motion, Atmosphere and Sound are the normal sections. Advanced retains layers, masks, pins, painted flow, crop, detailed clip timing, FPS and timeline. Desktop mockups are UI only. Delivery groups fullscreen, genuine 4K PNG, silent live loop and editable backup, with manual macOS/Windows guidance and honest video-host limits.

Basic image choice preserves the current draft and starts a new neutral wallpaper identity. Advanced add/replace remains separate. Up to 48 navigation drafts use metadata storage, separate from the existing sixteen named slots; a full draft collection blocks switching with a backup message. Imported collection covers use local photo blobs only, viewport loading and URL cleanup.

API completion validates, applies and saves motion automatically, with zero required downloads. The linked original stays intact. Reanimation replaces prior linked motion, retaining the latest video grade, selective colour, placement, mask and post-generation crop; photo crop remains neutral after source preparation. Unrelated video layers stay. Undo keeps the previous composition. Wrong-project, removed/locked source and changed-source/crop results are retained for explicit recovery. An ambiguous or independently hidden legacy source requires a deliberate source choice. Session keys and provider no-retry rules are unchanged. The Kling website route remains manual and credits remain distinct from API credit.

Mist now uses a five-octave periodic density field with smooth advection, directional variation, feathered edges and sky/valley/full placement. Height/falloff appear only for spatial placement. The tile cache holds four seeds and one reusable 256×144 render surface. Preview and exports use the same operation. This adds atmospheric density; Advanced painted flow moves existing cloud pixels. It is not scene reconstruction or physical simulation. [Wallpaper Engine's effect overview](https://docs.wallpaperengine.io/en/scene/effects/overview.html) informed that distinction; no branding/assets were copied.

## Checks and actual evidence

Evidence: `.asyncly/visual-captures/wallpaper-redesign/`.

- **78 units passed**, retaining all prior 71. After the final video-crop correction, the **7 focused workflow units passed** again, including repeated regeneration, latest grade/mask/placement/crop, neutral photo crop, unrelated videos, source failures, metadata and mist invariants.
- **8 workflow browser groups passed** in disposable contexts: real gallery/search/favorite/drafts, new-photo identity and old named-project preservation, choose/import → mocked model → automatic editable wallpaper, second generation and Undo/Redo, no duplicate paid submission/download/reimport, wrong-project retention, failed key/media, isolated providers, save/reload/share, actual 4K still and 390px touch navigation.
- **3 collection groups passed**: real private-photo covers and URL cleanup; filtered counts/empty state and hidden category controls; saved real project → new photo → save/reload with old named data exactly unchanged; explicit legacy hidden-source choice.
- **8 provider control groups passed**, using intercepted Wan SDK/Google REST transport only. Durations/prompts, cancellation/timeouts, no retries/fallback, redacted errors and session-key removal remain checked. Kling auto-apply transport is mocked in the workflow suite. No live generation occurred.
- **4 selective browser + 4 renderer + 4 export/media groups passed** with the real watermarked Kling fixture. Exact original MP4 bytes survive portable round-trip. Full decoded 4s/96-frame/1080p timing and the existing selected-colour and unchanged-region tolerances remain enforced. These counts describe these runs, not all loads/browsers.
- **4 atmosphere/render/media checks passed**: disabled/zero and loop endpoints are exact; motion and amount/direction/scale/cycles/height/falloff visibly change pixels. Side borders feather to zero. Adjacent loop-boundary mean RGB difference is 0.022/255 versus 1.646 across quarter-cycle motion. CPU/GPU agreement is exact for the new atmosphere operation, isolated from pre-existing photo-grading differences. The real silent VP9 export fully decodes to 1920×1080, 96 frames, first PTS 0, final packet end/duration 4.000s. The still is 3840×2160.
- Final presentation check covers readable headline, complete 1280×720 artwork, one delivery action, collapsed crop details and Full frame control visibility. Production build and whitespace checks pass.

Initial test failures were retained/logged while fixing a transport-overlapping status notice and adapting stale UI selectors/disclosure assumptions. Import/saved-state assertions now wait for navigation/storage completion. Mist agreement isolates its own operation rather than requiring identical pre-existing GPU/CPU photo sampling. Assertions for real media decode, timing, colour and preservation were retained.

Inspect `gallery-final.jpg`, `studio-final.jpg`, `animate-final.jpg`, `gallery-mobile.jpg`, `studio-mobile.jpg`, `my-wallpapers-local-cover.jpg`, `mist-before-review.jpg`, `mist-after-review.jpg` and `mist-4s.webm`. The original rectangular-fog screenshot supplied by the supervisor is `/Users/divyanshagarwal/Downloads/Stillwild-Wallpaper-Workflow/Before-fog.jpg`.

No broad Classic audit was repeated; Classic implementation and previously accepted checks are retained. Real provider output quality, Safari/Firefox encoding and native wallpaper-host compatibility are not newly verified. The supervisor owns independent UI/export and production verification. No provider generation, credentials, accounts, billing, commits, pushes or deployment by this task.
