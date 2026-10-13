---
title: R2 connection test verification
updated: 2026-10-13
result: Passed
---
# R2 connection test verification

## Scope and implementation

The user requested a **Test connection** button and explicitly asked to keep it
lean with `rule-lean`. This covers [FEAT-media](../../features/media.md): a single
button/result using the current unsaved settings, independently of Save. The
implementing agent performed verification; no independent review is claimed.

The existing S3 client configuration is shared with uploads. The test writes unique
text under `connection-test/<uuid>.txt`, fetches it without credentials through the
public URL, compares its body, and deletes only that key. Each operation has a
15-second timeout; SDK attempts are limited to one. Cleanup is attempted after a
failed write response as well. Errors distinguish write/read failure and identify
any possible leftover key when cleanup cannot be confirmed. No media record, saved
settings, backend, dependency, retry loop or diagnostics panel was added.

Inputs and Save are disabled while testing. Cancel/dismiss leaves the asynchronous
cleanup running. Editing clears the prior result. Save remains optional and reports
only that settings were saved, avoiding a contradictory claim after a successful test.

## Build and environment

macOS, Node 22.19.0, pnpm 10.34.1, Chrome. Base revision
`5a14f1a526e6c82efa0eb1c15a03ea3bf0a76801`, with existing uncommitted work preserved.
The [source manifest](../../evidence/2026-10-13-r2-connection-test/source-manifest.json)
identifies the tested inputs. No application changes occurred after the final checks.

The existing isolated Intr development server at `http://127.0.0.1:4324` was updated
with App, StorageSettings, its CSS and the media integration from this workspace.
Content hashes were identical before/after; environment and browser settings were
not changed. A fresh disposable browser tab used the standard development login.
The user's existing tab was observed but not edited, reloaded or used for testing
their R2 credentials. The original server remains running for the user.

## Results

| Scenario | Expected and observed | Result | Evidence |
| --- | --- | --- | --- |
| Repository checks | Type checks, all 228 tests across 34 files, production build and artifact checks pass. | Passed | [Full log](../../evidence/2026-10-13-r2-connection-test/verify.log) |
| Probe success | Unique key and content, public read without credentials/cache, matching body, deletion of exactly the probe key, client disposal. Repeated tests use different keys. | Passed | `tests/media-connection.test.ts` |
| Failed write/read/cleanup | Failed writes still attempt deletion and skip reads. Network/HTTP/wrong-body public failures clean up. Cleanup failure prevents success, preserves prior failure context and reports the possible leftover key. Invalid settings cause no SDK/fetch effects. | Passed | Connection regression tests |
| Form behavior | Tests use unsaved values, never call Save, disable concurrent edits/Save, clear success on edits, permit retry and permit dialog dismissal while the test finishes. Validation errors appear before the integration is called. | Passed | `tests/storage-settings.test.ts` |
| Actual 4324 preview | New button appears beside Cancel/Save on desktop; at 390px it takes one row above the two save/cancel actions. Dialog and page have no horizontal overflow. | Passed | [Desktop](../../evidence/2026-10-13-r2-connection-test/desktop.png), [mobile](../../evidence/2026-10-13-r2-connection-test/mobile.png) |
| Browser validation | Activating the actual button with a DevTools-dispatched DOM click shows the invalid-account error before any R2 request. | Passed | [Browser observations](../../evidence/2026-10-13-r2-connection-test/browser-observations.json) |

## Limits and cleanup

SDK/fetch tests use mocks. No real bucket credentials, live CORS policy, public
response, probe upload or remote deletion was exercised. The browser pass establishes
rendering and client validation only. Browser-driver click/key attempts focused the
button without dispatching DOM events; a DevTools DOM click exercised the handler.
This does not establish the driver's native activation path or physical-device behavior.

Closing the tab/browser or losing connectivity can interrupt cleanup; the feature
does not promise cleanup in that case. A passing test covers this small probe at
that moment, not image conversion or every media file size/type.

Temporary event instrumentation and viewport overrides were confined to the owned
test tab and removed when it closed. The user's original tab, content and running
4324 server were preserved. No Cloudflare changes, commit, push or deployment occurred.
The wiki was rebuilt and passed its integrity check. The report metadata checker
still flags the same four pre-existing legacy result labels; this run is valid.
See [metadata output](../../evidence/2026-10-13-r2-connection-test/report-metadata.json).
