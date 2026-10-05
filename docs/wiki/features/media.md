---
title: Direct media uploads
updated: 2026-10-05
---
# Direct media uploads

**ID:** FEAT-media

## Intent and basis

The [agreed media design](../discussions/agreed-design.md) uses R2 with runtime credentials, original files, modest browser-generated variants, and IDs in content. It does not add an upload server or media transcoding service.

## Entry points and prerequisites

`/admin/` → Media → Storage settings. A test R2 bucket, public HTTPS media origin, authorized credentials, and CORS for the editor origin are required. The root README contains configuration details. The Media block selects an uploaded record.

## Expected outcomes

The original uploads directly to R2. Decodable static raster images below the pixel limit get configured smaller WebP variants, with no upscaling; animated/unsupported formats retain their original. Non-image media uses native players or links. Metadata enters the draft, while credentials and binaries do not.

Failed batches attempt to delete their own attempted keys. Successful uploads discarded before Save remain in R2 for manual cleanup. Public URLs may be accessible before Publish.

## Verification recipe

1. `pnpm test` exercises SDK-mocked upload batches, metadata, smaller variants, failed-batch cleanup, executable-format rejection, and decode fallback.
2. With a disposable bucket, upload a large JPEG and a static PNG, inspect original/variant sizes and Content-Type, select them in a Media block, Save/Publish, and verify responsive image loading.
3. Test animation preservation and denied CORS/credentials. Confirm no credentials in exported JSON or built assets, and clean up only the test object's prefix afterward.

Steps 2–3 are unvalidated with real browser decoding and R2.

## Coverage and limitations

Canvas/SDK mocks are not proof of browser encoders, R2 CORS, or live object cleanup. No automatic deletion of successfully uploaded assets, image service, or video transcoding is supplied.

## Verification history

- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md).
