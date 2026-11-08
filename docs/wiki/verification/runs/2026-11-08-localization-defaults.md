---
title: Default text localization verification
updated: 2026-11-08
result: Passed
---
# Default text localization verification

## Scope and build

DEC-251 changes [FEAT-internationalization](../../features/internationalization.md):
text/rich-text values vary by default, explicit false keeps a field shared, and
other leaf types opt in. Composition, collection selectors and field mappings
remain shared. This run covers collection schema editing, nested copy storage,
existing data preservation, public builds and the Tessera homepage workflow.

The requested engine checkpoint is `0923d05` (`feat(editor): checkpoint admin
redesign and verification tooling`). Localization changes were tested as dirty
working trees in the engine and sibling library. The library also contained
pre-existing Kahf changes. See the [source manifest](../../evidence/2026-11-08-localization-defaults/build-identity.json)
for both revisions and SHA-256 input hashes. Environment: macOS, Node 22.19.0,
pnpm 10.34.1, Vitest 5.0.3; Chromium version and isolated port are in the
[browser observations](../../evidence/2026-11-08-localization-defaults/browser.json).

## Results

| Scenario | Expected and observed outcome | Result | Evidence |
| --- | --- | --- | --- |
| Engine regression suite | 297 tests in 35 files pass, including default text/rich text, explicit shared/opt-in fields, mappings, nested lists/objects, preserved original values and existing translations, schema validation and schema toggle persistence. | Passed | [Engine tests](../../evidence/2026-11-08-localization-defaults/engine-tests.log) |
| Production language routes | The suite builds an isolated site with translated block text without localization flags; `/id` renders the translation while English remains unchanged. Missing copies retain whole-record fallback and strict validation. | Passed | `tests/languages-build.test.ts`, included in engine results |
| Library regression suite | 17 tests in five files pass. The new Tessera test covers hero text, header/footer and navigation defaults, technical exceptions, field mappings and unchanged main-language values. Existing Kahf save/publish tests use mocked providers. | Passed | [Library tests](../../evidence/2026-11-08-localization-defaults/library-tests.log) |
| Assembled library type check | 249 files checked: zero errors, zero warnings, one existing unused-import hint. | Passed | [Check log](../../evidence/2026-11-08-localization-defaults/check.log) |
| Real Tessera editor | Settings enables Chinese; cancelling copy creation leaves no copy. Creating a copy exposes blank translatable hero text without Shared badges. Commands remain shared. Chinese heading/description/button text renders in the live Draft preview. Switching to English preserves its text. | Passed | [Browser observations](../../evidence/2026-11-08-localization-defaults/browser.json), [Chinese hero](../../evidence/2026-11-08-localization-defaults/chinese-hero.png) |
| Reload and persistence | After reload and login, the Chinese heading returns. The recovery record stores it only under the Chinese copy, keeps English values unchanged, and does not copy the shared command. Local content files remain byte-for-byte unchanged. | Passed | [Browser observations](../../evidence/2026-11-08-localization-defaults/browser.json) |
| Existing review tab | Restarted the confirmed Tessera review server at port 5323, reopened its retained draft, and observed its existing `ni hao` Chinese title. Hero Heading/Description/Emphasis/button labels are now translatable; Anchor/Command/URLs remain Shared. No content fields were edited. | Passed | [Native observations](../../evidence/2026-11-08-localization-defaults/review-tab.txt) |

## Repairs and limits

The library test harness needed access to the linked engine's font asset and an
updated selector for the redesigned Publish confirmation. Initial browser-driver
attempts selected Astro's Settings, hit its overlapping toolbar, or assumed
authentication persisted through reload. Corrected the driver to scope editor
navigation, use keyboard creation actions and sign in again; the completed run
passes. These were setup/driver issues rather than localization failures.

The wiki builds and its 227-page link/current-output check passes. The separate
report-metadata checker accepts this report but flags nine older reports whose
historical result strings are outside its current enum. Those unrelated reports
were not rewritten.

Technical exceptions were marked in the library's Tessera, Archline and Intr
definitions; existing explicit choices in Kahf remain unchanged. Tessera's
starter release-version field is shared. Existing sites own their collection
schemas and require their own review of technical text on upgrade; no site
content or schema was rewritten here. Previously shared text is not inferred or
moved into a translation. Optional untranslated fields can remain blank under
the existing eligibility rules; this change does not add field-level fallback.

The isolated browser/site/server were removed after saving evidence. The existing
review server remains running at `http://127.0.0.1:5323/admin/` with the updated
engine/library; its tab is open to Home's Chinese hero. The independent dev site
on port 4322 was not restarted. No live Git, R2, remote install, hosting or
deployment was exercised, and this is not an independent review. Those provider
paths were outside the selected scope.
