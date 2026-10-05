---
title: Persistent admin sidebar
updated: 2026-10-06
result: Passed
---
# Persistent admin sidebar

## Scope and environment

[FEAT-editor](../../features/editor.md), DEC-074: replace Home destination cards with persistent main navigation, retaining nested page/block controls and page-only preview. Local macOS, Node 22.19.0, pnpm 10.34.1; dirty workspace based on `f6993528410bebeae1dafd70d52f57c1cc3e34d4`. The [source manifest](../../evidence/2026-10-05T1725Z-admin-navigation/source-manifest.json) identifies the verified application, tests, fixtures and configuration.

## Results

| Scenario | Expected | Observed | Result |
| --- | --- | --- | --- |
| Main navigation | Five destinations persist separately from workspace; Pages opens by default | Mounted tests and Safari show Pages table with separate main navigation; active Pages highlight visually confirmed | Passed |
| Nested editing | Page and block controls stay separate; live preview has its own space | Safari Home → Hero shows main navigation, block drawer and preview in three non-overlapping columns; hierarchy tests pass | Passed |
| Area switching | Content uses standard admin; shared edits survive switches | Browser opens Content without preview; mounted tests preserve edits and verify active-area state across destinations | Passed |
| Narrow navigation | Menu exposes destinations and closes after selection | Safari responsive viewport at 390×844 opens Menu and navigates to Media; dialog closes, standard admin layout fits viewport | Passed |
| Regression/build | Tests and static output checks pass | `pnpm verify`: zero errors/warnings/hints, 75 tests in 13 files, static build and shared-runtime checks pass | Passed |

Evidence: [verification log](../../evidence/2026-10-05T1725Z-admin-navigation/verify.log), [browser observations](../../evidence/2026-10-05T1725Z-admin-navigation/browser-observations.txt).

## Limits and cleanup

Browser checks used the existing development server on 4321 in an isolated Safari window. Production output was built and checked automatically; production browser behavior and live provider actions were not selected for this layout-only change. The narrow-screen check covers navigation and Media; it is not a complete mobile page-builder audit.

No content edits, saves, publications or uploads were performed in the browser. The isolated test window is closed; the user's existing window and development server remain running. No commit or deployment was performed.
