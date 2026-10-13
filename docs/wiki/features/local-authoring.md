---
title: Building sites with local agents
updated: 2026-10-13
---
# Building sites with local agents

**ID:** FEAT-local-authoring

## Start with the design

This repository is a blank slate for a client's website. Let the brief, references
and your judgment shape its visual design, interactions and information structure.
The shipped pages, themes, blocks and layouts are materials to inspect, reuse,
reshape or replace. They are not a required aesthetic or a checklist of features.

The builder can make a useful bridge between an expressive custom site and easy
client maintenance. Consider editable fields for content the client is likely to
change; use collections or reusable structures when they simplify the project.
A small site may need only a few blocks. A more involved site may benefit from
structured content and custom renderers. Site-specific code is also an option.

The workflows below are suggestions. Choose the capabilities that fit. Record shapes,
renderer interfaces and validation limits are more precise because they describe
what the current software can read and render, rather than prescribing a design.

## A quick map

| Look here | To understand |
| --- | --- |
| `content/site.json` and `content/pages/` | This site's layout selection, pages and block instances. |
| `content/collections/`, `content/objects/`, `content/entries/` | Its schemas and structured content, if used. |
| `blocks.config.mjs`, `layouts.config.mjs` | Which implementations are installed. Follow their directories to `definition.json` and source. |
| `src/core/types.ts` | Exact record and field shapes. |
| `src/core/content.ts`, `schema.ts`, `bindings.ts`, `lists.ts`, `routes.ts` | Validation, change checks, references, defaults and routes. |
| `examples/content-model.json` | An optional richer composition with objects, references, arrays, generic pages and a single-entry collection. |
| [Feature map](index.md) | Current capability details and UI entry points. |

Local agents normally edit source/JSON in the clone. The browser is useful for
checking appearance and whether the client's controls feel right. Browser editing
updates an in-memory draft and tab recovery; it does not write the local checkout.
Importing a backup replaces that browser draft. A connected editor saves to its
configured GitHub or GitLab draft branch. These are different copies until synchronized.

## Choosing content structures

These are useful starting points, not required allocations:

| Need | Consider |
| --- | --- |
| A page with its own address | A static page with ordered blocks. |
| Section-specific copy, images or a small repeatable list | Block props with declared fields. |
| Repeated, independently managed items such as articles or people | A `many` collection with its own schema and entries. |
| One centrally managed record, such as company details | A `single` collection; its one entry is still independent content. |
| The same field structure in several places | A named object definition. Each use owns its values; it does not share the content itself. |
| Repeated values owned by one entry | An array of objects, using one inline or named shape. |
| Selecting existing shared records | A reference, or ordered array of references, to one collection. |
| A reusable presentation for entries | A generic page assigned to a collection. |
| Site-wide chrome, typography or custom surrounding UI | A Site Layout with author-defined settings. |
| A distinctive section or interaction | A custom registered block and its renderer. |

A data-only collection needs no URL. An ordinary collection assigned a generic
page uses a prefix plus entry slugs; a single-entry collection uses one exact path.
An index, if useful, is a separate static page. Static pages use static blocks;
generic pages use generic blocks. General content queries and reverse-reference
template lists are not built-in capabilities; forward bindings and collection
cards cover the current structured rendering features. A custom renderer can
provide other behavior using its available content context.

## Starting a new site

A practical sequence is to run the demo, inspect useful definitions, then sketch
the site's routes, visual components and likely client edits. Reuse or author
layouts and blocks as the design suggests. Replace sample records with the site's
own records, checking links and references together. Unused content directories
can be absent. The regression suite has its own sample content, so the client site
has no obligation to keep Home/Journal/chartr demo records or their routes.

For new records, the canonical layout shape is a useful starting point:

```json
{
  "formatVersion": 1,
  "id": "site_main",
  "globals": {},
  "layout": {
    "id": "starter",
    "version": 1,
    "settings": { "title": "Client site", "navigation": [] }
  }
}
```

That selects Starter as an example, not a design requirement. An installed custom
layout can use its own settings. Public-site content spacing belongs to the active
layout settings (`contentMaxWidth`, `pageGutter` in the built-in layouts). Starter
uses 1200px/0px defaults and chartr 1512px/40px. Switching layout/version initializes
the selected manifest's defaults. Styling tokens are optional inputs for block authors.

A static page might begin as:

```json
{
  "formatVersion": 1,
  "id": "page_home",
  "kind": "static",
  "path": "/",
  "title": "Home",
  "blocks": []
}
```

