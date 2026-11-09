# Stillwild Atelier — build and reuse disclosure

Stillwild v2 extends the same React, TypeScript, and Vite application built in this Asyncly Codex thread. The starting Git revision was `cd882aa`. No application code was implemented in another session. The existing Sites identity in `.openai/hosting.json` is preserved. Deployment is handled by the supervising session; this task does not submit an entry, accept terms, configure account access, or install a wallpaper host.

## Art direction

Four material families serve both Shadow Garden and Rainprint:

- **Paper** retains the original botanical silhouettes, paper cutouts, grain, and watercolor blooms. It is fully procedural.
- **Natural** uses an original generated conservatory environment, shaded botanical details at the edges, movable light, soft atmospheric rain, water rings, haze, and motes. Its default keeps the pool and open center clear. It has no default paper arch or circle.
- **Ink** uses procedural charcoal washes, layered imperfect strokes, negative space, and diluted ink blooms on textured paper. Graphite, umber, green-black, and indigo have distinct material colors. It is fully procedural.
- **Future** uses an original generated nocturne environment with a monumental arch, restrained aurora, fine particles, light, rain, and reflections. No foreground sculpture competes with the main arch by default. Extra elements can be added deliberately.

Each family has three presets for each scene. Theme families change rendering/material, composition, and atmosphere; palettes grade and recolor the chosen material. Negative space is intentional.

## Original generated environments

The supervising session generated these during this event with the built-in image tool and delivered them into this checkout:

| Same-origin asset | Actual source dimensions | Bytes | Use |
| --- | --- | --- | --- |
| `public/art/natural-conservatory.png` | 1672 × 941 | 2,592,172 | Natural environment |
| `public/art/future-nocturne.png` | 1672 × 941 | 1,945,994 | Future environment |

`public/art/provenance.json` contains the supplied provenance. These images are generated artwork, not photographs or native 4K sources. A 3840 × 2160 PNG export is a real 4K output canvas combining a resampled environment with procedural layers. Its output dimensions do not add native detail to the source backplate. The renderer uses an aspect-preserving cover crop; it does not stretch the image.

The two trusted same-origin images preload once per document, with bounded decode/load waits and deterministic procedural fallback. Exports wait only for the selected, enabled environment. Paper/Ink exports remain independent of image availability. Imported JSON cannot supply an arbitrary image URL.

## Implementation and dependencies

The v2 model, migration, material renderers, Canvas overlays, tabbed UI, Web Audio mixer, saved collection, history, tests, and documentation were written through Codex here. The v1 model is retained in `src/legacy.ts` to validate and migrate original compositions. Original procedural shapes, SVG icons, and paper grain are reused from this project's v1, which was also written in this thread.

Open-source dependencies remain React/React DOM (MIT), Vite (MIT), TypeScript (Apache-2.0), React type definitions (MIT), and Playwright Test (Apache-2.0). Exact resolved versions are in `package-lock.json`. There are no new runtime dependencies, remote fonts, stock images, downloaded sound files, analytics, accounts, backend services, or paid APIs. Typography uses system sans-serif and Georgia.

Ambient sound is synthesized with Web Audio: filtered seeded noise for rain/air, slow air modulation, and a quiet sine-wave harmonic bed. Channel and master gains ramp smoothly. Sound starts off on first visit, reload, and a newly opened shared link; only a user gesture starts it. Imports and in-app composition changes cannot enable audio. An already playing soundscape remains independently controllable. Artwork pause and sound mute are separate controls. Hidden tabs suspend audio and drawing. Stop releases nodes and the context; the sleep timer stops sound. Mixer levels persist locally and do not travel in visual share links.

## Saved work and exchange

V1 saved data and share URLs migrate into Paper without changing original object positions, seeds, time, palette, wind, rain, or pigment values. New data uses schema version 2. Legacy raw storage stays intact; unreadable candidates are retained under a recovery key before replacement. If recovery cannot be saved, automatic replacement is blocked and the status explains that the current composition needs a backup.

V2 validation checks enums, booleans, finite numeric values, unique safe object IDs, and bounded object/particle/cache counts. Finite numeric ranges clamp to safe values. JSON imports are limited to 128 KB. Favorites are plain text and limited to 24; scenes hold at most 18 objects. Shape cache capacity is 128 and the paper texture cache holds one image.

Share links contain a frozen visual moment, including theme, palette, all objects/seeds, light, effects, and deterministic time. They never start audio. JSON backups use the same validated composition data. A localhost link requires the app at that origin; public links use the deployed origin. Exports use the preview's Canvas renderer at exact 16:9 dimensions: 1920 × 1080, 2560 × 1440, or 3840 × 2160. No interface controls are drawn into exports.

## Boundaries

This is a browser wallpaper atelier with stylized procedural weather and generated environment art. It does not claim photorealism or physical simulation. Plash, Lively, and native desktop integration remain future, untested work. No native compatibility claim is made.
