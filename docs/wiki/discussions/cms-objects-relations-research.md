---
title: CMS research — objects and relations
updated: 2026-10-07
status: Research record; subsequent selections recorded separately
---
# CMS research — objects and relations

Subsequent selection: the user chooses a lean Sanity-style model as DEC-128. See the [selection journal](../journal/2026-10-07-lean-sanity-model.md) and [current plan](content-model-plan.md). The comparison below preserves the evidence and assessment that informed that choice; broader vendor features are not automatically adopted.

## Refreshed comparison — collection schemas and relations

The user requests a broader tabulated comparison after the nesting reconsideration. Official documentation was checked again on 2026-10-07, adding TinaCMS to the earlier six systems. No comparative installations, editor trials or benchmarks were performed. Suitability judgments below are the assistant's assessment against DEC-110–DEC-127 and our Git-backed architecture, not new accepted choices.

**Sanity is the closest conceptual match for our content model. Keystatic is the closest storage/workflow reference.** Payload is an especially useful collection/field API reference. This recommends design ideas for our builder, not adoption of another CMS backend.

| CMS | Collection schemas and owned structures | Relations | Fit with our builder — assessment |
| --- | --- | --- | --- |
| Strapi | Collection types and Single types; reusable Components supply owned structures. The visual schema builder is development-only; model schemas use JSON files. [Builder](https://docs.strapi.io/cms/features/content-type-builder), [models](https://docs.strapi.io/cms/backend-customization/models). | Explicit cardinalities and optional paired inverse fields. The Builder's relation target must be a collection type. [Relations](https://docs.strapi.io/cms/backend-customization/models#relations). | Good vocabulary and schema-editor reference; database/application schema changes differ from our editable schema records in Git. |
| Sanity | JS/TS document types describe independent records; named object types and arrays describe reusable owned structures. [Schemas](https://www.sanity.io/docs/studio/schemas-and-forms), [objects](https://www.sanity.io/docs/studio/object-type). | Document-ID references; arrays for many; configurable target types. Strong references prevent target deletion. Reverse queries are available. [References](https://www.sanity.io/docs/studio/reference-type), [joins](https://www.sanity.io/docs/specifications/groq-joins). | Closest conceptual data model. Its hosted Content Lake and document publication workflow differ from our shared Git snapshot. |
| Payload | Each Collection config defines fields; Globals describe single documents. Groups and Arrays compose structures; definitions can be reused through code. [Collections](https://payloadcms.com/docs/configuration/collections), [Globals](https://payloadcms.com/docs/configuration/globals), [fields](https://payloadcms.com/docs/fields/overview). | Relationship fields configure one/many values separately from allowed collections. Join fields expose reverse relationships without storing a second copy. [Relationships](https://payloadcms.com/docs/fields/relationship), [Join](https://payloadcms.com/docs/fields/join). | Close field/collection mechanics; schema-as-code and a database-backed runtime differ from our schema-as-data design. |
| Directus | Collections are database tables plus metadata, managed through Studio or APIs; singleton mode opens the item editor directly. [Collections](https://directus.com/docs/guides/data-model/collections). | Foreign keys, virtual inverse fields, many-to-many junction collections and many-to-any targets. [Relationships](https://directus.com/docs/guides/data-model/relationships). | Strong relational modeling reference. Table/junction machinery would complicate ordinary owned JSON values in our builder. |
| Keystatic | Code-defined Collections and Singletons map to repository files; Object and Array fields compose structures. [Collections](https://keystatic.com/docs/collections), [Singletons](https://keystatic.com/docs/singletons), [objects](https://keystatic.com/docs/fields/object). | References store a collection-entry slug; arrays provide multiple selections. Slug changes do not update references. [Relationships](https://keystatic.com/docs/fields/relationship). | Closest file/Git reference. Preserve our stable IDs rather than copying slug identity. |
| TinaCMS | Code-defined collections map to repository paths; fields/templates and repeatable objects describe content. Current global collections provide a single-document editing shortcut. [Modeling](https://tina.io/docs/schema), [Collections](https://tina.io/docs/reference/collections). | References target specified collections; GraphQL exposes linked documents. [References](https://tina.io/docs/reference/types/reference). | Strong Git and visual-editing comparison, with an indexed backend beyond our static browser/Git design. [Backend](https://tina.io/docs/self-hosted/overview). |
| Storyblok | Content-type blocks define stories; nestable blocks define embedded pieces; universal blocks support either role. [Blocks](https://www.storyblok.com/docs/concepts/blocks). | Story references use UUIDs, with explicit delivery-API resolution. [References](https://www.storyblok.com/docs/concepts/references). | Useful visual block-authoring reference; story/block composition is broader than our schema-only entries and separate templates. |

### Important distinctions

**One selection does not imply exclusive one-to-one ownership.** Our Article.author selects one Author while many Articles can share that Author. Payload's field multiplicity and Sanity's references are closer to this behavior than exposing every SQL cardinality as an editor choice. [Payload relationship configuration](https://payloadcms.com/docs/fields/relationship).

**Definition reuse does not share content values.** Sanity objects and Strapi components resemble our reusable SEO structure; independent referenced entries resemble a shared Author. The component's internal database representation does not make it an independently managed content entry. [Sanity objects](https://www.sanity.io/docs/studio/object-type), [Strapi components](https://docs.strapi.io/cms/features/content-type-builder).

**Singleton features differ.** Current Sanity Studio docs introduce a dedicated singleton registry from v6.17.0; older custom-structure recipes are not the full current story. Tina's `ui.global` opens a document directly, but falls back to a list for zero or multiple documents. Our accepted single-entry mode also prevents extra entries. [Sanity singletons](https://www.sanity.io/docs/studio/structure-builder-cheat-sheet), [Tina globals](https://tina.io/docs/reference/collections).

**Reverse views need not duplicate relationships.** Payload Join, Directus reverse aliases and Sanity reference queries derive the other side. Our admin usage index can follow that principle while keeping reverse template lists outside scope. [Payload Join](https://payloadcms.com/docs/fields/join), [Directus relationships](https://directus.com/docs/guides/data-model/relationships), [Sanity joins](https://www.sanity.io/docs/specifications/groq-joins).

**Strong-reference integrity differs from full schema validation.** Sanity's custom schema validation runs in Studio rather than on every Content Lake API write. Keep our own structural and complete publication-snapshot checks for Git/import paths. [Validation boundary](https://www.sanity.io/docs/content-lake/schema-validation-and-the-content-lake).

**Git-backed is not synonymous with a fully static admin.** Keystatic's documented GitHub deployment needs Node API routes. Tina uses a cloud or self-hosted backend with an indexed data layer. Both remain useful references without matching our browser-driven GitHub SDK workflow exactly. [Keystatic deployment](https://keystatic.com/docs/github-mode), [Tina backend](https://tina.io/docs/self-hosted/overview).

### Recommended adaptation

| Part of our design | Strongest reference | Adaptation |
| --- | --- | --- |
| Entries versus owned objects | Sanity | Independent entries have identity; owned objects share definitions but retain local values. |
| Stable references and deletion integrity | Sanity | Keep IDs separate from slugs/routes and check incoming usage against the publication snapshot. |
| Collection fields and multiplicity | Payload | Compose fields and configure target/multiplicity independently, retaining one target collection per field. |
| Repository content | Keystatic | Retain file-based content and Git history with our own persistence/publication workflow. |
| Schema administration | Strapi | Separate structure editing from content editing, while storing our schemas as editable data. |

For the collection/schema/relation question, **Sanity is the primary conceptual reference**. Payload informs field machinery; Keystatic informs storage. Sanity's document types correspond conceptually to our collection schemas, although its dataset and Studio lists are not literally our collection records.

Our agreed three-level cap, nonrecursive definitions, one shape per list, single target collection, selection-only controls and admin-only reverse lookups remain intact. This comparison does not reopen those choices or propose a general query language. Our editable JSON schemas are a distinct engineering requirement: code-defined schemas in several compared systems do not directly provide that workflow.

## Earlier research and interview history

The sections below preserve the research and proposals preceding Q77–Q81. The refreshed comparison above is the current suitability assessment; accepted behavior is in the [consolidated plan](content-model-plan.md).

Subsequent outcome: [Q77–Q81](../journal/2026-10-07-relations-and-objects-round-one.md) originally select named/inline objects, one-level structures, one target collection per relation field, one shape per list, and blocking referenced-entry deletion (DEC-110–DEC-114). [Q93 later accepts three owned levels](../journal/2026-10-07-nesting-round-one.md) as DEC-126; [Q94 excludes recursive owned definitions](../journal/2026-10-07-nesting-round-two.md) as DEC-127. The recommendations below preserve the research stage; mixed types were not selected. See the [current design discussion](relations-and-objects.md).

The earlier review compared builders broadly; it did not sufficiently study these modeling choices before Q77–Q79. This research examines six CMSes through their official documentation. It revises the recommendations, not the accepted product contract. No comparative installations or hands-on editor trials were performed.

## The recommendation

Build a small, composable content model: **owned objects, reusable object definitions, typed lists, and references to independent entries**. Add an explicit choice of allowed object variants where a list needs different shapes. The same primitives should work inside entry fields, block props and layout settings.

The central distinction is ownership:

| Need | Model | Effect of editing |
| --- | --- | --- |
| A location's address | Owned object | Changes that location only. |
| The same address fields across collections | Reusable object definition | Shares the schema; each address still has independent values. |
| One author used by many articles | Reference to an Author entry | Every use resolves the shared author on the next relevant publication. |
| A body containing quotes, images and callouts | List with allowed object variants | Each item declares its shape; the presentation defines how that shape renders. |

These are complementary capabilities. A reusable definition does not make its values shared, and a reference does not imply a public URL.

## What other CMSes do

| CMS | Verified approach | What we could adopt |
| --- | --- | --- |
| **Sanity** | Nested objects, typed arrays and document references. References can allow multiple document types; strong references block target deletion, while weak references permit missing targets. | Clear ownership, constrained target types, explicit reference integrity. [Objects](https://www.sanity.io/docs/studio/object-type), [references](https://www.sanity.io/docs/studio/reference-type). |
| **Payload** | Groups hold nested fields; arrays repeat rows; Blocks allow different row schemas. Relationships independently configure one/many values and one/multiple target collections. Join fields expose reverse relationships without storing another copy. | Composable fields and derived reverse views. [Groups](https://payloadcms.com/docs/fields/group), [arrays](https://payloadcms.com/docs/fields/array), [Blocks](https://payloadcms.com/docs/fields/blocks), [relationships](https://payloadcms.com/docs/fields/relationship), [joins](https://payloadcms.com/docs/fields/join). |
| **Strapi** | Reusable components can be single, repeated or nested. Dynamic zones let editors arrange different allowed components. Relations connect content types. | Distinguish a repeated shape from a list of different shapes; both deserve schema support. [Content-type Builder](https://docs.strapi.io/cms/features/content-type-builder). |
| **Storyblok** | Nestable blocks live inside other blocks; content-type blocks are stories; universal blocks can serve either role. References identify shared stories by UUID, with explicit API resolution. | Keep embedded composition and shared content distinct, and request linked data deliberately. [Blocks](https://www.storyblok.com/docs/concepts/blocks), [references](https://www.storyblok.com/docs/concepts/references). |
| **Directus** | Relational modeling uses foreign keys, virtual inverse fields and junction collections. Many-to-any links also identify the target collection. | Store an association once; derive its reverse. Use an association record when the relationship itself needs independent management. [Relationships](https://directus.com/docs/guides/data-model/relationships). |
| **Keystatic** | Objects can contain other fields, including arrays of relationships. Relationships use collection-entry slugs; its docs warn that changing a slug breaks existing references. | A composable model fits file-based content. Use stable entry IDs in our implementation. [Objects](https://keystatic.com/docs/fields/object), [relationships](https://keystatic.com/docs/fields/relationship). |

This is a comparison of useful mechanisms, not a claim that every system supports every combination or has the same lifecycle behavior.

## What changes in our proposal

**Revise Q79: allow one or several explicitly selected target collections.** Default an ordinary author field to Authors; allow an intentional featured-content field to select Articles and Events. Our earlier single-collection-only recommendation was too restrictive for the stated breadth goal. This is a recommendation, not an accepted answer.

**Add Q80: lists with different object shapes.** Ordinary nesting cannot express an ordered Quote → Image → Callout sequence unless each row can declare its variant. This can remain a schema-defined entry field: the allowed shapes and rendering are controlled. It does not inherently require free-form per-entry page layouts.

**Add Q81: deletion of referenced records.** Recommend blocking deletion while incoming references remain, with a visible usage list and a repair path. Clearing links in the same change or permitting missing targets are different policies to choose explicitly. Optional fields and weak references are separate ideas: optional permits no selection; weak permits a selection whose target is absent.

**Keep Q77–Q78, clarify their boundaries.** Recommend inline and named object definitions, plus nested objects/lists. Recursive type definitions are a separate engineering issue: a recursive schema can have finite values. The earlier wording incorrectly equated recursion with infinite content. Initially excluding recursive definitions is a possible complexity limit, not a necessary consequence of supporting nesting.

## A model that covers more sites

These examples are proposals for evaluating the design, not a final serialized format:

```text
Article
  seo: SEO object
  author: reference → Authors
  related: ordered references → Articles | Events
  body: ordered objects → Quote | Image | Callout

Event
  venue: reference → Venues
  sessions: list of Session objects
    startsAt: date/time
    speakers: list of references → People

Project
  credits: list of Credit objects
    person: reference → People
    role: text

Person
  projects: derived reverse view of Project.credits.person
```

An event owns its session objects in this example. If sessions need independent reuse or management, make Sessions a collection and reference it instead. The relationship's role belongs on Credit, since one person can have different roles on different projects. A separate Credits collection becomes useful if credits themselves need independent management; a junction collection is not required for every list of references in a JSON store.

Article.related is an editorial selection with stored order. “Latest related articles in this category” is a query, and “all articles by this author” is a reverse lookup. They can produce similar displays but should remain distinct operations.

## Architecture implications for our builder

These are engineering recommendations derived from the comparison and current code, not claims about existing features.

| Area | Proposed boundary | What otherwise hinders us |
| --- | --- | --- |
| Field system | A shared schema traversal handles objects, lists, variants and references wherever fields are used. | Independent implementations drift between entries, blocks and layouts. |
| Storage | Owned values stay with their owner. References store stable target identity; mixed targets also need an unambiguous type/collection discriminator. | Copying referenced values creates stale duplicates; slug-based links break on rename. |
| Binding | Typed paths traverse objects and references; lists map item fields; mixed targets require a type-specific branch or explicit common projection. | Adding editor fields alone leaves templates unable to use them. |
| Resolution | Build an entry index and reverse-reference index once per content snapshot. Resolve requested paths with bounded work and cycle detection. | Eagerly embedding whole graphs causes cycles, large payloads and repeated work. |
| Authoring | Search/select/create targets; show their collection and incoming uses. Nested editors open dedicated levels. | Rich data becomes unusable if navigation loses the parent or editors cannot see shared impact. |
| Publication | Validate the complete proposed Git snapshot, including target existence, allowed types and required fields. | A valid source record can still reference an invalid or missing target in the release. |
| Schema changes | Preview affected values and bindings when changing a shared object definition. | One reusable schema change can break many collections silently. |

The current `Field` union has neither an object nor an entry-reference type; collection schema validation allows lists only at the top level. `resolveBlock` reads top-level keys, so a string such as `author.name` does not currently traverse anything. Source: `src/core/types.ts`, `src/core/content.ts` and `src/core/bindings.ts`. Arbitrary JSON storage capacity is not equivalent to a supported schema, editor and rendering contract.

List-row identity already exists in `src/core/lists.ts`. Preserve the useful behavior in a redesign: stable identity across reorder/edit, new identity on duplication. Sanity likewise gives object-array members persistent keys; it also forbids direct arrays-of-arrays, illustrating why we should adopt concepts without copying every vendor constraint. [Sanity arrays](https://www.sanity.io/docs/studio/array-type).

Multiple allowed relation targets do add real work. Payload documents restrictions on querying fields inside polymorphic targets; for us, a binding to `featured.author.name` must be rejected or scoped to a matching variant when not every allowed type has that field. [Payload relationship querying](https://payloadcms.com/docs/fields/relationship#querying-and-filtering-polymorphic-relationships).

Our shared Git publication snapshot differs from systems that publish each document separately. Validate linked data against that snapshot; do not copy another CMS's separate-document publishing workflow without a product need. A data-only Author can be available to rendering without generating an author page. This content model can be implemented in JSON and a static build; it does not by itself require a live database. Performance limits still need representative fixtures and measurement.

## Revised discussion round

| Question | Recommendation after research |
| --- | --- |
| Q77 — Object definitions | Both inline groups and named reusable definitions. |
| Q78 — Nesting | Objects and lists can nest; exact depth/recursion mechanics remain engineering proposals. |
| Q79 — Allowed relation targets | One or multiple explicitly allowed collections, with one as the normal default. |
| Q80 — Different object shapes in a list | Opt-in typed variants per list field. |
| Q81 — Deleting a referenced entry | Block until incoming links are removed or reassigned. |

All five were subsequently answered; see the outcome at the top of this page. The original Q77–Q79 form is superseded for discussion, with its files preserved. Single/multiple relation controls, ordering/uniqueness, reverse-view editing, metadata on associations, schema-library management and exact resolver contracts remain follow-up topics. No application implementation is authorized by this research request.
