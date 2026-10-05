---
title: Shared content width and development reloads
updated: 2026-10-06
result: Passed
---
# Shared content width and development reloads

## Scope and environment

[FEAT-static-blocks](../../features/static-blocks.md) and [FEAT-editor](../../features/editor.md): shared site width, optional author adoption, consistent public/preview propagation and prompt-free development reloads. macOS, Node 22.19.0, pnpm 10.34.1; dirty tree based on `f6993528410bebeae1dafd70d52f57c1cc3e34d4`. [Source manifest](../../evidence/2026-10-05T1735Z-content-width/source-manifest.json).

## Results

| Scenario | Expected | Observed | Result |
| --- | --- | --- | --- |
| Content contract | Numeric width survives serialization; omitted/null defaults; invalid explicit values rejected | Unit tests pass for 880px round-trip, legacy/cleared defaults and invalid values | Passed |
| Admin propagation | Setting persists across navigation and applies only to preview | Mounted UI test checks 880px, recovery state, clearing to 1200px and separation from admin controls | Passed |
| Browser width/reload | Editing width changes containers and survives reload without a development confirmation | Safari keyboard input sets 680px; dirty reload completes directly; screenshot shows narrower aligned header, Hero content, Text and Counter while background stays full width | Passed |
| Public output | All public shells emit the saved width without requiring JavaScript | Five built public pages emit 1200px in their root CSS variable | Passed |
| Regression/build | Checks, tests, build and shared assets remain valid | Final `pnpm verify` passes: zero diagnostics and 77 tests in 13 files | Passed |

Evidence: [final verification log](../../evidence/2026-10-05T1735Z-content-width/verify.log), [public output checks](../../evidence/2026-10-05T1735Z-content-width/public-output.txt), [browser observations](../../evidence/2026-10-05T1735Z-content-width/browser-observations.txt).

## Limits and cleanup

The first native numeric setValue action did not dispatch an edit; keyboard input was used and verified through enabled Save draft and the changed layout. The existing dev process had a stale generated route from previous fixture changes. A clean restart on 4321 removed the error before the successful check. Its replacement is intentionally left running for development. The isolated Safari window is closed; no Git/provider writes occurred.

Production browser reload prompts, a full responsive audit, third-party block compliance and live providers were not selected. Public output was inspected from the production build; browser interaction used the development server. The earlier width-only verification log precedes the additional development-reload change; the linked final log includes both.
