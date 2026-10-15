---
title: Direct media uploads
updated: 2026-10-16
---
# Direct media uploads

**ID:** FEAT-media

## Intent and basis

DEC-185 makes R2 connection settings and upload defaults developer-owned build
environment values. The admin exposes media selection/upload only, with no storage
settings, credentials form, connection test or CORS controls. The existing direct
browser uploader, originals, browser-generated variants and IDs in content remain.
No upload server or media transcoding service is added.

## Media library display

Media uses a responsive card grid with 16px gaps and a 220px target minimum card
width, shrinking to fit narrower containers. Images use a consistent 140px preview
height with `object-fit: contain`; names, file details and original links remain.

Local Safari verification on 2026-10-16: three columns at 867px available width,
two at 600px, and one at 280px and 200px, without horizontal overflow. Desktop
appearance was checked in the dev site; narrow checks temporarily constrained the
grid container and restored it afterward. No live uploads were exercised.

## Upload from media fields

Implemented from DEC-160–DEC-162. See the
[interview answers](../journal/2026-10-13-grill-3216fc08-5d84-4f48-92f3-20bf92b7afd7.md).

- Keep the existing shared media dropdown and alternative-text field. Add an
  Upload button and a small thumbnail for selected images.
- Reuse the existing R2 uploader. On success, add the file to the draft Media
  library and select it for the field; update the page preview. Show simple
  upload status/errors beside the field and keep the previous selection on failure.
- If storage is not configured at build time, hide upload controls while preserving
  existing media selection and thumbnails. Media explains that uploads are
  unavailable. This supersedes DEC-161's setup-dialog fallback.
- Cancelling block changes restores the previous selection; a successful upload
  stays in Media for reuse. The existing draft Save/Publish flow still applies.

The shared media field provides these controls wherever it is already used,
including block creation, nested forms, collection entries and layout settings. A visual library picker, drag-and-drop,
upload queues and automatic deletion are outside this increment. Image thumbnails
can reuse the existing media URLs; other supported files retain their names.
The editor uses its existing busy state during upload: editing, cancellation,
Save/Publish and editor navigation wait for completion. Field selection is applied
before the media record is appended, so layout editors that replace their content
snapshot cannot discard the upload. New block/item creation remains uncommitted;
cancelling it keeps the uploaded media record available in the draft. Alternative
text starts empty when a new file is selected, matching the existing selector.

The Media library uses the same upload control and inline feedback. No new
storage service, dependency or content format was added. Failed upload cleanup
remains owned by the existing uploader.

[Local verification](../verification/runs/2026-10-13-media-fields.md) covers the
editor flows and mocked uploads. Live R2 upload execution remains unverified.

## Build environment setup

Maintain a commented `.env.example` in each site. Copy it to ignored `.env` for
local use, or set the same variables in the host/CI build environment. Never commit
real keys. Restart development after an environment change; production needs a
fresh build and deployment.

| Variable | Purpose / default |
| --- | --- |
| `R2_ACCOUNT_ID` | 32-character Cloudflare account ID; the standard S3 endpoint is also accepted |
| `R2_BUCKET` | Bucket name |
| `R2_PUBLIC_URL` | HTTPS public bucket URL or custom domain, with an optional path prefix; not the S3 API endpoint |
| `R2_ACCESS_KEY_ID` | S3 access key ID |
| `R2_SECRET_ACCESS_KEY` | S3 secret access key |
| `R2_MAX_MB` | Maximum original file size; defaults to 30, must be greater than zero |
| `R2_IMAGE_WIDTHS` | Comma-separated integer widths between 64 and 4096; omitted defaults to 480,960,1600; explicitly blank uploads originals only |
| `R2_IMAGE_QUALITY` | WebP variant quality between 0.1 and 1; defaults to 0.8 |

All five connection values blank disables uploads. Supplying any requires the
complete valid set; partial/invalid configuration fails the build before it can
replace a site's last successful `dist/`. Optional tuning values do not enable
uploads by themselves. Old `PUBLIC_R2_*` defaults and saved `lean:r2` tab settings
are no longer configuration inputs. Move values to the names above when upgrading.

