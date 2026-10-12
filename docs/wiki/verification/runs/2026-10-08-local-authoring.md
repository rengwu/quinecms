---
title: Local authoring implementation verification
updated: 2026-10-08
result: Passed for selected local scenarios
---
# Local authoring implementation verification

## Scope

[FEAT-local-authoring](../../features/local-authoring.md), with affected
[static output](../../features/static-blocks.md) and validation of the existing
[content model](../../features/content-model.md). DEC-134 authorizes advisory
onboarding and verification independent of demo content. Checks cover draft and
publication validation, baseline change impact, regression isolation and production
output for a minimal client site.

Aggregate: **Passed** for these local checks. This is not a fresh-agent benchmark
or live-provider verification. No UI behavior is changed by this increment, and
no new browser exercise is claimed. Nothing was deployed.

## Build and environment

macOS, Node v22.19.0, pnpm 10.34.1. The dirty tree is based on
`348f1237f115541694f738bac77137333a4550d8`; it includes concurrent admin-theme and
readable-usage work, which was preserved. The implementing agent ran the checks;
no independent review is claimed.

The [client probe manifest](../../evidence/2026-10-08-local-authoring/client-probe.json)
records SHA-256 hashes of copied source, scripts, regression fixtures, assets and
configuration, plus the exact canonical site/home-page records and command exit
code. This identifies the source under test rather than treating the base commit
as the tested revision. Generated files were regenerated. The isolated copy reused
installed dependencies through a node_modules symlink; provider credentials were
not copied. The temporary project was removed after verification, and root content
was not replaced.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Normal full verification | Existing source/content passes diagnostics, regressions, production build and artifact checks | Zero errors/warnings/hints; 158 tests in 21 files; seven routes built; artifact check passed | Passed | [Full log](../../evidence/2026-10-08-local-authoring/verify.log) |
| Draft, publication and structural validation | Incomplete publication fields pass draft checks but fail publication; malformed structure fails both | Blank page title/path pass `--draft`, fail default validation; invalid schema field key fails `--draft`; checked content stays byte-identical | Passed | `tests/local-authoring.test.ts`; full log |
| Baseline change impact | A final snapshot alone cannot conceal removal of a populated field when compared with its baseline | Draft snapshot passes alone; `--draft --base HEAD` rejects removing the populated summary field | Passed | `tests/local-authoring.test.ts`; full log |
| Isolated regression demo | Static demo budgets and shared framework versions remain covered without imposing demo routes on client output | Journal index/entry emit zero JavaScript; demo runtime versions each appear once | Passed | `tests/local-authoring.test.ts`; full log |
| Minimal client build | No sample record or unused content directory is required | Canonical site and home page build and pass artifact checks, producing only `/` and `/admin/` | Passed | `tests/local-authoring.test.ts`; full log |
| Full verification with minimal client content | Tests as well as build checks remain independent of root demo content | 158 tests in 21 files; zero errors/warnings and two unused-code hints in the generated empty page; two routes; artifact check passed | Passed | [Client verify log](../../evidence/2026-10-08-local-authoring/client-verify.log), [fixture/source manifest](../../evidence/2026-10-08-local-authoring/client-probe.json) |
| Documentation build and links | Wiki regenerates and its integrity check succeeds | 141 pages built and checked; generated reader is current | Passed | `node docs/wiki/_build.mjs`; `node docs/wiki/_build.mjs --check` |

The lower test count than some prior runs reflects removing accidental duplicate
registration caused by importing a helper from `tests/content.test.ts`; existing
semantic coverage was retained and two local-authoring scenarios were added.

## Limits

The minimal-site run retains installed block/layout implementations, source and
regression fixtures. It establishes freedom to replace client content, not that
removing arbitrary source implementations leaves their regression tests valid.
The optional baseline uses a local Git commit; it neither fetches remote client
drafts nor reconciles unsaved browser edits. Core validation does not guarantee
visual quality or client usability.

No fresh agent was measured against these new instructions. No remote agent
access, account permissions, live GitHub/R2/hosting transaction or deployment was
tested. Existing provider tests remain mocked. Documentation integrity checks
establish valid local wiki references, not product behavior.
