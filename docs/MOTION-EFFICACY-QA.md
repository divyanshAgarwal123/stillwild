# Motion efficacy retest · 9 November 2026

The retest repairs the hidden Apply/playback gates, weak local treatments, doubled foliage edges and expensive per-pixel rendering. The supervisor reviewed the current fourteen-source exact gates, four recordings and material speed gain, and accepted the corrected Sorapiss default/high and Alpine default captures. Independent manual Tidal input changed displayed artwork by mean 4.235 RGB across 235,224 pixels (91,442 over 3); reload retained amount 100, enabled and paused at 7.61s. Independent Back preserved 649×365 artwork with zero changed pixels, the same 7.61s and no retired copies. Copies of the supplied JSON evidence are in `supervisor/`. These remain optional local pixel treatments. Their quality limit is recorded below.

All browser runs use disposable contexts and block external requests. No provider calls, keys, new accounts, commits or deployment occurred. The supervisor reports **12 current public saved projects**, superseding the historical 20-project count. This task never opened or cleared real public storage; final public-data checks and publication remain supervisor-owned.

## Behavior and fixes

- **Apply & preview** enables a usable region and hides its cyan guide. It preserves Pause, Before and OS/studio reduced motion. Shared links deliberately restore paused; the recording harness explicitly presses Play. Numeric fields and sliders were checked through actual keyboard input, committed storage and renderer state, rather than DOM range values alone.
- Readiness, Enable/Apply and temporal-source detection use the **current mapped crop**, preserving the stored matte. A cropped-out region offers Paint/reframe. Its region Play/reduced-motion action is absent; zero-amount treatments also offer no region Play action.
- Bloom guidance reads post-grade pixels inside the selected mapped matte. Exposure can create/remove eligible highlights. Eligibility is advisory and never falsely blocks Apply. The selected dark-region test chooses threshold 2 even with bright sky outside it. Bloom is labelled static; amount/threshold/radius alter light, not elapsed-time motion.
- Movement samples one displaced source location per pixel. Displacement tapers to zero at the matte boundary, and source-atop composition retains destination alpha. It no longer overlays shifted texture fractionally over identical unshifted texture. Foliage excursion/confidence and the Sorapiss matte were tightened to protect rocks and lower foreground. A synthetic edge test has no doubled grey plateau.
- Curated tools suit the source: Alpine cloud/foliage, Sorapiss foliage/water, water scenes water, city highlights/water, dunes/space static bloom. Imports retain explicit correction/All tools and Paint. Generic landscape suggestions now omit water; the earlier mountain matrix metadata predates that final suggestion-only correction.
- Harmonic row/column tables replace per-pixel trigonometry and large per-pixel fields. Bilinear addressing is shared across RGB. Unchanged graded source surfaces are cached separately from region parameters. Work is bounded by a 960px longest edge and 518,400 pixels, matte caches by 24 MiB, field tables by 256 KiB.
- Workspace suspension holds the last painted time instead of invoking reduced-motion/time-zero rendering behind Welcome. Pause skips unchanged repaint; video time commits only after a prepared frame paints. Back also uses layout width for backing dimensions: the before check shrank a 969px paused canvas to 954px during the temporary page scale. Current Back preserves 969×545, exact pixels and time. No navigation animation resizes that backing surface. Image readiness also invalidates the paused-paint cache: the final capture review caught an empty first paint being retained after decode, now covered by a content-pixel assertion without extra interaction. The affected Zoom check found later desktop/mobile CSS overriding intentional zoom; those rules now multiply the Fit width by the selected zoom while keeping fullscreen overrides.

## Fourteen-source matrix

Every source was measured at 960×540 with the guide hidden: amount zero/default/100, at non-symmetric phases 0.0925, 0.2825 and 0.5975 of a four-second cycle. Measurements compare RGB, not alpha. The local-video retouch matrix holds its actual source frame fixed so source video motion cannot inflate treatment efficacy.

The table lists offered/recommended treatments and mean temporal RGB change on a 0–255 scale between the first two phases. It is evidence of response, **not a professional-quality score**. Bloom's zero temporal response is correct; its default/high static difference is nonzero (for example Dune 9.36 RGB levels). Coverage is the coarse matte's mean weight, before display feathering. Timing is mean CPU draw in these bounded runs, not a universal frame-rate claim.

