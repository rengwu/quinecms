---
title: Media field uploads verification
updated: 2026-10-13
result: Untested
---
# Media field uploads verification

## Scope and build

[FEAT-media](../../features/media.md#upload-from-media-fields), DEC-160–DEC-162:
Upload and thumbnails in shared media fields, existing storage settings in place,
and retention of uploaded records when block changes are cancelled. Implementation
was authorized with work-until-grill. No new storage provider or file format.

macOS, Node 22.19.0, pnpm 10.34.1. Dirty source at
`93fdce513dbd2dcfd41ceb9c99590080956509a9`; the
[source manifest](../../evidence/2026-10-13-media-fields/source-manifest.json)
fingerprints application files, tests, configuration, content and public assets.
Chrome used a fresh disposable tab at the main development editor,
`http://127.0.0.1:4322/admin/`, with the fixed development login. Existing user tabs
were not edited. Intr content was imported into this tab's draft only; source
content, Git and published files were not changed by browser checks.

## Results

| Scenario | Expected and observed | Result | Evidence |
| --- | --- | --- | --- |
| Full local verification | 457 files checked with zero diagnostics; 239 tests across 36 files pass; seven-route production build and artifact checks pass. | Passed | [Full log](../../evidence/2026-10-13-media-fields/verify.log) |
| Existing block upload and cancellation | Mocked success selects the new record, updates preview props/thumbnail and leaves another block unchanged. Cancel restores the old reference and retains the uploaded media record. | Passed | `tests/media-fields.test.ts`, full log |
| Upload progress, failure and retry | Pending upload disables editor controls/navigation; an error retains the previous image. Retrying selects and records one uploaded file. | Passed | Editor integration tests, full log |
| Missing storage | Opens the existing settings dialog. Cancel retains field edits; Save retains settings and returns to the form without starting an upload. | Passed | Integration tests and actual Chrome dialog flow |
| Nested items, new blocks, entries and layouts | Nested upload changes only its row; cancelled new block adds no block but retains its upload; non-image entry media gets no thumbnail. Layout snapshot updates retain both the field change and the new record. | Passed | Eight new editor integration tests, full log |
| Media library | Uses the same upload control; an empty file selection changes nothing. Successful mocked upload adds the record without changing page content. | Passed | Integration tests, full log |
| Desktop and 390 × 844 field UI | Intr introduction shows Upload controls, selected local-image thumbnails and alternative text. An unsupported text file produces an inline error and retains about 1. Fields, thumbnails and error text fit the narrow drawer. | Passed | [Desktop error](../../evidence/2026-10-13-media-fields/desktop-error.png), [mobile](../../evidence/2026-10-13-media-fields/mobile.png) |
| Repeating block checks after reload | Reload/login restored the imported pages, but automation could not reopen the block controls reliably. Field-level repetition after reload is not established. | Untested | Observed browser automation limitation |
| Live R2 upload | No disposable bucket/credentials were used. Successful upload behavior is SDK/editor mocked, not evidence of live permissions, CORS or image encoding. | Untested | Outside the local fixture |

Overall is **Untested** because the live upload and repeated post-reload browser
journey are not established. The local automated suite and pre-reload browser
field/setup/validation checks passed; no product regression was established by
the later automation difficulty. Browser console inspection returned no warnings
or errors during the completed field checks.

## Implementation and cleanup

The shared field renders a small existing-image thumbnail and invokes the same
upload action as Media. The editor's existing busy state holds edits during an
upload. Applying the field change before appending its media record preserves
layout editors that replace a content snapshot. No queues, picker redesign,
automatic successful-file deletion or dependency was introduced.

The first fixture import used the example's bare content JSON and was rejected by
the existing importer, which expects an editor backup envelope. A temporary file
wrapped the same content in that envelope and imported successfully. The unrelated
initial import-error toast is visible in the screenshots. The extension file
chooser API required file-URL permission; the native file picker completed the
local import and unsupported-file check without changing extension permissions.
Only dummy storage settings were entered in this disposable tab; the unsupported
text file was rejected before any SDK upload. No live connection test, remote
Save or Publish was attempted. The viewport override was reset and the disposable
tab closed. Temporary fixtures were removed; evidence is retained here.

Wiki build/link checks and `git diff --check` pass. The report metadata checker
accepts this run's result but flags six existing reports with nonstandard result
labels (GitLab, local authoring, Quine, Archline, Intr and unified dashboard).
Those historical reports were not changed in this increment.
