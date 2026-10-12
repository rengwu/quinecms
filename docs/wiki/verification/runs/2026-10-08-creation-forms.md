---
title: Explicit creation forms sitewide
updated: 2026-10-08
result: Passed
---
# Explicit creation forms sitewide

## Scope and expected behavior

DEC-129 and [FEAT-editor](../../features/editor.md#creation-forms-dec-129) standardize Add → uncommitted New form → Create or Cancel. Applies to pages, entries, collections, reusable objects, schema fields, owned objects, structured rows, page blocks and layout footers. The shared row editor also covers navigation, dropdowns and footer links. Opening/editing a creation form must not change its parent content or recovery; nested child creation remains local until its parent is created. Creation screens omit Back and item deletion. The former eager-insertion pattern is recorded as negative UX in AGENTS.md and the editor contract.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`. The [source manifest](../../evidence/2026-10-08-creation-forms/source-manifest.json) identifies the tested application, content, tests and build configuration, including pre-existing content-model changes. macOS, Node 22.19.0, pnpm 10.34.1. Mounted React tests use jsdom. Native Safari used a fresh test tab against the user's running development server at `http://127.0.0.1:4322/admin/`, including Responsive Design Mode at 390 × 844. Production compilation and artifact checks ran through `pnpm verify`.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| New schema screens | Create/Cancel; no Back or item deletion | Desktop New field and New collection show the correct actions; cancelling both returns to the original Journal-only collection list | Passed | [New field](../../evidence/2026-10-08-creation-forms/new-field.png), [New collection](../../evidence/2026-10-08-creation-forms/new-collection.png), [browser notes](../../evidence/2026-10-08-creation-forms/browser.txt) |
| Collection commit and singleton | Entry exists only after Create collection, with final defaults | Browser-created single-entry collection opens its entry in Content and survives reload; mounted tests verify atomic provisioning and final schema defaults | Passed | Browser notes; `editor-navigation.test.ts` |
| Pages and entries | Cancel/navigation/reload leave no new record; Create appends once | Mounted tests cover page/entry cancellation, area changes, recovery and commits. Browser reload after starting an entry leaves the original two entries | Passed | [Verify log](../../evidence/2026-10-08-creation-forms/verify.log); browser notes |
| Mobile entry form | Usable fields and reachable Create/Cancel; cancellation leaves list unchanged | 390 × 844 form scrolls to both actions without clipping. Cancel returns to the original two entries | Passed | [Form](../../evidence/2026-10-08-creation-forms/mobile-new-entry.png), [actions](../../evidence/2026-10-08-creation-forms/mobile-create-actions.png), [cancelled state](../../evidence/2026-10-08-creation-forms/mobile-cancelled-entry.txt) |
| Nested fields and values | Creating a child stays local to an unfinished parent; invalid schema commit retains form | Mounted tests cover collection/object fields, cancelled defaults, rejected recursive definitions, nested rows, owned-object cancellation and ancestor-form submission isolation | Passed | `editor-navigation.test.ts` and `block-library-editor.test.ts`; verify log |
| Catalog blocks and footers | Catalog selection stages; Create commits; Cancel preserves original page/footer | Mounted tests cover block insertion/recovery and footer creation/replacement cancellation; footer form hides parent layout controls | Passed | `editor-navigation.test.ts`; verify log |
| Full application check | Diagnostics, tests, production build and artifact checks pass | `pnpm verify`: zero diagnostics, 157 tests across 19 files, successful build and artifact check | Passed | Verify log |

## Limits and cleanup

Browser coverage samples desktop schema forms and mobile entries. The broader creation matrix is covered by mounted component tests, not a browser replay of every variant. No physical-device/cross-browser matrix or live GitHub, R2 or hosting-provider operations were performed. Existing provider mocks are not live-provider certification. The implementing agent ran these checks.

Browser test content stayed in the disposable tab's local draft; no Save draft, Publish or upload was used. Closed the owned test tab while preserving the original Start Page and user's running development server. No browser test content was written into repository fixtures.