| Source | Treatment | Matte coverage | Before default temporal RGB | Current default / high temporal RGB | Before → current draw ms |
|---|---|---:|---:|---:|---:|
| Alpine quiet | cloud | 29.5% | 0.11 | 1.04 / 2.86 | 188.5 → 7.8 |
| Alpine quiet | foliage | 14.4% | 0.01 | 0.95 / 1.74 | 181.1 → 8.0 |
| After the rain | bloom | 4.1% | 0.00 | 0.00 / 0.00 | 47.9 → 11.2 |
| After the rain | water | 11.4% | 0.52 | 1.05 / 2.84 | 126.9 → 7.8 |
| Tidal studies | water | 99.6% | 2.55 | 5.19 / 7.48 | 110.8 → 15.2 |
| Quiet reflections | water | 12.1% | 1.70 | 2.12 / 3.98 | 116.4 → 7.9 |
| Above the pines | foliage | 8.1% | 0.01 | 1.57 / 2.99 | 158.0 → 7.7 |
| Above the pines | water | 2.9% | 0.17 | 0.67 / 1.54 | 81.9 → 7.5 |
| Woodland water | water | 4.4% | 0.81 | 0.96 / 2.14 | 74.2 → 7.9 |
| Venice at dusk | bloom | 14.3% | 0.00 | 0.00 / 0.00 | 58.5 → 13.3 |
| Venice at dusk | water | 14.1% | 0.11 | 1.79 / 3.93 | 109.2 → 8.0 |
| Dune light | bloom | 25.0% | 0.00 | 0.00 / 0.00 | 73.5 → 15.2 |
| Sand rhythm | bloom | 33.3% | 0.00 | 0.00 / 0.00 | 59.4 → 15.3 |
| Stellar nursery | bloom | 4.6% | 0.00 | 0.00 / 0.00 | 52.6 → 11.5 |
| Pacific edge | water | 62.9% | 2.87 | 6.13 / 9.82 | 155.2 → 13.4 |
| Galactic dust | bloom | 3.8% | 0.00 | 0.00 / 0.00 | 48.2 → 11.1 |
| Original mountain import | cloud | 2.1% | 0.01 | 0.15 / 0.54 | 49.6 → 7.0 |
| Original mountain import | foliage | 5.9% | 0.07 | 0.51 / 0.96 | 189.6 → 6.7 |
| Existing local video (source frame held for retouch tests) | bloom | 4.3% | 0.00 | 0.00 / 0.00 | 61.1 → 15.6 |
| Existing local video (source frame held for retouch tests) | water | 12.7% | 0.63 | 1.26 / 3.36 | 145.9 → 8.1 |

Full control measurements, captures and raw gates: [before matrix](../.asyncly/visual-captures/motion-efficacy-retest/before/matrix.json), [final matrix](../.asyncly/visual-captures/motion-efficacy-retest/final/matrix.json), and [final foliage confirmation](../.asyncly/visual-captures/motion-efficacy-retest/foliage-confirmation/matrix.json). The foliage confirmation supersedes only the foliage entries/captures in final. `after/` and `pre-review/` retain intermediate, unaccepted ghosted results; they are not the final visual evidence.

Cloud/water/foliage direction, detail, cycles and feather were measured separately. Bloom amount, threshold and radius were measured separately. Each source also has empty flow, pin strength, painted flow/freeze, camera amount/zoom, exposure, temperature, shadows and contrast results. Empty flow remains an exact no-op and now explains how to add a pin/flow stroke. Unsupported/empty suggested mattes explain Paint rather than pretending to reconstruct absent content.

Zero amount, disabled, Before, reduced movement and whole-loop endpoints pass exact RGB gates across all fourteen sources. Static bloom stays visible under reduced motion as designed. Feathering intentionally expands the effective matte: the raw coarse-mask outside-change counter includes that halo. A separate hard-mask far-exterior test passes exact stability on both GPU and forced Canvas, together with region independence and saved/shared/portable render parity. Near-boundary samples and whole-loop closures are retained in the matrix.

