---
title: Visual editing and recovery
updated: 2026-10-08
---
# Visual editing and recovery

**ID:** FEAT-editor

## Intent and basis

The [accepted design](../discussions/agreed-design.md) requires a side drawer alongside a live single-document preview for page editing, defined block fields, basic collection schemas, and tab recovery. The [versioning and Markdown contracts](../discussions/technical-contracts.md) prohibit guessed migrations and silent loss of unsupported formatting.

DEC-052–DEC-054 established the Add block header action and separate Content and Collection schemas areas. DEC-074 replaces the standalone Home menu with persistent main navigation in a separate left sidebar. The current area stays highlighted even in nested editors; Pages opens by default. At widths up to 800px, Menu opens the same destinations in a Kumo dialog.

DEC-132 makes non-leaf sidebar items disclosures without routes. Schemas expands/collapses Collections and Objects without navigating or resetting the current editor. Each child opens its list directly, with no intermediate Schemas screen and no Back button on either list. Nested schema editors retain Back. Only the active leaf has `aria-current`; the parent exposes its expanded state and a caret. The compact navigation dialog uses the same hierarchy, staying open for disclosure changes and closing after a leaf selection. Opening the menu on a schema destination reveals its active child.

DEC-055 requires consistent form and action layout. The [editor layout contract](../journal/2026-10-05-editor-layout.md) defines 8px label/control gaps, 16px field gaps, 24px section spacing/padding, grouped navigation fields and separate terminal actions. Custom widgets follow the same contract as built-in fields.

DEC-056 adds Pages table → Page editor → Block editor. The full-page overview lists every page's title, type and URL path using [Kumo Table](https://kumo-ui.com/components/table/). It contains Add page, with no builder drawer or live preview. Main navigation remains available. Open a row (or its keyboard-accessible title button) to edit that page. Titles use plain table styling; hover/focus highlights the row, with a visible keyboard focus indicator. Adding first selects static or generic, then opens an uncommitted New page form; Create page adds it and opens the page editor; deleting returns to the table, including its empty state. Page edits survive returns and switching pages.

DEC-099 extends live rendering to Site Layout settings and their selected page. DEC-057 continues to confine other live rendering to an individual page or its block editor. Content, Collection schemas, Media and Settings use centered admin forms/lists with no builder drawer, preview or preview-width toggle, including nested entry, model and field screens. Preview islands are unmounted when leaving page editing. The content state and shared Save draft/Publish actions remain available across all views.

DEC-076 standardizes the Pages table and every standard admin form/list at a centered 867px maximum content width, shrinking to fit narrower viewports. Both layout containers share `--admin-content-max-width`. This admin layout token is separate from the editable public-site width. The page-building drawer and compact dialogs retain their own layout.

## Entry points and prerequisites

Open `/admin/` using [setup](../verification/setup.md). Without a configured password, the Pages table opens directly. Repository credentials are needed only for remote loading/saving. The main sidebar provides Pages, Content, Schemas, Media, Site Layout and Settings. Schemas separates Collections and Objects; the [content-model contract](content-model.md) describes shared definitions, nested values, references and single entries. Area switching preserves local content; existing-item editors use ← Back to return to their parent screen; creation forms use Cancel and Create instead.

## Expected outcomes

The mobile live preview is horizontally centered in the workspace remaining beside the navigation and editing drawer. Its 390px width shrinks to the available desktop space; the narrow-window overflow behavior remains in place.

The [block library](block-library.md) adds themed/tagged browsing, shared chrome, repeated content and schema lists. Its record owns the expanded contract and verification recipe.

The shared sortable list uses optimistic FLIP animations for page blocks and every repeated-content list. From mouse-down, the carried row follows cursor Y at the original grab offset, with X locked; it is drawn above clipping containers. Neighbors animate into the temporary order over 150ms and interrupted movements start from the current visual position. The blue insertion marker has been removed. Edge scrolling uses a 32px activation band and a capped speed, following Chartr's shared sorter reference. Only the list changes while held; the site's content/preview order updates once on release. Releasing outside still commits, with positions above/below the list resolving to its ends. This explicitly supersedes the earlier outside-release cancellation behavior. Escape, system pointer cancellation, or conflicting content/disabled changes abort safely. Reduced motion retains exact pointer carrying and immediate reordering while skipping FLIP/settle motion.

Create/edit/delete pages and entries; reorder blocks by dragging their rows (Alt+Up/Down with keyboard focus). Kumo supplies admin controls, dialogs, and toasts; its styles are scoped away from preview blocks. Select a block to edit its fields and version. This replaces the parent editor controls, including page fields and the parent back link. Back returns to the same document and restores those controls. Same-key compatible values survive a version switch, unmatched values are null, and Cancel restores the last loaded/saved instance. Unknown versions preserve raw data and prevent publication.

