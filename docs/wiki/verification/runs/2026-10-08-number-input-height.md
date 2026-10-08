---
title: Number input height repair
updated: 2026-10-08
result: Passed
---
# Number input height repair

## Scope

[FEAT-editor](../../features/editor.md) and [FEAT-content-model](../../features/content-model.md). The user's [screenshot](../../evidence/2026-10-08-number-input-height/before.png) showed short Minimum/Maximum inputs in the number-field schema editor. The shared `.row input` rule applied `flex: 1` to inputs inside vertically stacked field groups, collapsing their height. Restricting the rule to direct row children preserves Kumo's standard input height and existing horizontal row behavior.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`; [source manifest](../../evidence/2026-10-08-number-input-height/source-manifest.json) records the tested files. macOS, Node 22.19.0, pnpm 10.34.1, native Safari. Used a fresh tab against the user's existing development instance at `http://127.0.0.1:4322/admin/`; browser-only fixture edits were never saved or published. The code change is limited to two selectors in `src/editor/editor.module.css`.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Numeric schema controls | Minimum/Maximum match standard text-input height | Schemas → Collections → Journal → Add field → number: both controls visually match Label/Field key height | Passed | [Corrected editor](../../evidence/2026-10-08-number-input-height/after.png) |
| Editing | Both number controls remain usable | Entered Minimum 18 and Maximum 120; both values visible in controls and accessibility state | Passed | Corrected editor |
| Application verification | No regression in diagnostics, tests, build or artifacts | `pnpm verify` passed with zero errors/warnings/hints and 151 tests across 19 files | Passed | [Verify log](../../evidence/2026-10-08-number-input-height/verify.log) |

## Limits and cleanup

Desktop Safari was visually exercised; a separate mobile/cross-browser matrix and live providers were outside this CSS repair. No new tests mirror the selector change. The implementing agent performed verification. Closed the test tab, preserving the user's browser tabs and running development server. Repository content was not changed by the browser fixture.
