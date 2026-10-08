---
title: Architecture and product breadth review
updated: 2026-10-07
status: Analysis and proposals; no new product decisions
---
# Architecture and product breadth review

Subsequent direction, 2026-10-07: the user confirms the prototype is not in use or production and explicitly permits breaking existing promises or completely redesigning it (DEC-109). The preservation-first priority below is historical advice, no longer a requirement. The current focus is [relations and objects](relations-and-objects.md).

The user requested a fresh assessment of features, collection schemas, architecture, maintainability, and the ability to support different site structures and presentations. This is a source-based review, with current primary-source competitor research and a fresh automated baseline. Recommendations below are proposals, not authorization to change accepted behavior. The [journal](../journal/2026-10-07-architecture-review.md) records the scope and verification.

## Assessment

The underlying stack is a reasonable foundation for developer-built, client-edited content websites. Astro, React, JSON records, Git, and R2 are not the main obstacle to greater variety. The current product abstractions are the constraint: a flat section list, a small field model, shallow bindings, one entry template per collection, one site wrapper, and a few specialized collection consumers.

Today this is best described as a curated section builder with a small Git-backed CMS. It can already support quite elaborate custom visuals through developer-authored blocks, as the chartr work demonstrates. That does not establish that editors can express varied information architectures with the existing schemas and controls. A developer can always put more code inside a block; repeated reliance on that escape hatch increases implementation and maintenance work per client.

The highest-value next investment is a small set of reusable content and composition capabilities. More hero, bento, and testimonial variants would expand the catalog without addressing those underlying limits. Keep the working stack and evolve the contracts in bounded increments.

## What is worth preserving

- Content identity is independent of URLs through stable record IDs and filenames.
- Entries are separate from their presentation. A collection template can serve many records, and compatible collections can share it.
- JSON and Git provide inspectable content, atomic changes, history, and ownership without an always-running CMS.
- Preview and published blocks normally share rendering source. Activation can be omitted for static blocks.
- Incomplete drafts and publication validation are separate. The Git implementation handles stale saves, non-fast-forward protection, and ambiguous network responses deliberately.
- Layout and block versions are selected explicitly. The intended retention contract is valuable, although its implementation boundary needs strengthening.
- Styling is scoped, container queries are already used in the principal themes, and runtime/build checks verify sharing. The same-document preview has been treated as a real engineering constraint.

The fresh baseline passed type checking, all 132 tests in 18 files, the production build, and emitted-asset checks. Seven routes were built including admin. The Journal index and its two entry pages have zero reachable JavaScript modules under the committed Starter selection. This is evidence that the existing bounded model works, not a scale or live-provider certification.

## Where the model becomes restrictive

### 1. Collections cannot represent ordinary relationships

`src/core/types.ts:26` defines scalar fields, media, and lists. Collection validation in `src/core/content.ts:518` permits one list level but no object/group or entry-reference fields. The block-only `collection` field selects a collection; it is not an entry relation. `Link` can reference page/entry IDs, but that type is not a general collection field.

Consequences include duplicated author details across posts, unstructured category strings, copied office/location data, and ad hoc related-content lists. A location with an address and opening-hours rows cannot use a reusable address object. More elaborate product or event structures quickly become large flat schemas. Shared templates also require matching field keys across collections, which encourages shaping content around the presentation.

Propose single references and multiple references, constrained object fields, and reusable field-group definitions first. References should store stable entry IDs, declare allowed target collections, validate missing targets, and support reverse-usage inspection before deletion. Bound traversal and detect cycles where recursive resolution is allowed. Do not expand immediately into arbitrary recursive models.

A useful proof model is:

```text
Article
  title, slug, summary, body
  author -> Author
  categories -> Category[]
  relatedArticles -> Article[]
  seo -> reusable SEO object

Location
  name
  address -> reusable Address object
  openingHours -> structured rows
  services -> Service[]
```

