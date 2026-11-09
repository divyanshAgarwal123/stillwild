# Selective colour · 8 November 2026

Select a photo/video layer → **Grade → Selective colour**. Enable it, choose Source colour / Replacement colour, then adjust Colour range, Edge softness and Strength. Defaults are disabled, source `#ff486f`, target `#8b45ff`, range 40°, softness 18°, strength 100. The supervisor's real study used source `#ff0080`, the same target, range 40°, softness 8° and strength 100.

The optional per-layer setting leaves legacy v3 projects unchanged when absent. Numeric grades remain numeric. Circular HSV matching protects low-saturation greys, feathers outside the full-strength hue range and replaces hue while preserving each pixel's HSV saturation/value. Grey source/target wells deliberately do nothing. Disabled, zero strength and Before bypass the operation. It runs after global hue and before vignette/grain in both rendering paths, before mask/opacity compositing. CPU cache keys include the setting.

The edit is local colour processing, not AI, object segmentation or regeneration. Other objects with matching hues can change. The flame-like geometry and movement remain. Original media and the Kling watermark are preserved. No provider requests, new dependency, credentials, account changes, commits or deployment.

## Local checks

Starting source: `d8746bc1065877cc5b937eb85b422b629de260cf`. Fresh isolated browser contexts imported the supplied real project; user browser projects, including the eight public named projects, were not accessed or removed.

- **71 units pass**, no failures/skips: circular red wrap, purple target, HSV detail, neutral/disabled/zero identity, strict metadata bounds, legacy links and generated-layer attribute copying.
- **4 renderer groups pass**: WebGL compiled; isolated GPU/CPU pixels matched exactly. Real frames at project 0/1/2/3s converted all measured bright selected pixels to violet, with exact zero RGB change in measured greens/cyans. Mask, opacity, Before and photo fallback cache invalidation passed.
- **4 browser groups pass**: real controls, numeric and keyboard-slider changes, grouped Undo/Redo, locks, selective/full/group resets, duplicate, named save/reload, portable and built-in sharing. The original MP4 SHA remains `25eeedda6d6052479a10fd1c3ebdcd941fcf3709da14ce480a4606bcf650a58e`. Source attributes copy into generated layers once; neutral source preparation remains unbaked.
- **4 export/media groups pass** after the browser produced both files: each before/purple WebM fully decodes as silent VP9, 1920 × 1080, **96 frames / 4.000s**, first PTS 0, last PTS 3.958 and last packet end 4.000. These counts describe this controlled run. Both PNGs are genuine 3840 × 2160 artwork exports.
- All 96 decoded frames pass unselected-region preservation. Nonempty selected masks have at least **98.11%** violet pixels; mandatory populated frames at 2s/3s exceed 99%. Maximum green/cyan mean RGB difference is **1.169/255** across independent lossy encodes (limit 2.5); direct-render comparisons require exact zero. The 4K PNG sample has 100% violet selected pixels. Empty early masks have no selected-colour assertion; preservation checks still apply. The pink develops later and video compression/downsampling erases tiny early regions.
- Production build and `git diff --check` pass. No unrelated Classic/provider audit was repeated.

The first cache test incorrectly used the monochrome coast, which correctly resisted hue changes; the corrected coloured-photo fixture exercises invalidation. The first export reader incorrectly required bright pink at frame zero; the corrected reader retains full decode/timing, preservation and mandatory later colour gates. Original failures remain under `attempt-1/`; neither was classified as an app defect.

## Independent supervisor evidence

Actual studio UI accepted the fresh real project and the controls, including Strength 0 → 4K PNG → Undo to 100. [Supervisor pixel measurements](</Users/divyanshagarwal/Downloads/Stillwild-Purple-Edit/Pixel-check.json>) report **3661/3661** sampled bright pink pixels became purple (median hue 262.588°), with maximum HSV brightness change 0. **88184 green** and **188712 cyan/sky** sample pixels had exact zero RGB change. Strength-zero output matched the deployed v10 PNG exactly, and the portable file retained the original MP4 SHA. This is a colour-only result; original source, media and motion are unchanged. The supervisor owns the independent final UI export and publication.

## Evidence and replay

[Before studio](../.asyncly/visual-captures/selective-colour/before-studio.jpg) · [Purple studio](../.asyncly/visual-captures/selective-colour/purple-studio.jpg) · [Purple 4s WebM](../.asyncly/visual-captures/selective-colour/purple-4s.webm) · [4K PNG](../.asyncly/visual-captures/selective-colour/purple-4k.png) · [Handoff inventory](../.asyncly/visual-captures/selective-colour/handoff.json).

Run `scripts/verify-selective-colour.mjs` first, then `scripts/verify-selective-colour-exports.mjs`. Browser checks use `scripts/release-context.mjs` to block unmocked external traffic and disposable storage. Detailed reports, five motion captures and decoded review frames are under `.asyncly/visual-captures/selective-colour/`. Chrome desktop was exercised; no cross-browser or universal codec/performance guarantee is made. Existing fallback differences in other grading operations were not redesigned; GPU/CPU comparison isolates this colour operation.
