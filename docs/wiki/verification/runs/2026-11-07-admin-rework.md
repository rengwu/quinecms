---
title: Admin rework verification
updated: 2026-11-07
result: Passed
---
# Admin rework verification

## Scope and basis

Implementation and local verification of the accepted
[admin redesign](../../discussions/admin-redesign.md), DEC-234–DEC-250, for the
[editor](../../features/editor.md) and [site layouts](../../features/site-layouts.md).
The selected checks cover the shell, nested creation/editing, preserved draft
semantics, the single live preview, the maintainer's full-height Split and
resizable-sidebar corrections, and the reported off-screen Float defect.

The maintainer stopped the parallel Claude review. The observations below were
performed by the implementing Codex agent; this is not an independent review.

## Build and environment

- macOS, Node 22.19.0, pnpm 10.34.1, native Chromium browser control through
  Helium; initial checks also used Chrome.
- HEAD `930ffcba5869c39d2104abdddf8d57fc0f69217b`, dirty working tree including
  the inherited Claude gallery, branding, browser-Back changes and research.
- Final engine input SHA-256:
  `fe0287029d3486b287030789aa2cf59dae1c59fad886d6931f834e57653bf2ff`.
  The [351-file manifest](../../evidence/2026-11-07-admin-rework/build-identity.json)
  includes test/fixture inputs and the final production admin output hash.
  Final production `src/editor` matches the engine source byte for byte.
- Separate disposable fixtures: basic multi-framework production site on
  `127.0.0.1:5322`, library Tessera copy in dev on `127.0.0.1:5321`, and the
  real-App gallery on `localhost:5319`. No client site files or live providers
  were changed. The [handoff](../../discussions/admin-rework-handoff.md) records
  review entry points; [setup](../setup.md) records executable commands.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Full regression suite | Existing data, creation, navigation, media and translation contracts survive the rework | 293 tests in 35 files passed with four workers | Passed | [Test output](../../evidence/2026-11-07-admin-rework/tests.txt) |
| Focused preview/navigation/gallery | Preserve live state, panel parents, busy guards, sidebar bounds and component states | 56 checks passed; preview tests cover a single mounted island and persisted modes | Passed | [Focused output](../../evidence/2026-11-07-admin-rework/focused-tests.txt) |
| Type check | Engine and generated site compile | 0 errors, 0 warnings, 6 hints from unused generated imports | Passed | [Check output](../../evidence/2026-11-07-admin-rework/check.txt) |
| Production build and boundary | Build routes, retain encrypted admin, avoid editor/provider/Base UI in public bundles | Four routes built; encrypted-envelope, asset graph and runtime-sharing checks passed | Passed | [Build](../../evidence/2026-11-07-admin-rework/build.txt), [bundle checks](../../evidence/2026-11-07-admin-rework/check-build.json) |
| Split preview | Website fills the available height under its toolbar | Tessera begins immediately below the toolbar and fills the pane, with its own scroll area | Passed | [Full-height Split](../../evidence/2026-11-07-admin-rework/tessera-split-full-height.jpg) |
| Desktop/mobile Float | Float uses workspace bounds and does not push the editor sideways | Both devices stay visible in the workspace; editor and sidebar retain their position | Passed | [Desktop](../../evidence/2026-11-07-admin-rework/tessera-float.jpg), [mobile](../../evidence/2026-11-07-admin-rework/tessera-float-mobile.jpg) |
| Pointer geometry | Toolbar moves Float; corner drag resizes at device aspect ratio | Native drag moved the window, and southeast corner drag reduced its size | Passed | [Moved and resized](../../evidence/2026-11-07-admin-rework/tessera-float-resized.jpg) |
| Sidebar sizing | Pointer and keyboard resize within 160–360px; long names truncate | End reached 360; pointer drag changed it to 224.5; Home reached 160; collection labels showed ellipsis without horizontal scrolling | Passed | [Minimum width](../../evidence/2026-11-07-admin-rework/sidebar-minimum.jpg), navigation regression tests |
| Block panel | Nested editing covers the editor while preserving preview; Escape returns to the record | Tessera Hero opened with the parent inert and preview visible; Escape restored Home | Passed | [Block panel](../../evidence/2026-11-07-admin-rework/block-stack.jpg) |
| Narrow/light creation | Form fits a 390px viewport with reachable actions and no horizontal overflow | New-page fields, Close, Cancel and Create fit; sticky header/footer padding now agrees with mobile panel padding | Passed | [390px light form](../../evidence/2026-11-07-admin-rework/narrow-light-creation.jpg) |
| Final built editor and live state | Real encrypted login opens editor; changing preview geometry preserves island state | Login and Home succeeded; React counter remained Count 1 through Float, device switch, close and reopen. Svelte/Vue text and vanilla Static HTML rendered | Passed | [Final production capture](../../evidence/2026-11-07-admin-rework/production-preview.jpg), [native observation](../../evidence/2026-11-07-admin-rework/production-observation.txt) |