These features can be resolved at static build time. They do not inherently require a database or a persistent server. Astro itself documents collection references and build-time queries; its Content Layer could be an implementation aid, but it would not replace this product's browser-editable schema and validation contract. [Astro content collections](https://docs.astro.build/en/guides/content-collections/).

### 2. Content retrieval is coupled to a particular card design

`src/core/content.ts:113` constructs context for every block. It recognizes the literal prop names `titleField`, `summaryField`, `imageField`, and `dateField`, then projects those values for one selected collection. `src/themes/tailwind/Blog.tsx` takes the first entries up to a limit. It has no explicit query sorting, filtering, pagination, or current-entry relation semantics.

A jobs block needs salary and location; an events block needs a start time and speakers; a directory needs filters. Each currently needs special integration work. The core should not need to know every presentation's field names.

Propose a declarative collection-query contract with collection, filters, deterministic ordering, limit, selected IDs, and named field mappings. Start with equality, references, date/number comparisons, and a stable ID tie-breaker. Add pagination and current-entry filters as actual sites require them. Separate resolving a query from drawing its cards. A grid, list, carousel, and related-content panel should consume the same resolved shape.

`src/core/bindings.ts` currently reads only `values[source]`, while `Block.bindings` maps strings to strings. Lists require compatible child keys. A later typed binding should identify its source context and field path, and optionally map list-item fields. Keep authoring to pickers and safe operations; executable expression strings in content would create a different product and risk model.

### 3. Static/generic block duplication multiplies maintenance

The static and generic `tw-hero-1` renderers are identical thin wrappers around the same theme renderer, but have separate registered definitions. The same pattern recurs across the 27 generic counterparts. Static and generic pages have different authoring purposes; that does not require maintaining two independently authored implementations of each visual component.

The strict kind split also prevents placing an ordinary static-only collection/query block on an entry template. An article template with fixed introductory content, entry-bound body, and a related-article list becomes harder than it needs to be.

First deduplicate definition authoring and common renderer contracts while preserving existing IDs and kind restrictions. A subsequent product proposal could expose blocks according to supported data capabilities and allow literal and bound inputs on one component. That would revise DEC-059/DEC-060/DEC-083 and must be discussed as such. Do not silently relabel or remove retained block IDs.

### 4. Composition has too few levels

`Page.blocks` is an ordered flat array. The site layout receives one children slot. Existing blocks can contain complicated internal markup, but editors cannot compose independent registered blocks into a reusable two-column section, tab panel, article sidebar, or named region. List rows are data, not reusable nested components.

This creates pressure to implement a new giant block for every combination. A growing library then becomes a catalog of combinations rather than reusable parts.

Propose limited, author-defined slots: for example `ArticleLayout(main, aside)`, `SplitSection(left, right)`, and `Tabs(items)`. Authors own responsive behavior; the editor inserts permitted content into meaningful regions. Bound nesting depth and retain stable instance IDs. Structural constraints should follow slot semantics, never which visual theme a block follows. Keep DEC-108's dedicated navigation levels for nested editing.

A further useful distinction is a reusable preset, which copies starting content, versus a shared section, whose edits update all references. The current shared header/footer does not provide general reuse for an announcement or contact CTA on many pages. That distinction should be explicit before adding a reuse feature.

### 5. One global layout is workable; a missing page-template layer is the problem

There is no first-class page archetype or route context in `src/core/layout-contract.ts:5`: layout props contain the entire content set and children, but no selected page, entry, collection, route, or locale. The same global wrapper surrounds marketing, article, documentation, and campaign pages.

A site commonly needs one brand system with several structures: marketing navigation, documentation sidebar, narrow article body, and a campaign page with reduced chrome. This should not require unrelated site layouts or page-path checks scattered through custom code.

