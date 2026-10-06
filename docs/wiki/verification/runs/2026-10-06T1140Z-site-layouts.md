---
title: Site Layouts, chartr and nested navigation verification
updated: 2026-10-06
result: Passed
---
# Site Layouts, chartr and nested navigation verification

## Scope and identity

[FEAT-site-layouts](../../features/site-layouts.md), [FEAT-chartr](../../features/chartr.md), [FEAT-editor](../../features/editor.md), [FEAT-static-blocks](../../features/static-blocks.md) and [FEAT-block-library](../../features/block-library.md). Implements DEC-092–DEC-108 after the user's “lets go” authorization. The later header/footer screenshots require dedicated nested editor levels sitewide.

Dirty tree based on `a4fe1bac89a08763c388283a6ef369214d86d3fa`, macOS, Node 22.19.0, pnpm 10.34.1, Astro 7.3.5, React 19.3.0. [Source manifest](../../evidence/2026-10-06T1140Z-site-layouts/source-manifest.json) records 370 application/test/content/asset/configuration files, SHA-256 `58230c4f922e55a5a136f09d0bd58aaecb2ce7b00eb260a73fc508d4d8070b08`. Existing uncommitted discussion records were preserved.

The normal source content retains Starter and gains the nine-block `/chartr` sample. A separate temporary production fixture used [active chartr settings](../../evidence/2026-10-06T1140Z-site-layouts/production-site.json) and `SITE_LAYOUT_WHITELIST=starter` to exercise excluded-active behavior. It shared installed dependencies, copied source/content/assets without credentials, and built seven routes. Reference code remained read-only; [reference hashes](../../evidence/2026-10-06T1140Z-site-layouts/reference-manifest.json) record the local source and captured live HTML. v0.3.0 is the observed reference release, not a latest-release promise.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Full verification | Valid types, tests and production artifacts | `pnpm verify`: 322 files, zero errors/warnings/hints; 132 tests across 18 files; seven routes; emitted asset/runtime checks pass | Passed | [Verify log](../../evidence/2026-10-06T1140Z-site-layouts/verify.log) |
| Layout state, conversion and serialization | Only active ID/version/settings; legacy preservation; default reset without content loss | Migration/round-trip, A/B/default reset, exact-selection no-op, geometry/content preservation and recovery assertions pass | Passed | `tests/layouts.test.ts`, `tests/editor-navigation.test.ts`, verify log |
| Retained versions | Installing a newer version leaves old renderer/settings selected | Generation fixture installs Starter v2 beside v1; selected public import remains v1 and both browser editors/renderers are retained. Explicit version/default-reset assertions pass | Passed | `tests/block-generation.test.ts`, layout tests |
| Whitelist behavior | Restrict future choices without breaking an excluded active layout | Parser and validation tests pass, including empty/unknown errors. Mounted editor Preview is nonmutating, allowed application preserves content, excluded layout remains unavailable. Compiled active-chartr site builds with only Starter allowed; browser settings work and picker offers only Starter | Passed | Tests, [production log](../../evidence/2026-10-06T1140Z-site-layouts/chartr-production-build.log), [browser observations](../../evidence/2026-10-06T1140Z-site-layouts/browser-observations.txt) |
| Dedicated levels sitewide | Item editing replaces parent/siblings and Back unwinds one level | Shared inspector boundary, chartr header/footer and nested Starter dropdown assertions pass; normal repeated-field add/edit/reorder/remove tests pass. Browser confirms whole-inspector replacement and heading focus for the reported cases | Passed | Editor and block-library-editor tests; browser observations |
| Shared rendering and optional styles | Layout contains static/generic blocks; no style-based eligibility gates; admin stays separate | Existing Home renders inside chartr; chartr blocks render independently. Public chartr and generic entry contain the wrapper and Head. Starter journal fixtures still emit zero JS; chartr correctly adds its own interactive runtime. Browser mobile light/dark previews leave admin controls unchanged | Passed | [Final build log](../../evidence/2026-10-06T1140Z-site-layouts/final-build.log), production log, browser observations |
| Real DOM demo integration | Independent state/IDs, scoped palette coordination and cleanup | Repeated workspace instance controls, keyboard selection, context-update state preservation, all fifteen palettes, other-surface isolation, reduced-motion final pane state and observer/frame cleanup pass controlled tests | Passed | `tests/chartr.test.ts`, verify log |
| Chartr browser interactions | Hydrated public controls and usable responsive shell | Desktop public theme/view/palette/dialog controls work; narrow preview stacks correctly; menu focuses its first link and Escape restores the toggle. Final public console is empty | Passed | Browser observations; editor keyboard regression test |
| Content safety and download destinations | Escaped content, safe URLs, six packages and fallback links | DOM tests cover escaping/unsafe URLs, scoped dialog actions and six release destinations. Browser displays the native dialog and returns focus on close | Passed | Chartr tests; browser observations |

## Limits and interpretation

Passed applies to the selected automated, build-artifact and sampled Safari scenarios above. The layout wrapper/settings contract is an engineering implementation of the accepted product scope; no new styling categories or unrestricted backend execution are implied.

Live GitHub save/publish, R2 upload/CORS and Netlify deployment are **Untested and outside this run**. Provider tests use mocked transports. Browser backup-file download/upload was not repeated here; active layout serialization/recovery/import plumbing has automated coverage. Retained v2 selection is a temporary generation/test fixture, not a newly shipped Starter version. Full pixel comparison, physical-device coverage, motion smoothness profiling and package installation are also outside the selected checks.

Observer/animation tests control visibility, reduced motion and frame scheduling in jsdom. They establish scoped lifecycle behavior, not real-browser memory measurements or every animation frame. The browser sample independently confirms the public app demos hydrate and respond. Public section anchors remain author content; duplicated anchor-targeted sections need unique values, while internal control/SVG IDs are instance-scoped.

Verification found and repaired mobile-menu focus and the Starter title's accessible name. A typography test previously targeted a stale closing-popup option; scoping selection to the trigger's current controlled popup repaired that test. A recursively nested collection-schema test fixture was corrected to use supported nested header data; recursive collection schemas were not added.

## Cleanup and evidence

Logs and hashes were saved before removing the owned production fixture/server. The owned Safari tab and Inspector were closed; the ordinary development server remains available at `http://127.0.0.1:4321/admin/` for the user. No source content was overwritten to activate chartr, no reference repository files were edited, and no provider actions or deployment occurred. Verification was performed by the implementing agent; no independent review is claimed.
