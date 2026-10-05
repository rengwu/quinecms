# lean-sitebuilder

A static Astro website with its React editor at `/admin/`. Content, collection definitions, and block implementations live in this repository. Saving writes one commit to a GitHub draft branch; publishing fast-forwards that saved snapshot to `main`. Netlify rebuilds `main`. No application server runs in production.

## Run locally

Requires Node 22.12+ and pnpm 10.34.1.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:4321/admin/`. Without repository credentials you can edit the local preview, exercise the builder, and export a content backup. Browser edits do not write local project files. To inspect the production output:

```sh
pnpm build
pnpm preview
```

Stop the background preview with `pnpm exec astro preview stop`.

`dist/` contains deployable static files. `/` demonstrates React, Svelte, Vue, and vanilla blocks; `/blocks/` contains two independent interactive React islands; `/journal/` and its two sample entries need no JavaScript.

## Connect and deploy

1. Commit this project to a GitHub repository with a `main` branch. Connect Netlify to that repository and deploy `main`; `netlify.toml` supplies the build command and output directory. Disable draft branch deploys and deploy previews if you want draft content to stay off public hosting.
2. Set build environment values from `.env.example`. `PUBLIC_GITHUB_OWNER` and `PUBLIC_GITHUB_REPO` identify this repository. `ADMIN_PASSWORD` enables an optional convenience gate; only its SHA-256 digest enters the static output. The gate does not make the editor, published data, or assets private.
3. Open `/admin/`, then **Connection**. Enter your own GitHub token with Contents read/write permission for this repository. Branch protection must permit the intended draft and main updates. **Connect** loads the draft; a missing draft branch is initialized from main.
4. Make edits and choose **Save draft**. All pending records are included in one commit. Incomplete required fields may be saved. **Publish** becomes available after saving and rejects unresolved required fields, routes, references, or unknown block versions.
5. Publishing advances main to the exact validated snapshot without force. The editor reports deployment pending; it does not claim the Netlify build succeeded.

The password gate and tokens have separate purposes. GitHub permissions authorize writes. GitHub/R2 credentials stay in session storage for this tab and are cleared by **Lock editor**; trusted blocks run in the same document. Neither credentials nor upload binaries enter content backups or Git.

A stale save leaves local work intact. Export a backup, reload the remote draft, and reconcile edits. Importing a backup replaces local content, so review it before saving. Tab recovery survives a reload, not a closed browser session. A storage failure is shown instead of silently promising recovery.

The deployed editor compares draft source hashes with its own build before publishing. After installing blocks or changing code, deploy/rebuild the corresponding editor and synchronize main and draft before publishing content with the new contract. Divergent main/draft history requires a developer to synchronize branches; the portal never forces either branch.

## Media storage

In **Media → Storage settings**, enter a Cloudflare R2 account ID, bucket, public HTTPS base URL, and S3-compatible credentials authorized for that bucket. Use a separate public media origin. Configure bucket CORS for your editor's exact origins, for example:

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

Uploads go directly from the browser to R2. The original is retained; decodable static images below 40 megapixels get smaller WebP variants at 480, 960, and 1600px where applicable. Widths, quality (default 0.8), and upload limit (default 30MB) are configurable. Animated/undecodable images keep their original only. Video/audio/PDF files are stored without transcoding. Uploads can be publicly accessible before publishing content. Failed batches attempt cleanup of their own object keys; a network or permission failure can prevent that cleanup. Successful uploads whose draft is discarded remain in R2 for manual cleanup.

Add a **Media** block and select the uploaded record. Images use responsive `srcset`; other supported media use native players or a link.

Live GitHub writes, R2 CORS/uploads, and Netlify deployment require your accounts and have **not** been exercised by the included mock tests.

## Content and blocks

- `content/site.json`: title, optional globals, ID-based navigation.
- `content/pages/<id>.json`: stable ID, static/generic kind, ordered blocks; only static pages have a public path.
- `content/collections/<id>.json`: schema fields, URL prefix and an optional generic page ID.
- `content/entries/<collectionId>/<id>.json`: slug and schema values only.
- `content/media/<id>.json`: R2 URLs and variant metadata.
- `src/core/types.ts`: record, field, block, and renderer context contracts.
- `src/blocks/<name>/vN/`: retained implementation, JSON definition, scoped styles.
- `blocks.config.mjs`: explicit registration; generated code stays in ignored `src/generated/`.

To install a block, create its version directory, add `definition.json` and a shared renderer, then register its directory in `blocks.config.mjs`. Declare dependency ranges against the root package versions. `pnpm prepare:blocks` rejects incompatible requirements; one root lockfile owns shared dependencies. Rebuild after registry changes.

React/Svelte/Vue renderers receive `{ props, context }`. Vanilla modules export `render(props, context)` and `mount(host, props, context)` returning `{ update, destroy }`. Framework adapters supply that lifecycle automatically for live preview. Public activation is `never`, `visible`, `idle`, or `load`. Use CSS Modules or framework-scoped CSS and container-relative sizing for preview parity; shell resets belong to the layout. Keep installed code trusted and tolerate blank draft props.

**Site → Content max-width (px)** sets `site.globals.contentMaxWidth`. It defaults to 1200px when omitted or cleared. The public shell and live preview expose the same `--site-content-max-width` CSS variable. Block authors are encouraged to use it for their centered content container; adherence is optional. Full-width backgrounds and narrower line lengths remain block design choices. The limit includes the container's padding and never forces a minimum viewport width:

```css
.content {
  width: 100%;
  max-width: var(--site-content-max-width);
  margin-inline: auto;
  padding-inline: var(--site-page-gutter);
  box-sizing: border-box;
}
```

The raw setting is also available in `context.globals.contentMaxWidth`; `contentMaxWidth()` from `src/core/site-style.ts` resolves the numeric default for JavaScript uses such as image sizing. Admin controls do not inherit the public-site variable.

Site also exposes **Body font**, **Heading font**, **Body font size (px)**, **Body line height** (a unitless multiplier) and **Page gutter (px)**. Globals are `bodyFont`, `headingFont`, `bodyFontSize`, `bodyLineHeight` and `pageGutter`. Defaults are `system`, `system`, 16, 1.6 and 24. Font IDs `system`, `arial`, `georgia`, `times` and `mono` select built-in system/fallback stacks; no font download is required. Missing/null values use defaults. Font size and line height must be finite positive numbers; gutter permits zero.

The matching tokens are `--site-body-font`, `--site-heading-font`, `--site-body-font-size`, `--site-body-line-height` and `--site-page-gutter`. The public shell and preview apply body typography and heading fonts at their `.site-surface` boundary. Starter blocks inherit body line height and use `em` for relative font sizes so changes behave equally in the public document and preview. Display-heading line heights and vertical block spacing remain block choices. The gutter controls horizontal container padding and is included inside content max-width. These are recommended defaults for block authors, not enforced styling for every custom block; admin UI retains its own typography and 867px layout.


Block widgets are registered in `src/editor/widgets.ts`. They receive the JSON value, field, change callback, read-only state, and errors. Compound fields register a shared pure validator in `src/core/custom-fields.ts`. The Hero v2 design control demonstrates both. Collection fields remain limited to text, rich text, number, date, toggle, select, and media.

Retain old version directories and their widgets/validators. A version switch carries compatible same-key fields; unmatched fields are null until explicitly entered. **Cancel block changes** restores the last loaded/saved instance. A missing implementation preserves content but blocks publication.

## Generic pages and collections

Pages → Add page offers **Static page** and **Generic page**. Static pages use normal blocks and own a URL. Generic pages use Entry heading, Entry rich text and Entry media blocks. Each field can optionally bind to a schema field key; its fixed value becomes the fallback for empty optional values. The preview displays bound field names.

Collection schemas → a schema → Generic page assigns a reusable compatible template, or **None · data only**. Entry URLs combine the collection prefix and entry slug. No index is generated automatically: create a static page at that prefix and add a Collection list block if desired. Entries themselves contain only schema fields.

Visual rich text supports uploaded images and YouTube videos. Upload images in Media, then choose them using the rich-text Image control. Markdown stores stable references as `![alt](media:media_id)` and `![title](youtube:VIDEO_ID)`. Invalid bindings and missing embedded images can remain in drafts but block publication.

A registered block's `kind` is `static` by default or explicitly `generic`. Generic renderers use `context.bindingPlaceholders[fieldKey]` during preview; public rendering receives resolved typed props. Shared collection summaries are available through `context.collections`. See the starter generic blocks for the contract.

The earlier demo entry format has been replaced. Old entry block arrays and collection `template: "standard"` imports are rejected instead of silently dropping content. Legacy tab recovery remains stored under its old key; this editor uses a new recovery namespace.

## Verify

```sh
pnpm verify
```

This runs type checking, unit/transport tests, the production build, and checks that emitted assets exist, framework runtimes are shared, and public pages do not load editor/provider code. `scripts/build-assets.mjs` preserves CSS referenced by lazy preview imports when Astro extracts its SSR counterpart. Keep the build check when upgrading Astro/Vite.

The [development wiki](docs/wiki/index.md) records the agreed design, feature recipes, evidence, and outstanding live-provider verification. Rebuild its offline reader with `node docs/wiki/_build.mjs`.
