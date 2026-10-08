---
title: Lean content-model implementation verification
updated: 2026-10-08
result: Passed
---
# Lean content-model implementation verification

## Scope

[FEAT-content-model](../../features/content-model.md), with affected [editor](../../features/editor.md), [generic pages](../../features/generic-pages.md) and [Git publishing](../../features/publishing.md). The user authorized implementing DEC-110–DEC-128 without compatibility or migrations. Selected checks cover the new model, persistence, schema impact, references, routes, presentation, recovery and dedicated desktop/mobile editing levels.

Aggregate: **Passed** for these local and mocked checks. Live GitHub, R2 and Netlify, physical devices, broad performance benchmarks and a complete browser matrix are excluded, not implied to pass. Nothing was deployed.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`, macOS, Node 22.19.0, pnpm 10.34.1, Astro 7.3.5. The [source manifest](../../evidence/2026-10-08-content-model/source-manifest.json) identifies application/generated code, scripts, tests, content, public assets, example, package lock and configuration. Manifest: 492 files, SHA-256 `e99189e93084c3d0c243d24e3b0f459c8bafb290e0d0717c55c9c3ec0dfbdbb9`. Discussion records already present in the dirty tree were preserved. The implementing agent performed the verification; no independent review is claimed.

The full application check uses normal repository content. `examples/content-model.json` was additionally built in an isolated temporary source copy with its own JSON content records and no copied credentials/environment. This produced eight routes including the single-entry `/about`, compared with seven normal demo routes. The [example build log](../../evidence/2026-10-08-content-model/example-build.log) and [render assertions](../../evidence/2026-10-08-content-model/rendering.json) record that check.

Browser verification used native Safari, desktop and responsive 390 × 844. The example production build ran on localhost:4330; the actual project development server ran on localhost:4332; the final normal production build ran on localhost:4333. Example browser evidence predates only final Add-button styling and collection-label spacing; the final production screenshot records those small corrections. Application behavior was unchanged by them, and the full suite was rerun afterward.

An attempted development run from the temporary copy could not hydrate because its symlinked dependencies were outside Vite's serving allowlist. The check was moved to the real workspace without weakening that boundary; its editor mounted and opened Schemas successfully. This was a verification-fixture setup issue, not treated as a passing startup observation. See [development log](../../evidence/2026-10-08-content-model/development.log).

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Types, regressions and production artifacts | Clean diagnostics, passing tests/build and runtime checks | Zero errors/warnings/hints; 151 tests across 19 files passed; seven normal routes built; artifact checks passed | Passed | [Full verify log](../../evidence/2026-10-08-content-model/verify.log) |
| Model persistence and independent owned values | Objects/modes/new values survive JSON records, defaults remain independent, duplicated descendants get fresh IDs | Record round-trip, cloned defaults and nested row identity tests pass | Passed | `tests/content-model.test.ts`; verify log |
| Owned depth and recursion | Three levels and ordinary reuse work; fourth level, direct and indirect cycles fail | Named/inline use-site checks pass, including shared-definition depth impact and valid entry-reference cycles | Passed | `tests/content-model.test.ts` |
| Shared definition impact and deletion | Populated values/defaults and incoming usages prevent destructive changes | Nested entry/default impact tests, collection/object usage checks and referenced-entry deletion tests pass | Passed | Core and mounted editor tests; [used-by view](../../evidence/2026-10-08-content-model/objects.png) |
| Reference integrity | Draft targets remain repairable; Publish requires correct targets; selections are ordered and unique | Missing/wrong targets, defaults, per-value uniqueness and reference-array order covered; mobile search/reorder observed | Passed | `tests/content-model.test.ts`; [mobile references](../../evidence/2026-10-08-content-model/mobile-references.png) |
| Forward rendering and projections | Owned/reference paths, nested projections and collection cards use current values and preserve order | Resolver tests, mounted projection editor test, real Structured details renderer test and static example output pass | Passed | [Public output](../../evidence/2026-10-08-content-model/public-output.png); render assertions; core/editor tests |
| Route modes | Data-only needs no URL; many uses prefix/slug; single uses exact path; collisions fail | Route tests pass, example `/about` emitted, Authors not routed, single-entry Content has no slug or extra-entry action | Passed | [Single entry](../../evidence/2026-10-08-content-model/single-entry.png); example build |
| Authoring and recovery | Definitions and nested editors preserve the shared draft and replace parents | Mounted creation/reload tests pass; three owned levels edited in Safari; Weight changed 1.2 to 1.3 and persisted after reload | Passed | [Nested desktop](../../evidence/2026-10-08-content-model/nested-editor.png), [mobile](../../evidence/2026-10-08-content-model/mobile-nested-editor.png), [recovered value](../../evidence/2026-10-08-content-model/recovered-nested-value.txt) |
| Incomplete/unreadable recovery | Unfinished schemas survive; unreadable snapshots are not silently overwritten | Cyclic-definition and preserved unreadable-draft tests pass | Passed | `tests/recovery.test.ts` |
| Git save/reload/publication | New object records and references participate in atomic snapshots without changing stale-save protection | Rich-fixture mocked save/reload/publish plus all existing transaction/race tests pass | Passed | `tests/github.test.ts`; verify log |
| Development and final production startup | Editor hydrates and Schemas navigation works | Actual project dev startup and final built editor open; final collection actions have consistent primary styling/icons and separated labels | Passed | [Development](../../evidence/2026-10-08-content-model/development.png), [final collections](../../evidence/2026-10-08-content-model/final-collections.png) |

## Browser evidence and cleanup

The [browser observations](../../evidence/2026-10-08-content-model/browser.txt) distinguish browser actions from mounted tests. Save/Publish was exercised against mock transport, not live services. Public output displayed the immutable example snapshot (Ada, Weight 1.2), while local browser edits changed Grace/Weight 1.3 only in the test session; no publication was inferred from those edits.

All task-created Safari tabs were closed, preserving the original Start Page. Owned development/static servers were stopped. The isolated fixture directory was removed after evidence capture; repository content remained intact. Screenshots and logs contain local test content. Wiki build/check and verification-report schema checks validate records separately from the application suite.
