# Gemini motion QA — 8 November 2026

The client integration and editable video layers are implemented. Local verification passed on frozen source. **Live video generation remains unverified and blocked by provider quota/billing.** The supervisor completed two manually requested real tests with the user’s privately entered key: first HTTP 429 (quota/rate limit), then HTTP 402 (Payment Required). Neither returned a video; neither triggered an automatic re-POST. The key was explicitly cleared again after the second test. The supervisor/user owns billing, quota recovery, any further paid test and publication. This task did not read their credentials or make billable calls.

Preview: **http://127.0.0.1:5173/**. No deployment, submission, account or billing changes were made. `.openai/hosting.json` retains SHA-256 `e6ebdfb66856f275dfddd32d12de8ec70308377c2ac5736a720097883071e381`.

## Request and privacy contract

The optional AI inspector uses `gemini-omni-1.2-flash` through `POST https://generativelanguage.googleapis.com/v1beta/interactions`. It sends a JPEG source and the visitor’s prompt, requests 16:9 native 720p for 4s or 8s, and sets `store:false`, `stream:false`, `background:false`. It omits `delivery` to use the documented default inline output, decoded from REST `steps → model_output → content → video`. It does not use retired Veo endpoints. [Google Omni documentation](https://aistudio.google.com/docs/omni) and the supervisor-supplied official snapshots under `/tmp/stillwild-google-*-docs.txt` supplied the API contract.

The source is the selected photo’s crop, without grading, masks, rotation/flips, text, weather or guides. Non-16:9 crops fit inside a 16:9 matte. The inserted clip cover-crops that matte back to the source layer’s aspect and retains its request-time transform, grade and visibility mask once. In a mocked identity-result test, a nonuniform `.62 × .89` layer with crop zoom 1.4, offset crop, rotation 24° and both flips matched its photo within mean RGB **0.889/255** after JPEG/H.264 encoding. Actual model content can change; this test verifies local placement, not model fidelity.

A result waits for explicit **Add video to current project**. The original photograph and other layers remain. Changing themes or editing during a request cannot overwrite newer work. If the source no longer exists, explicit Add creates a new layer in the current composition. The downloaded original remains available after local decode or storage failure.

The password field, Clear key, AI Studio key-help link and cost disclosure are visible. Keys stay in component/service memory, clear on reload or explicit Clear, and never enter localStorage, sessionStorage, IndexedDB, project/history, URLs, portable files, source, environment variables or logging. Tests used a synthetic noncredential in isolated browser profiles. No operator profile or private key file was inspected. Photos/prompts go directly to Google; keys are not forwarded to Sites or another backend. The output estimate is $0.28 for 4s / $0.56 for 8s plus input/thinking charges, with a [Google pricing link](https://aistudio.google.com/docs/pricing#gemini-omni-1.2-flash); the UI states that estimates are not guarantees and paid-tier access is required.

The HTTP 402 message tells visitors to enable API billing or add available credits and check their eligible API balance. A Google Pro UI subscription is separate from app API billing. Pro can offer Developer Program Cloud credits after activation, but the API still requires billing and an eligible available balance. No billing changes were made here.

Generation is a single explicit POST with one active job and no automatic retry. Stop waiting aborts local work and warns that Google may still process/charge. Responses, prompts and keys are not logged. Payment/quota/access/key/network, malformed/text-only/safety-only output, timeout, abort, oversized media, processing failure and decode errors fail visibly.

URI responses remain defensive support: validate the official file ID, bounded polling to ACTIVE, then bounded download. The key is only sent to the canonical Google API host. Automatic redirects never carry it. A readable redirect to an allowlisted Google storage URL is fetched without the key; foreign URLs, credentials, unexpected queries and opaque browser redirects are rejected. **Mock readable redirects do not prove browser redirects work.** Inline delivery avoids routing every job through that path. A URI failure never regenerates a paid job.

Credential-free OPTIONS checks on the exact Interactions POST and Files `:download` GET paths returned HTTP 200 with the deployed origin and required `x-goog-api-key`/Content-Type headers at 2026-11-08 10:18 UTC. This establishes preflight compatibility only, not successful generation or download. The two reported live outcomes are HTTP 429 followed by HTTP 402; neither establishes successful generation.

## Editing, timing and storage

Generated and imported MP4/WebM use the same video-layer path: transforms, cover crop, flips, rotation, opacity/blending, all existing grades, visibility masks, stacking, duplicate/delete and undo/redo. Trim in/out, speed and an internal crossfade are in Motion. Still-photo pins/flow/freeze controls are disabled for video. Text, shape, gradient, photo and weather layers continue to composite normally.

Paused HTML decoders seek from the project clock; they do not run an independent playback clock. WebGL uploads each new frame; Canvas fallback refreshes its graded pixels. PNG and recorded export await decoded frames and use the same timing/compositor. Pause and reduced motion freeze output. Source clip audio stays muted, and existing exports remain **silent**; neither clip audio nor the ambient mixer is mixed into them.

Crossfade softens internal clip repeats and shortens their period. Arbitrary trim/speed can jump at the **project** boundary. The UI states this, and no blanket seamless-cycle claim remains. Adjacent-frame tests measured zero mean RGB difference across the chosen internal crossfade, versus **10.096/255** at an intentionally mismatched project boundary. This is a disclosed limitation, not hidden by comparing only `t=0` with `t=duration`.

Limits: 12 total layers, up to 3 video layers; 10 distinct private media assets; 32 MB and finite 0.1–30s per video, maximum 4096 × 2160; existing 16 MB image bounds; 144 MB complete portable file; 16 named projects. Invalid media is rejected before replacing work. Media/project saves remain atomic and serialized with autosaves; import IDs are remapped. Existing v3 image files, Classic/v1/v2 work and frozen built-in links remain valid. Private videos use portable files rather than leaking bytes or remote URLs through share links. Browser storage can still be cleared by the browser/user; portable backups are recommended.

Each preview/export owns its decoders. Deleting or changing layers prunes unused decoders/textures. Abort/disposal while opening the secondary blend decoder released both decoders/object URLs in the regression. Streams, timers, renderers and export resources close in `finally` blocks. No runtime dependencies were added.

## Executed checks

The broad functional suites ran on application SHA-256 `a6b20e58040fc552aa42bfcccd6dcb2c137f94b43c01c6638592383a9dbeb61e`. Footer/provenance and canonical-link corrections received a focused browser check and build. The final narrow HTTP 402 message correction received all 33 unit tests, including its dedicated redaction/no-retry case, and a production build. Request flow is unchanged; earlier browser/functional results are retained for unchanged behavior. Test fixture footage is synthetic FFmpeg `testsrc2`, **not an AI-generated demonstration**. All generation-test requests were intercepted; no test made a real provider POST.

| Coverage | Result | Evidence under `.asyncly/visual-captures/gemini-motion/` |
|---|---|---|
| Unit/provider contract, inline/URI, schemas, hosts, redirects, limits, no retries, safe errors and cancellation | 33 tests passed; 0 skipped | `final-unit.log`, `tests/gemini.test.mjs` |
| Real browser inline generation → editable clip; grading, undo/redo, real pointer mask, transforms, trim/speed, playback, pause/reduced, private save/reload/portable/share, pending-job theme change, key absence, desktop/touch | 13 groups passed | `browser-report.json`, `browser.log` |
| Nonuniform framing; secondary decoder abort cleanup; quota/redaction; Stop waiting; URI fallback; corrupt/oversized import; exact PNG/preview parity | 7 groups passed | `edge-report.json`, `edges.log` |
| Recover original after decode/storage failure; video duplicate/delete/history/limits; finite WebM reimport | 4 groups passed | `retention-report.json`, `retention.log` |
| Accepted photo editor / edges / render / final suites | 36 groups passed | `regression/photo/`, `regressions.json` |
| Accepted Classic suite including legacy migration, palettes, lighting, audio, sharing and export | 27 groups passed | `regression/classic/browser-report.json` |
| TypeScript and production Vite build | Passed | `build.log` |
| Supervisor’s two manual real Google requests | **BLOCKED — first HTTP 429, then HTTP 402; no video on either; zero automatic retries** | Supervisor report in this thread; no credentials copied |

The legacy edge fixture now uses nine 13 MB images, each below the image bound and within ten assets, to exceed the new 144 MB base64 portable budget. It asserts rejection and unchanged current work. Obsolete 48 MB/error-wording assertions were updated; bounds were not weakened. Two earlier browser-test failures were harness assumptions: checking a deliberately hidden AI panel after insertion, and accessing collection buttons before opening Saved projects. Final runs exercise visible controls. WebM reimport accepts the finite duration measured by the browser rather than assuming constant recorder cadence.

The actual edited PNG download is **3840 × 2160**. The edited silent video fully decodes as **1920 × 1080 VP9**, container duration **4.000s**, **95 encoded frames**, with distinct sampled frames. MediaRecorder uses real-time variable cadence; 96 encoded frames are not guaranteed. A browser can report a slightly longer decoded duration (about 4.14s in this run) than the declared container duration. Source timing remains deterministic; live recording cadence depends on the browser/load. 4K output dimensions do not create native 4K model/source detail.

Fresh broad image-only checks retain exact frozen-share/4K PNG pairs and measured audio behavior. Video-specific preview/export parity compared every channel at 640 × 360 and found **zero differences** for the edited frame. Native WebGL and fallback hashes both change across distinct video times. Five actual preview frames over 3s are saved with the retention report; screenshots were inspected at desktop and 390px touch layouts. They show fixture playback/editor state, not successful live AI output.

## Reproduce and remaining limits

With the detached preview running:

```sh
npm test
node scripts/verify-gemini-motion.mjs
node scripts/verify-gemini-edges.mjs
node scripts/verify-gemini-retention.mjs
python3 scripts/gemini-regressions.py
npm run build
```

The fixture is generated locally before the three video browser runners:

```sh
mkdir -p .asyncly/visual-captures/gemini-motion
ffmpeg -y -v error -f lavfi -i 'testsrc2=size=640x360:rate=24:duration=4' \
  -c:v libx264 -pix_fmt yuv420p -preset fast -movflags +faststart \
  .asyncly/visual-captures/gemini-motion/fixture.mp4
```

Browser verification used installed Chrome 157 on macOS, isolated profiles, 1440 × 1000 desktop and 390 × 844 real browser touch events. Safari/Firefox/WebKit, physical mobile devices, native wallpaper hosts, actual model output fidelity and successful paid Google generation remain unverified. The supervisor’s quota/billing recovery and eventual real-output check remain external to this source handoff. No automatic approval/Add, commit, push, deployment or publication success is claimed.

Final release application SHA-256: `0678507d483d77295c9f0be1409e197638757449f29183864a668af09a59bb30`. The focused release check verified the canonical `https://aistudio.google.com/apikey` help URL, pricing anchor `#gemini-omni-1.2-flash`, **Saved locally** footer, corrected README provenance, empty key and zero provider requests. The release production build passed. [Evidence manifest](../.asyncly/visual-captures/gemini-motion/evidence-manifest.json) · [Current AI panel](../.asyncly/visual-captures/gemini-motion/release-ai-desktop.jpg) · [Synthetic edited-video export](../.asyncly/visual-captures/gemini-motion/video-layer-edited-4s.webm).

The final HTTP 402 correction changes error guidance only: enable API billing or add available credits and check the eligible API balance. Its unit verifies the provider body/key remain redacted and the generation POST occurs once. Both manual live failures (429 → 402) remain blocked/unverified; no further real request was made by this task.

Later supervised **Flow Pro UI** generation and real-video editing succeeded using existing credits, without API billing setup. That is separate from the still-unverified billed API path documented here. See [the bounded restore-selection correction](REAL-VIDEO-RESTORE-QA.md) for the real clip, repair and fresh checks.
