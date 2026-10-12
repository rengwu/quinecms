---
title: Admin hierarchy and Home navigation
updated: 2026-10-05
result: Untested
---
# Admin hierarchy and Home navigation

## Scope

[FEAT-editor](../../features/editor.md), DEC-052–DEC-054: distinguish Add block from block rows, separate collection content and schemas, and move all global destinations to a standalone Home screen. Entry and block editing retain the existing shared Save draft/Publish workflow.

## Build and environment

Dirty implementation on `f6993528410bebeae1dafd70d52f57c1cc3e34d4`; [final source manifest](../../evidence/2026-10-05T1054Z-admin-hierarchy/source-manifest.json). macOS, Node 22.19.0, pnpm 10.34.1. Native Safari against the existing development server at `http://127.0.0.1:4321/admin/`; Vitest/jsdom tests use real Kumo controls and mock only preview islands. No independent verifier.

The user refined the navigation during implementation: the final build opens a separate Home menu instead of a sidebar destination grid. The final verification log and manifest include that correction.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Add block placement | Compact header action distinct from draggable rows | Browser displayed plus/label aligned right beside Blocks, with no footer action | Passed | [Browser observations](../../evidence/2026-10-05T1054Z-admin-hierarchy/browser-observations.txt) |
| Entry navigation and preview | Content → collection → entry → block; edits survive returns | Browser title edit updated preview, survived block round trip and appeared in the entry list. Final automated test passes | Passed | [Observations](../../evidence/2026-10-05T1054Z-admin-hierarchy/browser-observations.txt), [final checks](../../evidence/2026-10-05T1054Z-admin-hierarchy/verify.log) |
| Home menu | Global destinations outside the sidebar; local edits retained between areas | Browser displayed the standalone menu without sidebar/preview. Final UI test exercises Pages, Media, Site and returning through Home with edits intact | Passed | [Observations](../../evidence/2026-10-05T1054Z-admin-hierarchy/browser-observations.txt), [final checks](../../evidence/2026-10-05T1054Z-admin-hierarchy/verify.log) |
| Schema and entry separation | Definitions and values on separate screens; safe fields and defaults | Automated UI test edits label/default, checks populated key/removal locks, creates an entry with the new default and preserves existing content | Passed | [Final checks](../../evidence/2026-10-05T1054Z-admin-hierarchy/verify.log) |
| Preview entry links and deletion | Links open Content; deleting returns to correct parent | Automated UI test follows the preview link, deletes the entry, then deletes its empty collection and checks the empty states | Passed | [Final checks](../../evidence/2026-10-05T1054Z-admin-hierarchy/verify.log) |
| Schema/field browser layout | Dedicated screens fit the drawer and show only relevant controls | Browser review interrupted by active user interaction; automated behavior passed but final visual inspection was not completed | Untested | [Interruption and cleanup](../../evidence/2026-10-05T1054Z-admin-hierarchy/browser-observations.txt) |
| Required verification | Types, tests, static build and asset checks pass | Zero diagnostics; 61 tests in 12 files passed; five static routes and runtime sharing checks passed | Passed | [Final checks](../../evidence/2026-10-05T1054Z-admin-hierarchy/verify.log) |

## Limits and follow-up

Overall Untested reflects the incomplete schema-screen browser inspection, not an observed application failure. Production output was built and artifact-checked without a separate production browser run. Live GitHub/R2/hosting operations and unrelated editor flows were outside scope.

No server was started or stopped. The owned browser tab became actively used; its content was preserved and the tab was left open, including the local verification title edit. No repository content files or remote providers were changed by UI testing. A follow-up browser inspection should use a fresh isolated window when it can be operated without interfering with the user.
