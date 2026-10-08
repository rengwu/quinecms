---
title: Collections, objects and references
updated: 2026-10-08
---
# Collections, objects and references

**ID:** FEAT-content-model

## Intent and basis

DEC-110–DEC-128 select a lean Sanity-style model within the Git-backed builder: independent entries, owned objects, typed arrays and references. DEC-126 permits three owned levels; DEC-127 rejects recursive owned definitions. The user authorized implementation on 2026-10-08 and explicitly excluded compatibility and migrations. The [plan](../discussions/content-model-plan.md) retains the accepted scope and original engineering proposals; this page describes the implemented contract.

## Entry points

Schemas is an expandable sidebar group, with no route of its own (DEC-132). Collections and Objects open directly from its children, without Back on either list; individual definition editors still return to their list. The same grouping appears in the compact navigation menu. [Verification](../verification/runs/2026-10-08-sidebar-groups.md).

Schemas → Collections manages each collection's complete entry schema. Choose Add collection or Add single-entry collection, complete the New collection form, then Create collection. Cancel discards the definition and its pending fields. Schemas → Objects manages named reusable field definitions. Content manages entry values; single-entry collections open their one record directly. No mode-conversion UI is provided.

The importable `examples/content-model.json` backup demonstrates two collections sharing SEO, data-only Authors, an ordinary Journal with references and nested specifications, and Company profile at `/about`. Import it through Settings → Backups in a disposable local session. It replaces the local content snapshot; it is not installed over the repository's normal demo content.

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

Existing scalar content fields remain available. Block/layout definitions retain their `list` interface; collection/object schemas use `array`. Scalar arrays, mixed item variants, direct arrays of arrays and polymorphic references are outside this increment.

Objects and object arrays each count one owned level. An array's row wrapper and a named definition add no extra level. Entry references and reference arrays add no owned depth. Schema validation expands named definitions at every use site, rejects a fourth level and reports direct/indirect ownership cycles. Reuse in independent branches is valid; cycles between independently managed entries are valid.

Defaults are cloned when creating objects, rows or entries. Duplicating a row creates fresh identities for every descendant row. Changing defaults does not rewrite existing values.

## Editing and integrity

Definitions, fields, objects, rows, reference selection and projection mappings open dedicated levels, replacing parent controls under DEC-108. Existing-item editors use Back to return one level without discarding the shared draft. Add opens an uncommitted New form with Create and Cancel under the [sitewide creation contract](editor.md#creation-forms-dec-129); nested children remain local until their pending parent is created. Reference controls search existing targets by title/ID, display missing targets, remove selections and reorder multiple selections. Target creation/editing stays in Content.

Named definitions show their schema uses. Shared-field impact checks include nested values in every dependent collection and schema defaults; deleting or changing populated fields incompatibly is blocked until the values are explicitly repaired. Depth and cycle checks also run when changing shared definitions. Unused definitions can be deleted.

An incoming-usage index covers declared references at every owned level, references in defaults and explicitly tagged internal entry links. Arbitrary strings are not relations. Referenced entries cannot be deleted; the editor displays owning records and paths. Collection removal also checks schema reference targets and contained entries. Create collection provisions one entry for a single-entry collection using its final field defaults; Content hides extra-entry creation and ordinary deletion, leaving guarded model removal in Schemas.

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

Reference-array projections use the same mapping shape and preserve selection order. Resolution reads current target values, follows only requested paths and limits each path to 12 segments. Invalid/overlong paths produce binding errors; references are never recursively hydrated into an unrestricted graph. Compatibility is checked even when there are no entries or values. Empty optional values use literal fallbacks; `false` and `0` remain values. Collection-card mappings use the same typed forward paths. Generic-page preview still shows field placeholders.

The generic Structured details block consumes headings, referenced author names and nested grouped rows. The example maps its three owned specification levels into that block and its selected related entries into a generic FAQ block. Blocks need compatible declared fields to consume structured content; this is not arbitrary page composition or a query language.

## Persistence and recovery

Object records, collection modes and nested values participate in existing whole-snapshot Git saves/publication, backup JSON and tab recovery. Recovery preserves unfinished schemas, including cycles, without expanding them. Unreadable recovery data is kept available for download; the editor does not overwrite it until the user explicitly discards it. No old-model migration layer is included.

## Verification recipe and limits

Run `pnpm verify`. `tests/content-model.test.ts` covers records, depth/cycles, defaults, impact checks, usages, typed resolution, projections and routes. Mounted editor tests cover definition/single-entry creation, reload, dedicated nested levels, reference selection and projection editing. Mock GitHub tests save/reload/publish object records and references; recovery tests cover unfinished and unreadable drafts.

For browser checks, build the example in an isolated copy, open Schemas → Objects → SEO, inspect both collection uses, then edit Journal → an entry → Specifications → Dimensions → Item 1 → Detail. Reload and reopen the edited value. At mobile width, search a single reference and reorder related entries. Inspect the built entry for the SEO heading, referenced author and specification rows. Single-entry Content should open directly with no slug or Add entry control.

The [implementation run](../verification/runs/2026-10-08-content-model.md) records local and mocked results, desktop/mobile browser evidence and production output. Live GitHub/R2/Netlify behavior, physical devices and a complete browser matrix remain untested. No site was published.

The [number-input repair](../verification/runs/2026-10-08-number-input-height.md) verifies that numeric schema limits retain standard control height inside horizontal rows.

[Explicit creation forms and cancellation](../verification/runs/2026-10-08-creation-forms.md) verifies staged definitions, nested values, singleton provisioning and cancellation.
