---
title: Relations and objects — first-round choices
updated: 2026-10-07
status: Choices accepted; details open
---
# Relations and objects — first-round choices

The user reports the revised form submitted. Collection and finish succeed, preserving [Q77–Q81](2026-10-07-grill-60cae8b1-ce10-49a9-b741-7cb19b94ca6e.md). All five questions have selections and no notes. DEC-110–DEC-114 record both named/inline object definitions, one-level objects/lists, one target collection per relation field, one shape per list for now, and blocking deletion while referenced.

The nesting, multi-collection and mixed-list research recommendations were not selected. They must not be treated as accepted requirements. The accepted limits favor a smaller model; supporting deeper structures through separate collections remains a modeling option, not permission to bypass the limits.

During interpretation the user asks whether objects differ from collection schemas. The explanation distinguishes a collection schema, which defines independent entries, from an object definition, which defines a field group owned by an entry. Both describe fields and can share schema machinery. Reusing an object definition shares structure, not values. A relation connects independently managed entries. The question supplies no changed answer.

Before implementation, make the one-level rule concrete, especially the list-row wrapper and whether relation multiplicity inside a group counts as structural nesting. Single/multiple relations, order/uniqueness, reverse views, target creation/editing and the object-definition UI remain open. No further questionnaire is issued during this conceptual clarification.

Records and the research brief are reconciled with the submitted choices. The completed form link is replaced because finish removed that temporary session. Application source is unchanged; this remains a design discussion.
