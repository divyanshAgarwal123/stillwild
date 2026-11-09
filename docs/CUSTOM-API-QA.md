# Configurable animation API · 9 November 2026

Animate now offers **Wan · free shared quota** and **Your API**. Wan stays the default, with variable shared queue/daily limits and no guaranteed allocation. The branded Google/Kling panels, adapters and manual website workflow have been removed. Their saved video provenance is retained. No dependency changed.

## Default contract

Your API uses one authenticated JSON POST to the configured HTTPS generation endpoint. The default parsed JSON template is:

```json
{
  "model": "{{model}}",
  "prompt": "{{prompt}}",
  "duration": "{{duration}}",
  "image": "{{image_data_url}}"
}
```

An exact `{{duration}}` value becomes a JSON number. `{{image_base64}}` supplies raw JPEG base64; `{{image_data_url}}` adds the JPEG data URL prefix. Placeholders replace values, never field names or executable expressions. Quotes, newlines and literal braces in the visitor's prompt remain ordinary string data. Optional model defaults to empty; remove that field from the template if the service does not accept it.

Authentication defaults to `Authorization: Bearer <session key>`. Configure a different prefix such as `Key`, or a named API-key header and blank prefix. Endpoint queries, embedded credentials and fragments are rejected. HTTP is allowed only through explicit development opt-in on the exact current loopback origin, including its port.

Supported responses:

- Direct `video/mp4` or `video/webm` bytes.
- JSON containing `video.url`, downloaded without API credentials or cookies.
- JSON containing `video.base64` and optional `video.mime_type` (`video/mp4` by default).
- Queued JSON: `status`, `poll_url`, optionally `result_url`. Default pending states are queued/pending/running/processing; complete states are completed/succeeded/success/done; failed states are failed/error/cancelled/canceled. A complete response can contain the video or lead to the result URL. A result response may omit status.

API format exposes each field path and state list. Paths use up to eight own-property names or array indexes, such as `outputs.0.location`; blank disables a mapping. Poll/result templates accept only `{{id}}`, using a validated 1–64-character alphanumeric, underscore or hyphen ID from the configured ID field. The creation ID and resolved job URLs persist when subsequent polls omit them. Later responses cannot replace those resolved URLs or change that templated job ID.

Authenticated GETs stay on the configured endpoint origin and API directory. An explicit directory path can broaden/narrow that boundary; `/` trusts that origin. Returned external video URLs receive no auth, cookies or referrer. Redirects are disabled. Services requiring redirects, multipart, custom signing, WebSockets or other protocols need an adapter that implements those requirements. CORS must permit this studio's origin. These mocked checks do not establish live compatibility with any service.

## Bounds and retained behavior

One generation POST per activation, no automatic generation retry. Waiting ends at 180 response-processing iterations or ten minutes and combines deadline/user abort. Video is limited to 32 MiB; JSON is capped at the base64 equivalent plus 64 KiB; inline data is bounded before decoding. Request templates are capped at 64K characters, 2,048 nodes and depth 12; prepared JPEG base64 at four million characters and request JSON at 6,291,456 characters. Prompt length is at most 2,400 and duration 0.1–30s. Invalid formats, field paths, states, URLs, redirects and oversized/failed responses fail locally with static guidance. Raw provider bodies and network/stream errors are hidden.

Connection settings and key remain in component memory, survive panel changes, and clear on reload/Clear connection. Clear also aborts local waiting. They are excluded from project/portable data, URLs, localStorage, sessionStorage and IndexedDB. Remote jobs may continue and incur the service's charges after local waiting stops.

Neutral source framing, automatic editable insertion, latest appearance and video crop, transferred mattes, original recovery, race guards, Undo and sound-off behavior use the existing paths. New Your API layers carry `custom`, fitted repeat/crossfade and unknown source FPS. Wan retains its known 16fps setting and official SDK transport. Existing `google`/`kling` metadata still validates without those retired adapters.

## Validation and provenance

Baseline before edits: **112 unit tests passed**. The final current suite passes **109 tests**, including 16 generic-adapter groups, five video compatibility/handoff groups and the retained Wan and studio tests. Retired provider transport tests were replaced; their useful video-schema and insertion checks remain in `video-compatibility.test.mjs`. The missing-ID regression exercises create-with-ID → pending-without-ID → completed-without-ID → result → keyless media, with exactly one POST. The first focused run also exposed an `image_base64` placeholder parser defect; the repaired test verifies literal prompt braces and typed substitution.

