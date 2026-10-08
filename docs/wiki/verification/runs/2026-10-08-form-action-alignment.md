---
title: Sitewide form-action alignment
updated: 2026-10-08
result: Untested
---
# Sitewide form-action alignment

## Scope

[FEAT-editor](../../features/editor.md#form-action-alignment-dec-131), DEC-131. Align terminal form actions at the right edge across creation forms, nested forms, dialogs, compact image/video insertion and the login action. The change is shared layout styling and action-row markup; creation/persistence semantics are unchanged.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`, including existing work from other increments. The [source manifest](../../evidence/2026-10-08-form-action-alignment/source-manifest.json) records the working source snapshot. macOS, Node 22.19.0, pnpm 10.34.1, native Safari, fresh owned tab on the running development server at `http://127.0.0.1:4322/admin/`. This increment changes `editor.module.css`, `EmbedControls.tsx` and the login action markup in `App.tsx`.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Desktop creation form | Cancel/Create group aligns to the field's right edge | Schemas → Objects → Add object: both buttons sit together at the right edge below the divider | Passed | [New object form](../../evidence/2026-10-08-form-action-alignment/object-form.png) |
| Shared form coverage | Similar admin forms use the standard | Source inspection confirms all creation screens use FormScreen; dialogs use dialogActions; image/video inserts and login now use that same row; terminal actionFooter also aligns right | Passed | Source manifest |
| Application checks | Diagnostics, tests, build and artifacts pass | `pnpm verify` passes with zero diagnostics and 159 tests across 19 files | Passed | [Verify log](../../evidence/2026-10-08-form-action-alignment/verify.log) |
| Additional dialog/narrow-form visual walkthrough | Verify alignment outside the sampled desktop form | Not completed: the active Safari tab and page changed during the check, preventing a reliable isolated continuation; Chrome browser control is unavailable | Untested | Browser-tool observations; no product failure established |

## Limits and cleanup

Overall Untested reflects the incomplete additional browser walkthrough, not a failing test or observed alignment defect. Mobile, login and embed controls were checked through source coverage and existing tests but not visually exercised in this run. No live providers were used. No screenshot-only checks are claimed to prove persistence. The implementing agent performed verification.

Closed only the created test tab via its tab close action, preserving the existing Start Page/editor tabs and development server. No test content was created, saved or published.
