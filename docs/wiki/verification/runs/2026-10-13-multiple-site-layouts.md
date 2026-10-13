---
title: Multiple site layouts verification
updated: 2026-10-13
result: Passed
---
# Multiple site layouts verification

DEC-165–DEC-171, authorized with work-until-grill after the scoped interview.
The [feature contract](../../features/site-layouts.md) describes the delivered
behavior. No new product decision was needed during implementation.

Local source is based on `6590690`, with uncommitted changes fingerprinted in the
[source manifest](../../evidence/2026-10-13-multiple-site-layouts/source-manifest.json).
The retained discussions and site/engine separation proposal were preserved.
Root client content and example content were not rewritten.

## Automated checks

- `pnpm check`: 471 files, zero errors/warnings/hints. [Log](../../evidence/2026-10-13-multiple-site-layouts/check.log).
- `pnpm test`: 258 tests across 37 files pass. [Log](../../evidence/2026-10-13-multiple-site-layouts/tests.log).
- `pnpm build` and `pnpm check:build`: seven routes, encrypted admin and public asset checks pass. [Build](../../evidence/2026-10-13-multiple-site-layouts/build.log), [artifacts](../../evidence/2026-10-13-multiple-site-layouts/artifacts.log).
- A disposable checkout built Starter static pages, an Intr static page, chartr generic-entry routes and an unused incomplete inactive Starter configuration together. Validation, build and artifact checks pass. Emitted HTML confirmed the expected wrapper, layout-specific title and 987px overrides for Intr/chartr; Starter retained its own settings. [Mixed build](../../evidence/2026-10-13-multiple-site-layouts/mixed-build.log), [artifacts](../../evidence/2026-10-13-multiple-site-layouts/mixed-artifacts.log).

New regression coverage includes independent instances of the same design,
page-specific globals, generic-page inheritance/usage without entries, activation
and deletion guards, used-only publication completeness, invalid imported/draft
assignments, retained versions, per-route wrapper/Head imports, serialization,
creation/cancellation, design-reset cancellation and browser recovery. Existing
GitHub/GitLab, backup/import, factory-reset, media and editor checks remain passing.
The filesystem-heavy generation test now has a 15-second timeout: its added
mixed-route generation exceeded the original five seconds under the full suite.

## Browser observations

Chrome used a fresh local development tab at `http://127.0.0.1:4322/admin/`.
The main dev server was restarted to pick up the new generated route imports.
Existing user tabs and their drafts were not edited.

- Site Layouts shows name, design/version, assigned page count and switches.
- Created a second Starter configuration, **Compact**, with width 760px, without
  reassigning the five existing pages. Assigned Home to Compact; its preview used
  760px and its own header/title. The table then showed four Main layout pages and
  one Compact page, with both in-use switches disabled.
- The layout editor showed Home in the usage list and disabled deletion.
- Change design to chartr displayed the reset confirmation; Cancel preserved
  Compact and its settings. Automated checks cover the confirmation's apply path.
- Reload and login recovered both configurations and Home's Compact assignment.
- At 390 × 844, the table, names, counts and switches fit. Individual editing
  retains the existing narrow drawer beside the preview; no general mobile
  editor redesign was attempted. The viewport override was reset.

[Desktop table](../../evidence/2026-10-13-multiple-site-layouts/desktop.png).
Chrome's native sample-password warning temporarily intercepted automated clicks;
after it was dismissed the ordinary controls responded. This was an automation
interruption, not an application behavior change.

## Boundaries and cleanup

Browser changes remained in the disposable tab's recovery draft; no remote Save,
Publish, Git provider, R2 upload or hosting deployment was performed. Provider
coverage is mocked and does not establish live service behavior. No commit or push
was made. Existing singleton records are supported through the current reader;
this is not a general historical-content migration framework. The separate
site/engine repository proposal remains deferred and unagreed.

Wiki generation/link checks and Git whitespace checks pass.