Create [R2 S3 credentials](https://developers.cloudflare.com/r2/get-started/s3/)
with **Object Read & Write**, scoped to the site's bucket. Use the resulting access
key ID and secret access key, not the token string. Enable a public development URL
for testing or a custom media domain for production. Configure bucket CORS for the
editor's exact origins; keep any existing origins in use:

```json
[
  {
    "AllowedOrigins": ["https://your-site.example", "http://127.0.0.1:4321"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Credential boundary

The build reads these non-`PUBLIC_` variables only in the admin page's server-side
assembly. Settings and credentials are serialized into the existing encrypted
admin payload, never plaintext public assets, media records, backups or new browser
storage entries. Unlocking decrypts the configuration in memory for direct S3
uploads. **Anyone who can unlock the editor can recover its upload credentials.**
Hiding configuration in the UI does not provide server-side credential isolation.

Use bucket-scoped keys and trusted build contexts. Use test-bucket credentials
for development testing, especially in the shared dev site.
Rotating environment keys requires rebuilding; revoke the old key in Cloudflare
if old downloaded/deployed encrypted copies must lose access. Lock reloads the
page and discards the in-memory configuration; it also clears legacy tab credentials.

Use a separate public media origin. Decodable static images below 40 megapixels
receive configured smaller WebP variants without upscaling. Animated/undecodable
images keep their original. Supported uploads are JPEG/PNG/WebP/GIF/AVIF, MP4/WebM,
MPEG/OGG/WAV audio and PDF; SVG/executable documents are outside this upload path.

## Expected outcomes

### Locally-authored media

Local developers may copy original assets into `public/` and create ordinary
`content/media/<id>.json` records whose file URLs start with `/`, for example
`/quine/v1/flanksource.png`. Keep `key`, `mime`, `bytes`, optional dimensions and
the `variants` array. Media fields refer to `{ mediaId, alt }`; the Media library,
selectors, rich-text rendering and block context use the same records as uploads.

Accepted file URLs are HTTPS URLs or safe root-relative paths. Plain relative
paths, protocol-relative URLs, HTTP media URLs and executable/data schemes are
rejected. The metadata validator does not inspect the filesystem; authors must
verify that each public file exists and loads from the built output.

This supports reference-site recreation without an initial R2 upload. It does
not add a browser file-import pipeline or storage synchronization. Later uploads
still go to R2. Removing/resetting records does not delete copied local files or
uploaded objects. See the [Quine trial](../journal/2026-10-11-quine-rebuild.md).

The original uploads directly to R2. Decodable static raster images below the pixel limit get configured smaller WebP variants, with no upscaling; animated/unsupported formats retain their original. Non-image media uses native players or links. Metadata enters the draft, while credentials and binaries do not.

Failed batches attempt to delete their own attempted keys. Successful uploads discarded before Save remain in R2 for manual cleanup. Public URLs may be accessible before Publish. Settings → Factory reset clears all media-library records from the local draft, while retaining uploaded R2 objects. Save draft persists removal of the records; this action never deletes bucket objects.

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

- [Upload from media fields](../verification/runs/2026-10-13-media-fields.md): full local verification, eight editor upload regressions, desktop/mobile controls and validation errors; no live R2 upload.

- [Test connection button](../verification/runs/2026-10-13-r2-connection-test.md): mocked write/read/delete verification and actual 4324 UI check; no live bucket probe.
- [Simplified R2 setup](../verification/runs/2026-10-13-r2-setup.md): local setup behavior and regression verification; no live R2 connection.
- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md).


## R2 environment configuration — 2026-10-14

[Verification](../verification/runs/2026-10-14-r2-environment.md) covers environment
validation, encrypted credential delivery, absence of storage setup controls,
configured/unconfigured uploads and existing media behavior. Live R2 is not claimed.
