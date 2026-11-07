---
title: Admin gallery
updated: 2026-11-07
result: Passed
---
# Admin gallery

The [admin design-system audit](../../discussions/admin-design-system-audit.md)
added `tools/admin-gallery/` (`pnpm gallery`) and moved the login screen into
`src/admin/login-screen.ts` and `login-screen.css`. Every check below passed.

## Build and environment

- Revision `930ffcba5869c39d2104abdddf8d57fc0f69217b` with uncommitted working
  changes, including unrelated in-progress editor and branding edits.
- macOS, Node 22.19.0, pnpm 10.34.1; headless Chromium through Playwright 1.62.
  The Chrome extension was unavailable.

## Checks

- `pnpm test`: 35 files and 290 tests passed, including
  `tests/admin-gallery.test.ts`. That test requires every Kumo component and
  Phosphor icon imported by `src/editor/` to appear in the gallery, and clicks
  every state of every in-page specimen in jsdom without a render error. A
  deliberately broken state made it fail, then the change was reverted.
- In Chromium, all 49 specimens were clicked through every state with no
  render error, console error or warning. Screenshots confirmed the scripted
  states: open selects, reference and list drill-downs, new object and item
  forms, rich-text embed forms, upload progress and its configuration error,
  copy statuses, contained dialogs and toasts, catalog search, tag and preview,
  forced hover and focus, and light mode.
- All 27 editor frames and four login states loaded without a failure message.
  Screenshots confirmed the page, block, entry, list item, schema, layout,
  settings and narrow menu screens; the connecting, failed, saved, unsaved,
  newer-draft and publish states; and second-language editing.
- The gallery stayed at the top on load; dialogs no longer pull it to their
  card.
- An isolated fixture site from `tests/support/project.ts` built with the
  extracted login page. Its `dist/admin/index.html` contained the login markup,
  passed the `check:build` rule that submit starts disabled, and loaded the login
  styles from an external `_astro` stylesheet as before.

## Limits

- Catalog thumbnails and previews use the test registry's single unstyled view;
  they do not show real designs. Non-React fixture blocks are excluded.
- Forced states copy `:hover`, `:focus*` and `:active` rules; they do not
  reproduce JavaScript-driven states such as Base UI's highlighted options.
- Frames replace Git with a local stand-in. Uploads report the real empty-R2
  configuration error and never reach a network. Live providers were not used.
- Only Chromium was used. Native Chrome, Safari and Firefox were not checked.
