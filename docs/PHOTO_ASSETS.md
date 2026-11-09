# Photo studio assets and visual references

Prepared on 8 November 2026 for the Stillwild v3 upgrade. These are **reused photographs**, not newly generated art or photographs taken by the builder. Application code is being implemented through Codex inside Asyncly. The supervising session researched, downloaded and visually reviewed these assets.

## Photographs

| Local asset | Photographer | Source and published license | Downloaded dimensions |
| --- | --- | --- | --- |
| `public/photos/forest-falcade.jpg` | Luca Bravo | [Misty forest covering a mountain slope](https://unsplash.com/photos/misty-forest-covering-a-mountain-slope-5Rdwb97xdWQ), [Unsplash License](https://unsplash.com/license) | 4096 × 2726 |
| `public/photos/tokyo-asakusa.jpg` | Valentin BEAUVAIS | [Wet street at night in Tokyo](https://unsplash.com/photos/wet-street-at-night-in-tokyo-yVUQlyRlJSw), [Unsplash License](https://unsplash.com/license) | 4096 × 6141 |
| `public/photos/coast-monochrome.jpg` | Annie Spratt | [Black-and-white waves](https://unsplash.com/photos/a-black-and-white-photo-of-waves-in-the-ocean-yN1lXxg5oKk), [Unsplash License](https://unsplash.com/license) | 4096 × 2732 |

The source pages identify these images as free under the Unsplash License. The license page was reviewed during preparation. It permits downloading, modifying and using images, including commercially, subject to its restrictions; it does not permit assembling a competing image service or selling unmodified images. Stillwild is a local image/motion editor using a small credited set of example photographs. Retain the source links and photographer credits in the product and disclosure.

Downloads use the source page's image CDN URL with `fit=max`, `fm=jpg`, `q=90`, and `w=4096`. These dimensions describe the supplied local copies, not an inferred native camera resolution. The urban photo is portrait; the editor should offer deliberate cover/reframe controls for 16:9 compositions. The originals stay intact as project assets. A 4K output canvas may resample/crop source pixels and does not promise new source detail.

`public/photos/provenance.json` records exact source/download URLs, dimensions, byte sizes, SHA-256 hashes and license links. Browser/editor transformations, masking and animation are non-destructive application behavior; do not rewrite the supplied original files.

## Pinterest references

These were examined for atmosphere, composition and palette only. Their images were **not copied into the application** and no asset license is inferred from a pin.

- [The Night Void — cinematic street photography](https://uk.pinterest.com/pin/the-night-void-cinematic-street-photography-in-london--502362533452659101/): sparse night composition, existing urban material and isolated pools of light.
- [Epic Pine Tree Landscape II](https://uk.pinterest.com/pin/99782947990217227/): large pine silhouettes and monochrome atmosphere. This is a commercial mural/interior reference, not a free wallpaper source.

The new workspace's art direction is real photographic material, restrained treatment and editable layers. The older generated v2 environments remain disclosed separately in `docs/ART_ASSETS.md` if retained in Classic mode. User-imported photos and portable themes must stay local and are not granted a public redistribution license by this document.

## /brag assessment

The local `/brag` skill was reviewed at `orb-launch-video/vendor/brag/skills/brag/SKILL.md`. It composes product launch films using Hyperframes. Its deterministic time-based rendering and output-validation approach can inform Stillwild's video export. It is not a model that semantically invents moving objects or unseen photo content. No unrelated launch film was requested or generated for this upgrade; the requested deliverable is motion inside the actual studio and an exported loop.

## Wallpaper gallery additions · 8 November 2026

Nine additional real photographs were downloaded from the image URLs on their verified primary source pages. Each source explicitly labels the photograph free under the [Unsplash License](https://unsplash.com/license); none is Unsplash+. They are bundled with local 640px thumbnails. No runtime hotlinks or new photo-service integration are used. NASA imagery is processed observational telescope photography, not AI stock. Existing three assets and identifiers are unchanged.

| Scene | Photographer / agency | Supplied dimensions | Verified source |
| --- | --- | --- | --- |
| Quiet reflections | Luca Bravo | 3840 × 2560 | [Source](https://unsplash.com/photos/banff-national-park-canada-oV4bR3YoR_s) |
| Above the pines | Luca Bravo | 3840 × 2560 | [Source](https://unsplash.com/photos/worms-eye-view-of-mountain-during-daytime-ii5JY_46xH0) |
| Woodland water | Luca Bravo | 3840 × 2650 | [Source](https://unsplash.com/photos/body-of-water-surrounded-by-pine-trees-during-daytime-ESkw2ayO2As) |
| Venice at dusk | Luca Bravo | 3217 × 4825 | [Source](https://unsplash.com/photos/grand-canal-venice-italy-UKJev6G45f0) |
| Dune light | Zetong Li | 3840 × 2560 | [Source](https://unsplash.com/photos/the-sun-is-shining-over-the-sand-dunes-9G8K_nycv7s) |
| Sand rhythm | Matt Artz | 2403 × 1920 | [Source](https://unsplash.com/photos/grayscale-photography-of-sand-vpDWWugLoIE) |
| Stellar nursery | NASA | 3840 × 3647 | [Source](https://unsplash.com/photos/nebula-rTZW4f02zY8) |
| Pacific edge | Paul Hanaoka | 3741 × 2804 | [Source](https://unsplash.com/photos/aerial-photography-of-seashore-DKnXlH_r3x4) |
| Galactic dust | NASA, ESA and the LEGUS team / NASA Hubble Space Telescope | 3799 × 4123 | [Source](https://unsplash.com/photos/a-very-large-spiral-galaxy-with-a-bright-center-gtw2ufYvhnQ) |

Exact downloads, byte counts and SHA-256 hashes are in `public/photos/provenance.json`; `/PHOTO-CREDITS.html` ships all twelve credits.
