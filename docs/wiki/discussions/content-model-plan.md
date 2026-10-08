---
title: Collections, objects and relations — implementation plan
updated: 2026-10-08
status: Implemented; original engineering plan retained
---
# Collections, objects and relations — implementation plan

**Use a lean Sanity-style model: independent entries, owned objects, typed arrays and references.** Collections own entry schemas; reusable objects share field structure; references connect independent entries. This extends the existing Git-backed static builder without requiring a database or CMS server.

The nesting reconsideration is complete: [Q93 accepts up to three owned object/list levels](../journal/2026-10-07-nesting-round-one.md), recorded as DEC-126, replacing the earlier one-level restriction. [Q94 rejects direct and indirect recursive definitions](../journal/2026-10-07-nesting-round-two.md), recorded as DEC-127, while retaining ordinary nested reuse.

DEC-110–DEC-128 record the accepted scope, with superseded depth choices identified in the register. DEC-128 selects Sanity as the primary modeling reference and asks to keep the adaptation lean. No further product questions block this increment. Storage, lifecycle and implementation details below retain the original engineering proposals, not additional interview decisions. The user authorized implementation on 2026-10-08 with no compatibility or migrations. See the [implemented contract](../features/content-model.md) and [verification run](../verification/runs/2026-10-08-content-model.md) for the delivered behavior and evidence. DEC-109 permits replacing prototype contracts without compatibility work.

## Accepted direction — a lean Sanity-style model

The user's instruction, “let's model ours closely to sanity's. keep it lean,” selects the direction after the [CMS comparison](cms-objects-relations-research.md). DEC-128 records that selection. Apply Sanity's document/object/array/reference distinction within the already agreed scope.

| Modeling concept | Our adaptation |
| --- | --- |
| Document type and document | A collection owns the schema; an entry is an independently managed document with a stable ID. Single-entry is a collection mode using the same entry model. |
| Object | An owned group of fields, defined inline or through a reusable named definition. Reuse shares structure; values belong to their containing entry. |
| Array | An ordered sequence with one declared item shape: owned objects or references. A structured list and a multiple-reference selection are the two supported uses. |
| Reference | A stable-ID pointer to an entry in one declared collection. Referenced content remains independently managed; its route is optional. |

Retain Collections, Objects and Content as the admin vocabulary. Schemas remain editable data in Git, and publication still releases one validated repository snapshot. Generic pages remain the separate presentation layer. Sanity's hosted service, query language, code-only schema workflow and document-by-document publishing are not prerequisites for these modeling concepts.

Keep the agreed three owned levels, nonrecursive definitions, one object shape per list, one target collection per reference, ordered unique multiple selections, deletion guards, selection-only controls and admin-only reverse usage. The direction does not reopen those choices. Exact TypeScript and JSON representations below record the planning proposals; the feature contract records the implemented interfaces; there is no requirement for Sanity API or file-format compatibility.

## The agreed model

| Concept | Agreed behavior |
| --- | --- |
| Collection | Owns its complete entry schema. Ordinary collections contain many entries; single-entry collections contain one centrally managed record. |
| Object | A named reusable definition or an inline field group. Reusing a definition shares fields, while each containing entry owns its values. |
| Depth | Up to three owned object/list levels, using named or inline definitions. Each object or list counts once; neither the entry nor a list-row wrapper adds a level. Reusing a named definition adds no extra wrapper. Each list has one shape. |
| Recursive definitions | An object definition cannot contain itself, directly or indirectly through owned fields. Reuse in independent places remains allowed. |
| Relation | Selects one or several entries from one specified collection. Allowed at the entry level and inside an object or list row. |
| Order and reuse | Multiple selections keep editorial order and cannot repeat a target within that field value. The same target may occur in other fields or separate rows. |
| Routes | Data-only content needs no URL. Routed ordinary entries use a collection prefix plus slug; a routed single entry uses one explicit path. Both require a generic page assignment. |
| Deletion and lookup | Block deletion while an entry is referenced. Reverse lookup powers admin usage checks; reverse template lists are outside this increment. |
| Editing | Schemas → Collections / Objects manages structure. Content manages values. Relation controls select existing entries; target creation/editing stays in Content. |