It lives at `content/pages/page_home.json`. A publishable snapshot currently needs
a static home page at `/`. Add block instances with their installed `type`, `version`,
unique `id` and `props`. A useful starting value is the definition's defaults;
`newBlock()` in `src/core/content.ts` also clones defaults and row identities.

`pnpm dev` generates source imports and opens the development workflow described
in README. After adding registrations or routes, stop the owned development instance
with `pnpm exec astro dev stop`, then run `pnpm dev` again. The demo site uses an older
site shape understood by the existing reader; use the canonical shape above for new work.

## Recreating an existing site

Inspect the reference at wide/narrow widths and exercise its interactions. When
source is available, inventory routes, copy, assets, fonts and behavior. Confirm
only unresolved choices: fidelity, source reuse, likely client edits and whether
the active site should be replaced or preserved. A reproduction is not automatically
a redesign, a CMS schema port or permission to remove unrelated content.

Compare the rebuilt page and reference at the same viewport after fonts and entry
animations finish. Check distinctive typography closely: splitting text for an
animation can change word spaces, kerning and flex sizing even with the correct
font and size. Repeat the comparison in the editor preview.

Map visible sections and client tasks to builder capabilities before coding:

| Reference need | Builder location | Client location |
| --- | --- | --- |
| Shared shell, typography, navigation | Registered Site Layout | Site Layout |
| Section copy/images/actions | Registered block fields | Pages → page → block |
| A short list owned by one section | Block `list` fields with `_rowId` rows | The block's named list |
| Independent reusable content | Collection and entries, when useful | Content and Schemas |
| Existing image files | `public/` plus media records | Media and field selectors |
| New interaction | Block renderer and activation | Preview and public site |

The [Quine trial](../journal/2026-10-11-quine-rebuild.md) is a runnable example:
`pnpm example:quine` stages it separately and preserves the root demo. It uses
ordinary content records and installed implementations, not a special rendering
path. See `examples/quine/README.md` in the repository for the editing map and
local credentials. Source assets and fonts are local; effects are independently
implemented. A project gallery is a block-owned list because its owner selected
that model. Do not introduce collections merely to exercise more CMS features.

The [Intr trial](../journal/2026-10-13-intr-rebuild-scope.md), run with
`pnpm example:intr`, adds a contrasting model: a data-only Projects collection
shared by ordered homepage/listing cards, plus one static sample detail page.
See `examples/intr/README.md` for the client editing map. Assign a generic page
when every entry should produce a route; shared card data alone does not need one.
An optional URL field lets the few completed detail pages link without creating
dead links for the other cards. Static detail copy remains separately owned.

For custom static collection blocks, `contextFor` exposes the conventional
`titleField`, `summaryField`, `imageField`, `dateField` and `urlField` mappings from
block props. Declare their `collectionField` selectors in the block manifest;
this is a limited existing card-data adapter, not arbitrary schema access or
automatic generic-page binding. Check the returned `Context` before implementing
the renderer. Intr adds the missing URL mapping and covers shared edits in tests.

Several details are easy to miss during implementation:

- A media field value is an object containing `mediaId` and optional `alt`.
  Block lists use `list`/`fields`; collection arrays use `array`/`of`.
- Keep layout geometry defaults, its policy output and renderer consistent.
  Author-specific settings need not expose every source-maintained value.
- Scope typography/resets to the website. Container queries let the same
  responsive renderer react to the editor's narrow preview, independently of
  the desktop browser window. The layout Head does not mount in that preview,
  so assets needed there also need a renderer-loaded path.
- Choose responsive image sources for the visible crop. A landscape image filling
  a tall phone hero needs more pixels than its narrow element width implies;
  check `currentSrc` and sharpness after a fresh mobile load.
- Give shared-content blocks clear field labels and an editing map. A reference
  selects content; it does not open an inline editor for that content. In block
  lists, reference-only rows currently fall back to numbered item labels.
- Choose layout activation deliberately: `never` renders only on the server,
  while `load` hydrates the React wrapper. Static blocks do not eliminate that
  layout cost. Native navigation may be enough; measure the built page scripts
  before choosing React hydration for a small menu behavior.
- Read the actual dev-server URL and verify the page identity. A requested port
  may belong to another running site. Click an interactive control and inspect
  `pnpm exec astro dev logs`; an HTTP 200 and correct static screenshot do not
  establish successful hydration. Vite caches are separate per checkout and
  Astro command, so checks/builds do not overwrite the active dev cache. Isolated
  checkouts explicitly allow their linked dependency directory.
