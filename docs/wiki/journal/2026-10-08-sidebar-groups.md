---
title: Expandable sidebar groups
updated: 2026-10-08
status: Implemented and locally verified
---
# Expandable sidebar groups

The user requests expandable/collapsible sidebar items, with no routes on non-leaf items. Schemas becomes a group containing Collections and Objects. The follow-up explicitly removes Back from both child list screens. DEC-132 records these direct requirements; no interview is needed.

Navigation now distinguishes groups from typed leaf destinations. Schemas toggles an indented child group and caret without changing the active view or resetting local forms. Collections and Objects are separate editor destinations; switching between them remounts the schema editor and discards unfinished creation, as DEC-129 requires. The old intermediate Schemas screen is removed. Existing definition and field editors keep their nested Back actions.

The shared navigation component supplies the same hierarchy to the compact menu. Group toggles keep that dialog open; selecting a leaf closes it. The active child is revealed when the menu opens on a schema destination. Disclosure state is local UI state, not content or a persisted routing contract.

`pnpm verify` passes diagnostics, 161 tests, production build and artifact checks. Native Safari confirms expansion without navigation, direct Collections/Objects screens without Back, and collapse without leaving Objects. Mounted tests exercise local form preservation, cancelled creation after switching children, active highlighting and compact-menu behavior. See the [verification record](../verification/runs/2026-10-08-sidebar-groups.md).
