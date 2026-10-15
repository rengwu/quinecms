---
title: Tessera visual fidelity pass
updated: 2026-10-16
status: Verified
---
# Tessera visual fidelity pass

This follows the [initial recreation](2026-10-16-tessera.md). The user requested
closer visual fidelity, particularly customer testimonials, the developer strip,
the five-tab feature demonstration and the closing CTA. It supersedes the earlier
choice to omit detailed visual motion in these sections. No engine implementation
changed in this pass.

## Changes and ownership

The library owns the revised scoped styles, components, animation helpers, block
field definitions and preset. Existing list fields now include full testimonial
copy, correct portraits, wordmark styles, an italic phrase and caption. Feature
panels use an editable block-owned list containing tab labels, descriptions and
both code panels. No special engine field type or collection query was added.

Restored three inset-border customer cards, faded corner grids and warm glows;
a horizontal developer ticker with edge fades; five independent tabs with the
reference's contents; and the split CTA with a moving 15×15 pixel chevron.
The hero schema demo cycles through four stages, the walkthrough progresses
automatically, and buttons and headings have hover/entrance motion. Updated shared
typography, header icons and sticky positioning. JavaScript demos pause offscreen
and respect reduced motion; the CSS ticker has hover/focus pause and a manually
scrollable reduced-motion presentation.

The independent dev content and starter records were compared before applying
matching targeted changes. The pre-pass archive, including local content,
configuration and library source, is in the dev repository at
`backups/tessera-before-fidelity-20261016-061810.tar.gz`, with a SHA-256 sidecar.
Its contents were checked and contain no `.env`. The earlier Archline backup
remains intact. The personal recreation skill now distinguishes lean architecture
from fidelity and requires same-width visual/interaction comparisons.

## Checks

- [Site validation/typecheck](../../evidence/2026-10-16-tessera-fidelity/site-check.txt): valid
  for publication; 255 assembled files, zero errors, warnings or hints.
- [Library tests](../../evidence/2026-10-16-tessera-fidelity/library-tests.txt): all nine pass,
  including existing designs and Tessera content/route/shared-record checks.
- [Disposable production build](../../evidence/2026-10-16-tessera-fidelity/build.txt): 60 pages
  including admin. [Output check](../../evidence/2026-10-16-tessera-fidelity/build-check.json)
  passes; [complete local link/asset/anchor audit](../../evidence/2026-10-16-tessera-fidelity/links.json)
  covers 59 public pages with no missing targets or anchors.
- Safari desktop comparison against the live reference: measured section widths,
  card dimensions, font sizes, weights, letter spacing and font features; inspected
  all four priority sections and reference feature-tab contents.
- All five local feature tabs switch the description and both panels correctly.
  Arrow keys and End move selection and keyboard focus.
- Public homepage container at 375 CSS pixels: root clientWidth and scrollWidth
  both 375. Feature panels and CTA stack. Decorative pseudo-element glows are
  clipped at their own section boundaries; tabs retain a local horizontal scroller.
- Fresh browser reload after the final animation change shows no hydration
  warnings. The previous layout observer mutated block-owned attributes before
  hydration; entrance animation now uses the Web Animations API without doing so.
- Observed the developer ticker and pixel-chevron motion in Safari. Reduced-motion
  behavior is implemented, but OS preference switching was not manually exercised.

## Delivery boundary

The dev site remains at `http://127.0.0.1:4322/`. This pass checks the highlighted
sections and shared visual changes; it does not claim a pixel-identical export or
an exhaustive retest of every route, animation frame, browser or physical device.
The separate blog/release sections and external-service boundaries from the initial
recreation remain. No remote publication, dependency push or hosting deployment
was performed. Existing engine changes and unrelated working-tree edits remain.
