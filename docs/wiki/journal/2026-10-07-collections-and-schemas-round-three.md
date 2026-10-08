---
title: Collections and schemas — shape and behavior accepted
updated: 2026-10-07
status: Structural choices accepted; usage choices open
---
# Collections and schemas — shape and behavior accepted

The user reports the form submitted. Collection and finish succeed, preserving [Q86–Q89](2026-10-07-grill-a0fd15b5-4c31-4b31-800c-1b302fae7558.md). All four recommended options are selected with no notes. DEC-119–DEC-122 record relations inside flat groups, editorial order, unique targets within each relation value, and direct public paths for routed single-entry collections.

The one-level rule is now concrete: a top-level owned object or structured list row may contain leaf fields, including single/multiple references, but not another owned object/list. Reference traversal is a graph operation, not deeper owned content. Multiple references must preserve order and reject duplicates per field value, while separate credit rows may reference the same person.

Single-entry collections remain optionally data-only. When assigned a generic page, their explicit path replaces the prefix-plus-slug formula used by ordinary collections. There is no implicit route or separate entry slug in that routed mode.

The remaining product round, Q90–Q92, asks about reverse-related content in templates, creating/editing targets from relation controls, and the navigation home for collection schemas and reusable object definitions. Recommendations are derived reverse lists, dedicated target-editing navigation, and a common Schemas area with separate Collections and Objects destinations. All remain unanswered.

The implementation plan still needs lifecycle/conversion rules, serialized field shapes, bounded resolution, draft/publication validation and schema-change impact handling. These should be concrete engineering proposals under the accepted constraints rather than additional speculative product questions. Form completion does not authorize application implementation.

This turn updates discussion records and the next form only. Application source and fixtures are unchanged.
