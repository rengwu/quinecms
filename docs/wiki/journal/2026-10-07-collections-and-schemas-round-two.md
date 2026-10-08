---
title: Collections and schemas — content models accepted
updated: 2026-10-07
status: Content-model choices accepted; details open
---
# Collections and schemas — content models accepted

The user reports the form submitted. Collection and finish succeed, preserving [Q83–Q85](2026-10-07-grill-62a9fc65-afb5-4c46-bb07-9da151affd7f.md). All three recommendations are selected, with no notes. DEC-116–DEC-118 record single-entry and ordinary collection modes, routing metadata required only for routed content, and configurable one/many relations.

These choices retain one schema per collection, one target collection per relation field and the selected one-level object/list limit. Single-entry content shares actual values; reusable object definitions share field structure. The new mode does not itself create a public route.

Q86–Q89 clarify ready follow-ups: whether relation fields may appear inside shallow objects/list rows; whether multiple references have editor-controlled order; whether one target can repeat in the same relation field; and the URL shape for a routed single-entry collection. Recommendations are to allow relations inside flat groups, preserve editorial ordering, prevent duplicates within a direct relation field, and use a direct path for a routed single-entry collection. All remain unanswered.

The singleton URL proposal would be an explicit exception to the ordinary prefix-plus-slug route rule. Reference values inside a group do not embed target fields, but counting multiple references under the one-level rule still needs the user's choice. No such behavior is silently inferred from the latest answers.

This turn updates planning records and the questionnaire only. Application source, fixtures and provider state are unchanged; implementation is not authorized by form completion.
