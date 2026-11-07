---
title: Admin design-system handoff
updated: 2026-11-07
status: Gallery delivered locally, uncommitted; redesign not started
summary: What the 2026-11-07 session did before the admin redesign, the choices behind it and what to know when continuing.
---
# Admin design-system handoff

## Task

The maintainer finds the Kumo-based admin basic and chunky and plans to redesign
its design system. First they asked for a deep analysis of the admin UI and one
test page that previews every component and input in use. This session delivered
both. **No redesign work has started**, and no redesign direction is decided.

- [Admin design-system audit](admin-design-system-audit.md): inventory, findings
  and open questions for the redesign.
- [Verification](../verification/runs/2026-11-07-admin-gallery.md): what was
  checked and its limits.
- `tools/admin-gallery/README.md`: how the gallery works and how to add to it.

## Choices made by the maintainer

From one grill-form round, plus one instruction during the build:

- The gallery is a maintained engine dev tool at `tools/admin-gallery/`, run with
  `pnpm gallery`, outside the package `files`.
- It renders the real QuineCMS components on fixture data, plus a Kumo primitive
  matrix.
- States are chosen per component, with a state picker above each one. Forced
  hover, focus and pressed are included.
- Dark and light mode are one at a time, through a sticky toggle.
- Full shell frames are included: "sidebar, inner sidebar with the back button,
  etc."
- The login screen is extracted into a shared module rather than copied.
- The audit is recorded as a wiki discussion.
- The gallery's own design follows jstack's `rule-plain-ui` and `rule-lean`. Its
  chrome has headings, source paths and pickers only.

## What changed

New: `tools/admin-gallery/`, `src/admin/login-screen.ts`,
`src/admin/login-screen.css`, `tests/admin-gallery.test.ts`, the audit and
verification pages, and `docs/wiki/evidence/2026-11-07-admin-gallery/`.

Edited: `package.json` (`gallery` script), `src/pages/admin/index.astro` (renders
the shared login screen), one sentence in `README.md`, one bullet in `AGENTS.md`,
a paragraph in the [editor contract](../features/editor.md), the top entry of
the [wiki index](../index.md), and the regenerated `docs/wiki/index.html`.

`src/editor/` was not changed. **Nothing is committed.** The working tree also
holds the maintainer's own unrelated work: browser-Back support, the logo and
favicon branding, and the Statamic review. Some of it shares files with this
session (`index.astro`, `README.md`, the wiki index). Preserve it, and commit
this work separately if asked.

## Things learned while building

- **Watcher:** Vite on macOS can serve stale modules with recursive FSEvents. The
  gallery config sets `useFsEvents: false`, as `scripts/dev-server.mjs` does.
  Restart the server if edits stop appearing.
- **Kumo Input:** it warns unless it gets `aria-label` (or `label`); a `Label`
  with `htmlFor` is not enough. Editor inputs already pass one.
- **Kumo Select:** `element.click()` opens it; a synthetic `pointerdown` does
  not. Scripted states run one task after the picker click, otherwise Base UI
  treats that click as an outside press and closes the popup.
- **Toasty:** it resolves its portal container in its first layout effect, so the
  container element must come before the provider as a sibling (as `App` does).
- **Dialogs in cards:** specimen dialogs use `modal={false}` and portal into a
  stage with `transform`, which contains `position: fixed`. Open dialogs take
  focus on mount; the gallery and frames therefore focus without scrolling.
- **Fixture media:** URLs must be `https://` or root-relative; `validate` rejects
  `data:` URLs. Images are served from `tools/admin-gallery/media/`.
- **Frames:** they share the tab's `sessionStorage`, so each clears the recovery
  key before mounting `App`. Git is replaced by `tools/admin-gallery/git.ts`.
  Uploads use empty R2 settings and fail validation before any request.
- **Test registry:** `hero` resolves to version 1. Version 2's custom
  `hero-presentation` field has no registered widget and would render as a text
  input.
- **Tests:** Vitest does not load CSS, so the gallery test mocks the Foundations
  section, which reads stylesheets as text.
- **Browser checks:** the Chrome extension was not connected. Checks used
  Playwright 1.62 from the local npx cache with throwaway scripts that are not in
  the repository.

## Continuing

Start from the audit's open questions: keep or replace Kumo, the type scale and
typeface, field-level validation, and the narrow layout. Use the gallery to
judge each change across all components and screens at once.

When editor components change, keep `pnpm verify` passing. The gallery test fails
when a specimen's state throws, or when the editor imports a Kumo component or
Phosphor icon the gallery does not show. Add a specimen for each new editor
component. Scripted states and screens report **State unavailable** or **Screen
unavailable** when a label they click changes; update `screens.ts` or the
specimen's `Then` step.

Ask the maintainer through grill-form for consequential redesign choices. Apply
`rule-plain-ui` and `rule-lean` unless told otherwise.
