---
title: Media library and direct uploads checks
updated: 2026-11-09
---
# Media library and direct uploads checks

Contract: [Media library and direct uploads](../../features/media.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/storage-config.test.ts tests/media-fields.test.ts tests/media.test.ts tests/local-media.test.ts
```

Build an isolated site with uploads disabled, then with dummy complete storage settings, to check control visibility and selection without attempting dummy uploads. Exercise real upload/variant/denial/cleanup paths only with an authorized disposable live bucket. Confirm cancelling the referencing form retains a completed media record.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier media-grid observation

On 2026-10-16, local Safari checks reported three columns at 867px, two at
600px and one at 280px/200px, using temporary grid constraints. No live uploads
were exercised. This was retained from the prior feature page, not rerun here.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-10-16). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification recipe

1. Run `pnpm exec vitest run tests/storage-config.test.ts tests/media-fields.test.ts tests/media.test.ts tests/local-authoring.test.ts` for environment validation/defaults,
   no-storage behavior, encrypted build configuration/plaintext exclusion, preserved
   output on failure, upload/selection/cancel/retry paths and mocked SDK cleanup.
2. Build a disposable site with dummy complete R2 settings. Unlock its production
   admin and check Media plus a media field: Upload is available, storage settings
   and credential controls are absent. Existing file selection still works.
3. Build with all connection values blank: no upload buttons or setup dialog;
   existing media remains usable. Partial settings must fail with named missing
   variables rather than printing values. Do not upload using dummy credentials.
4. With an authorized disposable live bucket, configure its environment, public URL
   and CORS outside the portal, rebuild, upload a JPEG/PNG, inspect original/variant
   sizes and Content-Type, select it, Save/Publish and verify public rendering.
   Check a denied request and retained field selection. Live R2 remains unverified.

## Coverage and limitations

Canvas/SDK mocks are not proof of browser encoders, R2 CORS, or live object cleanup. No automatic deletion of successfully uploaded assets, image service, or video transcoding is supplied.

## Verification history

- [Upload from media fields](../runs/2026-10-13-media-fields.md): full local verification, eight editor upload regressions, desktop/mobile controls and validation errors; no live R2 upload.

- [Test connection button](../runs/2026-10-13-r2-connection-test.md): mocked write/read/delete verification and actual 4324 UI check; no live bucket probe.
- [Simplified R2 setup](../runs/2026-10-13-r2-setup.md): local setup behavior and regression verification; no live R2 connection.
- [Initial implementation run](../runs/2026-10-05T0819Z-implementation.md).


## R2 environment configuration — 2026-10-14

[Verification](../runs/2026-10-14-r2-environment.md) covers environment
validation, encrypted credential delivery, absence of storage setup controls,
configured/unconfigured uploads and existing media behavior. Live R2 is not claimed.
