---
title: Technical contracts
updated: 2026-10-08
status: Implemented foundation; live providers unverified
---
# Technical contracts

Implemented content-model redesign: [collections, objects and relations](content-model-plan.md) consolidates accepted DEC-110–DEC-128 and proposed storage, validation, binding and editor changes. DEC-126 revises owned nesting to three levels; DEC-127 rejects direct and indirect recursive owned definitions while allowing ordinary nested reuse. DEC-128 selects a lean Sanity-style model; the plan proposes one object/array/reference grammar, including arrays of references for multiple selections. Exact serialization remains an engineering choice, now recorded in the [implemented contract](../features/content-model.md) and [verification run](../verification/runs/2026-10-08-content-model.md). DEC-109 removes prototype compatibility as a redesign constraint; the older contracts below remain implementation history where superseded by the feature contract.

Current extension: the [implemented Site Layout API](../features/site-layouts.md#authoring-api) supersedes the pre-implementation notes immediately below and the legacy central site-options ownership elsewhere in this document. One selected React wrapper contains all blocks; author settings and pure policy modules are versioned together. The exact record/whitelist/transition contract and [chartr port](../features/chartr.md) are implemented and linked to build-specific evidence.

DEC-107 independently selects [retained layout versions and explicit upgrades](site-layouts.md#layout-versions), following the block precedent. A site's active layout/version continues resolving its renderer and settings implementation when newer versions are installed. Store only that active selection and its current settings. Exact version-picker/settings-transition mechanics remain engineering work; no automatic settings migration or inactive-layout settings cache is selected by Q76.

Accepted product extension: the [Site Layout redesign](site-layouts.md) will replace central ownership of title/theme/typography/header/footer with a selected author's wrapper and settings. DEC-092–DEC-101 establish active-settings-only persistence, advisory width/gutter (subsequently moved into layout settings with per-layout defaults by DEC-130), separate Site Layout/Settings areas, a live layout preview, direct card application plus separate Preview, and source-installed layouts. Concrete authoring/rendering interfaces remain engineering proposals. The current site record/rendering interfaces below describe the existing system, not an implemented layout plugin contract. Layout variables remain optional for blocks, with no styling-adherence categories or compatibility gating.

DEC-102–DEC-105 add a growing source layout library and a hidden environment whitelist for the client picker. An absent variable offers all installed layouts. An excluded active layout retains its settings and keeps working under the normal rendering/preview/settings/save workflow; whitelist exclusion alone is not a build or publication error. Future picker choices are restricted. Build-time resolution and stable-ID configuration remain proposed mechanics. The installed implementation registry must remain distinguishable from the filtered picker catalog so an excluded active implementation remains resolvable.

Planned extension: the [accepted block-library scope](block-library.md) adds theme/tag catalog metadata, schema lists and bindings, collection card mappings, shared header/footer and external forms. Those contracts are pending implementation; the current code described below has not yet gained them.

The generic-page redesign (DEC-058–DEC-073) is implemented following authorization on 2026-10-06. The current page, entry, collection, binding and rich-text contracts below replace the earlier entry-block model. See [implementation and verification](../verification/runs/2026-10-05T1650Z-generic-pages.md). Live providers remain unverified.

The accepted foundation and contract choices are DEC-026–DEC-050 in the [decision register](../decisions/index.md). The technical interview is complete. Concrete definitions below are engineering specifications derived from those decisions. The [feature map](../features/index.md) links the implemented API, recipes, and build-specific evidence. Supporting library choices and exact adapter integration remain subject to implementation validation.

## Shared dependencies — Q33

Accepted: build-generated self-hosted vendor modules. Proposed mechanics: a site-owned dependency registry and lockfile. Block manifests declare compatible ranges; imports resolve to the site's selected versions. Incompatible requirements fail validation rather than silently installing another framework runtime or rewriting compatibility declarations. Emit minified, hashed ESM vendor/shared chunks in the site's static output. Block entry points import the same module URLs; load only the graph required by the current page or preview. Retained deprecated block implementations must follow the same compatibility rule.

Use the build's module graph instead of requiring every package to be a single manually maintained script. Packages may have multiple entry points and transitive dependencies. Sharing must include the React editor, block adapters, and block widgets. Build output inspection and browser checks must verify the result; a configuration flag alone is not proof.

Vite documents resolving duplicated dependencies to a root copy, along with limitations for certain SSR ESM outputs: [resolve.dedupe](https://vite.dev/config/shared-options#resolve-dedupe). Its [production build](https://vite.dev/guide/build) manages emitted assets. Browser [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) can map names to module URLs, but do not make incompatible package APIs compatible. Exact implementation must match the Vite version bundled with the chosen Astro release; compatible versions are now pinned in the application package and lockfile.

## Documents and identity — Q34

Accepted: immutable record IDs and ID-based filenames, with editable paths/slugs stored inside. Draft concrete page shape:

```json
{
  "formatVersion": 1,
  "id": "page_about",
  "kind": "static",
  "path": "/about",
  "title": "About",
  "blocks": [
    {
      "id": "block_intro",
      "type": "core/hero",
      "version": 1,
      "props": { "heading": "About us" }
    }
  ]
}
```

Proposed path: `content/pages/<id>.json`. Entries use `content/entries/<collectionId>/<id>.json` with `collectionId`, `slug`, and schema `values` only. Page records carry `kind: "static" | "generic"`; only static pages have a `path`. Definitions live in `content/collections/<id>.json`; settings and media metadata have separate records. Example IDs above are readable placeholders; the concrete definitions below specify ID generation. Reserved route validation is required before publishing. Draft/main branches determine publication; no second per-record publication flag is implied.

## Text inside blocks — Q35

Accepted: JSON remains the outer format, with Markdown strings for formatted prose inside text blocks. Use a shared renderer and a restricted safe feature set. This does not add arbitrary executable Markdown/MDX. DEC-068/DEC-072 extend the schema field set with rich text and uploaded-image/YouTube embeds. Users edit through visual formatting controls for headings, paragraphs, emphasis, links, and lists. Unsupported externally edited Markdown must be preserved or explicitly rejected for visual editing, never silently discarded on a round-trip.

## Versioning — Q36

Accepted: retain old implementations, mark them deprecated, and let users explicitly choose the block version. A block instance's `type` plus `version` selects its renderer and field definition. Deprecated means still renderable and selectable, not automatically upgraded. No automated migration functions.

On an explicit version switch, carry over fields only when keys and value types remain compatible with the target definition. New, renamed, incompatible, or otherwise unmatched target fields begin empty for manual entry; do not guess mappings or silently fill new fields with defaults. Preserve the original instance during the unsaved edit so cancellation can restore it. Save is the boundary for persisting the new version. Required empty values may be saved in drafts but block Publish.

Proposed source layout: `src/blocks/<name>/v1/`, `v2/`, each with its own definition and renderer. The registry maps `(type, version)` to an installed implementation. Newly added instances default to the latest nondeprecated version; the version selector still exposes retained versions. Keep an independent `formatVersion` on file envelopes. If an implementation is genuinely missing, preserve its raw data and show a repairable error rather than dropping the instance. These guardrails preserve the user's manual model without inventing a migration subsystem.

## Block manifest and rendering — Q37

Illustrative source organization: `src/blocks/<name>/definition.ts`, a shared rendering component/template, optional styles, and optional custom widgets. An explicit registry imports installed blocks. A definition declares a stable type, data version, fields/defaults, framework, renderer entries, dependency requirements, and activation policy. Content JSON only names the block type and supplies JSON values; it contains no import paths or executable callbacks.

Accepted: framework adapters around ordinary React/Svelte/Vue components; vanilla/custom blocks implement the same lifecycle directly. Draft signature:

```ts
interface PreviewHandle<Props> {
  update(props: Props, context: BlockContext): void;
  destroy(): void;
}
type Mount<Props> = (
  host: HTMLElement,
  props: Props,
  context: BlockContext
) => PreviewHandle<Props>;
```

The host is a stable block root. Updates receive the complete structurally valid props object, which may contain blank or missing draft values; preview renderers must tolerate these and show placeholders. Public renderers receive publish-valid values. Removal cleans up listeners, subscriptions, and the framework root. Reordering preserves instance IDs and avoids remounting unnecessarily. The build renderer consumes the same validated props/context through Astro's static rendering path. Astro integration details must be validated before treating this as a final interface.

Proposed context contains stable instance identity, optional global theme/settings, and media/reference resolution. GitHub/R2 clients and credentials are not passed as block props. This is an API separation, not a security sandbox: developer-installed code in the same document is trusted code.

Custom field widgets are React components that receive a JSON value, change callback, field configuration, and validation/read-only state. Their saved values still pass the field schema. Exact signatures depend on the answers and must remain small.

## Activation — Q38

Accepted: a block declaration of `never`, `visible`, `idle`, or `load` for public-page browser activation, with complete static HTML where appropriate. Preview always mounts the necessary renderer so edits appear immediately; this differs from public hydration policy. Framework runtime/dependency loading is shared, regardless of when block instances activate. Astro provides these public hydration modes; see [client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives). Custom adapters must honor equivalent behavior where Astro directives do not apply directly.

## References — Q39

Accepted: stable IDs for internal page/entry/media references, with explicit URLs for external links. Proposed record detail: media records contain R2 object URLs, image variants, dimensions, MIME type, and size. Blocks reference media IDs plus presentation data such as alt text. The build resolves IDs to URLs; published pages need not fetch the source metadata registry. This avoids duplicating a variant set into every block but adds a reference-resolution step.



## Supporting stack choices

The selected core is Astro/TypeScript, React, Cloudflare Kumo, and CSS Modules, with Astro's compatible Vite toolchain. DEC-048 supersedes the earlier Base UI choice: Kumo supplies admin controls, dialogs, and toasts; CSS Modules own layout. Scope Kumo's standalone styles to admin surfaces and portals, outside the live preview. Blocks use React/Svelte/Vue integrations or the vanilla adapter. Exact package versions must be pinned together during scaffolding; illustrative versions mentioned in answers are not pins.

Engineering recommendations for remaining supporting tools:

- Octokit for the requested browser GitHub SDK, importing only required client/API features. Its [official repository](https://github.com/octokit/octokit.js) documents browser support.
- AWS SDK v3 S3 client for R2, loaded with the media editor. Cloudflare supplies an [R2 example](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/).
- Lexical's React integration with a restricted Markdown transformer set as the visual-editor candidate. Its [Markdown package](https://lexical.dev/docs/packages/lexical-markdown) supports import/export and selectable transformers. Verify fidelity and bundle cost before adoption; do not persist Lexical's internal document format as the content source.
- pnpm with one lockfile and a Node version supported by the selected Astro release. No separate independently bundled copy of the admin's React runtime.

These recommendations identify an implementation direction, not user-approved package pins or measured integration results.

## Concrete record definitions

These are the initial engineering definitions. Use JSON with two-space indentation and a final newline. Sort object keys consistently where meaningful; preserve array order for blocks, navigation, fields, and select options. Generate IDs once using UUIDs with entity prefixes; the shorter readable IDs in examples are illustrative. Renaming a route does not rename its ID file.

```ts
type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
interface JsonObject { [key: string]: JsonValue }
interface Envelope { formatVersion: 1; id: string }
interface BlockInstance {
  id: string;
  type: string;          // e.g. core/hero
  version: number;      // installed implementation version
  props: JsonObject;
  bindings?: Record<string, string>;
}
interface PageRecord extends Envelope {
  kind: "static" | "generic";
  path?: string; // required public route for static; forbidden for generic
  title: string;
  blocks: BlockInstance[];
}
interface EntryRecord extends Envelope {
  collectionId: string;
  slug: string;         // route segment under the collection
  values: JsonObject;
}
interface CollectionRecord extends Envelope {
  name: string;
  path: string;
  fields: FieldSpec[];
  titleField: string;   // key of a text field in values
  genericPageId?: string;
}
type LinkRef =
  | { kind: "page" | "entry"; id: string; fragment?: string }
  | { kind: "external"; url: string };
interface MediaRef { mediaId: string; alt?: string }
interface MediaFile {
  key: string; url: string; mime: string; bytes: number;
  width?: number; height?: number;
}
interface MediaRecord extends Envelope {
  name: string;
  original: MediaFile;
  variants: MediaFile[];
}
interface SiteRecord extends Envelope {
  title: string;
  globals: JsonObject;
  navigation: { id: string; label: string; to: LinkRef }[];
}
```

Files live under `content/pages/`, `content/entries/<collectionId>/`, `content/collections/`, and `content/media/`, using `<id>.json`. `content/site.json` stores the site record. Connection configuration is separate from content, and no credential is serialized into these files.

Public paths must be unique across static pages and assigned entry routes. A collection prefix does not reserve or generate an index route; a static page may occupy it. Generic pages have no independent URL. Normalize paths and reject traversal, reserved admin/assets routes, and collisions. Internal references resolve through IDs. External links use allowed URL schemes; scripts are never a link target. Media URLs are derived from configured R2/public origins and recorded per uploaded object. The registry is used during build/preview, not fetched by every public block.

## Field and custom-widget definitions

```ts
interface FieldBase {
  key: string; label: string; required?: boolean;
  default?: JsonValue;
}
type FieldSpec = FieldBase & (
  | { type: "text"; multiline?: boolean }
  | { type: "richtext" }
  | { type: "number"; min?: number; max?: number }
  | { type: "date" }                 // YYYY-MM-DD
  | { type: "toggle" }               // boolean, false is a value
  | { type: "select"; options: { value: string; label: string }[] }
  | { type: "media" }                // MediaRef
);
type BlockField = (FieldSpec & { widget?: string }) | (FieldBase & {
  type: "custom"; widget: string;    // block-owned JSON validation required
});
interface WidgetProps<Value extends JsonValue> {
  value: Value | undefined;
  onChange(value: Value): void;
  field: BlockField;
  errors: readonly string[];
  readOnly: boolean;
}
interface ValidationIssue {
  path: string;                     // document/block/field address
  code: string;
  message: string;                  // plain-language UI text
  phase: "structure" | "publish";
}
```

Collection definitions permit only `FieldSpec`; custom block controls do not expand the collection schema-builder scope. A Markdown control stores a string, while a compound block-specific control can use `custom` with the block's shared pure validator. The browser/build run identical value validation. Widget registration maps stable IDs to trusted React components; JSON never supplies component source code.

Field keys and select option values are stable machine identifiers; labels are editable. Empty draft values are omitted or null; empty required text is a publication error, while zero and false are valid values. Nonempty values of the wrong type are structural errors. Do not coerce existing numbers, strings, or selections to make a new version appear compatible.

Developers and the portal edit the same serialized collection definition. New fields are optional by default unless existing entries can satisfy required validation. Block schema definitions remain developer-owned. Collection keys/types with existing data cannot be destructively renamed/changed through the initial portal. Adding an entry initializes declared defaults; switching an existing block version follows the manual blank-field rule above instead.

## Block source contract and styles

A source definition includes `type`, integer `version`, `label`, optional `deprecated`, `fields`, `defaults`, `framework`, `activation`, and declared dependency ranges. Separate renderer registrations reference compiled source modules: a static renderer, a browser mount entry, and optional React widget loaders. Framework adapters generate common lifecycle behavior from a shared component when possible. Explicit alternate renderers need parity fixtures.

Do not import every block or framework into every public page. Generate statically analyzable registry entries and lazy browser loaders as part of the build. Keep browser-safe metadata separate from build-only rendering code; do not send server modules or credentials to the browser. Preview code must load only installed registered versions and clean up after itself.

Blocks use CSS Modules or framework-scoped styles. CSS resets and document-wide theme variables belong to the shell. Namespaced keyframes/fonts and popup portal containers need equivalent ownership. Portals used by editor components mount inside a styled editor-owned container; block popups must retain block-scoped classes. Optional globals such as theme are passed as values/CSS variables, with no mandatory stylistic adherence.

DEC-075 adds optional `site.globals.contentMaxWidth`, a positive finite number in pixels (omitted/null uses 1200). The public shell and live preview set `--site-content-max-width` using the same resolver. Blocks are advised to cap their content containers with it; full-width backgrounds and narrower text measures are allowed. This is a maximum border-box container width including padding, not a forced block width. The variable is scoped away from admin controls. Invalid explicit values fail content validation; preview safely falls back while editing.

DEC-078 adds optional `bodyFont`, `headingFont`, `bodyFontSize`, `bodyLineHeight` and `pageGutter` globals. Font IDs select local fallback stacks (`system`, `arial`, `georgia`, `times`, `mono`); missing/null uses system sans. Body size defaults to 16px, unitless line height to 1.6 and horizontal page gutter to 24px. Size and line height accept finite positive numbers; gutter accepts finite nonnegative numbers. Explicit invalid values fail structural validation. The shared resolver emits corresponding `--site-*` tokens on the public shell/live preview only, safely defaulting during draft editing. Starter blocks follow these tokens; custom block adherence remains advisory. Heading line height and vertical spacing remain block-specific. These defaults and the initial font list are implementation choices within the accepted controls.


CSS scoping is a contract and validation target, not a sandbox for arbitrary untrusted JavaScript. Public HTML, the admin document, and every retained block version must be checked for cross-component style leakage and duplicate runtime execution.

## Save, recovery, and Publish

Accepted behavior: Save includes all pending editor changes in one draft commit; incomplete content may be saved. Publish requires valid required values and resolvable references. Tab-session recovery preserves unsaved content through reloads, without persisting uploaded binary buffers.

Engineering transaction design:

1. Load a coherent content snapshot from an immutable draft commit. Hold its SHA as the editing base.
2. Validate structural integrity of all staged records and file paths. Serialize the full pending change set into a tree and a single commit parented by that base.
3. Advance the draft reference without force. If another writer has advanced it incompatibly, reject the stale save; preserve edits and explain recovery. Do not overwrite a file-at-a-time or silently replay the user's values onto newer content.
4. On uncertain network results, compare the remote reference/commit before retrying. Only clear recovery state after the intended saved commit is confirmed. Associate recovery with repository, branch, base commit, and editor compatibility version.
5. Publish operates on a saved, immutable draft snapshot, not unsaved local state. Validate that entire snapshot, including installed block versions, schema compatibility, paths, references, and required fields. Revalidate during the production build as well.
6. Initial implementation direction: publish through a fast-forward merge of the validated snapshot into main, using a non-forced reference update. Main must be an ancestor; diverged source/content changes require synchronization and renewed validation. This preserves the snapshot under concurrent updates without claiming a preflight read is a lock. Fast-forwarding satisfies the selected draft-to-main merge behavior without requiring a special merge commit.
7. After publishing, retain newer unpublished draft commits if present; never reset the draft branch or force main. Report “published to Git; deployment pending” until deployment completion is actually known. Netlify owns the deployment pipeline.

GitHub exposes the required [tree](https://docs.github.com/en/rest/git/trees#create-a-tree), [commit](https://docs.github.com/en/rest/git/commits#create-a-commit), and [reference](https://docs.github.com/en/rest/git/refs#update-a-reference) operations. Its [merge endpoint](https://docs.github.com/en/rest/branches/branches#merge-a-branch) also accepts an immutable commit SHA, but can merge against a changing base; that alone does not guarantee a previously validated full output tree. The initial fast-forward constraint is an engineering recommendation that needs race testing.

Session recovery includes the base SHA and incomplete values. If the server draft changed, restore local work as recoverable edits rather than silently treating it as current. If browser storage is unavailable/full, show that recovery is unavailable and keep live edits intact. Keep credentials out of content backups, logs, and Git. R2 credential retention can follow the GitHub tab-session default; this is an engineering default, not a separately answered preference.

## Initial proof and validation targets

Implementation began after explicit user authorization. The [initial verification run](../verification/runs/2026-10-05T0819Z-implementation.md) records coverage and gaps for these targets:

- Render repeated React blocks, another framework block, and a vanilla block in public output and a single-document preview. Verify compatible vendors execute once per document, styles stay scoped, and pages load only their required dependencies.
- Edit/reorder/remove blocks; ensure updates appear immediately and destruction releases handlers. Compare published and preview content/layout on fixed fixtures.
- Render a retained deprecated version; switch versions, carry only compatible fields, leave unmatched values blank, cancel safely, and Save incomplete data without automatic migrations.
- Round-trip the limited Markdown feature set through visual editing and shared rendering, including pasted content and unsupported markup preservation.
- Verify all-or-nothing multi-record saves, stale saves, lost responses, reload recovery, invalid Publish rejection, concurrent saves during Publish, and divergent main handling.
- Upload image variants to a test R2 bucket, verify IDs/metadata and responsive URLs, and preserve original files when a format cannot safely be resized. Verify credentials never appear in generated assets.

Exact image widths/quality, upload limits, package pins, drag-and-drop implementation, and route reservations are bounded engineering details to validate during implementation, not unresolved product preferences. No application behavior is claimed tested by the wiki build.

## Admin interaction refinement

DEC-049–DEC-050 keep preview islands interactive without a mode toggle. Block rows sort with pointer dragging; Alt+Up/Down provides keyboard access without extra visible controls. Session recovery remains automatic and silent. Submission runs the existing Save/Publish checks and reports errors through Kumo toasts; there is no proactive issue panel or saved/unsaved status banner.

DEC-057 limits mounting preview islands and displaying the preview-width control to page editing, including page-block details. Content entries, collection schemas, Media and Site use a normal admin main region. Leaving page editing unmounts the preview rather than hiding an active rendering. All areas still share content state, recovery and Save draft/Publish.

## Generic pages and field bindings — DEC-058–DEC-073

`Definition.kind` is `static` (the default for existing blocks) or `generic`. The Add block catalog and publication validation enforce the page kind. Generic starter blocks are Entry heading, Entry rich text and Entry media. A normal Collection list block selects a collection on static pages; entries without a generic page display plain titles rather than broken links.

`Block.bindings` maps each target block-field key to a schema field-key string. `props` retain literal values, used directly for unbound fields and as fallbacks for bound fields. Source and target field types must match; custom/collection selector fields are not bindable schema types. Validate every schema assigned to a template even when it has no entries. Unknown keys, missing assignments and type mismatches are publication issues; structurally valid drafts remain saveable. Resolved values also satisfy the block field's range/options/media constraints before publishing.

A blank optional source value (missing, null or whitespace-only text) uses the literal fallback or null. Zero and false remain real values. Schema required fields still govern entry completeness; a bound block field does not make an optional schema field required. Broken bindings never silently use fallback to bypass validation. Version switching retains only bindings whose target fields remain compatible.

During preview, generic renderers receive literal props and `context.bindingPlaceholders`, mapping bound target keys to strings such as `{{title}}`. Block authors display that placeholder at the field's rendered position, including media slots. Publication receives resolved typed props and no placeholder map. Context also exposes collection title/link summaries for listing blocks; provider credentials remain outside context.

Rich-text values are Markdown strings. Uploaded images use `![alt](media:media_id)` and YouTube uses `![title](youtube:VIDEO_ID)`; `src/core/embeds.ts` validates identifiers and accepted YouTube URLs. The shared Markdown renderer resolves image IDs through media metadata and emits only canonical youtube-nocookie iframe URLs. Raw HTML is escaped. Visual Lexical nodes preserve these destinations through editing, undo and reload. Unsupported Markdown remains in source mode; missing media and unsupported embed destinations block publication. Choose an already uploaded image through the rich-text Image control; upload new files through Media first.

The existing demo entries were replaced under DEC-073. There is no automatic legacy-entry migration: imported entry block arrays and old collection `template` values are structural errors. Tab recovery now uses `lean-sitebuilder:recovery:v2`; older recovery storage remains untouched. JSON file envelopes retain `formatVersion: 1`, with the explicit page discriminator and structural checks distinguishing the revised shape.

## Persistent admin navigation — DEC-074

The main navigation is independent of the selected area's content. Pages opens to its table; page and block details add their own drawer beside the navigation, followed by the live preview. Other areas retain the standard admin main region. At widths up to 800px, a Menu button opens the same navigation in a Kumo dialog; choosing an area closes it. Area switching preserves the shared content state and removes any active page preview.
