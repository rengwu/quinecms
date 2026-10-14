---
title: R2 environment configuration and removal of portal setup
updated: 2026-10-14
result: Passed
---
# R2 environment configuration and removal of portal setup

Scope: DEC-185, [media uploads](../../features/media.md),
[encrypted admin](../../features/admin-encryption.md), and the independent site's
environment template. R2 connection and upload defaults now come from build-time
`R2_*` variables; all storage setup controls are removed from the admin portal.

## Build and environment

- Engine base `e5276e8`, with the implementation identified by this
  [source manifest](../../evidence/2026-10-14-r2-environment/source-manifest.json).
- Node 22.19.0 / pnpm 10.34.1, macOS, Chrome. Engine tests create isolated sites.
- Browser checks used a disposable original-extension site, production static
  builds served on loopback port 63982, a test admin login and dummy R2 keys.
  No live bucket or user credentials were used. Tests leave client content intact.
- The configured and unconfigured browser builds used separate fresh tabs;
  the mobile viewport was restored after the check.

## Results

| Scenario | Expected and observed outcome | Result | Evidence |
| --- | --- | --- | --- |
| Engine regression | 249 tests across 30 files pass, including independent builds, types and artifact checks; wiki current | Passed | [Full log](../../evidence/2026-10-14-r2-environment/engine-verify.log) |
| Environment contract | Empty connection disables uploads; complete settings normalize and apply defaults; blank widths mean originals only; partial/bad values fail without printing credentials | Passed | `tests/storage-config.test.ts` |
| Encrypted configuration | Real production build decrypts to the exact R2 configuration; no access key, secret or bucket marker appears in any published file or secret in build output | Passed | `tests/local-authoring.test.ts` |
| Failure preservation | Incomplete R2 configuration fails production build and leaves the previous site's output byte-identical | Passed | `tests/local-authoring.test.ts` |
| Configured portal | Media and media fields show Upload, existing selections and previews; no storage, credential, CORS, test-connection or advanced setup controls | Passed | [Media](../../evidence/2026-10-14-r2-environment/media-configured.png), [field](../../evidence/2026-10-14-r2-environment/field-configured.png), [mobile](../../evidence/2026-10-14-r2-environment/field-configured-mobile.png) |
| Unconfigured portal | Media explains upload unavailability; no upload or setup controls; existing media remains visible/selectable | Passed | [Media](../../evidence/2026-10-14-r2-environment/media-unconfigured.png), [field](../../evidence/2026-10-14-r2-environment/field-unconfigured.png) |
| Upload and draft behavior | Mocked uploads use the build configuration despite stale tab settings; selection, preview, cancellation, errors and failed-batch cleanup retain their existing behavior; no keys in recovery or new R2 session entry | Passed | `tests/media-fields.test.ts`, `tests/media.test.ts` |

## Repairs and limits

The first regression run found an old navigation assertion requiring the now-removed
Storage settings button. It was updated to assert absence and the unavailable
message; the complete rerun passes. A broad disposable browser fixture included a
render-only vanilla block without a preview mount method. The browser fixture was
narrowed to the media-bearing text block, then rechecked; no product repair was
needed for that fixture mismatch.

This run does not establish live R2 permissions, CORS, public access or uploads.
It preserves the existing browser uploader and exercises network behavior through
SDK mocks. An unlocked editor receives and can recover R2 keys from its encrypted
payload. There is no server-side secret isolation. Production requires bucket-scoped
credentials in the build environment and the bucket's public/CORS configuration.
Changing these values requires rebuilding. Old credentials must be revoked at R2
if already downloaded/deployed copies should stop working.

The root and pilot `.env.example` files share documented admin, repository, R2 and
upload sections; the pilot retains its own repository defaults. No real keys are
committed. The removed setup component, its stylesheet, connection-test helper and
obsolete UI tests are no longer shipped or maintained.