Schema rich-text fields and Text blocks provide visual headings, paragraphs, bold/italic, links, and lists with Markdown storage. Uploaded-image references and YouTube embeds round-trip in the visual editor. Unsupported Markdown remains available as source text. Custom React widgets and shared pure validators support compound block fields. Content browses collections → entry lists → schema-defined entry values only. Schemas browses Collections / Objects → definitions → individual fields, with label/key/type/required/options/default controls. Schema editing protects populated keys/types/options. Entries remain in Content and never appear in the Pages table. Add entry is confined to entry lists; Add collection belongs to the schema list. All Add actions (page, block, entry, collection, field and link) use the same blue Kumo primary variant, base size and plus icon. Add block remains aligned right beside Blocks, outside the draggable list. Main navigation preserves all local content edits. Site Layout delegates title, appearance and navigation to the active author settings; shared Settings owns geometry, Backups and Session.

Local content and its base/repository identity survive reloads silently in tab storage. Unreadable recovery data is preserved for download and requires explicit discard before it can be overwritten. This includes unfinished schema edits that cannot yet be saved. Export/import backups contain content, not credentials or binary uploads. Storage failure is visible. Lock clears GitHub/R2 credentials and returns to the gate.

Local development skips the unsaved-edit reload confirmation at the user's request; production retains it. Tab recovery continues in both. Site Layout owns content max-width/page gutter and their per-layout defaults (DEC-130); Starter also owns the typography controls. Settings contains Backups and Session. Website tokens stay scoped away from admin controls. See the [Site Layout contract](site-layouts.md).

DEC-108 applies the same drill-down rule sitewide: opening a repeated item replaces all parent/sibling controls with its dedicated level. Back returns one parent at a time, including nested header dropdowns and footer columns. The inspector-wide `PanelNavigation` outlet also contains block/entry field lists and schema default rows; their parent forms remain mounted but hidden from display and accessibility. Area/document/layout changes clear the level, and focus moves to its heading. Custom settings authors use `PanelLevel` for their own drill-down screens.

The block editor places its version selector beside the block title in one non-wrapping row. The selector has no visible label, retains the accessible name **Version**, and occupies at most 140px or half the row. Long block titles truncate with an ellipsis; the full name remains in the heading's accessible text and hover title. See the [header verification](../verification/runs/2026-10-08-block-header.md).

## Form action alignment (DEC-131)

Terminal confirmation/cancellation groups align to the right edge of the full form, including creation screens, nested editors, dialogs and rich-text image/video insertion. Cancel/Close comes before the confirming action; the group wraps when space is limited and remains right-aligned. Single terminal actions use the same alignment. Implement with the full-width shared `dialogActions` row; `actionFooter` separates terminal actions from fields and also aligns its children right. Author-supplied admin forms follow this rule.

## Creation forms (DEC-129)

Add opens a dedicated **New …** form. Entering or typing in that form does not add anything to site content, recovery, exports or saves. Its terminal actions are **Cancel** and **Create …**, with no Back or Delete/Remove action for the pending item. Cancel, leaving the screen or reloading discards unfinished creation. Existing items keep their normal Back and deletion controls.

Block and footer creation headings separate the action from the selected type: **New block** or **New footer** is the heading, with the definition label (for example, chartr · Workspace) directly underneath in smaller, muted text. The subtitle may wrap, and the grouped heading is separated from the first field by the standard form gap.

This applies to static/generic pages, entries, many/single-entry collections, reusable object definitions, nested schema fields, owned object values, list rows, page blocks and footers. Shared list fields carry the same interaction into navigation links/dropdowns, footer columns/links and repeated block content. Page-kind or catalog selection may precede the form; choosing a candidate still does not insert it. Pages first collect their title/path, then Create page opens the existing page editor for block authoring.

Create adds to the immediate parent. A child created inside an unfinished parent remains local to that parent; cancelling the parent discards all its staged children. A single-entry collection provisions its entry, with the completed schema's defaults, only on Create collection. Cancelling a replacement footer preserves the current footer. Create updates the local editor draft; Git Save draft and Publish remain separate actions.

**Negative UX to avoid:** Add immediately inserts a placeholder, then shows Back and Delete/Remove as the only exits. This leaves accidental empty records when a user merely explores a form and forces deletion to cancel an action. Do not introduce this pattern in new built-in or author-supplied controls. This supersedes the earlier immediate-insertion catalog behavior.

## Verification recipe

