---
title: Engine and extensions checks
updated: 2026-11-09
---
# Engine and extensions checks

Contract: [Engine and extensions](../../features/site-engine.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/block-generation.test.ts tests/local-authoring.test.ts tests/repository.test.ts
```

Assemble an isolated site with library and original extensions, retained versions and custom fields. Check duplicate identities/assets, unsupported pins, missing initial designs and source-manifest mismatch failures. A portable installation needs a separate frozen install of available exact dependencies; linked fixtures do not establish it.

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

## Verification recipe and limits

Engine `pnpm test` exercises independent original extensions, multiple frameworks,
retained versions, duplicate identities/assets, missing initial designs, pin guards,
custom fields, content validation, encrypted admin, static routes and both mocked
Git providers' blocked writes. Library `pnpm test` validates its fixture content,
local media, shared edits, bindings and rendering. The pilot's `pnpm verify` validates
its actual site. A clean clone/install/build and desktop/mobile browser checks are
required before calling an engine/library revision delivered.

Portable output is checked using an ordinary static server. Live Git, browser
credentials, R2 uploads and hosting each require their own evidence; local/mocked
results must not be described as proving those integrations.


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; the maintainer subsequently [confirmed the full hosted connection, edit, draft save, publish and live deployment flow](../../journal/2026-10-14-pilot-acceptance.md). This final signed-in evidence is user-reported; pilot delivery is accepted.


## R2 environment configuration — 2026-10-14

[Verification](../runs/2026-10-14-r2-environment.md) covers environment
validation, encrypted credential delivery, absence of storage setup controls,
configured/unconfigured uploads and existing media behavior. Live R2 is not claimed.
