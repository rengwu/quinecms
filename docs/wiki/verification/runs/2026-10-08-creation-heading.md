---
title: Creation heading hierarchy
updated: 2026-10-08
result: Passed
---
# Creation heading hierarchy

## Scope

[FEAT-editor](../../features/editor.md). The user's [screenshot](../../evidence/2026-10-08-creation-heading/before.png) showed **New block · chartr · Workspace** with the action and type competing on one line. BlockCreation now supplies a short action title and separate subtitle through FormScreen and PanelLevel. The subtitle uses 13px muted text, a 4px gap below the heading and normal wrapping. Fields retain their existing spacing; Create/Cancel handlers are unchanged.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`; the [source manifest](../../evidence/2026-10-08-creation-heading/source-manifest.json) records file fingerprints. macOS, Node 22.19.0, pnpm 10.34.1. Native Safari used a fresh tab on the existing development server at `http://127.0.0.1:4322/admin/`. The implementing agent performed these checks.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| New block hierarchy | Action title above smaller type label, grouped apart from fields | Home → Add block → chartr · Workspace displays New block above muted chartr · Workspace | Passed | [Block form](../../evidence/2026-10-08-creation-heading/block.png) |
| Nested footer hierarchy | Shared presentation survives PanelLevel and heading focus | Site Layout → Choose footer → Four column footer displays New footer above the muted type; focus remains on the heading | Passed | [Footer form](../../evidence/2026-10-08-creation-heading/footer.png) |
| Cancellation | Pending block/footer is discarded | Cancel returns to Home with the original five blocks; footer Cancel restores the unconfigured-footer message | Passed | Browser observations in this run; existing creation tests in verify log |
| Application checks | No type/build/test regressions | Zero errors/warnings/hints, 159 tests across 19 files, production build and artifact checks pass | Passed | [Verify log](../../evidence/2026-10-08-creation-heading/verify.log) |

## Limits and cleanup

Desktop Safari exercised the normal narrow editing drawer; a separate mobile viewport, other browsers and live providers were outside this presentation repair. No new tests mirror the markup or CSS. A formatting check found a pre-existing unrelated multiline calc formatting difference in the mobile-preview rule; it was left untouched. The initial address entry lost two characters through native typing and was corrected before verification; this was a tool-input issue.

Closed the fresh test tab and preserved the original Start Page and running development server. No Save draft, Publish or filesystem content mutation came from the browser checks. Wiki build/check validates documentation separately from the application suite.