The final two simplicity choices were explicitly delegated by the user. They are resolved choices, not unanswered recommendations. See the [decision register](../decisions/index.md) and [final interpretation](../journal/2026-10-07-collections-and-schemas-round-four.md).

## A concrete example

```text
Articles · ordinary collection · /articles/:slug
  title: text
  seo: SEO object
  author: reference → Authors
  related: ordered references → Articles

Authors · data-only collection
  name: text
  biography: rich text

Projects · ordinary collection
  title: text
  credits: list of one flat shape
    person: reference → People
    role: text

Company Profile · single entry · /about
  companyName: text
  seo: SEO object

SEO · reusable object definition
  title: text
  description: text
```

Changing SEO's field definition changes the schema wherever it is used. Editing an article's SEO values affects that article only. Editing an Author changes the shared content resolved by its references when the site is next published. An Author can be useful without having a public page.

The revised nesting limit also supports a Product with a specification-groups list (level 1), specification rows inside each group (level 2), and an owned detail object inside each row (level 3). The values stay owned by the product. The same definition can serve multiple independent fields, but cannot recur along an ownership path. A Menu group can contain Menu link rows; a Menu item cannot contain child rows of its own Menu item definition.

## The limits that still matter

**This is a broader content model, not a guarantee of every site structure.** The accepted three-level boundary supports nested specification groups but still constrains deeper documents and trees. A separate collection is appropriate when that content has independent identity and reuse; splitting everything into collections merely to evade the depth limit would burden editors.

Mixed Quote → Image → Callout lists, a relation that mixes Articles and Events, and automatic “all articles by this author” template lists remain outside this scope. An ordered relation field is curated content, not a query. Selection-only controls also mean more navigation when creating related content.

Presentation flexibility remains a separate concern: these changes do not add arbitrary template slots, per-entry page composition, actual-entry generic-page previews or a general query builder. Large content sets still face whole-repository loading, static rebuild costs and a shared publication boundary. Those are later architecture decisions, not problems solved by adding references.

The [CMS comparison](cms-objects-relations-research.md) informed the ownership/reference distinction and stable identity. DEC-126 later accepts bounded nesting; mixed variants and reverse template lists remain outside scope. The [architecture review](architecture-review.md) retains the wider proposals.

The refreshed seven-CMS comparison identifies Sanity as the closest conceptual model. The user subsequently selects that direction in DEC-128; see the [selection journal](../journal/2026-10-07-lean-sanity-model.md). Payload and Keystatic remain secondary implementation references, with Sanity guiding the content model. The [research journal](../journal/2026-10-07-cms-schema-comparison.md) records the sources and limits; no external CMS backend is adopted.

### Follow-up critique — depth revision accepted

Asked which accepted restriction is most limiting, the assistant identifies the one-level owned object/list boundary (DEC-111/DEC-119). Even an ordinary Product → specification groups → specification rows structure exceeds it. Moving each group into an independent collection adds identity, relation selection and separate Content navigation to values that belong to one product. Selection-only relation controls make that workaround more cumbersome. The rule simplifies schema traversal and editor implementation, but can transfer that complexity to content authors.

The assistant recommended reopening this boundary to allow bounded nesting of owned objects and lists, retaining one shape per list and dedicated editor navigation levels. The user requested a new grill-form round and selected three owned levels in Q93. DEC-126 records that accepted revision; the one-level rule is now historical.

Three levels is an accepted product boundary, not a measured technical maximum. Q94 subsequently excludes direct and indirect recursive definitions as DEC-127. Validation, bindings and schema-edit mechanics remain engineering work. Neither interview answer itself authorized application implementation; the user separately authorized it on 2026-10-08.

## Engineering proposal: records and fields

