---
title: Block sidebar hierarchy
updated: 2026-10-05
result: Passed
---
# Block sidebar hierarchy

## Scope

[FEAT-editor](../../features/editor.md), DEC-051: opening a block hides parent sidebar navigation; All blocks restores it. The top toolbar and interactive preview remain available.

## Build and environment

Dirty implementation on `f6993528410bebeae1dafd70d52f57c1cc3e34d4`; [source manifest](../../evidence/2026-10-05T1014Z-block-sidebar/source-manifest.json). macOS, Node 22.19.0, pnpm 10.34.1. Fresh Safari tab against the existing development server at `http://127.0.0.1:4321/admin/`. No independent verifier.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Open Hero from Home | Block details replace parent controls | Tabs, selector, Add page and page fields disappear; All blocks is first, followed by Hero fields | Passed | [Browser observations](../../evidence/2026-10-05T1014Z-block-sidebar/browser-observations.txt) |
| Return to page | All blocks restores selected document and navigation | Home selector, tabs, page fields and block list return; preview counter stays at 1 | Passed | [Browser observations](../../evidence/2026-10-05T1014Z-block-sidebar/browser-observations.txt) |
| Required checks | Types, existing tests, static build and asset checks pass | Zero diagnostics, 57 tests, five static routes and shared runtime checks passed | Passed | [Verification log](../../evidence/2026-10-05T1014Z-block-sidebar/verification.log) |

## Limits and follow-up

This bounded navigation change was checked in the development browser; the production output was built and artifact-checked, without a separate browser run. Live provider operations and unrelated editor features were outside scope. No persistent content changes, new server, or remote writes were made. The test tab was closed; the existing development server was preserved.