## Focused verification

- Complete baseline suite: **105 passes**, run once before edits. Final focused suite: **20 passes**, including seven new efficacy tests plus existing lifecycle/journey tests. No broad provider audit was repeated.
- Current-crop/bloom/portrait review: **3 passing groups**, including meaningful disabled-Apply, empty temporal sources, preserved matte and absent no-op playback controls. The earlier this/current-crop wording failure was a stale assertion, not an app defect.
- Real controls/recordings: **4 passing scenes**, Sorapiss foliage, Alpine foliage, Quiet reflections water and Dune static bloom. Keyboard Home/Arrow/End and sequential numeric typing commit LOW 10, HIGH 100 and the restored default. Moving scenes sustain their defaults before LOW/HIGH, then Pause, replay/Back and resume. Pause captures the pre-click frame/time exactly. Back leaves no retiring copy. Direction/detail inputs act immediately.
- Welcome: all three decoded scenes sustain bounded motion, freeze/resume and stop on the explicit hidden-document listener fixture. OS reduction overrides a stored false value; explicit Pause survives OS changes. Late decode cannot attach the wrong scene, failure retains usable entry, and forced no-WAAPI/no-ViewTransition works.
- Navigation: create double action inserts once; rapid gallery/editor/tab/guide/modal/Classic paths retain the mounted canvas, prompt/sound drafts, edits and Undo/Redo. Escape restores focus. Actual native image choice imports once. Native and deliberately rejected native fullscreen exclude Welcome/guide/toast/snapshot chrome. Share/Classic direct links bypass Welcome. Explicit sound stops when inactive and never restarts itself.
- Touch 390×844, desktop 1280×900 and short 1280×720 are the scoped viewport set. Touch/reduced fallback captures are in `routes/`. The initial blank captures remain in `routes/before-readiness-fix/`; final recaptures assert actual decoded content. The accepted renderer/media gates are retained across the subsequent layout/readiness-only corrections. Paused native video restoration and multiple-region timings are recorded in `lifecycle/`.

Validation reports and logs stay under [.asyncly/visual-captures/motion-efficacy-retest](../.asyncly/visual-captures/motion-efficacy-retest/). Initial browser sandbox failures, the original ghosted results, ambiguous retiring/hidden-panel selectors, the paused-share recording assertion and the real Back backing-size failure remain identifiable. Corrected harness runs exclude retiring presentation copies and respect hidden mounted drafts. Intermediate HMR reloads were not treated as production defects. The first zoom fixture was still playing; its renderer trace proves `paused:false` and advancing time. The corrected affected fixture explicitly pauses before strict photo/video Back comparisons; app pause policy was unchanged. Restored Fit is compared with the same closed/Advanced-off panel layout as its initial measurement.

## Affected zoom closure

The corrected workspace rules retain the existing Fit calculation and multiply its layout width for 150%/200%, including mobile. Fullscreen's existing important width overrides are preserved. Back still uses untransformed `clientWidth`; pointer mapping retains `getBoundingClientRect()`. Layout zoom can exceed the existing 1600px preview-bitmap cap.

| Viewport | Fit / 150% / 200% layout width | 200% backing bitmap width | Maximum horizontal / vertical scroll |
|---|---:|---:|---:|
| 1280×900 | 1026 / 1539 / 2052 | 1600 | 808 / 575 |
| 1280×720 | 706 / 1059 / 1412 | 1412 | 168 / 395 |
| 390×844 touch | 390 / 585 / 780 | 780 | 390 / 13 |

All four artwork edges are reachable in the scroll container. Each viewport passes strict paused **photo and video** Back checks at 200%: exact backing dimensions, PNG hash and held time, with zero retired copies. Returning Fit is compared in the original panel layout. The [zoom report](../.asyncly/visual-captures/motion-efficacy-retest/zoom/report.json) retains the complete measurements and pre/post hashes. Earlier playing-fixture and changed-panel-layout assertion failures remain in their labelled logs; neither required changing application Pause behavior or weakening pixel assertions.

## Bounded performance observations