- Test at least one realistic content edit and a repeatable-list edit, then
  confirm preview, cancellation/restoration and export. Browser edits do not
  write the source checkout. Record where content is maintained and how to keep
  it, alongside any fidelity compromises and untested integrations.

## Adjusting an existing site

Start with `git status`, the current site records, the relevant definitions and the
client's request. If the client uses the portal, review its latest saved draft too:
`PUBLIC_DRAFT_BRANCH` configures the branch, defaulting to `draft`. Fetching that
branch through the developer's normal Git workflow makes its saved content available
locally. Unsaved edits in someone else's browser are not in Git.

Identify the content snapshot being changed before editing. A text adjustment may
belong in one block's props, an entry value or shared layout settings. A change to
all article pages may belong in their generic page. New controls or visual behavior
may belong in a definition/renderer. Named-object changes can affect several collections;
`incomingUsage`, `definitionUses` and `collectionUses` in `src/core/schema.ts` help
trace their uses, and the portal exposes readable usage summaries.

For a normal adjustment, stable IDs and unrelated values are useful to retain.
If the request deliberately changes the structure, coordinate its values, references
and presentation too. The change checker can identify incompatible populated fields
or remaining references to deleted records. No automatic content migration is provided.

A useful check before delivery is:

```sh
pnpm validate:content --base HEAD
pnpm verify
```

Choose a baseline ref representing the actual starting snapshot; `HEAD` is only
appropriate when that is the intended baseline. The command reads local Git history
without fetching or changing branches. `--draft` can be combined with `--base` for
unfinished work. Source changes may require reconciliation with the shared draft
and deployment of the rebuilt editor before portal publication; see [publishing](publishing.md).

## Records and values

Each site/page/collection/object/entry/media record has `formatVersion: 1` and an ID.
Except for `site.json`, record filenames match their IDs; entry directories match
`collectionId`. Block instances have their own IDs and implementation versions. IDs identify records;
paths, slugs and labels are editable attributes. `filesFor()` and `parseFiles()` in
`src/core/content.ts` implement file mapping and serialization.

Collections contain `name`, `mode`, `fields`, `titleField`, and optional `path` and
`genericPageId`. Entries contain `collectionId`, `values`, and optional `slug`.
There is no entry block list. For a `single` collection, create its one entry too;
the portal does this on Create collection. `fieldDefaults()` is useful when making
entries/owned values, and `normalizeLists()` creates new identities when copying rows.

| Field definition | Stored value |
| --- | --- |
| `{ "key": "name", "label": "Name", "type": "text" }` | String or empty/null. Other scalar types include richtext, number, date, toggle, select and media. |
| `{ "key": "seo", "label": "SEO", "type": "object", "objectId": "object_seo" }` | An owned object of field values. Inline `fields` can replace `objectId`. |
| `{ "key": "team", "label": "Team", "type": "array", "of": { "type": "object", "objectId": "object_person" } }` | Ordered objects; `_rowId` gives each row a stable editor identity. |
| `{ "key": "author", "label": "Author", "type": "reference", "collectionId": "collection_authors" }` | An existing entry ID or null. |
| `{ "key": "related", "label": "Related", "type": "array", "of": { "type": "reference", "collectionId": "collection_articles" } }` | Ordered unique entry IDs. |

Collection/object schemas use `array`; block/layout definitions retain `list` with
`fields`. Arrays have one object shape or one target collection, not mixed variants.
Owned objects and object arrays allow three levels; named-definition reuse adds no
extra level, and recursive owned definitions are rejected. References between
independent entries may form cycles. [Full content contract](content-model.md).

Generic block `bindings` map a target prop to a typed path, for example
`{ "heading": "seo.title", "author": "author.name" }`. A list projection uses
`{ "source": "items", "fields": { "label": "name" } }` for its target binding.
The source's type/shape needs to fit the destination field, including every collection
sharing that generic page. Paths are bounded to 12 segments. Empty optional values
use literal `props` fallbacks; zero and false remain values. The generic editor preview
shows placeholders; a built entry route shows the actual resolved content.

