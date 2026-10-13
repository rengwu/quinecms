---
title: Archline theme scope
updated: 2026-10-13
status: Implemented and locally verified
---
# Archline theme scope

The user requested adopting [Archline](https://archline.framer.website/) as a
theme with blocks, with direct computer-use visual inspection before building.
The [submitted interview](2026-10-13-grill-4d9ebd9e-9318-4dea-afdf-3e4ce36bdf99.md)
accepts these choices:

- Install a layout and reusable section blocks, with an isolated example and
  importable backup. Preserve root content and all existing themes.
- Recreate the complete homepage, project index and reusable project detail
  template. Other standalone pages and an article template are outside this scope.
- Match desktop/mobile typography, spacing, colors, crops and composition closely.
- Use reference demo branding and imagery, with local assets and source provenance.
- Implement menu, FAQ, carousel, hover/reveal motion and reduced-motion support.
  Use ordinary scrolling; elaborate distortion effects are excluded.

Desktop and mobile browser inspection established a photographic hero, Inter
Display typography, warm off-white backgrounds, thin rules, asymmetric project
cards, dark checkerboard services, paired process images, photographic
testimonials, editorial cards, marquee, split FAQ, postcard enquiry and footer.

Engineering choices within this scope: use shared Projects collection entries for
both listings and the generic detail template; keep editorial section content in
block fields and identity/navigation/contact in layout settings. Adapt supporting
copy into architectural demo prose. Homepage navigation targets implemented
sections; article cards can link to their reference articles. These choices do not
change the builder's core behavior. No unresolved user decision blocks building.

Delivered as the installed `archline/v1` layout and 18 block definitions, with an
isolated example, importable backup and 29 local images. Six project entries share
a generic detail template, producing eight public routes. Root content and the
existing themes are preserved. No builder core behavior changed.

The editing guide at `examples/archline/README.md` records the reusable
content model, startup commands and reference asset provenance.
[Verification](../verification/runs/2026-10-13-archline-theme.md) covers type checks,
231 regression tests, root and isolated production artifacts, and representative
desktop/mobile/editor browser checks. Nothing was committed, pushed or deployed.