Keep JSON records in Git. Add an explicit collection mode, proposed as `many | single`. Keep collection-owned `fields`, `titleField` and optional `genericPageId`. Make routing metadata optional for data-only content; interpret a routed collection's path as a prefix in ordinary mode and an exact path in single-entry mode. Entry slugs become optional except for routed ordinary entries. Disabling routes does not erase stored routing metadata.

Add `Content.objects` and records at `content/objects/<id>.json`. Each named object definition owns a name and fields, including nested object/list fields within the accepted three-level limit. An object field selects either an `objectId` or inline `fields`, never both; an array of objects repeats that single shape. Depth is counted along each ownership path through resolved named/inline shapes. Enforce DEC-127 by rejecting direct and indirect cycles in owned definition dependencies; entry-reference fields are not owned-definition edges.

Use one composable content-field grammar: existing scalar fields, `object`, `array` and `reference`. A reference is a leaf, proposed as `{ type: 'reference', collectionId }`; many references use `{ type: 'array', of: { type: 'reference', collectionId } }`. Structured lists use an array whose `of` declares an inline or named object shape. This replaces the earlier proposed reference-specific `multiple` flag and separate structured-list grammar for the redesigned content model. A one/many choice can remain a simple authoring control that produces these shapes.

Keep arrays scoped to the accepted uses: one object shape or references to one collection. Arrays of scalar values, mixed variants and direct arrays of arrays are not added by this engineering proposal. Nested structured lists occur through object fields. An array of objects counts as one owned list level, including its item wrapper; a standalone owned object counts once. An array of references adds no owned object/list depth, preserving the accepted relation placement rules.

Keep values compact: a single reference stores an entry ID or null; an array of references stores ordered entry IDs. The schema already identifies the target collection and item shape, so values need no duplicate target/type discriminator. Preserve uniqueness within each reference array. Resolve current target values instead of copying them into the owner. These proposed wire representations need not copy Sanity's `_ref`, `_type` or `_key` spelling; stable identity and ownership semantics are the requirements.

Preserve stable `_rowId` identities for list rows at every allowed depth; duplicating a row generates fresh identities for that row and its descendant rows. New object/row instances receive independent cloned defaults. Editing a definition's default must not overwrite existing content values. These identity/default mechanics are proposed engineering details.

Update `src/core/types.ts`, `content.ts` and `load.ts` together with the GitHub file whitelist, serialization, backup/import and recovery formats. In particular, `recordPath`, `filesFor`, `parseFiles` and the recovery shape currently enumerate known record kinds. Merely adding a TypeScript field would lose or reject object definitions elsewhere. An intentional format replacement is allowed; unsupported formats must produce an explicit error rather than silently dropping data.

## Engineering proposal: one shared schema traversal

Create pure helpers that understand collection fields, named/inline object shapes, typed arrays and reference leaves through all three owned levels. Dispatch array handling by its declared item type; do not implement an unrelated relationship-list subsystem. Use these helpers for validation, defaults, field selection, schema-change checks and incoming usage. Report the owning path when the content depth exceeds three; do not silently truncate imported values. Keep owned depth separate from reference-resolution limits and any existing block/layout field capabilities.

Proposed schema validation checks resolved depth at each use site and rejects a field addition or shared-definition edit that would exceed three levels in a dependent schema. Detect recursive definitions using the current ownership path so reuse across independent branches is not mistaken for a cycle. Report the cycle path or affected use, including on import. Treat recursive definitions as structural errors; defaults and bindings must not expand them before validation. These mechanics implement the accepted boundaries without adding automatic truncation or migration.

Build lookups for entries and object definitions once per content snapshot. Build incoming usage from schema-declared reference fields and existing explicit internal entry links. Do not interpret arbitrary text strings or external URLs as relations. Usage should identify the owning entry and field, including the containing row when applicable.

Use the same index to guard entry deletion and show blockers. Collection removal must account for entries, incoming references and fields that declare it as a target. Object-definition removal must account for all schema uses. Reverse usage stays an admin facility; it does not imply a reverse field, second stored relationship or public query API.

## Engineering proposal: lifecycle and editor