Retain one selected Site Layout and introduce optional page templates or named regions within it. Pass a consistent render context containing route, page, optional entry/collection, and eventually locale. A collection can keep its default template; conditional sections and controlled template variants could handle different presentations without duplicating the entire collection. Per-entry overrides would be a separate decision, not an assumed requirement.

This evolution can preserve schema-only entries. Content variation is possible through typed fields and conditional presentation without restoring arbitrary entry-level page composition. If long-form editorial content later needs quotes, galleries, callouts, or embeds in variable order, evaluate a separate constrained rich-content field. Do not force every entry back into the page builder or replace ordinary Markdown unnecessarily.

### 6. URL paths are not an information architecture

`src/core/routes.ts` produces explicit static paths and collection-prefix-plus-slug entry routes. Static paths can contain multiple segments; there is no content-parent hierarchy, tree ordering, breadcrumbs, or nested entry relationship. A data-only collection still requires a path, and its entries still require slugs. Publishing, data modeling, and route identity are partly bundled together.

Documentation trees, product families, category archives, locale variants, and structured directories need more than path strings. Propose explicit route context, optional hierarchy where needed, and redirect history. Keep navigation trees distinct from content hierarchy: a site can have several menus and they need not mirror its URL tree.

The stable-ID link foundation is also applied inconsistently. Newer header, footer, CTA, and chartr controls use plain URL fields (`src/core/header.ts`, theme definitions). Renaming an internal page preserves ID-based links but can break those raw paths. Make an internal-or-external link field reusable across schemas, block controls, and layouts, and inspect incoming uses when changing/deleting targets.

### 7. Schema safety currently means preventing evolution

`schemaChanges()` intentionally rejects destructive changes to populated field keys/types. That is appropriate protection, but there is no schema revision on a collection or entry, no reference-aware rename operation, and no controlled migration path. `formatVersion: 1` is a file envelope, not a history of each content model. A long-lived site will eventually need to split a field, normalize authors, or restructure repeated data.

Propose explicit schema revisions and developer-run transformations with dry-run diffs, validation, backups, and one atomic commit. This is distinct from automatic block upgrades, which were rejected. Portal edits can remain conservative. Stable field identities or explicit rename maps deserve consideration before richer bindings make key changes expensive.

Schema interpretation is currently repeated in the type union, content validation, recovery shape validation, form controls, schema editor, and list/binding helpers. Establish a shared field definition/validation layer and generated types where practical; keep deliberately tolerant recovery separate from publication rules. Add new types through a defined extension contract rather than growing unrelated switches indefinitely.

## Engineering risks behind the feature limits

### Retained versions need a stronger boundary

`src/blocks/tw-hero-1/v1/View.tsx` imports `src/themes/tailwind/Hero.tsx`. That renderer, shared helpers, and `theme.css` are unversioned. The Starter v1 layout also imports shared unversioned theme and site components. A versioned entry directory therefore does not freeze its rendered behavior. Adding a future v2 while changing a shared helper could silently alter existing v1 sites.

There is a more specific dispatch issue: `src/site-layouts/starter/v1/View.tsx:20` extracts a footer variant from `tw-footer-[123]` and calls the shared `Footer` directly. It does not dispatch through the selected footer's registered type and version. This works for today's three variants but will not honor an independently implemented newer footer renderer or another registered footer family.

Version shared theme implementations/assets as a compatibility unit, or enforce an explicit backward-compatibility policy with regression fixtures. Route embedded/footer blocks through a version-aware renderer. Include dependent helpers/styles in upgrade review. All retained code also shares the root dependency versions: an incompatible old dependency range can block a whole build. Retention promises need supported runtime/API compatibility and deliberate maintenance of older code, not only additional folders.

### Whole-content work grows with the site