Rich text stores Markdown. Uploaded image embeds use `![alt](media:media_id)` and
YouTube embeds use `![title](youtube:VIDEO_ID)`. The managed rich-text renderer has a
limited safe vocabulary; a custom block's code can implement other visual/media behavior.
Media props store `{ "mediaId": "media_example", "alt": "Description" }`, rather
than a URL or bare ID. Records live in `content/media/`. Client uploads go to R2
through Media; copied assets can live in `public/` with root-relative record URLs.
For example `public/photos/team.jpg` uses `/photos/team.jpg`. Supply the normal
`original` metadata (`key`, `url`, `mime`, `bytes`, optional dimensions) and
`variants: []` when no variants exist. Existing selectors and renderers work with
both sources. Local validation checks metadata, not file existence; verify local
asset URLs in the built site. [Media contract](media.md#locally-authored-media).

## Custom blocks and layouts

A block version has a `definition.json` and renderer in `src/blocks/<name>/vN/`.
Register the directory in `blocks.config.mjs`. Definitions describe `type`, `version`,
`label`, `framework`, `activation`, `component`, `fields`, `defaults` and dependency
ranges. Optional metadata includes `kind`, theme/tags/description and footer placement.
The manifest is a good place to make a custom block discoverable in the catalog.

React/Svelte/Vue components receive `{ props, context }`. Vanilla implementations
export `render(props, context)` for public markup and `mount(host, props, context)`
returning `{ update, destroy }` for browser use. Public activation is `never`, `visible`,
`idle` or `load`; preview mounts immediately. The same source renders both contexts.
Preview props may be incomplete; graceful blanks/placeholders usually help authoring.
Root package pins and manifest dependency ranges are checked during generation.

`context` provides instance identity, resolved globals, media, links, preview/binding
placeholders and collection summaries. Collection-card field mappings expose their
selected values. It is not an unrestricted data-query service. See `src/core/types.ts`
and the relevant renderer for the available context. New behavior can be authored
in source where useful.

A layout lives in `src/site-layouts/<name>/vN/` and is registered in `layouts.config.mjs`.
Its manifest names a React wrapper, React settings component, pure policy, defaults
and fields, with an optional server-rendered Head component. Activation is `never`
or `load`. The wrapper receives settings, content, block children and preview context;
placing those children makes the page's block composition visible. Its settings UI
receives `settings`, `content` and `onChange`. The policy can derive title/globals and
validate values. The [layout contract](site-layouts.md#authoring-api) describes details.

Custom settings are permitted: `fields: []` is valid. Starter demonstrates this;
its settings/policy, `src/core/header.ts` and the renderer describe navigation,
header/footer and typography values. Hero v2 demonstrates a custom widget with a
pure validator in `src/core/custom-fields.ts`: its presentation value contains a
six-digit hex `accent` and numeric `inset` from 24 to 160. Briefly documenting custom
value shapes near new extensions can save the next agent from inferring them.

CSS Modules/framework-scoped CSS help keep an expressive design independent from
the editor. The layout owns the website surface; shared `--site-*` variables are
available when useful. Browser preview shares a document with the admin, so global
resets can affect both. Existing shared controls (`Fields`, `PanelLevel`, creation
forms) offer a consistent client experience for custom settings; [editor behavior](editor.md)
describes their navigation and cancellation semantics.

Saved records pin implementation versions. A version switch preserves compatible
same-key block values; layout switches use fresh defaults. If an implementation is
changed or removed, check the records using it. This prototype has no migration
commitment, and deliberate redesign is possible within the task's scope.

## Validation and delivery

```sh
pnpm validate:content                 # structural and publication issues
pnpm validate:content --draft         # structural issues only
pnpm validate:content --base HEAD     # also compare schema/deletion impact
pnpm verify                          # types, regression tests, build, artifacts
pnpm preview                         # inspect the built result
```

The validator refreshes generated registries without generating routes, then calls
the existing core validators. It prints paths, phases and messages; failure exits
nonzero. It does not edit content or save/publish anything. `--base` uses an explicit
local Git snapshot; final-state validation alone cannot establish every change-impact
check. Tests use isolated sample records; the build and artifact check inspect the
actual site's output. Runtime sharing and public/editor separation remain checked
without requiring particular page names, frameworks, scripts or custom embeds.

For visual changes, inspect the relevant public routes, narrow/wide layouts and
browser editor controls. Consider a representative client edit: can the owner find
and adjust the intended content, and does the rendered page actually use it? Which
parts remain developer-maintained can be an intentional handoff choice.

`pnpm build` produces `dist/`. README describes GitHub/GitLab connection and static hosting setup.
Save draft, Publish to Git and successful hosting deployment are separate outcomes.
Local/mock checks establish neither account permissions nor live upload/deploy
success. A useful handoff names the changed routes/controls, how to edit them, what
was verified, and any intentionally source-maintained parts.

## Verification history

See the [local authoring implementation run](../verification/runs/2026-10-08-local-authoring.md)
for the new-site regression, draft/baseline validation and verification limits.