Initially choose ordinary/single-entry mode when creating the model; do not add a conversion UI in this increment. For a single-entry model, provision one blank entry with a stable ID and open it directly from Content. Hide extra-entry creation and ordinary entry deletion there; model removal is the explicit removal path, subject to usage and content checks. These lifecycle defaults are engineering proposals rather than separately answered product choices.

Schemas opens Collections and Objects as separate destinations. Definitions, fields, nested object values and list rows open dedicated navigation levels under DEC-108. Relation controls provide searchable existing-target selection, useful title labels with an ID fallback, removal and ordering. They must work for data-only targets without requiring links or slugs.

Before changing a shared definition, show the affected schemas and validate all their stored values. Extend the existing safe-schema-change checks to named objects: reject deletion or incompatible key/type changes while affected values are populated, unless an explicit repair is included. Do not invent automatic migrations, inheritance or a second schema-version library. This protects content during editing; it does not reintroduce prototype compatibility as a redesign constraint.

Primary editor boundaries are `App.tsx`, `CollectionSchema.tsx`, `SchemaFieldEditor.tsx`, `Fields.tsx`, `ListField.tsx` and navigation components. Reuse the existing Content workflow for target authoring and the shared draft for unsaved values.

## Engineering proposal: bindings and publication

The current `src/core/bindings.ts` reads top-level values by key. Extend it with typed forward paths, for example `seo.title` and `author.name`, and explicit item projections for lists, including nested lists through the accepted three levels. A credit card could map `person.name` and `role`; a related-article list could map selected targets to title/image fields in stored order. Validate source/target field compatibility before rendering. Nested schema support must reach applicable authoring and rendering paths; a block still needs a compatible field shape to consume nested data.

Resolve only the requested fields. Do not recursively hydrate every related entry into a graph. Cyclic references can represent valid content; finite binding paths and a bounded resolver keep them from causing runaway expansion. Exceeding a resolution limit should report the affected binding, not silently truncate content. Exact limits belong with implementation fixtures.

Share resolution and compatibility logic between applicable editor previews and public rendering. Preserve existing empty-value fallback rules, including valid `false` and `0` values. Generic-page editing continues to use its agreed placeholders; this proposal does not introduce a real-entry preview selector.

Save accepts structurally valid incomplete content. Malformed field/value shapes, unknown object definitions and invalid schema declarations are structural errors. Empty required references may remain in a draft; Publish requires required selections, valid target membership and no dangling references. Editor deletion is still blocked while used. Structurally valid imported dangling references should remain visible for repair, with publication blocked, rather than being silently cleared.

Validate the complete publication snapshot, including data-only entries. Publish still releases one Git snapshot; there is no per-entry publication state or cascade. Route generation and internal links use the same mode-aware resolver, validate path collisions, and distinguish a valid content reference from a target that has a public URL.

## Before implementation — engineering priorities

The [read-only code review](../journal/2026-10-07-content-model-preimplementation-review.md) identifies four risks to address within this scope. These are implementation recommendations, not new product decisions or additional questionnaire prerequisites.

1. **Make richer content usable in presentation.** Current generic bindings, collection-card mappings and template compatibility checks each assume top-level keys. Define the typed forward-path and list-projection contract before building the full schema UI, and reuse resolution across these consumers. Prove a related author's name, ordered related-content cards and nested specification rows in public output. Provide compatible field guidance where schema context is available, with clear validation for other paths. A block still needs a compatible shape; arbitrary nested layouts are outside scope.
2. **Check all effects of shared-definition edits.** Inspect dependent definitions, collection uses, populated values and template bindings, including bindings whose current source values are empty. Show affected owners and paths. Preserve draft/publication distinctions: prevent unsupported destructive edits, allow incomplete values in drafts, and block publication on broken bindings. Adding a nested field must also check depth at every dependent use.
3. **Carry the new format through every persistence path.** Verify save/reload, backup/import and tab recovery together before expanding the authoring UI. Recovery must safely preserve unfinished schema edits without expanding an invalid recursive definition; structural Save validation remains stricter. An intentional format break is allowed, but rejected old data needs an explicit explanation. Do not silently discard records or reset an unreadable recovery draft.
4. **Keep content identity separate from public URLs.** Exercise a data-only Author used by a routed Article, a routed single-entry Company Profile, and an ordinary routed collection. References must resolve values without requiring target URLs; clickable internal links need valid routes. One resolver should govern generation, link resolution, previews and collision validation. Disabling a target's route should expose affected internal links during publication validation while preserving valid content relations.

