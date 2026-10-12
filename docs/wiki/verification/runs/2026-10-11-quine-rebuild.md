---
title: Quine recreation verification
updated: 2026-10-11
result: Passed for selected local scenarios
---
# Quine recreation verification

Scope: DEC-143–DEC-146 and the [trial journal](../../journal/2026-10-11-quine-rebuild.md).
The user selected an isolated recreation, editorial fields and section ordering,
block-owned projects, independently implemented components, and small fixes plus
instruction improvements. No deployment is part of this run.

## Environment and evidence

macOS, Node v22.19.0, pnpm 10.34.1, Safari. This is a dirty workspace based on
`ae4768c1449ea0bc2ed381c99e3ffc6332f01e01`, with pre-existing admin-encryption,
provider and documentation changes. The base commit alone does not identify the
tested source. The [source manifest](../../evidence/2026-10-11-quine-rebuild/source-manifest.json)
hashes the affected code, example records/assets and build inputs. The implementing
agent performed the checks; no independent agent review is claimed.

The Quine runner staged ordinary temporary checkouts, symlinked installed
dependencies, used public local fixture credentials and left root content intact.
The development browser checks used port 4323 because the user's existing demo
occupied 4322. Production output was served locally on 4324. Owned servers were
stopped after inspection; the existing demo server was preserved.

## Results

| Scenario | Observed result | Evidence |
| --- | --- | --- |
| Full repository verification | Zero type errors/warnings; 193 tests across 28 files; production build and artifact checks pass. | [Full log](../../evidence/2026-10-11-quine-rebuild/verify.log) |
| Isolated Quine production build | Publication validation, two routes (`/`, `/admin/`) and artifact checks pass. Home uses 9 JS modules, 87,605 gzip bytes; installed runtimes each appear once. | [Example log](../../evidence/2026-10-11-quine-rebuild/example-build.log) |
| Snapshot and assets | The included backup matches source records; all five media records and copied Quine assets exist byte-identically in built output. Root `git diff -- content` remains empty. | [Content checks](../../evidence/2026-10-11-quine-rebuild/content-checks.json), `tests/quine.test.ts` |
| Safe local media | Root-relative and HTTPS metadata validate and round-trip; protocol-relative, HTTP, script/data, backslash and noncanonical paths are rejected. | `tests/local-media.test.ts`, full log |
| Public-site interaction | Pointer selects Flash Coach; Down selects TDCX with matching image, selected tab and Visit URL. Repeated against final production output. | [Browser observations](../../evidence/2026-10-11-quine-rebuild/browser-observations.txt) |
| Narrow layouts | Safari responsive views at 390px and 320px show stacked gallery/two-line wordmark and fitting contact link without visible horizontal overflow. | Browser observations |
| Editor content and media | Introduction and project title edits appear immediately; local-media selection changes the image. Cancel restores content and disables Save draft. | Browser observations |
| Repeatable project list | Add item opens an uncommitted form; Cancel leaves three rows. Dragging first row to last updates preview order; cancellation restores original order. | Browser observations |
| Encrypted static editor | Production login with the fixture email/password unlocks Pages → Home. | Browser observations |
| Wiki and whitespace | Wiki reader rebuilt and integrity check passed; `git diff --check` clean. | Commands recorded in the browser/evidence notes |

The first broad run failed the layout-geometry contract test because Quine omitted
explicit geometry defaults. The manifest/policy/renderer were corrected and the
full suite rerun successfully. Early development checks exposed forbidden linked
dependency access and stale shared optimization caches; the Vite configuration
fixes were verified through working gallery and login controls. These earlier
failures are not hidden by the final passing logs.

## Limits

Visual checks are representative Safari inspection, not pixel-diff or cross-browser
coverage. The halftone intentionally approximates the reference shader. The final
small fallback-opacity reset was included in the last passing builds and production
gallery recheck; the earlier narrow/editor checks preceded that change. Reduced
motion is implemented but not exercised through an OS setting change. Source-based
safe URL and SSR checks do not establish every runtime failure path.

Browser export reached Safari's download-permission prompt and was cancelled.
The source backup equality check is not a completed browser export/import test.
No real repository save, publish, R2 upload, hosting behavior or email delivery was
tested. Third-party project destinations were checked as rendered URLs, not audited.
Nothing was committed, pushed or deployed. No fresh-agent success benchmark was run.
