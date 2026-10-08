---
title: Collections and schemas — ownership accepted
updated: 2026-10-07
status: Ownership accepted; next choices open
---
# Collections and schemas — ownership accepted

The user reports the form submitted. Collection and finish succeed; [Q82](2026-10-07-grill-7f4de03d-e6cc-42a8-a3e1-e309d5efb160.md) selects “Each collection owns its schema; reuse object definitions,” with no notes. DEC-115 records this selection.

The independent whole-schema branch is not selected. Questions about whole-schema assignment, per-collection overrides and switching a collection between shared schemas are therefore unnecessary for the current scope. Shared object definitions retain their accepted role; their values remain owned by each containing entry. Existing template sharing and data-only collection behavior remain intact.

The next round asks three independent content-model questions: Q83 single-record content, Q84 whether data-only collections require routing metadata, and Q85 whether a relation field can select one or multiple entries from its one target collection. All are unanswered. The assistant recommends a single-entry mode, routing metadata required only for routed collections, and configurable one/many references.

Code inspection confirms that collection path and entry slug fields are currently present regardless of template assignment. Changing their requirements would be a new behavior, distinct from the already accepted absence of generated routes for data-only collections. The new proposals are not recorded as accepted decisions.

No application code or fixtures change. The discussion records are reconciled and the next questions are presented with grill-form.
