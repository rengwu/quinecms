---
title: Collections, objects and references
updated: 2026-11-09
---
# Collections, objects and references

**ID:** FEAT-content-model

## Intent and basis

DEC-110–DEC-128 select a lean Sanity-style model within the Git-backed builder: independent entries, owned objects, typed arrays and references. DEC-126 permits three owned levels; DEC-127 rejects recursive owned definitions. The user authorized implementation on 2026-10-08 and explicitly excluded compatibility and migrations. The [plan](../discussions/content-model-plan.md) retains the accepted scope and original engineering proposals; this page describes the implemented contract.

## Entry points

**Schemas → Collections** manages collection definitions; **Schemas → Objects** manages reusable object definitions. These are direct sidebar destinations in the current admin. **Content → Collections → a collection** opens its entries; a single-entry collection opens its record directly. Lists and records are screens with breadcrumbs; nested fields and values use [editor panels](editor.md#workspace-and-navigation).

Schemas → Collections manages each collection's complete entry schema. Choose Add collection or Add single-entry collection, complete the New collection form, then Create collection. Cancel discards the definition and its pending fields. Schemas → Objects manages named reusable field definitions. Content manages entry values; single-entry collections open their one record directly. No mode-conversion UI is provided.

Record examples and authoring workflows are in the [authoring guide](../guides/local-authoring.md). The engine ships no sample site or importable client-content catalog.

## Records and values

| Record or field | Implemented shape |
| --- | --- |
| Collection | `mode: 'many' | 'single'`, collection-owned `fields`, `titleField`, optional `genericPageId` and `path`. |
| Entry | Stable ID, `collectionId`, `values`; `slug` is optional except on routed ordinary entries. |
| Named object | `Content.objects`, persisted as `content/objects/<id>.json`, with stable ID, name and fields. |
| Owned object | `type: 'object'` with either `objectId` or inline `fields`. Values belong to the containing entry. |
| Structured array | `type: 'array', of: { type: 'object', ... }`; one named/inline shape, ordered rows with stable `_rowId`. |
| Reference | `type: 'reference', collectionId`; stores a target entry ID or null. |
| Reference array | `type: 'array', of: { type: 'reference', collectionId }`; stores ordered unique entry IDs. |

Text and rich-text fields vary by language by default; `"localized": false` keeps them shared. Other leaf fields opt in with `"localized": true`; see [optional internationalization](internationalization.md). Existing scalar content fields remain available. Block/layout definitions retain their `list` interface; collection/object schemas use `array`. Scalar arrays, mixed item variants, direct arrays of arrays and polymorphic references are outside this increment.

Objects and object arrays each count one owned level. An array's row wrapper and a named definition add no extra level. Entry references and reference arrays add no owned depth. Schema validation expands named definitions at every use site, rejects a fourth level and reports direct/indirect ownership cycles. Reuse in independent branches is valid; cycles between independently managed entries are valid.

Defaults are cloned when creating objects, rows or entries. Duplicating a row creates fresh identities for every descendant row. Changing defaults does not rewrite existing values.

## Editing and integrity

Nested fields, object values, rows, reference selection and projection mappings open panels over the retained parent. Done/close and browser Back return one level while preserving existing draft edits. Add stages an uncommitted form with Create/Cancel under the [creation contract](editor.md#creation-forms-dec-129). Children remain local until their pending parent is created. Reference controls search existing targets by title/ID, display missing targets, remove selections and reorder multiple selections. Target creation/editing stays in Content.

Named definitions show their schema uses. Shared-field impact checks include nested values in every dependent collection and schema defaults; deleting or changing populated fields incompatibly is blocked until the values are explicitly repaired. Depth and cycle checks also run when changing shared definitions. Unused definitions can be deleted.

An incoming-usage index covers declared references at every owned level, references in defaults and explicitly tagged internal entry links. Arbitrary strings are not relations. Referenced entries cannot be deleted; the editor displays human-readable record and field locations with an Open action to the owning editor. Schema defaults are explicitly labeled, and self-references do not block deletion. Named-object usage rows offer the same navigation to dependent schemas. Collection removal also checks schema reference targets and contained entries. Create collection provisions one entry for a single-entry collection using its final field defaults; Content hides extra-entry creation and ordinary deletion, leaving guarded model removal in Schemas.

Draft saves require structurally valid records, schemas and value shapes. Incomplete required fields, unresolved entry targets and invalid presentation bindings remain repairable drafts but block Publish. Duplicate reference targets and malformed value shapes are structural errors. Publication also checks exactly one entry per single-entry collection, required values, routes and bindings.

## Routes and presentation

Unassigned collections are data-only and need no route metadata. A generic-page assignment enables routes: `many` uses prefix plus entry slug; `single` uses the collection's exact path. Central route/link resolution detects collisions and is shared with collection cards. A separate static page can supply an ordinary collection's index.

Bindings accept a typed forward path, such as `seo.title` or `author.name`, or an explicit list projection:

```json
{
  "groups": {
    "source": "groups",
    "fields": {
      "title": "title",
      "items": {
        "source": "rows",
        "fields": { "label": "detail.label", "value": "detail.value" }
      }
    }
  }
}
```

Reference-array projections use the same mapping shape and preserve selection order. Resolution reads current target values, follows only requested paths and limits each path to 12 segments. Invalid/overlong paths produce binding errors; references are never recursively hydrated into an unrestricted graph. Compatibility is checked even when there are no entries or values. Empty optional values use literal fallbacks; `false` and `0` remain values. Collection-card mappings use the same typed forward paths. Generic-page preview shows field placeholders; routed-entry preview resolves the current entry values.

Installed block definitions consume compatible declared scalar and structured fields. Particular Structured details, FAQ or collection-list designs belong to libraries. This is typed forward binding and projection, not arbitrary page composition or a general query language.

## Collection context

Block fields may declare `collectionField: { collectionKey, types }` to select
compatible typed paths from a chosen collection. Public rendering and preview
project those declared paths into `context.collections[].entries[].values`.
Only selected fields are exposed through this projection; changing a selector
changes the rendered values without requiring a new renderer. Forward-reference
paths use the same bounded type checks as generic bindings.

Multiple collection selectors remain independent. The older conventional
mapping names remain a compatibility fallback. This is the engine contract from
DEC-188; particular cards, listings, filtering and search interfaces are supplied
by block code. There is no general query language or built-in site-wide search.

## Persistence and recovery

Object records, collection modes and nested values participate in existing whole-snapshot Git saves/publication, backup JSON and tab recovery. Recovery preserves unfinished schemas, including cycles, without expanding them. Unreadable recovery data is kept available for download; the editor does not overwrite it until the user explicitly discards it. No old-model migration layer is included.

## Checks and evidence

[Check recipes and dated evidence](../verification/features/content-model.md).
