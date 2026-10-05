---
title: Admin startup repair
updated: 2026-10-05
result: Passed
---
# Admin startup repair

## Scope

[FEAT-editor](../../features/editor.md): reproduce the blank `/admin/`, restore development startup, and check production startup and preview interactions. This is a bounded repair, not a new full integration run.

## Build and environment

Base commit `f6993528410bebeae1dafd70d52f57c1cc3e34d4`, with dirty implementation. The [source manifest](../../evidence/2026-10-05T0910Z-admin-startup/source-manifest.json) identifies the tested code. macOS, Node 22.19.0, pnpm 10.34.1. Native browser controls reproduced the blank page in Helium and inspected the error and fix in Safari. The existing development server used port 4321; an owned production preview used port 4322. No independent verifier.

## Results

The baseline failed: the manual React root bypassed Astro's before-hydration initialization, and React Fast Refresh threw “can't detect preamble” before mounting. The repair replaces that bootstrap with Astro's `client:only="react"` island and normal props. The following results apply to the repaired build.

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Development startup | Editor and preview render without startup exception | Drawer, fields and home blocks visible after reload; preamble exception gone | Passed | [Browser observations](../../evidence/2026-10-05T0910Z-admin-startup/browser-observations.txt) |
| Live editing and cancel | Heading updates immediately; Cancel restores baseline | Both observed; content returned to Saved content | Passed | [Browser observations](../../evidence/2026-10-05T0910Z-admin-startup/browser-observations.txt) |
| Production startup and islands | Static output mounts editor, styles and interactive blocks | Svelte counter incremented; Vue accordion expanded; no JS/CSS startup error | Passed | [Browser observations](../../evidence/2026-10-05T0910Z-admin-startup/browser-observations.txt) |
| Required automated checks | Types, tests, build and asset graph pass | 44 tests passed; zero type diagnostics; five static routes; shared runtimes and asset references valid | Passed | [Verification log](../../evidence/2026-10-05T0910Z-admin-startup/verification.log) |

## Limits and follow-up

All selected repair scenarios passed. Live GitHub/R2/Netlify, full layout parity, password/Lock and other previously untested interactions remain outside this run. A missing favicon still produces an unrelated HTTP 404. No provider writes, commits or deployment were performed. The Safari test tab was closed, test content changes were cancelled, and the owned preview was stopped; the user's development server remains running.
