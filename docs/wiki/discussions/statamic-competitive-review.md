---
title: Statamic competitive and architecture review
updated: 2026-11-06
status: Research and proposals; not accepted implementation scope
summary: Statamic's strengths, QuineCMS's current position, and improvements suited to a Git-backed static CMS.
---
# Statamic competitive and architecture review

Statamic's strongest advantage is the completeness of its content-authoring system. Schemas, field controls, relationships, asset handling, previews, queries and editorial workflows cooperate. QuineCMS already has a credible structured-content and visual-composition foundation. Its largest opportunities are completing everyday editorial workflows and making its existing core concepts available consistently.

The recommended direction is a better CMS for independently owned static sites: dependable links, good content discovery, stronger field definitions, reviewable publication and useful media operations. A Laravel-style application platform, database backend or universal plugin framework is not a prerequisite.

## Scope and evidence

Research date: **6 November 2026**.

- Inspected Statamic's `6.x` source at [`ccb6fc46af6bde9f9c9237036076d1d6b29afb02`](https://github.com/statamic/cms/tree/ccb6fc46af6bde9f9c9237036076d1d6b29afb02). The checked-out changelog's latest release is **6.40.0, 3 November 2026**; the branch contains subsequent commits. This is a branch-source review, not an installed-release test.
- Read official documentation online and its [source snapshot](https://github.com/statamic/docs/tree/ff6c0a6d7f6b9b52b9221a4d83f86dcd03f681bb). Inspected official screenshots of blueprint configuration, Bard and asset management. Product usability judgments below are informed by those surfaces and implementation, not a hands-on editorial trial.
- Compared against QuineCMS **0.3.0**, engine HEAD `309c0ba` and the current working tree, including existing uncommitted editor/navigation changes. Consulted current feature contracts, accepted decisions and open questions, then checked core, editor, persistence, rendering and assembly source.
- This task does not install or run Statamic, benchmark either CMS, re-verify live providers, or implement recommendations. Existing QuineCMS verification records are historical evidence with their recorded limits. Only research documentation is changed.
- Recommendations are proposals. They do not supersede accepted choices about manual upgrades, shared credentials, translation fallback, minimal UI or independent site ownership.

Documentation verification: the wiki build and `--check` passed for 216 pages and their internal links. Opening the generated reader for visual inspection was attempted, but the browser access host was unavailable. No application source changed and no new product-test results are claimed.

Statamic's source is publicly readable but its package declares a proprietary license; it should not be described as MIT-licensed code available for incorporation into QuineCMS. This review uses behavior and architectural observations, not copied implementation. [Package and license](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/LICENSE.md).

## How Statamic works

### 1. An application package inside a site

The linked repository is the CMS Composer package, installed into a Laravel application. The application owns its content, templates, configuration and extensions. Its current control panel uses Vue 3 and Inertia; public rendering can use Antlers or Blade, or deliver content to another frontend. This separation resembles our engine/site dependency boundary, despite the different runtime. [Repository](https://github.com/statamic/cms), [package dependencies](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/composer.json).

The ordinary installation runs PHP/Laravel. “Flat-file” describes persistence; it does not mean a browser-only administrator or an inherently static deployment. Statamic offers static page caching and an official static-site generator, but these are distinct from the normal application request lifecycle. [Static caching](https://statamic.dev/advanced-topics/static-caching), [SSG](https://github.com/statamic/ssg).

### 2. Several deliberately different content primitives

Collections contain entries, commonly Markdown files with YAML front matter. Collection configuration controls routes, ordering, dates, templates and available blueprints. Entries have stable identifiers, so relationships do not need to depend on a file's current path. Taxonomies provide terms and classification. Global sets hold shared content. Assets are managed resources with metadata. [Collections](https://statamic.dev/content-modeling/collections), [taxonomies](https://statamic.dev/content-modeling/taxonomies), [globals](https://statamic.dev/content-modeling/globals).

Statamic distinguishes a **structured collection**, whose hierarchy can determine content URLs, from **navigation**, whose hierarchy composes a menu. Moving a menu link does not inherently move the referenced article. That separation is a useful product rule to preserve if QuineCMS adds reusable menus. [Structures](https://statamic.dev/content-modeling/structures), [navigation](https://statamic.dev/content-modeling/navigation).

### 3. Schemas describe both data and the author's form

Blueprints specify fields and authoring organization. A collection can allow multiple blueprints; assets, forms, users and globals also use blueprints. Fieldsets reuse field configuration, and fieldtypes supply the control and behavior for values. The same schema system reaches far beyond an entry's text inputs. [Blueprints](https://statamic.dev/content-modeling/blueprints), [fieldsets](https://statamic.dev/content-modeling/fieldsets).

The source's fieldtype contract includes processing, editor preprocessing, validation, defaults, listing presentation and value augmentation. This is more consequential than the number of available controls: custom fields can participate in the surrounding CMS instead of being isolated widgets. [Fieldtype contract](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Fields/Fieldtype.php).

### 4. Files are authoritative; indexes are disposable

The **Stache** turns content files into indexed data held in Laravel's cache. It has stores and indexes for resource kinds. Content files remain sufficient to reconstruct it. File watching can detect external edits; the docs advise disabling per-request watching in production and refreshing appropriately during deployment. [Stache](https://statamic.dev/advanced-topics/stache).

Consumers use repository contracts and query builders. The default entry repository delegates to the Stache; alternative implementations can replace that persistence layer. The source indexes fields including entry ID-related lookup data, slug, collection, publication, site, origin and URI, with additional indexes for dated/ordered content. This separates **storage**, **retrieval** and **presentation**. [Repositories](https://statamic.dev/backend-apis/repositories), [entry store implementation](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Stache/Stores/CollectionEntriesStore.php).

### 5. Stored values become useful rendering values

Statamic calls this **augmentation**. A relationship can remain a small list of IDs in storage and become usable entry objects when requested; Markdown can become rendered HTML; an asset can expose dimensions and a URL. Resolution is lazy where supported, and shallow forms are available. [Augmentation](https://statamic.dev/frontend/augmentation), [Value implementation](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Fields/Value.php).

Public requests resolve content by URL and render it through the template system. Its data cascade supplies values from several scopes, including entries, collection defaults and globals. That is convenient but makes some provenance implicit. QuineCMS should retain its explicit bindings and documented language fallback, even while improving reusable resolution helpers. [Frontend controller](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Http/Controllers/FrontendController.php), [data inheritance](https://statamic.dev/content-modeling/data-inheritance).

### 6. Editing, publication and Git history are distinct

With revisions enabled, a published entry can retain its live version while edits go into a working copy. Editors can view history and restore an earlier revision into editable work. Revision metadata includes authorship and time; revisions are stored separately from ordinary entry files. This is an editorial model, not merely a Git viewer. [Revisions](https://statamic.dev/content-modeling/revisions), [revision behavior](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Revisions/Revisable.php).

Git automation listens for changes and can commit/push automatically, manually or on a schedule. The CMS can operate without that automation. QuineCMS instead uses Git provider operations as the save and publication transport itself. Those are materially different contracts. [Git automation](https://statamic.dev/control-panel/git-automation), [event subscriber](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Git/Subscriber.php).

### 7. Preview substitutes draft data into the rendering path

Statamic processes preview fields and caches preview data under a token, then resolves that data while rendering. It supports multiple preview targets, such as an article detail page and the listing where its card appears. The value is contextual verification: editors can see downstream uses of their work. [Live Preview](https://statamic.dev/control-panel/live-preview), [preview controller](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Http/Controllers/CP/PreviewController.php), [token storage](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/CP/LivePreview.php).

QuineCMS already previews pages, layouts and routed entries using shared rendering/binding machinery. Additional preview targets would extend that investment; they would not justify replacing it with a server preview system.

## Capability comparison

“Not present” here means no general engine capability found in the inspected QuineCMS source. A custom library block can implement a narrower site-specific feature.

| Area | Statamic | QuineCMS today | Assessment |
| --- | --- | --- | --- |
| Site ownership | Application owns content/configuration; CMS is a package. | Independent site repositories; pinned engine and optional libraries; disposable assembly workspace. | Our separation is a strength worth preserving. |
| Content models | Collections, multiple blueprints, reusable fieldsets, globals, terms. | Collection-owned schemas, single/many modes, reusable objects, typed arrays and references. | We have the essential model; form configuration and some specialized workflows are thinner. |
| References | Relationship fields, query integration and resolved rendering values. | Stable entry IDs, ordered reference arrays, typed forward paths and incoming-use checks. | Build on ours; do not introduce a parallel relation system. |
| Field presentation | Sections, instructions, conditions and configurable listing visibility. | Labels/defaults/required/localized flags, scalar controls and nested editors. | High-value authoring improvement. |
| Long-form content | Bard mixes formatted prose with structured sets; Replicator mixes sets. | Restricted Markdown-backed Lexical editor with media embeds; separate page blocks. | Rich articles remain a meaningful gap. |
| Page composition | Blueprint fields and sets rendered through templates. | Versioned blocks, searchable design catalogs, multiple configured site layouts and framework adapters. | QuineCMS already has a substantial visual-composition system. |
| Content discovery | Collection listing/filter facilities, configurable columns, preferences and command palette. | Simple entry lists; dedicated block/catalog and reference search. | Improve ordinary content lists before adding more catalogue UI. |
| Editorial workflow | Per-entry publication state and optional working copies/revisions. | Local edits, saved whole-site draft, exact-snapshot publication; tab recovery/backups. | Same word “draft,” different capability. |
| Concurrency | Optional collaboration package adds presence, field locking and live updates. | Optimistic Git concurrency guards; preserves stale edits; manual recovery. | Robust stale-write detection is present; collaborative editing is not. |
| Users and permissions | Users/groups/roles and resource/action permissions. | One shared admin credential pair, shared Git/R2 credentials after unlock. | A different trust model, not a missing settings page. |
| Navigation | Reusable trees independent of URL hierarchy; link fields with resource selection. | Layout-owned navigation and existing tagged links; general URL fields remain strings. | Shared link controls first, reusable menus when justified. |
| Locales | Related site variants, multiple base URLs, localized content and inheritance. | Optional languages, shared composition/slugs, sparse copies, whole-item fallback and strict mode. | Ours is intentionally narrower and already implemented. |
| Assets | Containers, searching/folders, metadata blueprints, replacement, focal points and transformations. | Stable media IDs, local assets/R2, browser-generated variants, field upload, per-use/per-language alt. | Several strong additions fit without an image server. |
| Content queries | Query builders, scopes, filters and template tags. | Collection context, declared field projections, forward reference resolution. | A small deterministic query API would remove repeated library logic. |
| Site search | Configurable indexes, local and Algolia drivers. | No general engine search service; the Kahf design supplies a small client search. | Optional build-generated search output fits our model. |
| Forms | Submission processing, stored submissions, email and exports. | External form-endpoint support; no submission backend. | Integrate existing services before building an inbox platform. |
| Headless APIs | Opt-in read-only REST and GraphQL delivery APIs. | No general HTTP content API. | Static public JSON exports may cover initial demand. |
| Runtime and caching | Laravel runtime, Stache, page caching; separate SSG option. | Astro static generation and public hydration only where needed. | Different operating cost and capability tradeoffs. |
| Extension ecosystem | Composer addons, fieldtypes, tags, modifiers, actions, events, UI components and starter kits. | Declared library/site manifests, blocks/layouts, pure custom validators and React widgets. | Make existing interfaces complete before widening extension scope. |
| Upgrades | Versioned releases, upgrade guides and update scripts. | Exact dependency pins, source identity checks, explicit manual upgrades. | Better diagnostics/examples help; automatic content migration is not required. |

Statamic sources for the broader inventory: [Bard](https://statamic.dev/fieldtypes/bard), [Replicator](https://statamic.dev/fieldtypes/replicator), [assets](https://statamic.dev/frontend/assets), [permissions](https://statamic.dev/control-panel/permissions), [multi-site](https://statamic.dev/control-panel/multi-site), [search](https://statamic.dev/frontend/search), [forms](https://statamic.dev/frontend/forms), [REST](https://statamic.dev/frontend/rest-api), [GraphQL](https://statamic.dev/frontend/graphql), [addons](https://statamic.dev/addons/building-an-addon).

QuineCMS's authoritative current contracts: [content model](../features/content-model.md), [editor](../features/editor.md), [publishing](../features/publishing.md), [media](../features/media.md), [internationalization](../features/internationalization.md), [engine/site separation](../features/site-engine.md), [Kahf proof](../trials/kahf.md).

### Edition and deployment distinctions

The current pricing page lists free Core with one super-admin, one form, content modelling, assets and Live Preview. Pro lists multiple users/roles, revisions, headless APIs, multisite and Git automation. It is currently **US$349 per site**, including one year of updates, with **US$99/year** for subsequent updates. Those commercial boundaries are relevant when comparing the free experience with the full feature inventory. [Pricing](https://statamic.com/pricing).

Live multi-user collaboration additionally requires installing the [Collaboration addon](https://statamic.com/addons/statamic/collaboration); it should not be represented as zero-configuration behavior of the cloned CMS package. Likewise, a comprehensive SEO product or commerce suite should not be credited to core just because the ecosystem offers one. [Collaboration documentation](https://statamic.dev/control-panel/multi-user-collaboration).

## What Statamic is especially good at

### Making a developer's model usable by an editor

Its schema carries authoring intent: how fields are arranged, when they appear, what is valid and how related content is selected. This reduces the need for every site author to handcraft an editor. Conditional fields are substantial behavior, including submission/validation semantics; they are not just CSS hiding. [Conditional fields](https://statamic.dev/control-panel/conditional-fields), [validation](https://statamic.dev/content-modeling/validation).

The transferable lesson is to treat a good editor as part of the field contract. QuineCMS should not require a custom layout-settings component for routine grouping or explanatory text.

### Supporting the way articles are written

Bard lets prose continue around structured elements. A quotation, gallery or callout can retain meaningful fields while being inserted during writing. This is a better fit for long-form editorial content than treating every paragraph as a page section. The separate Replicator model also makes it clear that mixed structured blocks and flowing prose are related but distinct jobs. [Bard data and sets](https://statamic.dev/fieldtypes/bard), [Replicator](https://statamic.dev/fieldtypes/replicator).

### Giving editors reversible work

A working copy, a live version and a historical revision mean different things. That distinction lets an editor correct a live article while a larger rewrite remains unfinished. Our current site-level draft safely delays deployment but does not supply this independence.

### Treating assets as maintained content

Asset replacement, metadata, findability and focal points address recurring client work. Their usefulness comes from handling an asset throughout its lifetime, not merely accepting an upload. Glide also gives template authors named transformation presets instead of scattered image settings. [Asset operations](https://statamic.dev/frontend/assets), [image manipulation](https://statamic.dev/frontend/image-manipulation).

### Keeping flat files usable as the site grows

Repository APIs and indexes keep callers from repeatedly scanning and interpreting raw files. This is a sound separation even if QuineCMS never needs a persistent cache or database. We should adopt the derived-index idea at the scale of an immutable browser/build snapshot.

### Completing extension and maintenance workflows

Statamic documents extension contracts, scaffolding, testing, UI components and upgrades. Its code has dedicated subsystems for repositories, revisions, permissions, search and fields. The advantage is a discoverable route for common tasks. QuineCMS has good separation rules; it would benefit from small working examples and clearer capability coverage just as much as additional extension hooks. [Building addons](https://statamic.dev/addons/building-an-addon), [upgrade guides](https://statamic.dev/getting-started/upgrade-guide).

## What QuineCMS should retain

Our strongest existing decisions are practical, not speculative:

- **A static deployment with a static admin.** Sites can run without maintaining an application server. This matters for the independent sites in the current project contract.
- **Coherent Git saves and publication.** Structural draft validation, full publication validation, source-manifest checks and non-forced branch advancement are substantial integrity protections.
- **Independent site content and pinned dependencies.** Engine and library upgrades can be reviewed independently; site-specific content does not live in a central engine checkout.
- **Explicit references and bounded resolution.** Owned-depth/cycle checks, stable row identities, deletion guards and bounded typed projections are already useful architecture.
- **Reusable visual designs with actual preview.** Blocks, layouts, framework adapters and routed-entry previews are real capabilities, not a future roadmap.
- **Deliberate localization rules.** Shared composition, whole-item fallback and publication validation are comprehensible constraints. More permissive inheritance is not automatically better.

These are source-backed observations, not claims that QuineCMS is faster, more secure or easier to use than Statamic in measured deployments. [Engine](../features/site-engine.md), [publication](../features/publishing.md), [model](../features/content-model.md), [languages](../features/internationalization.md).

## Recommended additions

The ordering below assumes the existing target: custom sites maintained by their owner or a small trusted team. Effort estimates are relative architectural assessments, not implementation commitments.

### 1. A consistent internal-link field

**Value: very high. Scope: medium.**

Let an editor choose a page, entry, asset or external destination wherever a link is needed. Store internal identities, resolve their current paths and requested language, and show references when deletion would break a link. Reuse the same selector in CTA fields, layout menus and rich-text links. Statamic's link field demonstrates this as a common control. [Link field](https://statamic.dev/fieldtypes/link).

QuineCMS already has the `Link` union, `resolveLink`, stable content IDs and incoming-use handling. What is missing is a general field/control and consistent integration across libraries and rich text. Extend those foundations. Keep external URLs explicit; do not silently reinterpret old strings as content identities.

**Useful proof:** rename an entry slug, follow a translated CTA and a menu link, and verify both continue to reach the intended record. Attempt deletion and receive the correct owning field locations. This would solve a real multilingual-site weakness without widening the localization model.

### 2. Searchable and sortable content lists

**Value: very high as collections grow. Scope: small to medium.**

Start with title search, configurable default sorting and a few chosen columns on entry lists. Add translation-completeness filters using the states we already calculate. Preserve selection, keyboard access and existing Back behavior. Use pagination or windowing only when measured list size warrants it.

Statamic exposes listing preferences and blueprint-level column visibility; our current collection screen maps entries into a simple list. Reference search and block-catalog search do not solve the job of finding an article to edit. [Blueprint listing options](https://statamic.dev/content-modeling/blueprints), [preferences](https://statamic.dev/control-panel/preferences).

A command palette is useful later, once actions and content destinations have a common registration surface. It should follow a good content list, not substitute for one.

### 3. Richer field definitions with shared validation

**Value: high. Scope: medium.**

Add optional help/instructions, placeholders, sections or groups, text-length limits and a small set of conditional presentation rules. Allow a reusable object such as SEO to have a clear form without requiring a custom component. Keep field ordering and language badges consistent with accepted editor behavior.

Visibility, validation and persistence must have explicit contracts. A sensible QuineCMS default would retain hidden values, evaluate conditions deterministically and apply required checks according to declared rules. Statamic's default conditional submission behavior need not become ours.

The same validator must run in editor, CLI and publication. Existing incomplete-draft allowances remain. Avoid an arbitrary expression language initially: equality, nonempty values and booleans cover many practical cases.

**Useful proof:** an optional CTA reveals its label/destination, changing its toggle does not erase content, and CLI/publication reject exactly the same invalid combination.

### 4. Publication review and record history, then independent editorial drafts

**Value: high. Scope: medium for review/history; large for independent drafts.**

The immediate improvement is a Publish-time review of changed records, a useful diff, and actionable validation destinations. It fits our existing submission-time validation convention. Add access to a record's saved history and restore selected historical content into the current draft as a new change. Keep restore subject to current schema/source checks; never rewrite Git history.

Per-entry drafts are a larger product improvement. Example: a pricing correction should be releasable while another editor has an incomplete article rewrite. A `published: false` flag alone cannot solve this: hiding the working entry would also remove the previously published article unless that published version is retained separately.

A future design must decide where working and live revisions reside, how shared schemas/layouts/references affect a release, and how the release becomes a validated immutable snapshot. Selectively publishing arbitrary files would weaken our current guarantee. Keep the final publication atomic even if the editorial state becomes more granular.

**Useful proof:** publish one correction while preserving an unrelated live version and its unfinished rewrite; include a changed shared layout and referenced entry in the scenario. This should be designed before scheduling or approval chains.

### 5. Media findability, replacement and focal points

**Value: high. Scope: medium.**

Add media search/filtering, a replace-file operation that retains the media record ID, “used by” locations, optional credit/caption metadata and a focal point used by declared image variants. New binary object keys can prevent stale browser caches while old saved snapshots remain interpretable.

Preserve our per-use, per-language alt text. A single library-wide alt value is not a suitable automatic replacement: an image can have different meaning in different contexts, and our accepted translation contract does not silently fill missing translated alt text.

Separate removing a media record from deleting remote binaries. Determine retention and reference scope before any automatic garbage collection. Browser-generated or build-generated variants can support this increment; an on-demand image service is optional future scope.

**Useful proof:** replace a reused image, verify every current reference, retain crop intent and translated alt values, and prove that preview and generated output choose matching variants.

### 6. A small shared content-query contract

**Value: high for library authors. Scope: medium.**

Provide deterministic helpers for filtering a collection, ordering, limiting, projecting fields and finding incoming references. Concrete uses include “latest three posts,” “products with this ingredient” and “articles by this author.” Reuse the current typed path and projection logic instead of introducing another binding language.

Start as a code API for extensions. Add an editor query-builder only if editors actually need to change the selection rule. Keep bounds, stable ordering and explicit language/publication context. Build pagination routes deliberately; a browser query cannot create missing static pages.

Taxonomy-like behavior can initially use a Categories collection plus references and reverse queries. Add a specialized term workflow only if term creation, archives or hierarchy repeatedly need it. Do not duplicate the entry model merely to achieve feature-list parity.

### 7. A shared route and metadata pipeline

**Value: high for shipped sites. Scope: medium.**

Build on `publicRoutes` so page metadata, canonical URLs, language alternatives, sitemap entries, internal links and explicit redirects use one route inventory. Add site-origin configuration and a reusable SEO object with layout-independent rendering. A canonical or `hreflang` must reflect actual fallback/translation eligibility, not just every configured language.

This is partly our own synthesis from QuineCMS's delivery gaps, not a claim that Statamic core supplies a complete SEO suite. Our public shell currently supplies title, language and fallback `noindex`, while custom head components can add more. Existing decisions explicitly deferred a fuller metadata system.

Redirects need an output contract appropriate to static hosting: a portable manifest with supported host adapters or documented server configuration. HTML-only navigation cannot promise an HTTP 301 on every host.

### 8. Structured long-form content when an editorial site needs it

**Value: high for publishing-heavy sites; lower for brochure sites. Scope: large.**

Introduce a distinct, optional structured document field capable of prose plus a limited set of semantic nodes: quote, image, callout and related content, for example. Reuse existing field editors and renderer definitions where they fit. Keep the persisted representation independent of incidental editor-library state.

Do not migrate every existing Markdown value or treat arbitrary page blocks as valid inline content. Define paste/export behavior, versioned nodes, references, localization and unsupported-node retention first. Our current non-destructive handling of unsupported Markdown is worth keeping. Bard is the behavioral reference, not a reason to switch editor libraries by itself.

### 9. Optional static content/search exports

**Value: medium; demand-dependent. Scope: small to medium for a bounded export.**

Generate selected public JSON and search indexes from the same resolved publication snapshot. This supports small search pages, external widgets and modest headless use without operating an API server. Expose only declared fields and publishable records. Keep an export schema/version and locale metadata.

A full REST/GraphQL service should wait for a real need for runtime queries, remote applications or authenticated content. Statamic's APIs are explicitly read-only delivery APIs, not a general editorial write protocol. [REST](https://statamic.dev/frontend/rest-api), [GraphQL](https://statamic.dev/frontend/graphql).

## Architectural improvements grounded in our source

### A. Compile a lightweight content view per snapshot

Today, `Content` holds arrays. `publicRoutes`, `contextFor`, schema helpers and binding resolution repeatedly look up related records. There is already a memoized incoming-use index in the editor; this is an extension of that pattern.

A small derived view could hold `entriesById`, `collectionsById`, entries by collection, routes, resolved object fields and a typed reference-use graph. Build it once per immutable content version, then derive language/render views as required. Do not mutate persisted records while resolving them.

Use the same view for validation, bindings, listing queries and public generation. This can reduce repeated work and, more importantly, give new features one consistent interpretation of the snapshot. Measure before adding persistent caches or incremental invalidation. A new in-memory index will not remove Git API loading costs or the size of the encrypted admin payload.

**Source:** `src/core/content.ts` (`contextFor`, validation), `src/core/routes.ts`, `src/core/schema.ts`, `src/core/bindings.ts`, `src/editor/App.tsx` (`usageIndex`).

### B. Make field capabilities explicit across contexts

Our `Field` union includes custom fields and block/layout lists, but collection/object schema validation accepts a narrower set. Extension manifests pair a pure validator with a React control, while rendering, reference extraction and listing summaries are handled elsewhere. This is an actual coverage distinction, not a missing plugin system.

As new field behaviors are added, give each field definition a small shared contract for supported contexts, validation, child traversal and reference extraction. Add resolution or summary capabilities only when a real field needs them. Keep browser controls separate from pure code so builds do not depend on React.

Unify semantics where possible without forcing `list` and `array` into one persisted representation. A capability table is preferable to silently accepting a custom widget in a context the validator cannot support.

**Source:** `src/core/types.ts`, `src/core/schema.ts` (`schemaIssues`), `src/core/custom-fields.ts`, `src/editor/widgets.ts`, `src/editor/Fields.tsx`, `scripts/site-workspace.mjs`.

### C. Extend the existing dependency graph

We already track incoming references, defaults, tagged internal links and page/layout uses. Extend this deliberately to media, translated values, rich-text resource links, template dependencies and declared collection queries.

The immediate products are “used by,” accurate deletion guards and impact review. Later, it can inform release selection or incremental builds. Do not assume it is a complete build dependency graph: custom layouts receive broad content and can read arbitrary values, so undeclared dependencies must cause conservative invalidation.

**Source:** `src/core/schema.ts` (`incomingUsage`, `definitionUses`), `src/editor/usage.ts`, `src/core/layout-contract.ts`.

### D. Separate the editing session from screen composition

`App.tsx` currently coordinates navigation, pending creations, languages, preview, connection/recovery, draft validation, uploads and save/publish. Its roughly 1,944 lines are not themselves a defect; the cross-cutting state transitions are the reason to establish clearer seams before adding history or merge UI.

Extract a focused session controller/hook for loaded baseline, working content, source identity, connection status and save/publish/recovery transitions. Keep the existing `RepositoryStore` as the transport boundary. Move document commands into pure operations when reused. Screens should ask for operations and render outcomes.

Do this while delivering a relevant feature, not as a broad rewrite or a requirement to add a new state-management framework. Retain the pending-parent Create/Cancel contract and browser Back behavior.

**Source:** `src/editor/App.tsx`, `src/editor/recovery.ts`, `src/integrations/repository.ts`, `tests/editor-save.test.ts`, `tests/editor-submission.test.ts`, `tests/editor-navigation.test.ts`.

### E. Bound public rendering context

`contextFor` already projects declared collection values, which is good. It also carries all media and collection entry identities/titles/URLs. For interactive blocks, that broad context can become repeated public payload. There is no benchmark here establishing a current bottleneck.

Extend the current declaration mechanism so a renderer can request the data it actually consumes. Keep a compatibility path for existing libraries and measure generated bytes on a realistic multi-block site. Future preview modes and JSON/search exports should reuse the same publication/language projection rules.

This becomes essential if unpublished records or private fields are introduced. Data filtering must happen before serialization; hidden editor controls are not a data-exposure boundary.

**Source:** `src/core/content.ts` (`contextFor`), `src/core/types.ts` (`Context`, `collectionField`), `src/editor/Island.tsx`, generated renderer contracts in `scripts/generate-blocks.mjs`.

### F. Treat multi-user authorization as a separate architecture decision

Statamic enforces resource/action permissions in server-side policies. QuineCMS's decrypted admin delivers shared Git and optional R2 credentials to the editor. Everyone who can unlock it can obtain those capabilities. Adding role-based menus would not enforce separate edit/publish permissions. [Statamic entry policy](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Policies/EntryPolicy.php), [our credential boundary](../features/admin-encryption.md).

If client demand requires individual revocation, approval enforcement or separate publisher permissions, introduce an optional trusted authorization boundary with appropriately scoped provider operations. It can coexist with static public delivery, but it changes the admin operating model. Keep that explicit rather than quietly turning the default installation into a hosted service.

Before realtime collaboration, a more suitable improvement is better conflict review. Use base/ours/latest record comparisons, merge only demonstrably independent changes, and show conflicts for shared schemas, row ordering and translated structure. Continue requiring source compatibility and atomic saves. This needs its own design and tests; it is not implied by this review.

### G. Improve upgrades through inspection and reproducible examples

Keep manual pinned upgrades. Add clearer diagnostics for unsupported field/block/layout versions and missing extension capabilities, plus a dry-run compatibility report for a proposed pin change. A report can enumerate issues without promising migration or modifying client content.

Maintain small fixture-backed examples of a custom field, a collection-backed block, a typed link, a translated layout and a source-compatible upgrade. Package these as documentation/authoring examples without re-bundling sample sites into the engine. Statamic's inspectable extension contracts are a useful model for developer experience; its service-container flexibility need not be reproduced.

## Features to defer or adapt

| Candidate | Recommendation and reason |
| --- | --- |
| Database persistence | Defer until measured content volume or integration requirements justify it. Preserve a small read-model boundary without implementing imaginary backends. |
| Full GraphQL service | Defer; try explicitly versioned public exports first. |
| Realtime presence/field locking | Defer until identity, editorial state and actual simultaneous editing needs are settled. A local tab lock would not equal multi-user collaboration. |
| Native forms/submission inbox | Prefer service adapters. Storage, spam controls, mail delivery and submission permissions are an operating commitment. |
| Scheduled publication | Valuable later, but requires a dependable scheduled build/deploy actor for a static site. A stored timestamp alone does not update already deployed HTML. |
| Arbitrary polymorphic/nested schemas | Add only for a proven authoring need. Existing depth and cycle limits intentionally contain complexity. |
| First-class taxonomy subsystem | Begin with collections/references and reverse queries; add specialized workflow only where useful. |
| Large addon marketplace | Improve manifests, examples, compatibility checks and extension contracts first. |
| Statamic-style data cascade | Keep explicit resolution and our accepted whole-item language fallback. Do not introduce surprising field-by-field inheritance. |
| Automatic translation freshness tracking | Already declined in DEC-201. This research does not reopen it. |
| Automatic migrations or library overrides | Outside accepted architecture. Better reports and documented manual upgrades fit; copied engine/library files do not. |

## Suggested sequence

1. **Everyday editing:** common link field and collection search/sort. Add narrow shared indexes/resolvers as needed.
2. **Authoring contracts:** instructions/grouping/validation plus explicit field capability coverage. Keep changes small and reuse current controls.
3. **Delivery quality:** shared route/metadata output and media replacement/usage/focal behavior, with library examples consuming them.
4. **Publication confidence:** publish-time changed-record review, navigable validation and saved-record restore. Preserve existing snapshot publication.
5. **Content-heavy site support:** limited query helpers, optional structured articles and build-generated search, prioritized by a real site.
6. **Team workflows only when required:** design independent working/live revisions and optional trusted authorization before approvals, scheduling or realtime collaboration.

This order favours immediately visible improvements while creating the shared resolution and reference machinery needed for larger editorial features. The principal lesson from Statamic is to finish workflows across the whole system, rather than continually introduce new content nouns.

## Evidence map for implementation planning

| Finding | QuineCMS source to revisit | Statamic source or documentation |
| --- | --- | --- |
| Working snapshots vs independent editorial revisions | `src/core/types.ts`, `src/integrations/repository.ts`, `src/editor/App.tsx` | [Revisable](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Revisions/Revisable.php) |
| Basic entry list | `src/editor/App.tsx`, collection list rendering | [Preferences](https://statamic.dev/control-panel/preferences) |
| Narrower collection field support | `src/core/schema.ts`, `src/editor/SchemaFieldEditor.tsx` | [Fieldtype](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Fields/Fieldtype.php) |
| Existing typed references and usage graph | `src/core/schema.ts`, `src/core/bindings.ts` | [Relationship fieldtype](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Fieldtypes/Relationship.php) |
| Existing link model, incomplete general authoring coverage | `src/core/types.ts`, `src/core/content.ts`, `src/editor/Navigation.tsx` | [Link field](https://statamic.dev/fieldtypes/link) |
| Raw storage vs resolved rendering | `src/core/content.ts`, `src/core/bindings.ts`, `src/core/languages.ts` | [Value](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Fields/Value.php) |
| Repeated lookups and derived indexes | `src/core/routes.ts`, `src/core/schema.ts`, `src/core/content.ts` | [Entry repository](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Stache/Repositories/EntryRepository.php) |
| Core metadata boundary | `src/layouts/Public.astro`, `src/core/routes.ts`, layout head components | Our synthesis; see [open questions](open-questions.md) for deferred SEO work. |
| Media lifecycle | `src/core/types.ts`, `src/integrations/media.ts`, `src/editor/MediaField.tsx` | [Assets](https://statamic.dev/frontend/assets) |
| Restricted Markdown and media embeds | `src/editor/RichText.tsx`, `src/core/markdown.ts`, `src/core/embeds.ts` | [Bard](https://statamic.dev/fieldtypes/bard) |
| Source compatibility and non-forced transactions | `src/integrations/github.ts`, `src/integrations/gitlab.ts`, `src/integrations/repository.ts` | [Git integration](https://statamic.dev/control-panel/git-automation) is a different model. |
| Shared credential authority | `src/admin/crypto.ts`, `src/pages/admin/index.astro`, `scripts/admin-build.ts` | [Entry policy](https://github.com/statamic/cms/blob/ccb6fc46af6bde9f9c9237036076d1d6b29afb02/src/Policies/EntryPolicy.php) |

No roadmap items have been accepted merely by appearing in this report. For current product commitments, use [Decisions](../decisions/index.md) and the [feature map](../features/index.md).
