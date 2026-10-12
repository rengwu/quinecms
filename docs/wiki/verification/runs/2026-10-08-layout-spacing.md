---
title: Layout-owned spacing verification
updated: 2026-10-08
result: Passed
---
# Layout-owned spacing verification

## Scope

[FEAT-site-layouts](../../features/site-layouts.md), [FEAT-chartr](../../features/chartr.md) and [FEAT-editor](../../features/editor.md). DEC-130 moves content spacing into the active layout’s settings and gives each layout its own defaults. Selected checks cover navigation, switching, candidate preview, zero/cleared overrides, persistence, validation and rendering tokens.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`, including pre-existing content-model and creation-form work. The [source manifest](../../evidence/2026-10-08-layout-spacing/source-manifest.json) identifies tested files. macOS, Node 22.19.0, pnpm 10.34.1. Browser inspection used native Safari against the existing development server at `http://127.0.0.1:4322/admin/` in a disposable tab. Repository fixtures were not changed through the browser.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Application checks | Clean diagnostics, tests, production build and artifacts | `pnpm verify` completed with zero errors/warnings/hints, 159 tests across 19 files and seven built routes | Passed | [Verify log](../../evidence/2026-10-08-layout-spacing/verify.log) |
| Control ownership | Spacing in Site Layout; Settings limited to Backups/Session | Mounted editor assertions and desktop Safari agree; Starter shows 1200/24 and chartr shows 1512/40 | Passed | `tests/editor-navigation.test.ts`; [browser observations](../../evidence/2026-10-08-layout-spacing/browser.txt) |
| Defaults and switching | Each selection uses its definition’s defaults; current-version selection preserves overrides | Starter → chartr → Starter core checks pass; excluded-active candidate Preview uses chartr defaults without mutating the draft | Passed | `tests/layouts.test.ts`, `tests/editor-navigation.test.ts`; verify log |
| Overrides and rendering | Custom width, zero gutter and clearing are effective in preview and block context | Both layouts use their defaults for cleared values; chartr preview emits 1000/0 for explicit overrides and 1512/40 when cleared; Safari accepts zero then shows placeholder 40 when cleared | Passed | Core and mounted editor tests; browser observations |
| Persistence and validation | Layout settings round-trip, tab recovery retains edits, malformed values fail structure checks | JSON serialization, recovered Starter geometry, both layouts’ invalid width/gutter cases pass | Passed | Core and mounted editor tests; verify log |

The initial test run found one outdated assertion expecting width in Settings. It was updated to assert the new location; the complete verification above passed afterward.

## Limits and cleanup

Desktop Safari was visually inspected; a separate mobile/cross-browser matrix and active-chartr production fixture were not selected. Production build checks exercise the committed Starter selection; chartr rendering is covered by the mounted editor and development browser. Existing mocked provider tests passed; no live GitHub/R2/hosting operations were performed. The final disposable browser tab was closed and the pre-existing development server was left running. Wiki build/check validates documentation separately.