Start with a small working path through model, persistence and rendering using these fixtures, then expand the editor. Include a shared-definition edit and a reload in the same scenario. This supplements the implementation stages below; it does not introduce actual-entry generic-page previews, reverse template lists or a new query language. No further product interview is proposed by this review.

## Original implementation sequence — completed

| Step | Deliverable | Main boundary |
| --- | --- | --- |
| 1. Model and persistence | Field grammar, object records, collection modes, codecs, shared traversal and safe round-trips. | Core types/content/load, GitHub store, backup/import and recovery. |
| 2. Integrity and routes | Incoming usage, safe schema edits, guarded deletion, draft/publication validation and ordinary/single/data-only routing. | Core validation, routes and internal links. |
| 3. Authoring | Schemas destinations, object definitions and values, single-entry workflow, ordered unique relation controls. | React editor with dedicated nested navigation. |
| 4. Presentation | Typed forward bindings and list item projections, with representative page/block fixtures. | Binding resolver, collection mappings and render paths. |
| 5. Verification | Exercise complete editing/save/publish scenarios and document observed limits. | Automated suite plus desktop/mobile editor checks. |

Each step should land as a coherent change with its relevant tests. Do not postpone persistence until the UI is complete: every newly editable record must survive a save, reload, export and recovery cycle.

## Validation targets — results recorded in the implementation run

| Scenario | Required evidence |
| --- | --- |
| Shared SEO objects | Two collections use one definition with independent values; incompatible populated-field changes are blocked across both, including nested uses. |
| Three-level owned structures | Product specification groups, their specification rows and an inner detail object survive editing, defaults, save/reload and compatible rendering. A fourth owned level fails explicitly. Named and inline shapes count identically; list-row wrappers add no level. A shared-definition edit that would exceed the cap at a dependent use is rejected. |
| Nonrecursive reusable definitions | Direct self-containment and indirect A → B → A owned-definition cycles fail explicitly, including on import. The same definition reused in independent branches succeeds. Entry-reference edges are excluded from this cycle check. |
| Project credits | Flat rows contain person references and roles. Row IDs survive edits/reordering; duplicates get new row IDs. One person can appear in separate rows. |
| Ordered related articles | Selection order reaches rendered output; duplicate targets within one selection are rejected. Wrong-collection and missing targets block publication. |
| Referenced-entry deletion | Incoming usage finds top-level references and those inside objects/rows at all three owned levels, plus supported internal entry links. Deletion remains blocked until owners are repaired. |
| Collection modes | Data-only entries need no route metadata. Ordinary pages require prefix/slug; a single page uses an exact path. Collisions fail; single-entry content opens directly and cannot gain a second entry. |
| Binding consistency | Forward object/reference paths and row projections agree across rendering paths; target edits resolve current values. Cycles terminate; empty/false/zero behavior remains correct. |
| Persistence | Object definitions, modes and all new values survive mocked GitHub save/reload, export/import and tab recovery. Stale-save behavior remains intact. |
| Editor navigation | Definition, object and row editing replace their parent controls at every allowed depth on desktop and mobile; returning preserves the shared draft. |

Use publication, project/people and company-profile fixtures to exercise these behaviors. Run `pnpm verify` for application implementation, alongside targeted browser checks. Mocked provider tests do not establish live GitHub, R2 or Netlify behavior; live-provider evidence must remain separately identified.

The [2026-10-08 implementation run](../verification/runs/2026-10-08-content-model.md) records executed checks against the new model. Earlier passing baselines do not verify these features. Wiki build/check validates documentation structure and links, separately from application verification.
