---
title: Lean Sanity-style content model selected
updated: 2026-10-07
status: Direction accepted; engineering adaptation proposed
---
# Lean Sanity-style content model selected

After the [seven-CMS comparison](2026-10-07-cms-schema-comparison.md), the user says: “let's model ours closely to sanity's. keep it lean.” DEC-128 accepts Sanity as the primary content-model reference. This is a direct direction-setting instruction; no further questionnaire is needed to choose a reference model.

The [consolidated plan](../discussions/content-model-plan.md) now leads with independent entries, owned objects, typed arrays and stable references. A collection owns its document schema; an entry has independent identity; an object shares its definition while retaining locally owned values. Ordered references and repeated objects use arrays. Single-entry collections use the same entry model with a mode constraint.

The adaptation preserves the settled behavior through DEC-127, including three owned levels, nonrecursive definitions, one target collection, one object shape per list, unique ordered multiple selections, deletion guards and lean authoring/navigation. It retains editable schema records in Git, optional routes, separate generic pages and snapshot publication. Sanity's hosting, query language and broader feature set are not selected by this instruction.

Engineering recommendation: use a shared object/array/reference field grammar, with multiple references represented as an array of references. This replaces the prior proposed `reference.multiple` representation; the accepted one/many authoring behavior is unchanged. Keep compact ID values and stable row identities without adding vendor-specific metadata merely to resemble Sanity's wire format. Reuse one traversal, one incoming-usage index and bounded forward resolution. Exact records and interfaces remain proposed engineering, separate from DEC-128's accepted direction.

No application source changes or provider operations occur. Implementation of this increment remains pending. Documentation build/check is run for the updated plan and records; it does not establish application functionality.