The final portrait stress fixture renders at 400×960, not 960×2304. It retained 3,072,000 mask bytes and 250,880 field-table bytes, below the declared budgets. First edit took 20.4ms; the sixteen subsequent direction/detail draws ranged 7.6–38.8ms (median about 8.3ms). These are CPU measurements in this browser run.

A separate real-UI stress fixture enabled cloud, water and foliage over broad overlapping mattes. Sixteen actual direction/detail key presses per viewport measured first key-to-painted-frame time, clearing the event marker after its first paint. Results include cold edits and browser scheduling; they are not single-region quality settings or a frame-rate promise.

| Viewport | Recorded draws | Median / P95 CPU draw ms | Median / P95 key-to-paint ms | Maximum key-to-paint ms |
|---|---:|---:|---:|---:|
| 1280×900 desktop | 69 | 34.7 / 41.8 | 40.6 / 99.9 | 120.7 |
| 1280×720 short | 85 | 22.9 / 24.9 | 30.4 / 47.6 | 52.1 |
| 390×844 touch | 84 | 10.3 / 13.8 | 23.5 / 28.5 | 101.3 |

The single-region recorded controls had median CPU draws of 3.0ms Sorapiss, 3.1ms Alpine foliage and 4.4ms water at their practical artwork size. Stress timing samples and raw input latencies are in [lifecycle/report.json](../.asyncly/visual-captures/motion-efficacy-retest/lifecycle/report.json). The real video test imported through the native file chooser, scrubbed to 1.97s and retained exact 969×545 pixels and time through editor/Welcome/Back and gallery/Welcome/Back, with the same mounted canvas.

## Artwork and realtime evidence

[Replay page](../.asyncly/visual-captures/motion-efficacy-retest/replay.html) links original realtime files: Sorapiss 15.00s, Alpine 14.92s, water 15.08s and static bloom 11.68s, each recorded at 1280×900. These are actual UI recordings with normal timing, not deterministic screenshot animation. Container 25fps is the recording cadence, not a claim that the app always renders 25fps.

The [3840×2160 PNG](../.asyncly/visual-captures/motion-efficacy-retest/exports/alpine-region-4k.png) was inspected and contains artwork only. Both actual default-motion exports fully decode as **1920×1080 VP9, 96 frames, exactly 4.000s**, silent. Decoded frames at 0.37/1.13s differ by mean 1.69 RGB for Alpine and 1.36 for Sorapiss after downscaling to 480×270. See the [decode report](../.asyncly/visual-captures/motion-efficacy-retest/exports/decode-report.json). A separate UI PNG download/delivery matches the renderer hash exactly and occurs once.

Current visual comparisons: [Sorapiss source](../.asyncly/visual-captures/motion-efficacy-retest/foliage-confirmation/sorapiss-original.jpg), [default](../.asyncly/visual-captures/motion-efficacy-retest/foliage-confirmation/sorapiss-foliage-defaultImage.jpg), [high](../.asyncly/visual-captures/motion-efficacy-retest/foliage-confirmation/sorapiss-foliage-highImage.jpg); Alpine foliage and water source/default/high captures are beside their matrices. The supervisor independently accepted resolution of the obvious doubled-edge regression. The default realtime clip and actual export remain available for final manual judgment.

## Limits and handoff

Local retouch displaces existing image pixels. It cannot infer occlusion, synthesize water or animate branches semantically. Heuristic mattes can include unwanted texture and may need Paint/Erase/reframe; the mountain's sparse cloud response remains restrained. Maximum settings can distort texture. Coarse 96×54 mattes and the bounded treatment working resolution can soften tiny details inside treated areas; a real 4K output container does not mean a native-4K treatment field. Bloom alone is static. Welcome atmosphere is separate and never enters artwork exports. Browser/GPU performance and codec support vary.

Production build and whitespace pass on the final app source. The existing Vite bundle-size advisory remains. Complete current source hashes, exact evidence hashes and FROZEN state are recorded in the [handoff](../.asyncly/visual-captures/motion-efficacy-retest/handoff.json). Preview stays on the existing localhost server. Supervisor manual/public-data checks, packaging and publication remain outside this implementation pass.
