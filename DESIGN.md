---
name: Stillwild Scene Studio
description: An image-led creative wallpaper instrument
colors:
  accent: "#d5b887"
  surround: "#171a1c"
  panel: "#23272a"
  control: "#30363a"
  border: "#3c4246"
  text: "#edf0f1"
  muted: "#b4bec4"
  guide-background: "#21353a"
  guide-text: "#d3f2f7"
typography:
  brand:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    letterSpacing: "-1px"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.5
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  control: "4px"
  mobile-sheet: "10px"
spacing:
  compact: "4px"
  small: "8px"
  group: "12px"
  panel: "16px"
  canvas: "18px"
  gallery: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surround}"
    rounded: "{rounded.control}"
    padding: "7px 12px"
    height: "36px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "7px 12px"
  mobile-header-action:
    width: "44px"
    height: "44px"
    textColor: "{colors.text}"
    backgroundColor: "transparent"
  search-field:
    backgroundColor: "#171c20"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  region-dock-button:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "42px"
---

# Design System: Stillwild

## Overview

**Creative North Star: "Image-led creative instrument"**

The photograph is the work surface. Its editable regions connect the image, the dock and a compact inspector. Gallery is an Experience surface; studio is an Operate surface. Real photographs supply colour and texture while neutral tools stay readable beside them.

This system follows the submitted product brief and inspected implementation. It rejects slogan heroes, generic glowing gradients, decorative glass and a permanent wall of identical sliders. Local colour/edge heuristics remain suggestions that users inspect and correct.

**Key Characteristics:**
- Artwork first; direct, meaningful controls.
- Inspectable, correctable regions with explicit editing guides.
- Restrained neutral chrome and image-derived colour choices.
- Recoverable work and honest local-processing language.

## Colors

The workspace uses neutral charcoal, a restrained warm action accent and a separate cyan editing-guide colour. Frontmatter is normative; the source is `src/photo/studio.css`.

### Primary
- **Warm selection accent**: delivery actions, selected controls and keyboard focus. It does not tint the photograph.

### Neutral
- **Surround**: canvas pasteboard and gallery background.
- **Panel / Control**: inspector and interactive fields, distinguished by tone and borders.
- **Text / Muted**: primary instructions and secondary context, with readable contrast on charcoal.

**The Guide Rule.** Cyan identifies an editing matte. Always show “Region guide · hidden in export” with an immediate Hide guide action. Never present it as the finished effect.

## Typography

Self-hosted Manrope provides the UI, with system sans-serif fallback. Its variable font and OFL 1.1 license ship together. The frontmatter records the observed brand, headline, title, body and label roles; the gallery headline is compact and functional. No display slogan or decorative eyebrow is needed.

Use authored SVG paths for the region dock and primary controls. Existing Advanced/provider compatibility copy retains useful external-link indicators. Output dimensions are real output information, not decorative statistics.

## Layout

At 1280×800 the studio uses a 56px header, flexible image workspace and 26px status row. The inspector opens on demand at 304px. Advanced can add a 200px layer panel. The dock sits with the canvas; image clicks can select a relevant suggested matte.

Below 700px the header is 52px. The inspector becomes a bottom sheet, at most 57dvh or 510px. Header Undo/Redo/Share and inspector Close use exact 44×44px targets. The selected region starts with Enable, Matte/Paint/Erase and Amount, visible without initial scrolling at 390×844. Discovery, scene interpretation, analysis and palette are secondary.

Paint collapses the sheet into a compact toolbar so the lower image is reachable. Done painting restores the selected region. The photographic mosaic is retained on desktop; mobile removes the separate headline/subtitle rows and compresses resume/filter context so photos appear earlier.

## Elevation & Depth

Workspace depth comes from tonal panels and thin borders rather than floating glass or decorative shadows. The artwork has no added shadow frame. The mobile inspector uses a bounded edge and rounded upper corners to separate it from the image. Compatibility dialogs retain their existing modal treatment; they are not a new visual motif.

## Shapes

Controls and fields use compact 4px corners. The mobile sheet uses 10px upper corners. Photographs remain rectangular; the gallery creates variety through its grid and image crops rather than ornamental containers. The region guide follows editable source-coordinate mattes, not a claim of object segmentation.

## Components

### Actions and navigation