- Every generated route calls `loadContent()`, which walks, parses, and validates the complete content directory again (`scripts/generate-blocks.mjs:180`, `src/core/load.ts`). Without caching, route growth multiplies content-loading work.
- `contextFor()` repeatedly scans pages, collections, entries, and media for each block. It passes every collection's title/URL summaries and all media metadata even to consumers that do not need them.
- An activated layout receives the entire `Content` object through `client:load` (`scripts/generate-layouts.mjs:93`). Chartr is such a layout. That makes the whole record set eligible for client serialization on each route using it, even for a small header interaction. The committed baseline uses Starter, so this review did not measure a Chartr-layout payload build.
- `GitHubStore.read()` makes one blob request per content file in batches of eight. Save then rereads the whole saved snapshot, and Publish also reads main. Nine fixture records cannot establish acceptable behavior for thousands of files.
- The editor serializes the whole current and baseline content to compute dirty state on render, then writes recovery including the snapshot/content to synchronous session storage (`src/editor/App.tsx:271`). This is likely to affect typing and recovery capacity as records grow; no scale threshold was measured here.

Propose an indexed content graph built once per snapshot, memoized query projections, a minimal public render payload, and a separate editor context. Track changes per record, debounce/checkpoint recovery, and cache Git blobs by SHA. Measure 100, 1,000, and 10,000 representative entries before selecting supported limits or replacing Git. A future search index, browser filtering, or external search service should be selected by measured data size and interaction needs.

Data-only is not private: the admin build serializes its initial main-branch content, and hydrated layouts may also serialize records. This is consistent with the explicitly accepted static convenience gate, but it makes the present system inappropriate for private operational records. A reference field must not be presented as a private-data capability.

### Core, editor, and plugins have weak module boundaries

`src/editor/App.tsx` is 1,534 lines and coordinates content, navigation, provider connection, persistence, recovery, media, schema editing, and publication. `src/core/content.ts` is 783 lines spanning storage encoding, links, context projection, field validation, document validation, and schema changes. Size alone is not a defect; the mixed responsibilities make adding new capabilities riskier.

The core imports generated layout policies, and Starter's policy imports core content helpers. Theme helpers also import that core module. This couples model validation to the complete installed layout registry. Move pure field/content operations below plugin registration, and inject policy/renderer registries at application/build boundaries.

Separate editor state and record operations, content indexing/querying, schema validation, route planning, render resolution, and repository transport. Keep this a modular codebase rather than introducing services. A small author SDK should describe fields, data dependencies, preview lifecycle, semantic markup, responsive behavior, and compatibility expectations.

Multi-framework support is accepted and works in the checked fixtures. It remains an ongoing adapter, dependency, hydration, and preview test burden. Retain it, while using a documented default authoring path for new library blocks. Framework choice itself does not increase the schemas or compositions available to editors.

The generated Astro files and custom CSS-asset preservation plugin serve real purposes. They also add upgrade sensitivity, and recent journals already record a development-server restart issue after generation. A compilation phase that validates/indexes once and emits a route plan would simplify the boundary. Evaluate a small number of dynamic Astro route templates with statically analyzable renderer imports before replacing the current generator; do not sacrifice route-specific bundles merely to remove generated files.

### Publishing is safe at the commit boundary but coarse at the editorial boundary

The shared draft branch is deliberately atomic. It also means an incomplete unrelated entry can prevent publication of a ready page. Editors cannot independently schedule or release content items. Concurrent edits to separate records still encounter the branch-level stale-save boundary. A code change on main can require developer synchronization with draft; source-fingerprint checks correctly prevent an old editor from publishing against different source, but increase this operational coupling.

Keep the simple workflow for small sites. Before supporting a team, consider explicit release groups or per-entry workflows, dependency checks for included schemas/references/media, an actual-content deployment preview, and a clear deploy outcome. Selecting only some files without following dependencies is not a safe publish feature.

The current UI correctly says that Git publication leaves deployment pending. The review found no live GitHub/R2/Netlify evidence; tests use mocked transports. Direct GitHub tokens and runtime R2 credentials also impose onboarding and permission-management work on nontechnical owners. An optional hosted authorization/upload integration could address that later, but would revise the intentionally serverless operating model and should follow a demonstrated client need.