The production build passes. Vite retains its advisory about a chunk above 500 kB. No real key, remote generation, payment, account, commit or deployment was used.

Supervisor-reported CUA checks used isolated `http://127.0.0.1:5198`, a local reverse proxy to Vite on port 5187 with offline fixtures only. Reported passes: exactly two choices; invalid configuration gating; queued POST → two ID-less polls → result → keyless media → automatic editable insertion; direct MP4; changed model/duration reaching the fixture; regeneration retaining Exposure 0.6; visible video changes from Exposure 0 to 1; a 429 body containing a fake key/private detail safely redacted with one POST; Stop waiting; reload restoring the wallpaper with empty endpoint/key/model; and editable advanced fields at 390px (document width 390, panel width 388). These are supervisor observations, separate from the executable local report below. The supervisor subsequently confirmed Clear connection during a waiting POST emptied endpoint/key/model and stopped waiting; a 581,843-byte portable file included the custom video and excluded the fake key/endpoint/model; and a PNG was verified at 3840 × 2160. A clean Dune insertion followed by Undo restored an unanimated image. Those checks also identified the retained-result defect corrected below.

The local ten-group browser run passed configurable base64/header/model requests, double activation with one POST, automatic real-media insertion, regeneration/Undo, original recovery after decode failure, Clear while waiting with late-result blocking, exclusion from project/portable/browser storage, reload clearing, both legacy video imports and 1920 × 1080 PNG exports, official Wan SDK queue/quota handling with no retries, 390px access, and pending-request page navigation without late insertion. This run predates only the scoped retained-result correction; unaffected coverage is retained. The final affected rerun adds three passing groups on the corrected source, including the configurable POST and genuine temporal differences in the reapplied video.

The browser exception was traced to the test initializer touching localStorage on `about:blank`. The initializer now runs only on the local HTTP document. An old Animate selector and a counter sampled before asynchronous source preparation were also corrected in the harness. The final ten-group and affected three-group runs have zero browser exceptions; diagnostic runs remain in the evidence directory.

## Retained result after Undo

The supervisor found that Undo removed the generated video while a permanent local flag still disabled its retained Apply action. The panel and insertion guard now use the successful result's saved asset identity and actual presence in that project. Reapply keeps the same asset identity, so historical Undo/Redo states stay accurate. The session mapping holds only the current result, rather than an accumulating permanent applied set. Original bytes and project contracts are unchanged.

A focused unit regression covers application, removal, another project and reapplication. The fresh Dune UI check performs one mocked generation, Undo to an image, enabled **Apply retained motion**, reapply, Undo/Redo and reapply again. Each installed state contains exactly one video; the same saved asset is reused; POST count stays one. Five practical-scale canvas samples differ during subsequent playback. The true real-time recording is `retained-result-realtime.webm`; the forest clip is an offline stand-in deliberately returned for the Dune test, not a claimed generated Dune result. Desktop Undo/reapply and mobile screenshots were inspected.

Current local browser evidence and final hashes are indexed in `.asyncly/visual-captures/custom-api-cleanup/handoff.json`. `scripts/verify-custom-api.mjs` runs only against localhost and intercepted provider/SDK responses using real offline clips. Historical Google/Kling browser scripts are not acceptance tests for this new UI.

## Final disposition

**FROZEN · supervisor ACCEPTED.** Final CUA on the corrected source confirmed Dune direct insertion → Undo → enabled retained Apply with accurate status → successful reapply. The fixture POST count stayed at seven before and after reapply. Clear/dismiss returned to an empty Your API form. The supervisor's `supervisor-your-api.jpg` was read and inspected. The earlier verified 4K and portable redaction results stand.

Final current checks: 109 passing unit tests, production build and whitespace check. The ten-group pre-correction browser evidence is retained for unchanged behavior; the three-group affected rerun passes on the final implementation. Its 7.72s real-time recording fully decodes. Existing localhost on port 5187 returned HTTP 200 after validation browsers closed. No app or test edits followed acceptance; publication remains supervisor-owned.
