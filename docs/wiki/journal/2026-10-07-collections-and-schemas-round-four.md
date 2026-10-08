---
title: Collections and schemas — product discussion complete
updated: 2026-10-07
status: Product scope settled; engineering plan proposed
---
# Collections and schemas — product discussion complete

The user reports the form submitted. Collection and finish succeed, preserving [Q90–Q92](2026-10-07-grill-5a1974a4-c958-426a-affb-bcb9cfb7c8d4.md).

For both Q90 and Q91 the user selects Something else with the note “no opinion, choose the leanest, simplest option.” This explicitly delegates those choices. The assistant chooses admin-only reverse lookups and selection-only relation controls (DEC-123–DEC-124), rather than the richer options previously recommended. Reverse lists in templates and integrated linked-entry authoring are outside the current scope. The required incoming-usage/deletion checks and forward reference rendering remain.

Q92 explicitly selects one Schemas area with Collections and Objects destinations (DEC-125). Content remains the entry-value editor, and every nested editor retains a dedicated navigation level.

The scoped product discussion is complete. The [consolidated plan](../discussions/content-model-plan.md) collects accepted behavior and separately proposes storage, singleton lifecycle, field traversal, forward bindings, editor integration, publication validation and implementation stages. No further product questionnaire is needed for these choices. Engineering recommendations are not relabeled as user decisions.

The plan also states practical limits: no automatic author-to-articles template list, no multiple target collections per relation, no mixed object variants or deeper owned nesting, and no integrated target editor. These are deliberate scope limits, not claims that the initial breadth concerns have all been solved.

A standalone HTML brief is generated at `output/collections-schemas-plan.html`; Markdown remains authoritative. Only planning records and presentation artifacts change. Implementation is not started or authorized by completing the interview. Application/provider checks remain future work.

Verification: the wiki build and check pass for 108 pages. The standalone brief was inspected in headless Chrome at desktop and mobile widths; its disclosures open, local links resolve, and the document has no horizontal overflow, including with all sections expanded. Mobile tables render as readable stacked rows. Screenshots are retained beside the HTML. `pnpm verify` was not rerun for this documentation-only change; no application or live-provider result is implied.

## Follow-up — strongest restriction critique

After resuming the agreed scope, the user asks which single restrictive decision the assistant would criticise most. The assistant selects the one-level owned object/list boundary (DEC-111/DEC-119): common structures such as product specification groups with specification rows otherwise require artificial independent collections, relation controls and separate editing flows. Bounded nesting is recommended for reconsideration, with dedicated navigation and one shape per list retained. It would require additional traversal, validation, binding and schema-edit work.

The [consolidated plan](../discussions/content-model-plan.md) records this as a proposal. The user has not revised the accepted depth decision or authorized implementation. No application code changes.
