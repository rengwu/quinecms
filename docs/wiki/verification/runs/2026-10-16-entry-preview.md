---
title: Live entry preview verification
updated: 2026-10-18
result: Passed
---
# Live entry preview verification

The implemented entry-preview scenarios passed automated tests and actual Helium
development/production checks. The original Safari attempt did not reach the
editor. A fresh production check on 2026-10-18 passed in Safari, alongside a new
full regression run and isolated site validation/typecheck/build/artifact checks.

## Scope and build

This checks [live entry preview](../../features/generic-pages.md) and the
[editor](../../features/editor.md) against DEC-189–DEC-192 and the
[accepted scope](../../discussions/entry-preview.md): actual bound values,
unsaved updates, inherited layouts, pending creation, shared-template navigation,
data-only/singleton behavior and editable fields after preview failures.

Engine base revision: `207f3451776f7c3471ab89536a2aeee1f0edffe0`, with local
implementation changes. The [source manifest](../../evidence/2026-10-16-entry-preview/source-manifest.json)
fingerprints engine sources/tests, library sources, copied site inputs and the
production admin artifact. Environment: macOS, Node 22.19.0, pnpm 10.34.1.

Browser checks used an isolated copy of the independent Tessera dev site's
content/configuration/public assets, disposable local admin credentials, and no
provider credentials. It reused locally installed engine/library dependencies.
The temporary package pins were 0.3.0/0.2.0 for the production build; this was not
a clean registry installation or a released dependency upgrade. Development ran
on port 4337; the built `dist/` ran through Python's static server on port 4338.
The user's existing site/server on port 4322 was not changed or restarted.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Engine regression suite | Existing behavior and new entry-preview scenarios pass | 31 files, 271 tests passed | Passed | [Verify log](../../evidence/2026-10-16-entry-preview/engine-verify.txt) |
| Bound values and nested edits | Resolve actual rich text, media, references and projected values; nested edits keep preview | Automated assertions pass using the renderer mock; real Tessera title/body rendering also observed | Passed | `tests/editor-navigation.test.ts`, [browser observations](../../evidence/2026-10-16-entry-preview/browser-observations.txt) |
| Existing-entry desktop/mobile preview | Unsaved title updates in inherited layout; mobile toggle retains fields | Marketing entry H1 updated immediately; narrow preview and desktop return worked | Passed | [Browser observations](../../evidence/2026-10-16-entry-preview/browser-observations.txt) |
| Shared template | Open Pages template, retain draft entry edits, keep generic-page preview behavior | Template editor opened and entry's edited title remained in Content | Passed | [Browser observations](../../evidence/2026-10-16-entry-preview/browser-observations.txt) |
| Pending entry | Preview before Create, tolerate blank slug, prevent preview navigation, Cancel discards | Title/body previewed; Product link stayed in creation; Cancel removed pending entry; tests also cover Create and recovery isolation | Passed | `tests/editor-navigation.test.ts`, [browser observations](../../evidence/2026-10-16-entry-preview/browser-observations.txt) |
| Docs layout and navigation | Use template's distinct layout and existing entry navigation | Environments displayed docs sidebar; Migrations link switched both fields and preview | Passed | [Browser observations](../../evidence/2026-10-16-entry-preview/browser-observations.txt) |
| Data-only and singleton entries | Full-width data-only fields; routed singleton preview without slug | Automated navigation/form assertions pass | Passed | `tests/editor-navigation.test.ts` |
| Invalid preview and correction | Missing/wrong template/layout leaves fields editable; correcting failure retries | Automated missing-template/layout/implementation and renderer-error recovery assertions pass | Passed | `tests/editor-navigation.test.ts` |
| Site typecheck/build/artifacts | Assembled code checks and production output succeeds | Typecheck reported 256 files, zero errors/warnings/hints; build emitted 60 pages; runtime copy checks passed | Passed | [Observation log](../../evidence/2026-10-16-entry-preview/browser-observations.txt), [build](../../evidence/2026-10-16-entry-preview/site-build.txt), [artifacts](../../evidence/2026-10-16-entry-preview/site-artifacts.json) |
| Production editor in Helium | Unlock, mount, edit and preview real entry | Pages mounted; entry title and preview H1 updated; restoring title returned Local preview status | Passed | [Browser observations](../../evidence/2026-10-16-entry-preview/browser-observations.txt) |
| Additional Safari production check | Unlock and exercise entry preview | Attempt remained at Unlocking; editor scenario was not reached | Untested | [Browser observations](../../evidence/2026-10-16-entry-preview/browser-observations.txt) |
| Safari production recheck, 2026-10-18 | Unlock, edit, switch preview widths and retain entry edits through shared-template navigation | Pages mounted; title and preview updated together; mobile view retained fields; shared-template navigation retained edits; restoring the original title returned Local preview status | Passed | [Precommit observations](../../evidence/2026-10-16-entry-preview/precommit-2026-10-18.txt) |

## Precommit verification — 2026-10-18

`pnpm verify` passed all 271 tests across 31 files and checked 199 wiki pages and
internal links. Prettier passed for the five changed source/test files, and
`git diff --check` passed. All 151 nongenerated engine source/test hashes from
the original verification manifest still match; no implementation fixes were
needed. The [new manifest](../../evidence/2026-10-16-entry-preview/precommit-2026-10-18-manifest.json)
also fingerprints current library sources, isolated site inputs and the built admin.

A new isolated copy of the Tessera dev site passed
[content validation](../../evidence/2026-10-16-entry-preview/precommit-2026-10-18-validate.txt),
[typechecking](../../evidence/2026-10-16-entry-preview/precommit-2026-10-18-check.txt)
(256 files, zero errors/warnings/hints), the
[60-page production build](../../evidence/2026-10-16-entry-preview/precommit-2026-10-18-build.txt)
and [artifact checks](../../evidence/2026-10-16-entry-preview/precommit-2026-10-18-check-build.txt).
Local installed dependencies and temporary 0.3.0/0.2.0 pins were reused, with
disposable admin credentials and no provider configuration.

Safari's foreground production check used the owned static server on port 59361.
The editor mounted and the existing-entry, desktop/mobile preview and shared-template
journeys passed. This closes the earlier Safari coverage gap without establishing
the cause of the original incomplete unlock attempt. Test edits were restored,
the owned tab was closed and password saving was declined. Copied content hashes
matched the original site before cleanup; the owned server and temporary copy
were removed after preserving evidence.

Build/typecheck logs and exported interview answers have trailing whitespace
removed for the commit. Precommit logs also replace local checkout paths with
`<isolated-site>` and `<engine-root>`; observations and results are unchanged.

## Limits and cleanup

Tests mock the block renderer and provider integrations. The real browser checks
cover Tessera marketing/docs rendering but not every field type or library.
The Safari recheck covers the existing-entry journey described above; the cause
of the earlier incomplete unlock attempt was not established. No independent verifier was used.
Live Git saves, R2 uploads and remote hosting publication were outside this scope.
No content-format or library implementation change was required.

The report metadata checker accepts this run's result, but reports nine older
reports without valid result metadata. Those historical reports were not rewritten
as part of this change. Wiki rendering/internal-link checks are separate.

Evidence was preserved before stopping the owned servers, closing test tabs and
removing the isolated site. Its content hashes still matched the original site
before removal. Port 4322 remains the user's existing server. Restart that dev
server to assemble the updated engine into its disposable workspace.