Choose image, Animate, Customize and Use wallpaper have distinct roles. Delivery has one filled primary action. Back to gallery and My wallpapers preserve recoverable local work. Advanced retains the expert tools. Focus uses a 2px accent outline with a 3px offset. Reduced-motion preferences remove unnecessary transitions.

### Region task

A selected region leads with its name, explicit Enable, Matte/Paint/Erase and Amount. Additional direction/detail/cycle or threshold/radius controls follow only when applicable. Empty mattes explain why Enable is unavailable. Removing a region and whole-stroke Undo/Redo remain direct actions.

### Editing guide and painting

The guide has a visible status label and Hide guide. Painting leaves the artwork unobstructed and offers Done painting. Neither the guide nor controls appear in PNG/video output.

### Palette

Open the secondary Image palette disclosure, choose Source and Target, then Apply source → target. Choosing a swatch or editing either well does not commit a grade. Visible text explains that neutral greys have no hue and should use Look for tone.

### Gallery and fields

The authored photographic mosaic, local thumbnails, compact collections, filters, search and favorites are functional content. Search/private covers keep their existing storage behavior. Inputs use the dark field surface, a visible border and native keyboard affordances.

## Do's and Don'ts

### Do:
- **Do** put art and the selected task first.
- **Do** show inspectable suggestions and allow correction without applying an effect automatically.
- **Do** label every editing guide and exclude it from exports.
- **Do** preserve exact zero/off behavior, stable unmasked pixels and smooth source-pixel loops.
- **Do** preserve saved media, source IDs, automatic editable handoff and proven exports.

### Don't:
- **Don't** claim local heuristics perform semantic detection or scene reconstruction.
- **Don't** use a flat colour film or generic overlay as a substitute for source-pixel motion.
- **Don't** commit an arbitrary neighbouring palette hue without a chosen source/target and Apply.
- **Don't** auto-enable legacy overlays for new gallery choices or overwrite saved settings.
- **Don't** extend the completed bounded review into another restyle.

## Motion Plus task behavior

Preserve the photographic workspace and tokens above. Animate scene is the generation route; optional local pixel deformation stays in Advanced. The inspector resets to the task heading on explicit tab/action changes. Motion exposes its key value and Add/Update action in the initial 390 × 844 sheet; interpretation and quality notes are collapsed. Number drafts follow the evaluated selection on return, scrub and Undo without replacing active typing.

Sound starts explicitly, labels procedural sources honestly, and keeps selected-only preview isolated during edits. Replacements crossfade at the continuing playhead; level editing must not retrigger the beginning. Delivery distinguishes muted source-video audio from optional project sound, with silent export the default. Technical checks do not establish professional motion quality.

## Living interface motion

Presentation uses transform/opacity, strong ease-out `cubic-bezier(.23,1,.32,1)` and drawer easing `cubic-bezier(.32,.72,0,1)`. Budgets: press 100ms, release 150ms, panel/drawer 180ms, dialog 220ms, navigation 240ms, retirement 160ms. Only Back/Resume adds a bounded 5px blur with a 24px incoming / −42px outgoing depth shift. The rare first photographic reveal remains 720ms; subsequent scenes dissolve in 240ms. Motion retargets from the current rendered state. Keyboard actions are immediate; reduced motion uses at most 100ms opacity with no blur/translation. Native controls act synchronously.

Welcome atmosphere is a separate, capped 640px image-space canvas, drawn at up to 20fps while visible and permitted. Forest cloud pixels move within a colour/luminance mask; dune light changes exposure over fixed sand ridges; Tokyo changes existing sign luminance and coloured reflections with fine rain. Text and controls stay sharp. This treatment never enters the artwork renderer. Pause/hidden retain the last frame; scene/image changes, reduction and unmount release resources.

### Retouch and held-frame follow-through

Apply & preview enables the selected usable region and hides the cyan guide. Pause, Before and reduced-motion choices remain explicit. Empty current-crop mattes lead to Paint/reframe and suppress no-op playback actions. Static bloom is labelled separately from movement. Canvas backing dimensions follow layout size, so the brief navigation scale/blur never resamples a paused frame.

Intentional Fit/150%/200% zoom changes layout width and retains native overflow access to all artwork edges. Fullscreen continues to fit the screen. Presentation scale remains independent from layout zoom and canvas backing resolution.