Full-suite command: `pnpm exec vitest run --maxWorkers=4`. Focused command:
`pnpm exec vitest run tests/preview-workspace.test.tsx tests/editor-navigation.test.ts tests/admin-gallery.test.ts`.
Site build, check-build and check used the actual engine CLI from the fixture root.
Screenshots were inspected after capture. The gallery's narrow iframe is 390 CSS
pixels wide; the enclosing gallery was zoomed out to frame the screenshot.
Tessera captures were made during the final interaction pass, before the final
15px section-heading alignment; the production capture uses the recorded final
build. Last CSS refinements were checked in the browser/build rather than adding
DOM tests that cannot measure CSS layout.

## Repairs and earlier attempts

The reported Float bug was confirmed in source: an absolutely positioned grid
child retained its split `grid-column: 2`, which made that area its containing
block. Resetting `grid-area` in Float fixes placement. Full-height Split derives
its logical height from available height instead of fitting a fixed device ratio.

Native checks also found a mobile panel overflow caused by desktop negative
margins remaining after mobile padding changed. One shared panel-padding variable
now drives both. Sidebar pointer focus was made explicit so clicking its handle
also allows immediate keyboard resizing; pointer-capture cleanup handles loss.

The production fixture's vanilla block originally supplied only `render`, despite
the documented immediate preview `mount` contract. Its fixture source now supplies
`mount`, `update` and `destroy`; the final browser check renders Static HTML with
no missing-mount error. The engine did not receive a fixture-specific workaround.

Earlier unrestricted full-suite runs encountered two 5-second timeouts while
site builds and many workers competed for CPU. The bounded complete rerun passed;
no timeout increase or skipped test was introduced. Earlier selector failures
were updated for the accepted navigation, and checks caught repaired busy-state,
missing-translation-status and layout-creation-state regressions.

## Limits and cleanup

All selected local checks passed. Live GitHub/GitLab/R2 uploads, permissions, CORS
and hosted publishing remain **Untested**, outside this local scope. Transport
mocks do not establish those behaviors. This is a bounded Chromium check, not a
full screen-reader, touch-device, Safari or Firefox audit. Only the southeast
Float corner was dragged in the browser; all four share the same constrained
resize handler. Font and control details remain adjustable for a later polish pass.

The owned gallery and Tessera review servers remain available, as does the basic
production preview. Original user servers and browser tabs were preserved. No
commit, push or deployment was performed. Original visual references and spike
results are retained in the [reference index](../../evidence/2026-11-07-admin-rework/reference-index.txt).

Documentation validation: the wiki build/check passed for 225 pages and internal
links. The new report passes the outcome-metadata checker. Running that checker
across all historical reports flags nine pre-existing descriptive `result` values
that do not use its current three-value format; those unrelated reports were not
rewritten. [Metadata-check evidence](../../evidence/2026-11-07-admin-rework/report-metadata.json).
