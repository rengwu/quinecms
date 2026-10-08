---
title: Content model — review before implementation
updated: 2026-10-07
status: Engineering recommendations; scope unchanged
---
# Content model — review before implementation

The user asks whether anything else is concerning before implementation. A read-only review of the current source and accepted plan finds no further product restriction that needs reopening. The concern is completing the model across authoring, persistence, validation and presentation. DEC-110–DEC-127 remain the accepted scope; this review does not authorize implementation or start another interview.

## Source observations

| Boundary | Observed code | Consequence for implementation |
| --- | --- | --- |
| Generic bindings | `src/core/bindings.ts` resolves `values[source]`; `src/editor/BlockFields.tsx` uses a raw field-key input. Template compatibility in `src/core/content.ts` finds a top-level collection field. | Nested objects, forward relations and list projections need a shared contract and usable controls, not just new field types. |
| Collection presentation | `contextFor` in `src/core/content.ts` extracts a fixed set of mapping keys and reads top-level values. `src/themes/tailwind/Blog.tsx` consumes those mapped values. | Updating generic-page resolution alone would leave a separate presentation path unable to consume richer mappings. Preserve narrow data projection while extending resolution. |
| Schema edits | `src/editor/CollectionSchema.tsx` passes values from the edited collection into its field editor. `schemaChanges` in `src/core/content.ts` checks collection field changes against stored entry values. | Named reusable definitions require broader dependency/impact checks, including nested depth and presentation bindings even when values are empty. |
| Persistence and recovery | `recordPath`, `filesFor` and `parseFiles` in `src/core/content.ts` enumerate current record kinds. `src/editor/recovery.ts` requires path/slug strings and uses a `nested` flag that excludes further lists. GitHub loading delegates to the same parser. | New object records, optional route metadata and three-level shapes must travel through all codecs. Recovery also needs to retain repairable unfinished edits safely. |
| Routes | `src/core/routes.ts` always forms prefix plus slug. `resolveLink` and `contextFor` in `src/core/content.ts` add entry URLs only when a generic page is assigned. | Add single-entry paths and optional route metadata while preserving the distinction between a valid content relation and a valid public link. |

These are observations of the existing baseline, not claims of regressions in an implemented redesign. No new runtime, provider or benchmark result was obtained.

## Recommendations

The [consolidated plan](../discussions/content-model-plan.md) now prioritizes: end-to-end forward bindings and nested projections; shared-definition impact including templates; persistence and recovery round-trips; and consistent routing for data-only, ordinary and single-entry content. Exact mechanisms remain engineering proposals.

The highest risk is delivering a schema editor that stores structures its blocks cannot use. Start with a small complete path proving an Article's data-only Author, ordered related cards, and three-level product specifications. Include public rendering, a shared-definition edit and save/reload before expanding the authoring surface. A Company Profile fixture then covers the direct single-entry route. Existing blocks need compatible shapes; this is not a promise of arbitrary nested presentation.

Preserve the accepted draft/publish distinction. Draft values may be incomplete; malformed saved structures remain rejected. Recovery must preserve repairable in-progress edits without eagerly expanding cyclic definitions. Broken bindings and internal links need actionable publication errors, while a relation to data-only content remains valid.

Application source and fixtures are unchanged. The wiki build/check validates documentation only; `pnpm verify` and live-provider checks are reserved for implementation verification. The user has not authorized that increment by requesting this review.
