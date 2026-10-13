---
title: Direct media uploads
updated: 2026-10-13
---
# Direct media uploads

**ID:** FEAT-media

## Intent and basis

The [agreed media design](../discussions/agreed-design.md) uses R2 with runtime credentials, original files, modest browser-generated variants, and IDs in content. It does not add an upload server or media transcoding service.

## Entry points and prerequisites

`/admin/` → Media → Storage settings. The Media block selects an uploaded record. Credentials are runtime tab-session settings, not content records or build secrets.

### Connect a bucket

1. In Cloudflare, open **R2 → your bucket → Settings**. Paste its **S3 API URL** into **Account ID or S3 API URL**. The editor extracts the account ID and, when present in the URL path, the bucket name. An account-only endpoint leaves the entered bucket unchanged; you can also enter the account ID and bucket separately. The uploader supports the standard `https://<account-id>.r2.cloudflarestorage.com` endpoint. Jurisdiction-specific endpoints are not supported and are not silently rewritten.
2. In those bucket settings, enable **Public Development URL** for testing or connect a **Custom Domain** for production. Paste that HTTPS address into **Public media URL**. This is the address visitors use to read files; the S3 API endpoint is rejected in this field. Cloudflare's development URL is rate-limited and intended for development. See [public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).
3. From R2 account details, manage API tokens and create a token with **Object Read & Write**, limited to this bucket. Copy its **Access Key ID** and **Secret Access Key** into the two credential fields. These are the generated S3 credentials, not a generic Cloudflare API token. The form links to [Cloudflare's token instructions](https://developers.cloudflare.com/r2/api/tokens/).
4. Select **Copy CORS policy** and paste the JSON into the bucket's **Settings → CORS Policy**. It includes the current editor's exact origin, PUT for uploads and DELETE for failed-batch cleanup. Preserve any existing origins/rules; local and deployed editors need their own allowed origins. If clipboard access fails, the form shows the same JSON for manual copying. See [Cloudflare CORS](https://developers.cloudflare.com/r2/buckets/cors/).
5. Optionally select **Test connection** to check the entered settings before saving. It uploads a tiny, uniquely named text file, reads that exact content through the public media URL without credentials, and deletes the test file. One result reports success or explains which operation failed. Testing does not save settings or add a media-library record. Editing a field clears the result; fields and Save are disabled during the test. Cancel/dismiss allows the in-flight cleanup to finish.
6. **Save settings** validates and saves the settings for this tab independently of testing. **Cancel**, Escape or dismissing the dialog discards unsaved settings. A session-storage failure leaves the form open with an error and retains the previously active configuration.

The connection test uses the existing S3 client configuration, one attempt and a
15-second timeout per upload/read/delete operation. It attempts deletion even after
a failed upload response, since the write may have reached R2. Cleanup failure is
not success: the error names the possible leftover `connection-test/<uuid>.txt`
object for manual removal. Closing the browser/tab during a test can interrupt
cleanup. The public read compares unique content, so an unrelated success page
cannot pass. This small setup check does not exercise image conversion or all file
sizes/types.

Upload limit, image widths and quality live under collapsed **Advanced**. Defaults remain 30 MB, 480/960/1600px and 0.8. Widths remain editable as comma-separated text; blank means originals only. The normal form contains five connection fields, with the two credential fields paired on desktop and stacked on narrow screens. The user requested this simplification on 2026-10-13; the direct browser upload architecture is unchanged.

Configure bucket CORS for the editor's exact origins, for example:

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

Use a separate public media origin. Default upload limit is 30MB, image quality is 0.8, and candidate WebP widths are 480, 960 and 1600px; these are editable. Decodable static images below 40 megapixels receive smaller variants where applicable. Animated/undecodable images keep their original. Supported uploads are JPEG/PNG/WebP/GIF/AVIF, MP4/WebM, MPEG/OGG/WAV audio and PDF; SVG/executable documents are outside this upload path.

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

1. `pnpm exec vitest run tests/storage-settings.test.ts tests/media-connection.test.ts tests/media.test.ts` exercises pasted endpoint parsing, shared setup/upload validation, draft edits and cancellation, clipboard failure, connection-test write/read/delete success and failure paths, SDK-mocked upload batches, metadata, smaller variants, failed-batch cleanup, executable-format rejection, and decode fallback.
2. With a disposable bucket, upload a large JPEG and a static PNG, inspect original/variant sizes and Content-Type, select them in a Media block, Save/Publish, and verify responsive image loading.
3. Test animation preservation and denied CORS/credentials. Confirm no credentials in exported JSON or built assets, and clean up only the test object's prefix afterward.

Steps 2–3 are unvalidated with real browser decoding and R2.

Setup-only browser recipe: use a fresh disposable editor tab from [verification setup](../verification/setup.md). Open Media → Storage settings, paste a standard endpoint with a bucket path, and check both fields. Try the S3 endpoint as the public URL and confirm saving is blocked. Supply a fixture public URL and dummy credentials, copy the CORS policy and inspect its origin, expand Advanced and change widths, then save. Reopen, edit the bucket, Cancel, and reopen again; the saved bucket must remain. Reload and unlock to confirm tab persistence. Check the form and terminal actions at desktop and 390px width; close the disposable tab afterward. Do not upload using dummy credentials.

Connection-test browser recipe: use a disposable, authorized R2 bucket with public
access and CORS configured for the actual editor origin. Test the entered settings;
expect a single success message and no remaining probe object. Break the public URL
and retry; expect the public-read error and probe cleanup. Deny DELETE and retry;
expect a failure identifying the probe key, then remove that key manually. Live R2
execution of this recipe remains unvalidated. Local browser verification only
pressed Test with invalid fields, before any network effects.

## Coverage and limitations

Canvas/SDK mocks are not proof of browser encoders, R2 CORS, or live object cleanup. No automatic deletion of successfully uploaded assets, image service, or video transcoding is supplied.

## Verification history

- [Test connection button](../verification/runs/2026-10-13-r2-connection-test.md): mocked write/read/delete verification and actual 4324 UI check; no live bucket probe.
- [Simplified R2 setup](../verification/runs/2026-10-13-r2-setup.md): local setup behavior and regression verification; no live R2 connection.
- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md).
