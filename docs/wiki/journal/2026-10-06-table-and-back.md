---
title: Table rows and consistent Back labels
updated: 2026-10-06
status: Implemented locally
---
# Table rows and consistent Back labels

The user identified the Pages title's rounded hover pill as incorrect styling. The title still uses Kumo's accessible button but now has transparent background, no offset/padding and inherited table typography. Hover and focus highlight the whole row; keyboard focus remains visible.

Follow-up instructions require every parent-navigation control to read **← Back**. Page, block, entry, collection list, schema and schema-field screens now use that label, preserving their existing parent destinations. Navigation tests were updated to verify those transitions and continue checking that parent page controls disappear inside block editing.

The [verification run](../verification/runs/2026-10-05T1752Z-page-row.md) records the browser check and passing regression/build checks.

A further instruction standardizes every Add action to the blue variant. Add page, block, entry, collection, field and link now use Kumo primary at the same base size with a plus icon. Final verification includes this change; Add entry was visually checked in the browser.
