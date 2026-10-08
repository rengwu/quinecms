---
title: Catalog hover and dialog headers
updated: 2026-10-08
result: Untested
---
# Catalog hover and dialog headers

## Scope

[FEAT-site-layouts](../../features/site-layouts.md) and [FEAT-block-library](../../features/block-library.md). The user reported a partial [card hover](../../evidence/2026-10-08-layout-catalog/before-hover.png), requested aligning the [Site layouts title and close button](../../evidence/2026-10-08-layout-catalog/before-layout-header.png), and restored the visible **Add block** title in the [block catalog](../../evidence/2026-10-08-layout-catalog/before-block-header.png).

The layout hover background now belongs to the card rather than its inner selection button, so it extends through the Preview row. A shared CatalogHeader renders the visible accessible title beside the close button in layout, block and footer pickers. Catalog content scrolls below that header. Existing selection, preview and creation handlers are unchanged.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`; the [source manifest](../../evidence/2026-10-08-layout-catalog/source-manifest.json) fingerprints the tested source. macOS, Node 22.19.0, pnpm 10.34.1. Native Safari used the existing development instance at `http://127.0.0.1:4322/admin/`. The implementing agent performed these checks. Pre-existing source and documentation work was retained.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Diagnostics, tests and build | Checks pass | Zero errors/warnings/hints; 159 tests in 19 files passed; production build and artifact checks passed | Passed | [Verify log](../../evidence/2026-10-08-layout-catalog/verify.log) |
| Site layouts header | Visible title and × share a row | Safari displayed the title and close button aligned, above the description and search | Passed | [Browser observations](../../evidence/2026-10-08-layout-catalog/browser.txt) |
| Card hover | Metadata and Preview row share one highlight | CSS moved to the outer card; stable browser hover observation was interrupted | Untested | Browser observations |
| Block/footer headers and preview controls | Visible title, aligned ×, usable previews and closing | Shared component and existing handlers pass type/build checks; browser interaction was interrupted before these paths were exercised | Untested | Browser observations |

## Limits and cleanup

Aggregate **Untested** reflects the incomplete selected browser checks, not an established application failure. Development refreshes and active browser changes interrupted verification; the native tool also reported conflicting paste/user activity and blocked a Helium fallback. Narrow viewports and live providers were outside this run. No new tests mirror these presentation changes.

No Save draft, Publish or provider action was performed. Existing servers remain running. Browser cleanup was not forced after the active state changed outside the run; task-created tabs/window may remain. The screenshots, observations and verification log are preserved. Wiki build/check validates documentation separately from application behavior.
