---
title: Unified theme dashboard verification
updated: 2026-10-13
result: Passed for selected local scenarios
---
# Unified theme dashboard verification

DEC-163 follows the user's direct correction: all installed themes and blocks
belong in one main dashboard. The layout whitelist was removed from the build
configuration, editor props, core selection policy, environment example and
sample runner. The catalog now reads the installed layout definitions directly.
Block theme filtering remains optional and independent of the active layout;
static/generic page and footer rules remain intact.

`pnpm dev` is the documented main workflow. Example directories and commands are
optional sample-content tools, with no additional theme capabilities. No content
records were merged, replaced or removed. Switching layouts retains the existing
fresh-default-settings behavior and preserves pages, blocks, schemas and entries.

## Checks

- `pnpm verify` passes: 454 checked files, zero diagnostics, all 231 tests across
  35 files, the seven-route root production build and artifact checks.
  [Full log](../../evidence/2026-10-13-unified-dashboard/verify.log).
- The editor integration regression verifies every installed layout is offered
  before and after switching, previews do not mutate the draft, switching back
  remains available, and pages/entries survive. The missing-version structural
  validation test remains; obsolete whitelist assertions were removed.
- Chrome at the main development origin `http://127.0.0.1:4322/admin/` displays
  Starter, chartr, Quine Systems, Intr Studio and Archline in one layout picker.
  [Screenshot](../../evidence/2026-10-13-unified-dashboard/all-themes.jpg).
- In that same main dashboard, Home → Add block displays 89 compatible static
  page blocks and the Archline, Intr, Quine, Starter, Tailwind UI and chartr theme
  filters. Closing the catalog leaves Save draft disabled.
  [Screenshot](../../evidence/2026-10-13-unified-dashboard/all-block-themes.jpg).
  A stale browser tab stopped responding reliably during checks; a fresh tab
  using native browser controls completed login, navigation and catalog closing.
- Main site pages were inspected before restarting its existing development
  server. The dashboard showed Local preview with Save draft disabled. Source
  `content/` has no Git diff; no save, publish, theme switch or content insertion
  was performed in the browser.
- Wiki generation/link checks and `git diff --check` pass.

Checks use local development and automated production artifacts. They do not
establish live provider save/publish or hosting behavior. The main development
server remains running for the user's dashboard. No commit, push or deployment
was performed.