1. Open Pages. Verify all pages appear in a table with title/type/path columns, main navigation with Pages highlighted, and no builder drawer or preview. Open Home: page settings/blocks appear with a ← Back button, no selector or Add page. Open Hero: the sidebar starts with ← Back and shows no page fields, parent back link, or global destination menu. Back restores the page controls; reopen Hero. Change Heading and observe preview. Switch v2 → v1 → v2: Heading remains; Eyebrow/Alignment/Design start empty. Cancel restores the original.
2. Drag Text up: the row follows cursor Y with X locked, neighboring rows animate and the website preview holds its original order until release. Try releasing over a row, a gutter and outside the list; the final sort commits in every case. Hover at a scroll edge to reach offscreen rows. Reverse midway through an animation, try variable-height row labels and reduced motion. Escape cancels; ordinary clicks still open an item. Edit Body visually and reload; development reloads directly, while production may require accepting the browser warning. Order and text should persist.
3. Preview is always interactive. Increment the Svelte counter; select it in the drawer and change Starting number. Verify the preview uses the new number and retains its interactive increment until removal/reload.
4. Content → Journal shows an entry list and Add entry in a standard admin view, with no model controls or preview. Open an entry, change Title and verify its heading updates; verify there is no block list or Add block action, then return to the entry list. Values persist and no live rendering appears at any level. Collection schemas → Journal instead shows the model and compact field rows in the same admin layout. Open Title: populated key/type and removal are disabled. Add a field with a default, then create an entry through Content and verify the default. A blank required title produces no proactive issue notice; Publish reports validation through a toast.
5. Add a block through the header action and dialog. Switch directly to Site through the main sidebar; the builder drawer and preview disappear. Site → Discard edits resets local test content. Export/import and password/Lock browser paths still require a follow-up browser run.
6. Inspect Hero Design, Media and Site. Labels sit above aligned controls; settings/add actions appear beside section headings. Each navigation link is one bounded group, with removal inside it. Backups and Session are separate sections. Connection groups Close/Connect at the bottom right. Schema field removal is separated from editable fields.
7. Change a page title/path, return to Pages and open another page, then reopen the edited page: values persist and the table reflects them. Add page from the overview, choose Static page, rename it, then Create page. Repeat with Cancel and confirm no extra page appears. Delete that test page: Cancel keeps it; Continue returns to the table. With no pages, the table shows No pages yet and Add page remains available.
8. Visit Media and Site through the main sidebar: both use a centered admin workspace with no builder drawer, website rendering or Mobile/Desktop button. Return to Pages → Home and verify the preview and width toggle return. A page-preview navigation link to an entry opens that entry's standard Content editor. Below 800px, Menu opens all five destinations; selecting one closes the dialog and changes the area.

Generic-page binding, assignment and routing behavior is mapped in [Generic pages and collection content](generic-pages.md). Tab recovery uses a new namespace and leaves the legacy snapshot untouched.

## Coverage and limitations

The initial run observed core interactions on an intermediate build. The startup repair subsequently verified development startup, live heading edits/cancel, and production startup with Svelte/Vue interaction on the repaired build. Recovery, visual editor mounting/read-only behavior, Markdown meaning, and adapter lifecycle have unit coverage. The Kumo refinement run verifies mouse sorting, silent recovery, and submission toasts in the browser; full layout parity remains untested.

## Verification history

- [Expandable Schemas navigation and direct leaf lists](../verification/runs/2026-10-08-sidebar-groups.md).

- [Creation heading hierarchy](../verification/runs/2026-10-08-creation-heading.md).

- [Sitewide form-action alignment](../verification/runs/2026-10-08-form-action-alignment.md).

- [Centered mobile preview](../verification/runs/2026-10-08-mobile-preview.md).

- [Explicit creation forms and cancellation](../verification/runs/2026-10-08-creation-forms.md).

- [Number-input height repair](../verification/runs/2026-10-08-number-input-height.md).
- [Content model, nested editors and recovery](../verification/runs/2026-10-08-content-model.md).

- [Site Layouts, chartr and dedicated nested editing](../verification/runs/2026-10-06T1140Z-site-layouts.md).

- [Optimistic FLIP sorting and Chartr reference behavior](../verification/runs/2026-10-06T0845Z-sortable-flip.md).
- [Gutter drop regression repair](../verification/runs/2026-10-06T0632Z-gutter-drop.md).
- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md).
- [Admin startup repair](../verification/runs/2026-10-05T0910Z-admin-startup.md).

- [Kumo admin refinement](../verification/runs/2026-10-05T1005Z-kumo-admin.md).

- [Block sidebar hierarchy](../verification/runs/2026-10-05T1014Z-block-sidebar.md).

- [Admin hierarchy and Home navigation](../verification/runs/2026-10-05T1054Z-admin-hierarchy.md).

- [Editor layout consistency](../verification/runs/2026-10-05T1108Z-editor-layout.md), including the previously outstanding schema-field browser inspection.

- [Pages table hierarchy](../verification/runs/2026-10-05T1124Z-page-list.md).

- [Page-only preview and standard admin views](../verification/runs/2026-10-05T1303Z-admin-views.md).

- [Generic pages and schema-only entries](../verification/runs/2026-10-05T1650Z-generic-pages.md).

- [Persistent admin sidebar](../verification/runs/2026-10-05T1725Z-admin-navigation.md).

- [Shared content width and development reloads](../verification/runs/2026-10-05T1735Z-content-width.md).

- [Standard admin content width](../verification/runs/2026-10-05T1750Z-admin-width.md).

- [Table rows and consistent Back labels](../verification/runs/2026-10-05T1752Z-page-row.md).

- [Site typography and page gutter](../verification/runs/2026-10-05T1810Z-site-design.md).

- [Block library and repeated fields](../verification/runs/2026-10-06T1320Z-block-library.md).
