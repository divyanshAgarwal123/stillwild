# Real-video restore selection correction — 8 November 2026

The restore-selection defect is resolved. Default restoration now selects the topmost visible, positive-opacity, unlocked photo/video. If none exists it falls back through visible editable layers, visible layers, recoverable hidden/locked layers, then null for an empty project. One shared policy covers startup/reload, presets, portable imports, named loads, hash links and invalid-selection repair.

The old defaults selected the bottom image even when hidden beneath a visible video. Exposure then edited that hidden image and appeared ineffective. A valid deliberate selection remains selected during ordinary edits, including hiding, locking or reordering it. The inspector shows **IMAGE · HIDDEN** or **VIDEO · HIDDEN** for hidden selections. Explicit add/duplicate and structural redo selection remain usable; restored hidden sources do not steal selection from visible media. Restores clear stale pin/tool state when selecting another layer.

No project/schema migration, dependency, API, renderer, media decoder or storage-contract change was made. `.openai/hosting.json` is unchanged. Existing projects and real footage were kept; all test edits used isolated disposable browser profiles. Nothing was committed, pushed, deployed or submitted.

## Real footage and API boundary

The supervisor reports one successful generation in the signed-in **Google Flow Pro UI**, using **12 existing credits** (supervisor verified balance 895 → 883), with no new API billing setup or API key. This is separate from the app’s Gemini API integration. Its two prior manual API requests returned **HTTP 429 → HTTP 402**, no video, and no automatic retries. Successful generation through the app’s billed API remains unverified.

The supplied real clip is 1280 × 720 H.264, 96 frames at 24fps with AAC, container duration 4.032s and 2,243,895 bytes. Its SHA-256 was checked locally: `d99a7a6726e796f494e837b696e63da44e218955bac5939cc2a16e0ac4d63acb`. The original clip, mandatory regional watermark, and exact portable repro remain ignored under `.asyncly/visual-captures/pro-video-live/`; no real footage was added to public or tracked fixtures. This task made no generation requests and accessed no credentials, cookies or tokens.

The supervisor’s deployed-studio real-pixel speed/trim/grade/mask/play/pause/reduced-motion results are retained as inbound evidence. The supervisor also reports full decoding of the real edited 4.000s 1920 × 1080 VP9 WebM (96 frames, no audio), an actual 3840 × 2160 PNG, and exact preservation of the original MP4 SHA in its portable project. These are specific real-clip results, not a universal recorder-frame-count guarantee. Fresh local checks below use that same real-video portable project to verify the selection repair.

## Validation

Evidence: `.asyncly/visual-captures/restore-selection/`.

- **37 unit tests pass**, including four small default-policy tests covering media priority, covered/hidden/locked/zero-opacity layers, nonmedia fallbacks, empty projects and unchanged layer order.
- **10 focused browser groups pass** through actual portable import, reload, named load, theme undo/redo, hash restoration, structural deletion/undo/redo and explicit add/duplicate. Both hidden-original and visible-covered-original cases select VIDEO and disable photo-only pins/flow. Actual sequential Exposure typing changes the real video by mean RGB **51.30/255**; Undo restores the frame exactly. Manual hidden-photo editing remains deliberately selected and changes no visible pixels, with HIDDEN feedback. All-hidden/locked/zero-opacity and empty fallbacks remain recoverable. Zero provider requests and browser errors were recorded.
- **27 relevant photo/video groups pass**: 16 broad photo groups, five renderer/export groups and six final media groups. This includes all grade controls, masks and transforms, save/share/import, paused/reduced/hidden behavior, measured audio, exact 4K share/export parity for all three directions, export cleanup, and a fresh UI-exported 4.000s 1920 × 1080 WebM that decodes and seeks to four distinct frames. **Production build passes.** Outcomes are recorded in `regression-report.json`; the application remained unchanged throughout the final passing runs.

The first broad photo attempt sampled the frame counter immediately after exiting fullscreen, before one pending layout redraw. The test now waits two animation frames for layout, then retains its original 700ms no-redraw assertion. No renderer change, skip, expected failure or retry annotation was introduced; the initial attempt log is retained. A subsequent cold-start assertion timed out during a supervisor-confirmed temporary Mac/CUA/terminal stall. A standalone startup diagnostic then loaded the photo with no errors after host recovery. That stall is recorded separately from app asset loading; no loader code or timeout was changed.

The first final-media attempt lacked `urban-4s-1080p-silent.webm` in this task’s new evidence directory. Its decode error was a missing prerequisite, not a renderer failure. Running the existing `v3-render-checks.mjs` producer with the same evidence directory, then rerunning final checks, passed the original decoder/seeking assertions. The failed attempt log remains available.

Frozen application SHA-256: `4705b513571bb6d8285998ead04ac6f6c88a31a22e09f315e26fabc6529042a6`. `regression-report.json` records the exact source file inventory and suite outcomes; `restore-report.json` records the focused checks and pixel measurements. There are no unresolved failures in the required final checks. After the validation browsers closed, the final preview HTTP request returned 200.

Desktop captures at 1440 × 1000 were inspected: [VIDEO after reload](../.asyncly/visual-captures/restore-selection/reload-video-selected.jpg), [visible exposure edit](../.asyncly/visual-captures/restore-selection/restored-video-exposure.jpg), and [manual hidden selection](../.asyncly/visual-captures/restore-selection/manual-hidden-status.jpg). The real watermark remains visible. These screenshots prove restoration/feedback, not a new generation run.

Reproduce with the ignored real portable fixture present:

```sh
npm test
node scripts/verify-video-restore.mjs
npm run test:e2e
npm run test:e2e:render
npm run test:e2e:final
npm run build
```

The renderer/export producer must precede final checks and use the same `STILLWILD_EVIDENCE_DIR` if one is supplied. Checks use installed Chrome and disposable local data. Other browsers and native wallpaper hosts remain outside this fix. The supervisor owns publication; the successful deployed real-clip export/persistence checks above are supervisor evidence. Preview is left at **http://127.0.0.1:5173/**.
