# Kling studio integration · 8 November 2026

Implemented in the existing studio from clean source `543bbbacaed8ca78bf034de943b6479abe386cc2`. Wan remains the default; Google, Classic, user projects and the timestamped exporter are preserved. The saved Neon Falls study remains a rejected study. This change makes no claim about Kling output quality.

## Research and live-test limit

The supervisor's signed-in official Kling check found 66 consumer credits but **$0 API balance, $0 test balance and zero resource packages**, with no API key created. The inspected screenshot is [Kling API account balance](</Users/divyanshagarwal/Downloads/Stillwild-Kling-check/Kling-API-zero-balance.jpg>). Consumer credits cannot fund an API call. No key/account creation, paid generation or terms acceptance was performed here. A free API test is blocked by entitlement, not by a missing secret. The separate supervisor website test below used consumer credits; it does not change API entitlement.

The supervisor's dated [official developer pricing](https://kling.ai/dev/pricing) research recorded a $9.80 General trial for 100 units / 30 days / five concurrent tasks, rather than a no-card free API. The official API's unauthenticated browser preflight returned 401 without CORS headers. The studio does not accept official access/secret credentials or implement frontend JWT signing.

The optional browser route is [Kling 2.6 Pro on fal](https://fal.ai/models/fal-ai/kling-video/v2.6/pro/image-to-video): silent output is $0.07/second, approximately $0.35 for 5s or $0.70 for 10s. A personal **fal** key and API credit are required. Google, official Kling and fal keys are distinct. Prices and account entitlements can change.

Primary [queue REST documentation](https://fal.ai/docs/documentation/model-apis/inference/queue) confirms full-model submission and parent-app status/result paths. The [model schema](https://fal.ai/models/fal-ai/kling-video/v2.6/pro/image-to-video/api) supports JPEG data URIs, string durations `5`/`10`, optional end image and explicit `generate_audio:false`. Documented [platform headers](https://fal.ai/docs/documentation/model-apis/common-parameters) disable retries and request-history payload storage. A fresh keyless OPTIONS check against the queue returned 200 and allowed the production studio Origin plus Authorization, Content-Type, X-Fal-No-Retry, X-Fal-Store-IO and disable-fallback headers. This was a metadata check, not generation or proof of API credit.

## Supervisor live website result · separate evidence

The supervisor independently used actual studio UI to import the user's 4K photograph, download its neutral source frame, import a real Kling website video and insert an editable layer. The supervisor verified a 4s project, trim-in 0.8s, crossfade 0.24s, explicitly known 24fps, Exposure 0.3 and Undo back to 0.

One real Kling 2.6 **website** job succeeded without a card or paid API: 5s / 1080p / audio off, accepted at a displayed 25 consumer credits. The retained [original MP4](</Users/divyanshagarwal/Downloads/Stillwild-Kling-check/Kling-2.6-real-original.mp4>) was reported by the supervisor's ffprobe as H.264, 1920 × 1080, 24fps, 121 frames, 5.041667s and approximately 16.8 MB. Its watermark remains. This is website generation success, **not API generation success**; API balance/test balance remain $0 with zero resource packages.

Quality missed the brief: magenta lighting became flame-like patches. The result is not endorsed as finished or professional. The supervisor owns any separate export and publication. No further provider call was made for the copy correction.

The generic original/status label now says **Kling**, so importing a website result does not falsely attribute it to fal. The explicit paid **Generate with Kling / fal** label and cost remain unchanged. The 63-unit and 21-group mocked results above are retained evidence; only the required build/whitespace and narrow label presentation check are fresh after this copy-only correction. [Copy correction evidence](../.asyncly/visual-captures/kling-studio/copy-fix/handoff.json).

## Behavior

- Separate session-memory fal/Google passwords; clear/reload/unmount remove them. No owner key, backend, storage serialization, credential URL or fal-key-bearing media request.
- One explicit creation POST. Fixed endpoint; derived task URLs validated against owner/app/request ID; bounded JSON/video, conservative polling, abort/timeout, no POST retry/fallback and sanitized errors. Stop waiting does not guarantee remote cancellation or avoid charges.
- Neutral 1280 × 720 crop snapshot. Explicit insertion keeps the photograph and newer project edits; placement, grade and mask are copied once and the video's crop remains neutral. Provider `kling` persists through portable files/reload. Whole-repeat fitting starts with an adjustable 0.2s crossfade; FPS is not guessed. Drift, ghosts and a visible join remain possible.
- Optional same-image first/last anchors; natural waterfall/cloud and cyan/magenta scene-lighting prompts. These guide a model rather than certify appearance. Local flow is labelled pixel deformation.
- Manual website route: download prepared source, copy prompt, open [official Kling](https://kling.ai/app), then import the resulting video. No automatic upload, signup or generation. Account-dependent quotas, eligibility and watermarks; no promised free daily allotment.
- Crops/prompts leave the browser when explicitly generated. fal result URLs are public. The storage header concerns request-history payloads, not total vendor deletion. Downloaded portable assets remain local unless the user shares them.

## Validation

All generation success/failure responses in the agent's browser checks are **MOCKED**. Tests use fresh isolated contexts, real saved media and blocked unmocked external traffic. The 5s fixture is an explicitly identified resampling of previously saved Wan media, not Kling output. These automated checks do not validate real Kling model quality. The supervisor website test is recorded separately below; no live API generation was tested.

| Check | Result |
| --- | --- |
| Unit suite | 63 pass, no failures/skips |
| Focused Kling UI | 8 groups pass: session/cost controls, one silent POST, neutral crop, source/edit preservation, keyless exact original download, timing/grade Undo, portable/reload, errors/cancel, website import and responsive controls |
| Kling lifecycle/touch | 5 groups pass: provider switch, storage failure/original recovery and complete key-storage scan, rendered motion frames, unmount, fresh 390px touch |
| Existing Wan/Google panel controls | 8 groups pass using installed SDK / mocked REST; defaults, durations, examples, error/quota handling, cancellation, key clearing and isolation |
| Existing timestamped export from inserted mocked clip | Full VP9 decode at 1920 × 1080; first PTS 0, last 3.958, last packet end 4.000, duration 4.000 in this run |
| Build and whitespace | Pass |
| Live Kling/fal API generation | **Untested**; no usable no-card API credit and no paid-test authorization |
| Supervisor live Kling website generation | Succeeded with consumer credits; model appearance missed the requested lighting brief |

[Evidence report](../.asyncly/visual-captures/kling-studio/browser-report.json), [lifecycle report](../.asyncly/visual-captures/kling-studio/lifecycle-report.json), [packet probe](../.asyncly/visual-captures/kling-studio/export-probe.json) and [handoff inventory](../.asyncly/visual-captures/kling-studio/handoff.json) preserve the detailed checks. The initial browser attempt's assertion looked for the AI status via a visible-only role after insertion had correctly switched to Motion; its saved failure is under `attempt-1/`. The corrected assertion preserves the actual Motion controls and independent state checks. The first unit run had a mismatched error-message regex; it was corrected without changing the no-retry or credential-redaction assertions.

No broad Classic/release audit was repeated. Those implementations and exports were not redesigned. Chrome desktop and emulated touch were checked; other browsers and physical phones remain unverified. No commit, push or deployment. The supervisor owns review/publication and any authorized future live test.
