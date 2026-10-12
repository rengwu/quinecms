---
title: Git save status and recovery verification
updated: 2026-10-12
result: Untested
---
# Git save status and recovery verification

## Scope

[FEAT-editor](../../features/editor.md#git-save-status-and-recovery), implementing
DEC-148–DEC-151. Automated verification passed. The overall result is Untested
because selected browser visual/recovery checks could not be completed.

## Build and environment

macOS, Node v22.19.0, pnpm 10.34.1. Dirty working tree based on
`ae4768c1449ea0bc2ed381c99e3ffc6332f01e01`; pre-existing changes were preserved.
The [source manifest](../../evidence/2026-10-12-git-save-ux/source-manifest.json)
hashes the tested source, fixtures, assets and build inputs. No independent agent
review is claimed.

`pnpm verify` runs types, all regression tests, production build and artifact checks.
The new editor tests use real React/Kumo controls in jsdom, mocking the repository
boundary, download request and preview islands. Existing provider tests exercise
GitHub/GitLab transports with mocks, not live accounts.

## Results

| Scenario | Expected and observed outcome | Result | Evidence |
| --- | --- | --- | --- |
| Local, dirty, saving and saved statuses | Status follows content/baseline and in-flight save; content is unchanged until success. No extra remote polling. | Passed | `tests/editor-save.test.ts`, [full log](../../evidence/2026-10-12-git-save-ux/verify.log) |
| Stale save | Content/base retained, Save/Publish disabled, recovery opens; closing/reopening preserves edits. | Passed | Editor save tests, full log |
| Export | Download receives pending content with original repository and base SHA; no completed-download claim. | Passed | Editor save tests |
| Cancel/failed/successful load | Cancel and failure retain content/base; only confirmed successful load replaces them and resets status. Export is optional. | Passed | Editor save tests |
| Network/permission failure | Shows Not saved, retains edits, allows retry, does not claim a newer draft. | Passed | Editor save tests |
| Reconnection/destination change | Same-repository stale recovery is actionable; changing destination preserves pending content and cannot save through mismatched credentials. | Passed | Editor save tests |
| Provider stale/race protection | Existing rejection-before-commit and guarded shared-branch updates still pass. | Passed | `tests/github.test.ts`, `tests/gitlab.test.ts`, full log |
| Broad checks | Zero type errors/warnings, 202 tests in 30 files, build and artifact checks pass. | Passed | Full log |
| Native browser visuals and recovery | Automation returned no available browser/native surfaces; inspection could not start. | Untested | [Browser/readiness notes](../../evidence/2026-10-12-git-save-ux/browser-check.txt) |
| Completed browser backup download | Download request covered in component tests; actual filesystem completion not exercised. | Untested | Browser/readiness notes |

Initial focused runs had incorrect fixture labels/dialog selectors, and the initial
type check rejected an unsupported Kumo button variant. These were corrected before
the passing focused and full runs. They do not establish a live-provider failure.

## Limits and follow-up

Native control returned `Sky Computer Use native pipe startup failed` before any
interaction, and again after resetting the automation session. No alternative browser
surface was exposed. Follow up with the feature's desktop/narrow browser recipe once
automation is available. HTTP readiness does not prove mounting or layout correctness.
No real provider permissions, CORS, commits, publication, R2 or hosting behavior was
tested, and no external changes were made.

The pre-existing demo (4322) and Quine (4323) servers remain running; Quine has the
final editor source/styles. The owned disposable mocked-provider fixture (4324)
was stopped and removed without browser use. Root content has no diff. Wiki
records were rebuilt and checked, with `git diff --check` clean.
