---
title: Relations and objects
updated: 2026-10-08
status: Product scope implemented
---
# Relations and objects

The user requested discussion of relations and objects following the [architecture review](architecture-review.md). DEC-109 permits breaking the unused prototype. DEC-110–DEC-114 establish the first relation/object choices; DEC-126 subsequently replaces the original one-level limit with up to three owned levels. Implementation was subsequently authorized and completed on 2026-10-08; the feature contract linked below records current behavior.

The [six-CMS comparison](cms-objects-relations-research.md) informed Q77–Q81. The [submitted answers](../journal/2026-10-07-grill-60cae8b1-ce10-49a9-b741-7cb19b94ca6e.md) and [interpretation](../journal/2026-10-07-relations-and-objects-round-one.md) take precedence over the research recommendations. The earlier superseded form remains preserved.

The later collection/schema rounds settle the remaining product choices through DEC-125. [Q93 accepts three-level nesting](../journal/2026-10-07-nesting-round-one.md) as DEC-126; [Q94 rejects recursive owned definitions](../journal/2026-10-07-nesting-round-two.md) as DEC-127. The nesting reconsideration is complete. The [consolidated plan](content-model-plan.md) is the current implementation planning reference, with accepted behavior separated from engineering proposals.

DEC-128 then selects Sanity as the primary modeling reference, with a lean adaptation of independent entries, owned objects, typed arrays and stable references. The plan proposes an array of references for multiple relations, using the same array grammar as repeated owned objects. Accepted relation behavior and ownership limits remain in force; see the [selection journal](../journal/2026-10-07-lean-sanity-model.md).

## Objects versus collection schemas

A collection schema describes a complete, independently managed entry. An object definition is a schema for a field group inside an entry. An object is the actual value conforming to that definition. Both definitions describe fields and can use the same schema machinery; their ownership and lifecycle differ.

For example, a Locations collection schema can contain `name` and an `address` field using an Address object definition. Each Location owns its address. If addresses instead need independent management and shared updates, an Addresses collection plus a relation is the alternative. A collection does not need a public detail page to be independently managed.

| Concept | Ownership and behavior | Example |
| --- | --- | --- |
| Object | A group of values owned by its containing entry; it has no independent content-entry identity or public route. | A location's address; an article's SEO settings. |
| Reusable object type | A shared definition of fields. Each use has independent values. Changing the definition affects its uses and must be validated. | Address defines street/city/postcode once; every location has its own address. |
| Relation | A typed reference to an independently managed entry, stored by stable identity. Several entries can reference the same target. | Many articles reference one Author entry. |

Reusing an object type shares structure; referencing an entry shares content. Updating an Author's biography should affect every place that resolves that Author after publication. Updating one Location's address should affect only that owned address value. A repeated list of local FAQ objects and a list of references to shared FAQ entries are different content decisions, even if they render identically.

An illustrative model:

```text
Article
  title: text
  seo: SEO object
    title: text
    description: text
  author: relation to Authors
  categories: ordered relations to Categories

Location
  address: Address object
    street: text
    city: text
  openingHours: list of DayHours objects
```

## Engineering proposals and implementation

The user authorized implementation on 2026-10-08. See the [implemented contract](../features/content-model.md) and [verification run](../verification/runs/2026-10-08-content-model.md); the recommendations below remain the planning record.

- Use shared schema machinery for collections and object definitions. DEC-126 allows up to three owned object/list levels; DEC-119's relation placement remains accepted. Each object or list counts once, without an extra row or named-definition wrapper. DEC-127 rejects direct and indirect recursive definitions, while allowing reuse in independent branches. Exact serialization remains engineering work.
- Named and inline object definitions should share value/editor behavior. Changes to a reused definition need an impact check.
- DEC-118–DEC-121 accept one/many references, placement inside owned groups, editorial order and unique targets within a relation value. Storage and controls require engineering detail.
- Keep referenced records independently managed even when they do not have public detail pages. A relation should not require a target URL. Public pages, links, and relation identity are separate concepts.
- Expose typed bindings such as an entry's `seo.title` or its author's name. Relations inside objects/list items should use the same rules as top-level relations; rendering should resolve only requested data.
- Derive reverse usage from stored references to support the accepted deletion policy. DEC-123 keeps that index for admin checks only; DEC-124 keeps relation controls selection-only. Targets are created/edited separately in Content.

## Accepted first discussion round

| Question | Decision | Accepted outcome |
| --- | --- | --- |
| Q77 | DEC-110 | Both named reusable definitions and inline groups. |
| Q78 | DEC-111 | Originally one level; superseded by DEC-126's three owned levels. |
| Q79 | DEC-112 | One target collection per relation field. |
| Q80 | DEC-113 | One object shape per list for now. |
| Q81 | DEC-114 | Block deletion until incoming links are removed or reassigned. |

All five were answered. Broader nesting, mixed-target and mixed-object recommendations were not selected in that first round. Q93 later revises only owned nesting to three levels; mixed targets and mixed object shapes remain excluded.

## Resolved scope and engineering follow-up

Q90–Q92 resolve reverse template data, target authoring and schema navigation. Under the user's delegated simplicity criterion, reverse template lists and integrated target creation/editing are excluded for now (DEC-123–DEC-124). The user selects Schemas → Collections / Objects (DEC-125). No independently editable reverse list is introduced.

The [content-model round](../journal/2026-10-07-collections-and-schemas-round-two.md) resolves one/many relation support as DEC-118 and removes URL requirements for data-only entries as DEC-117. The [shape/behavior round](../journal/2026-10-07-collections-and-schemas-round-three.md) resolves placement, ordering and duplicate targets as DEC-119–DEC-121.

DEC-126 permits an Address object, FAQ rows, and further owned objects/lists up to three levels, with references allowed inside those groups. The entry itself and list-row wrappers add no levels. Following a reference is a separate bounded graph-resolution operation. DEC-127 rejects a reusable definition containing itself through owned fields, directly or indirectly. This leaves entry-reference resolution as a separate engineering concern.

The accepted shape supports a Project's contributor list with a Person relation and Role text field per row. Row order can express credit order. Per-project data stays on the credit, not the shared Person. Separate rows may reference the same person; DEC-121's uniqueness applies within each relation value. An independently managed association can instead be modeled as a collection; a specialized junction-record subsystem has not been requested.

Do not silently choose automatic cascading deletes, eager expansion of entire relation graphs, shared object values, unlimited recursive schemas, or automatic public routes. Rich relations do not require restoring per-entry page blocks or introducing a runtime database. No question here selects a new hosting architecture.

See the [journal](../journal/2026-10-07-relations-and-objects.md) and [open questions](open-questions.md).
