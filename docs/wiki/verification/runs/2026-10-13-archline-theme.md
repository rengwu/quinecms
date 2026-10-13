---
title: Archline theme verification
updated: 2026-10-13
result: Passed for selected local scenarios
---
# Archline theme verification

Scope: DEC-156–DEC-159 and the submitted grill-form interview. See the
[scope record](../../journal/2026-10-13-archline-theme-scope.md) and
editing guide at `examples/archline/README.md`.

## Environment

macOS, Node 22.19.0, pnpm 10.34.1 and Chrome through computer use. The working tree
is based on `59e41a304f3964cb83624329bcb5c28c47aefceb`, with the Archline changes
and separately authored media-upload planning documentation. Checks were performed
by the implementing agent; no independent review is claimed.

The reference homepage, project index and sample detail were inspected visually
at desktop and phone widths. Local browser checks used an isolated staged checkout
at port 4325. The staging directory had the latest theme CSS before the final
build. The root content and existing examples were preserved. The owned preview
server was stopped after inspection; use `pnpm example:archline` to reopen it.

## Results

| Scenario | Observed result | Evidence |
| --- | --- | --- |
| Repository checks | Type checking: 454 files, zero errors/warnings/hints. All 231 tests across 35 files passed. Root production build and artifact checks passed. | Terminal checks; [final root build](../../evidence/2026-10-13-archline-theme/root-build.log) |
| Isolated example | Publication validation passed; eight public routes plus `/admin/` built. Artifact checks passed. | [Final example build](../../evidence/2026-10-13-archline-theme/example-build.log) |
| Content and local assets | Example validates; backup equals the canonical parsed records; media files exist at recorded byte sizes; eight unique public routes. | `tests/archline.test.ts` |
| Shared projects | Title/year/image edits propagate to both grids and generic detail; narrative/gallery bindings retain array order. Incomplete and unsafe-link inputs render safely. | Archline regression tests |
| Desktop composition | Hero typography/crop, project grids, dark services, FAQ and project detail inspected at measured 1440 × 900. | [Home](../../evidence/2026-10-13-archline-theme/desktop-home.jpg), [index](../../evidence/2026-10-13-archline-theme/desktop-projects.jpg), [detail](../../evidence/2026-10-13-archline-theme/desktop-detail.jpg) |
| Phone layout | Home, menu, services, index and detail checked at 390 × 844. Measured document width 375, with no horizontal overflow. No broken loaded detail images. | [Home](../../evidence/2026-10-13-archline-theme/mobile-home.jpg), [index](../../evidence/2026-10-13-archline-theme/mobile-projects.jpg), [detail](../../evidence/2026-10-13-archline-theme/mobile-detail.jpg), [services](../../evidence/2026-10-13-archline-theme/mobile-services.jpg) |
| Navigation | Hero link opens project index; project card opens its detail; back link returns. Menu opens, Escape closes, and choosing expertise closes it and reaches the section. | Browser observations; [phone menu](../../evidence/2026-10-13-archline-theme/mobile-menu.jpg) |
| FAQ and testimonials | FAQ disclosure exposes its answer. Next testimonial changes the visible title and quote. | Browser observations |
| Reduced motion | With browser emulation, media query matches, marquee computed animation is `none`, and no reveal element has zero opacity. | DOM/style inspection through computer use |
| Editor | Dev login unlocks. Hero heading changes immediately in preview, then restoration disables Save draft. Project entry exposes summary/facts/chapters/gallery; nested chapter opens editable text/image fields. Archline layout exposes identity/navigation/contact settings. | [Chapter form](../../evidence/2026-10-13-archline-theme/editor-chapter.jpg), [layout settings](../../evidence/2026-10-13-archline-theme/editor-layout.jpg) |
| Documentation | Wiki rebuilt and integrity checked; whitespace check clean. | `node docs/wiki/_build.mjs`, `--check`, `git diff --check` |

## Corrections and boundaries

Initial mobile inspection identified oversized menu headings caused by CSS
specificity, heading line breaks and an incomplete menu background. These were
corrected and visually rechecked. The hero's background crop and typography were
aligned to the reference. The final root and isolated builds include those CSS
changes; the full type/test run preceded the final CSS-only adjustments.

Some automation pointer clicks did not activate the editor's block rows. Keyboard
activation opened them consistently. This check establishes keyboard form access
and live editing, not exhaustive pointer or drag coverage. No builder change was
made for the automation behavior. A temporary text edit was restored; no save or
publish action was performed.

Temporary viewport and reduced-motion overrides were cleared. The source tab had
already closed by cleanup. Screenshot dimensions were established per local tab
using DevTools through computer use because browser-wide viewport overrides did
not consistently apply after navigation. Local browser console inspection found
no error entries. Browser checks used development output; production output was
built and artifact-checked without a separate production-browser pass.

This is representative visual review, not pixel-diff or cross-browser coverage.
Native no-JavaScript menu/FAQ behavior is implemented but no JavaScript-disabled
browser pass was run. No live provider save/publish, R2 upload, backup roundtrip,
hosting deployment or email delivery was tested. Sample business details and
project narratives are demo content. Asset provenance does not establish licensing
rights. Nothing was committed, pushed or deployed.