### Routine website capabilities are still thin

The shared public shell has a title and fixed `lang="en"`; Chartr adds a layout-level description. There is no common per-page/entry SEO contract, canonical/alternate links, redirect management, sitemap generation, or localization model. These should belong to route/content presentation metadata rather than each visual theme having to invent them. They matter sooner for client websites than dozens of new section designs.

The upload pipeline creates image variants, but `src/themes/tailwind/shared.tsx` and `src/core/markdown.ts` render the original image without responsive variants or intrinsic dimensions. The dedicated media block already supports them. Use a shared image resolver/component for appropriate `srcset`, `sizes`, dimensions, alt text, and loading priority; hero images should not inherit a universal lazy-loading rule.

The schema and content editors also need eventual search/filter/sort, duplication, bulk operations, useful summaries, and a way to inspect actual rendered entries. Generic previews currently show placeholders by accepted decision, so real-entry preview is a proposed extension. A type-aware binding picker could improve the existing name-based contract immediately without changing stored strings. Reusable page/section presets and reference usage information will reduce client errors more than another catalog of visually similar blocks.

## What other systems offer that is worth adopting

These are researched patterns, not a claim of feature parity or a proposal to reproduce whole products. CMS examples supplement visual builders because the main content-model questions overlap.

| System | Verified pattern | Useful adaptation here |
| --- | --- | --- |
| Webflow | Reference/multi-reference collections, nested collection lists, component properties and slots | Typed relations, one reusable renderer with different data inputs, and controlled composition. [Lists](https://help.webflow.com/hc/en-us/articles/33961268936851-Nest-Collection-lists), [components](https://help.webflow.com/hc/en-us/articles/33961303934611-Components-overview), [slots](https://help.webflow.com/hc/en-us/articles/33961195339923-Slots). |
| Framer | CMS detail-page conditionals and variants; visitor filters connected to CMS fields with pagination support | Optional sections, controlled template variation, and a reusable query/filter layer. [Detail pages](https://www.framer.com/help/articles/how-to-create-flexible-cms-detail-pages/), [filters](https://www.framer.com/help/articles/how-to-add-dynamic-filters/). |
| Shopify | JSON templates, sections, and reusable/nested theme blocks | Developer-defined structures with bounded editor freedom; distinguish site shell, page template, section, and child block. [JSON templates](https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates), [blocks](https://shopify.dev/docs/storefronts/themes/architecture/blocks). |
| WordPress block themes | Templates, template parts, and insertable patterns | Separate reusable page structure, shared surrounding content, and copied starting compositions. [Theme structure](https://developer.wordpress.org/themes/core-concepts/theme-structure/). |
| Storyblok | Content types and nestable/universal blocks, with fields for constrained child blocks | A controlled component tree instead of a flat catalog of combinations. [Modeling](https://www.storyblok.com/docs/concepts/content-modeling), [fields](https://www.storyblok.com/docs/concepts/fields.html). |
| Sanity | Objects, arrays of inline objects/references, and explicit schema/content migration tools | Richer reusable models and safe long-term evolution. [Arrays](https://www.sanity.io/docs/studio/array-type), [migrations](https://www.sanity.io/docs/content-lake/schema-and-content-migrations). |
| Decap CMS | A Git editorial workflow creates a branch/pull request per unpublished entry | Evidence that Git storage need not imply one shared release unit. Adopt only if multiple editors/releases justify the added complexity. [Editorial workflow](https://decapcms.org/docs/editorial-workflows/). |

These products also have constraints. For example, Webflow documents restrictions around slots and nested collection lists, and Shopify bounds sections/blocks. The useful lesson is to choose expressive primitives with clear limits; unlimited nesting and an unrestricted canvas are not prerequisites for a flexible builder.

## Proposed target architecture

Keep JSON as persisted content and Astro as the public renderer. Introduce clearer layers incrementally:

```text
Schemas + content records + media + site settings
                    |
       Validation + indexed content graph
                    |
   Route context + template selection + data queries
                    |
       Resolved page / slots / typed block props
                    |
          Versioned rendering implementations
               /                    \
       Static Astro output      Interactive preview

Editor operations -> changed records -> Git save/release adapter
```

This is a proposed internal separation, not a mandate for separate packages or services. Persisted records remain simple. Public rendering receives only resolved data needed by the route. Editor controls retain access to broader content through a separate API. Reference/route/query indexes make validation, impact analysis, and preview use the same resolution rules.

Preserve one active Site Layout, optional style-variable adoption, developer-installed implementations, explicit retained versions, and dedicated nested editing levels. Do not add style-adherence badges or force blocks into a universal visual design system. A documented optional token vocabulary and authoring helpers can improve consistency without restricting independent blocks.

## Priorities and proof cases

| Sequence | Work | Evidence of success |
| --- | --- | --- |
| First: protect existing behavior | Fix renderer/version boundaries, consistent internal links, common image output, explicit route context; split pure model helpers from plugin registration | An installed newer theme/block does not alter a pinned older fixture; renaming a page preserves typed links; images use recorded variants. |
| Next: increase content expressiveness | References, constrained objects/reusable groups, typed binding discovery, declarative queries, actual-entry preview proposal | An author/profile/category change flows to articles and related-content cards without copied fields or core card-specific logic. |
| Then: broaden composition | Page archetypes within the active layout, named slots, conditions, presets/shared sections | Marketing, article, docs, and campaign structures coexist in one site with ordinary records and a small reusable component set. |
| Before expanding client volume | Schema evolution tooling, measured scale limits, record-level state/recovery, cached reads, provider integration checks, repository/library release strategy | A populated site upgrades safely; large fixtures remain usable; a real disposable provider workflow passes. |

Add the shared SEO/route metadata foundation early alongside routing and links. Plan locale identity before adopting it in production; full translation workflows can wait for a real requirement.

Use three deliberately different reference sites to test proposed contracts: a publication with authors/categories/related articles, documentation with a tree and sidebar, and a directory with locations/services/filtering. Include a marketing/campaign page in the same site to test shell variation. A corporate services site with industry/service cross-links is another useful relationship fixture. The objective is to assemble these from the general contracts, recording every core change needed. A bespoke full-page block passing the demo is not evidence of a general model.

Benchmark increasing record counts and measure build time, initial editor load, keystroke latency, recovery size, Git request counts, and public serialized bytes. Add contract tests and browser scenarios around these new boundaries rather than multiplying tests that merely assert source strings.

Live commerce, user accounts, bookings, permissions on private records, and transactional inventory require external runtime capabilities. Keep those as explicit integrations if needed. Supporting many public content structures is a realistic goal for this stack; treating every web application as a static content record is not.

## Decisions that a redesign must revisit explicitly

DEC-022/DEC-090 bound schema structure; DEC-059/DEC-060/DEC-083 establish static/generic block distinctions; DEC-061 and following decisions establish collection template assignment; DEC-069 selects placeholder previews; DEC-007/DEC-018/DEC-044 establish shared draft/publication behavior. Richer schema types, broader bindings, actual-entry preview, and release granularity would extend or revise those decisions. Changes to credential handling would revisit DEC-011/DEC-012/DEC-021.

DEC-038/DEC-107 already require retained implementation versions, so repairing version dispatch and its dependency boundary supports existing behavior. Named page regions may fit within the single active layout, but their authoring behavior still needs definition. Automatic block migrations, per-block design panels, style-based compatibility gates, and arbitrary entry block editing are not inferred from this review.

No new DEC IDs have been assigned. The unresolved questions are linked in [open questions](open-questions.md).
