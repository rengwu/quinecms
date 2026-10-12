---
title: Editor layout consistency
updated: 2026-10-05
result: Passed
---
# Editor layout consistency

## Scope

[FEAT-editor](../../features/editor.md), DEC-055: shared spacing and action hierarchy for sidebar forms, custom widgets, media, site navigation, schema fields and dialogs. The [layout contract and research](../../journal/2026-10-05-editor-layout.md) define the expected arrangement.

## Build and environment

Dirty implementation on `f6993528410bebeae1dafd70d52f57c1cc3e34d4`; [source manifest](../../evidence/2026-10-05T1108Z-editor-layout/source-manifest.json). macOS, Node 22.19.0, pnpm 10.34.1. Native Safari in a fresh window against the existing development server at `http://127.0.0.1:4321/admin/`. No independent verifier.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Block Design | Labels above aligned controls; actions separated below fields | Accent and Spacing occupied the same full-width column as other fields; Cancel/Remove followed a divider. Cancel restored the original block and disabled Save draft | Passed | [Browser observations](../../evidence/2026-10-05T1108Z-editor-layout/browser-observations.txt) |
| Media | Clear primary upload action; settings and help spaced separately | Storage settings appeared beside the heading; primary Upload file and helper below did not collide | Passed | [Browser observations](../../evidence/2026-10-05T1108Z-editor-layout/browser-observations.txt) |
| Navigation and utility sections | Related link fields grouped; adding distinct from rows; backups/session separated | Three bordered link groups showed labels and destination controls with removal at the right. Add link appeared in the header. Backups and Session had their own headings and separated action rows | Passed | [Browser observations](../../evidence/2026-10-05T1108Z-editor-layout/browser-observations.txt) |
| Connection dialog | Consistent field widths/gaps; close/connect grouped at bottom right | Aligned labeled fields, supporting actions above, and Close/Connect together at bottom right; no credentials entered | Passed | [Browser observations](../../evidence/2026-10-05T1108Z-editor-layout/browser-observations.txt) |
| Schema field screen | Immediate-parent back link; readable form and separated removal | Home → Collection schemas → Journal → Title showed only field controls, a Journal schema back link and a separated disabled Remove field action. No global menu or entry controls remained in the drawer | Passed | [Browser observations](../../evidence/2026-10-05T1108Z-editor-layout/browser-observations.txt) |
| Required verification | Types, regression tests, static output and asset checks pass | Zero diagnostics; all 61 tests in 12 files passed; five static routes built; shared runtime and public-style isolation checks passed | Passed | [Verification log](../../evidence/2026-10-05T1108Z-editor-layout/verify.log) |

## Limits and cleanup

Passed applies to the listed checks. The browser run used development output at desktop width; production output was built and artifact-checked without a separate production-browser run. Storage and confirmation dialogs share the checked layout but were not separately inspected in this run. Live GitHub/R2/hosting operations, password entry and a full responsive/accessibility audit were outside scope.

The temporary Design edit was cancelled. Save draft was disabled before closing the owned test window. The pre-existing user window and development server were preserved; no content files or remote providers were modified by browser testing. The schema-field visual observation closes the prior run's outstanding visual check without rewriting that historical report.
