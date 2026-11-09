# Scene studio QA · 9 November 2026

Baseline: published v12 `901193d178e2f28eaebedb939b6fbcafa5c56503`. Implementation stays in the same Asyncly Source. No live provider generation, credentials, accounts, billing, commits or deployment were used.

## Result and scope

The photograph leads the mosaic and workspace. Scene-specific regions open an inspector with Enable, Matte/Paint/Erase and Amount first. The cyan matte is labelled **Region guide · hidden in export**, with Hide guide. Mobile Paint collapses the sheet; Done restores the selected region. Header Undo/Redo/Share and inspector Close have 44×44px targets. Palette changes require an explicit source, target and Apply. New gallery choices have no legacy weather enabled; existing saved settings remain intact.

Local decoded-pixel analysis supplies palette, luminance, contrast, highlights and colour/edge mattes, with twelve documented scene profiles and an import correction control. Suggestions never enable effects or replace manual work. Source-pixel cloud advection, water flow, anchored foliage and own-colour highlight bloom share one bounded post-grade operation across both grading backends.

The quality bar is art first, direct meaningful tools, explicit editing guides, honest inspectable heuristic suggestions, exact zero/off identity and smooth source-pixel loops. [DESIGN.md](../DESIGN.md) holds canonical tokens and component guidance; [.impeccable/design.json](../.impeccable/design.json) extends it. The [initial acceptance contract](SCENE-STUDIO-ACCEPTANCE.md) was written before app edits.

## Local evidence

All current evidence is under `.asyncly/visual-captures/scene-studio/`:

- **83 unit tests pass**: all 78 existing tests plus five scene tests. Optional metadata/legacy identity, strict malformed/finite/size boundaries, pixel-derived suggestions, crop/paint coordinates and repeated cross-provider aspect rebasing are covered.
- **Four focused scene groups pass**, including five real-photo raster cases: nature/clouds, water, foliage, Tokyo lights and nebula highlights. All have exact zero/Before bypass and stable unmasked pixels. Reduced motion bypasses motion. Direction and detail independently change actual cloud/water/foliage pixels. Bloom responds to its parameters. The actual cloud frames approaching phase 1 and 0 match at quantized pixel precision; this checks the corrected advection crossfade, beyond sine displacement math. CPU/GPU operation-response differences are recorded in `functional-report.json`.
- **Eight mocked Wan/Google provider groups pass**; existing key isolation, single submission, timeout/error and no-fallback gates remain. **Four selective-colour browser groups and four renderer groups pass**, including exact original MP4 preservation and real exported media. Provider mocks never spend remote quota.
- Scene exports: water, cloud, bloom and the water control each fully decode as **1920×1080 VP9, 96 frames, 4.000s**, with all packet timestamps checked. The still is **3840×2160**. Five decoded water/control frames have meaningful selected-region changes and bounded foreground codec error. Raw unaffected pixels have exact zero change; lossy decoded frames do not promise byte identity. See `exports/decoded-report.json`, `exports/water-4k.png` and the three effect loops.
- The corrected desktop/mobile confirmation covers selected-task visibility without initial scrolling, explicit guide/hide, unobstructed lower-image touch painting, stroke Undo/Redo, explicit palette Apply, 44px targets, Sound access, fullscreen and no horizontal overflow. Private covers/URL cleanup, new-import identity and legacy hidden-source recovery retain their original assertions.

**Eight workflow groups, three collection groups and both confirmation viewports pass.** Final production build and `git diff --check` pass. Completion receipts are indexed in `handoff.json`; no broad Classic browser audit was repeated.

## Independent supervisor evidence

The fresh finish reviewer returned **SHIP for its five specified UX fixes only**. That visual verdict is separate from functional and export tests.

The supervisor independently operated the actual IAB studio: imported the user's mountain photo, cleared and painted a narrow waterfall matte with a real drag, undid/redid the whole stroke, confirmed empty-matte Enable was disabled, enabled water/cloud treatments, saved a named project, applied an explicit teal→purple palette edit and undid it. Their downloaded PNG is 3840×2160; their 16.18MB portable file retains the private photograph and two enabled editable mattes; their WebM fully decodes as 1080p VP9, 24fps, 96 frames, 4.000s. Files are in `/Users/divyanshagarwal/Downloads/Stillwild-Scene-Studio/`. The supervisor owns publication and public old-project restoration checks.

## Historical attempts and limits

The first design-context launcher failed permission 126; the submitted brief, code and incumbent pixels supplied context directly. The initial local browser permission review timed out; the subsequent isolated launch succeeded. Source reviews and preliminary tests exposed and corrected green foliage being classified as water, a discontinuous cloud blend, foliage direction/detail response and video-aspect matte rebasing.

Preliminary workflow/collection attempts failed on renamed/asynchronous gallery selectors and a closed matte disclosure. Presentation attempts hit an asynchronous storage read and then tried to reach a dock control behind the mobile sheet. The exact state assertions remain; the final scenarios wait for the actual gallery/disclosure and save-completion message, and use Close → All tools. The retained selective-colour suite also assumed a permanently open inspector on its share pages; only that failing share stage was rerun through Customize, preserving the first three passed UI/media checks with their original provenance. A focused touch-event reproduction confirmed one stroke/one Undo. These failed attempts are not reported as application export failures. The supervisor's first portable download was interrupted by HMR; the second succeeded, with no backup defect found.

Mattes are coarse 96×54 colour/brightness/edge suggestions, not semantic segmentation or tracking. Blue mountains can be mistaken for water; bright ground can enter cloud/highlight mattes. Inspect, erase and paint them. Motion is a local image deformation, with possible ghosting at high amounts; it does not reconstruct hidden geometry, water physics or new clouds. Scene regions on generated footage may need manual correction as its content moves.

Analysis caches at most eight summaries; rendering caches at most six matte fields and caps treatment work surfaces at 960px wide. Small details can soften inside a moving region, and CPU-heavy combinations can reduce preview cadence. Export uses deterministic timestamps rather than real-time playback speed. Legacy mist/rays/dust remain in Advanced for compatibility. Original media, source IDs, private storage and session-only keys are preserved. Detailed projects can exceed the existing share-link limit and use portable backup instead.

Manrope is self-hosted under SIL OFL 1.1, with provenance in the README reuse table and shipped notices. No npm dependency was added. Scanner flags were reviewed: real output dimensions and useful source/cost metadata were retained; they are not fabricated statistics. Final app source remains frozen for independent publication checks.
