---
title: Consistent editor layout
updated: 2026-10-05
status: Implemented
---
# Consistent editor layout

The user reported inconsistent spacing and action placement in block Design fields, Media, navigation links, and backup/session controls, and requested research into sidebar editors and Cloudflare's Kumo usage. DEC-055 records the requirement. The exact spacing below is an implementation choice, not an interview answer.

## Research and application

- [Kumo Input](https://kumo-ui.com/components/input/) and [Select](https://kumo-ui.com/components/select/) compose visible labels, controls, descriptions, and errors through Field. The [Field source](https://github.com/cloudflare/kumo/blob/main/packages/kumo/src/components/field/field.tsx) uses `grid gap-2`; use that 8px label/control rhythm and Kumo's native label support for compound widgets.
- [Kumo Dialog](https://kumo-ui.com/components/dialog/) demonstrates composed headings, content and action rows. Its base styling uses 24px padding and 16px gaps. Apply those dimensions to our drawer and forms, with closing/submitting actions together at the dialog's lower right.
- [Kumo Button](https://kumo-ui.com/components/button/) provides primary, secondary, ghost and destructive variants. Use primary for a screen's main operation, ghost for header additions/settings, and secondary-destructive for removal. These assignments are our application convention.
- [WordPress block design](https://developer.wordpress.org/block-editor/explanations/user-interface/block-design/) recommends sections and headers when inspector options grow. [Webflow's Style panel](https://help.webflow.com/hc/en-us/articles/33961362040723-Style-panel-overview) separates controls into meaningful sections. Group by task and selected object; do not add collapsible panels where a short visible group is sufficient.

## Layout contract

Kumo owns controls, visual states and semantic colors. `src/editor/editor.module.css` owns layout; `PanelSection` supplies a heading, optional header action and content stack.

| Relationship | Rule |
| --- | --- |
| Label to control | 8px; label above a full-width control, except checkboxes |
| Adjacent fields | 16px, owned by the parent stack rather than each field's margins |
| Drawer/dialog edges | 24px padding |
| Separate sections | Divider with 24px space on either side |
| Related action buttons | 8px; wrap naturally when needed |
| List rows | 8px; additions belong beside the heading, outside the list |
| Compound widget | Named fieldset and legend; internal controls follow the same stack |
| Destructive document/block actions | Separate footer after the fields |

Use `panelBody`/`formStack` for forms, `field` for a label/control pair, `PanelSection` for distinct tasks, and `actionFooter`/`dialogActions` for terminal controls. Avoid per-control spacing overrides. All layout remains scoped to the admin surfaces.

## Result

Hero Design fields now stack and align with the other block controls. Media gives Upload file priority and places Storage settings beside the heading. Navigation links each have a bounded group containing Label, Destination, optional URL and a right-aligned removal action. Site settings, Navigation, Backups and Session are separate sections. Pages, schemas, blocks, dialogs, media cards and the login form use the same layout primitives.

The [verification run](../verification/runs/2026-10-05T1108Z-editor-layout.md) records 61 passing tests, a successful static build, and browser inspection of the affected layouts. Browser schema/field inspection also completes the visual check left open by the previous hierarchy run.
