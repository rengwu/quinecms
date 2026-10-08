---
title: Collections and schemas discussion begins
updated: 2026-10-07
status: Exploring
---
# Collections and schemas discussion begins

The user asks to discuss collections and schemas after the object-versus-collection explanation. The assistant inspects the current collection types, schema editor and routing behavior, and reads the accepted content/template and recent object/relation decisions.

The [topic](../discussions/collections-and-schemas.md) separates schemas, collections, entries, object definitions and generic pages. It distinguishes conceptual separation from requiring separately stored reusable schemas. The current implementation stores fields and collection/routing settings together; it already supports template sharing and data-only collections.

Q82 asks whether each collection should own its whole schema or several collections should be able to share an independent schema. The recommendation is collection-owned schemas with reusable object definitions for common groups, while explaining the benefit and cost of whole-schema reuse. The question is unanswered. Dependent questions about overrides and schema switching wait for this root choice; no additional model choices are inferred.

DEC-110–DEC-114 remain intact. No application changes are made, and no implementation is authorized by the new discussion request. The round is presented using grill-form, following the project's interview workflow.
