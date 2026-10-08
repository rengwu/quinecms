---
title: Collections and schemas
updated: 2026-10-08
status: Product scope implemented
---
# Collections and schemas

The user asks to discuss collections and schemas after clarifying how object types differ from collection schemas. DEC-115–DEC-122 select ownership, content modes, relation placement/order/uniqueness and routing. DEC-109 permits a breaking redesign; DEC-110–DEC-114 remain accepted unless explicitly revised. No implementation is requested by this discussion.

Q90–Q92 resolve as DEC-123–DEC-125. Q93 subsequently selects up to three owned levels (DEC-126), replacing DEC-111 and the depth restriction in DEC-119; Q94 rejects recursive owned definitions (DEC-127) while allowing ordinary nested reuse. See the [consolidated accepted scope and proposed engineering plan](content-model-plan.md). Implementation was authorized and completed on 2026-10-08; see the [implemented contract](../features/content-model.md) and [verification run](../verification/runs/2026-10-08-content-model.md).

DEC-128 subsequently selects a lean Sanity-style model. Our collection schema corresponds to a document type, and an entry to an independent document. Objects share structure; arrays repeat one declared object/reference shape. Single-entry remains a mode of the same collection/entry model. See the [selection journal](../journal/2026-10-07-lean-sanity-model.md); schema records remain editable data in Git.

## The concepts

| Concept | Responsibility | Example |
| --- | --- | --- |
| Schema | Defines fields, types and validation rules. | Article: title, body, author. |
| Collection | Groups independently managed entries. | News. |
| Entry | Holds one record's values and identity. | A particular news article. |
| Object definition | Defines an owned field group, with independent values at each use. | SEO: title and description. |
| Generic page | Defines how entry content is presented on a public page. | Article detail template. |

These are separate responsibilities even when some share a stored record. Making the concepts clear does not automatically require an independent schema library.

## What the current implementation does

`Collection` in `src/core/types.ts` stores `fields`, `titleField`, `name`, `path` and optional `genericPageId` together. `Entry` stores `collectionId`, `slug` and `values`; its schema comes from that collection. `src/editor/CollectionSchema.tsx` edits fields, collection name, URL prefix and template assignment on one screen.

There is no separate reusable whole-entry schema record. Collection schemas are currently one-to-one with collections. Compatible collections can share a generic page, and an unassigned collection generates no entry routes (DEC-062–DEC-064). Sharing a template is already distinct from sharing a schema.

## Accepted ownership model

| Model | Behavior | Tradeoff |
| --- | --- | --- |
| Each collection owns its schema | Blog and News each define their entry fields. Both may reuse a named SEO object definition. | Straightforward ownership and independent changes; complete schemas can drift if intentionally duplicated. |
| Independent reusable schemas | Blog and News both select the same Article schema. Their entries, URL prefixes and template assignments remain separate. | Centralized whole-schema changes; every dependent collection is affected, and an additional schema-management layer is needed. |

**Accepted (DEC-115):** each collection owns its whole entry schema, with the accepted reusable object definitions supplying common field groups. The independent whole-schema alternative in the table was not selected. This is the user's chosen product boundary, not a compatibility requirement.

Q82 is resolved by the [submitted answer](../journal/2026-10-07-grill-7f4de03d-e6cc-42a8-a3e1-e309d5efb160.md); see the [interpretation](../journal/2026-10-07-collections-and-schemas-round-one.md). Shared field-definition, validation and editor machinery can still support collection schemas and object definitions. Entry values remain separate; a relation field still targets one collection (DEC-112). Compatible collections may still share a generic page (DEC-063).

## Accepted content models

| Question | Decision | Accepted behavior |
| --- | --- | --- |
| Q83 — Single-record content | DEC-116 | Single-entry and ordinary collection modes; single-entry mode opens the content editor directly and prevents extra entries. |
| Q84 — Data-only routing metadata | DEC-117 | Data-only collections need no URL prefix or entry slug. Require valid routing metadata before publishing generated entry pages. |
| Q85 — Relation multiplicity | DEC-118 | Each relation field selects one or multiple entries from its one configured collection. |

All three are accepted from the [answers](../journal/2026-10-07-grill-62a9fc65-afb5-4c46-bb07-9da151affd7f.md); see the [interpretation](../journal/2026-10-07-collections-and-schemas-round-two.md). Former URL metadata may remain stored when routes are disabled. Stable entry identity stays independent of URL and collection mode. Single-entry lifecycle, mode conversion and reference-picker presentation still need design detail.

The independent whole-schema branch is closed for this scope: no per-collection overrides of shared whole schemas or whole-schema switching system is proposed.

## Accepted shape and behavior

| Question | Decision | Accepted behavior |
| --- | --- | --- |
| Q86 — Relations inside groups | DEC-119 | Single/multiple references can appear inside objects and list rows. The original one-level restriction is superseded by DEC-126. |
| Q87 — Relation ordering | DEC-120 | Editors reorder multiple references; rendering receives the stored order. |
| Q88 — Duplicate targets | DEC-121 | A target appears once per relation field value. Other fields, entries and separate association rows can reference it again. |
| Q89 — Single-entry URLs | DEC-122 | Routed single-entry collections use an explicit path such as `/about`, without a separate entry slug. Ordinary collections retain prefix plus slug. |

All four are accepted from the [answers](../journal/2026-10-07-grill-a0fd15b5-4c31-4b31-800c-1b302fae7558.md); see the [interpretation](../journal/2026-10-07-collections-and-schemas-round-three.md). A generic page assignment remains necessary for single-entry routes; data-only single-entry collections remain valid.

[Q93](../journal/2026-10-07-nesting-round-one.md) later accepts up to three owned object/list levels, equally for named and inline shapes. An object or list counts once; the entry, list-row wrapper and named-definition reuse add no extra level. One shape per list remains required. Q94 subsequently rejects direct and indirect recursive owned definitions (DEC-127). Reuse in independent places remains supported; see the [final interpretation](../journal/2026-10-07-nesting-round-two.md).

## Accepted usage and navigation

| Question | Decision | Outcome |
| --- | --- | --- |
| Q90 — Reverse-related template data | DEC-123 | User delegates the leanest option; assistant chooses admin usage/deletion lookups only. No reverse template lists in this scope. |
| Q91 — Linked-entry authoring | DEC-124 | User delegates the leanest option; assistant chooses existing-target selection. Create/edit entries through Content separately. |
| Q92 — Schema navigation | DEC-125 | One Schemas area with separate Collections and Objects destinations; Content holds entry values. |

All three are resolved by the [answers and delegated interpretation](../journal/2026-10-07-collections-and-schemas-round-four.md). The earlier richer recommendations for Q90–Q91 were not adopted. Q92 organizes navigation without reintroducing independent reusable whole-entry schemas.

## Engineering work for the consolidated plan

The [plan](content-model-plan.md) proposes single-entry lifecycle, serialized types, object-definition editing, schema-change impact, bounded forward resolution and validation. These are original engineering recommendations under the accepted constraints; the feature contract above records their implemented form. Current data-only behavior and schema-only entries are already accepted; do not ask for those decisions again without a reason to reopen them.

The [relations and objects](relations-and-objects.md) model now has accepted multiplicity, placement, ordering and uniqueness; Q90–Q91 resolve its reverse-data and authoring scope. See the [initial journal](../journal/2026-10-07-collections-and-schemas.md) for discussion history.
