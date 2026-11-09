---
title: Encrypted static admin checks
updated: 2026-11-09
---
# Encrypted static admin checks

Contract: [Encrypted static admin](../../features/admin-encryption.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/admin-crypto.test.ts tests/admin-login.test.ts tests/editor-session.test.ts tests/local-authoring.test.ts
```

Build an isolated site with disposable credentials, unlock its production admin, reload, and lock. Wrong credentials must fail without losing the recoverable draft. Check missing/partial build credentials fail. Inspect emitted artifacts for plaintext editor/provider code.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-10-16). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification

`tests/admin-crypto.test.ts` covers both credential inputs, email normalization,
exact password preservation, independent Node AES-GCM decryption, random salts/
nonces, wrong credentials, tampering and unsupported KDF parameters.
`tests/local-authoring.test.ts` builds isolated sites, decrypts their real admin
payloads, checks artifacts and verifies missing-credential failure. It also starts
isolated development servers with missing, partial and configured credentials.
Missing/partial credentials fail the admin response; the configured pair decrypts
the actual response, while the former fixed pair fails in development and production.
`tests/editor-session.test.ts` covers credential clearing and retained drafts at
the editor-to-loader lock boundary.

See the [implementation and browser checks](../../journal/2026-10-09-admin-encryption.md).
These checks do not establish live hosting, GitHub/GitLab or R2 behavior or replace
an independent security review.


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; the maintainer subsequently [confirmed the full hosted connection, edit, draft save, publish and live deployment flow](../../journal/2026-10-14-pilot-acceptance.md). This final signed-in evidence is user-reported; pilot delivery is accepted.


## R2 environment configuration — 2026-10-14

[Verification](../runs/2026-10-14-r2-environment.md) covers environment
validation, encrypted credential delivery, absence of storage setup controls,
configured/unconfigured uploads and existing media behavior. Live R2 is not claimed.
