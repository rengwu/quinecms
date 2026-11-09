---
title: Local development and validation checks
updated: 2026-11-09
---
# Local development and validation checks

Contract: [Local development and validation](../../features/local-authoring.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/local-authoring.test.ts tests/block-generation.test.ts
```

Use the isolated fixtures owned by the test suite. Validate draft versus publication and --base changes; confirm inputs are unchanged. For a browser reload check use the documented local-file driver in setup. Stop each site command before another operation assembles that same workspace.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-11-07). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification history

See the [local authoring implementation run](../runs/2026-10-08-local-authoring.md)
for the new-site regression, draft/baseline validation and verification limits.


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; the maintainer subsequently [confirmed the full hosted connection, edit, draft save, publish and live deployment flow](../../journal/2026-10-14-pilot-acceptance.md). This final signed-in evidence is user-reported; pilot delivery is accepted.
