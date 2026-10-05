---
title: Visual editing and recovery
updated: 2026-10-06
---
# Visual editing and recovery

**ID:** FEAT-editor

## Intent and basis

The [accepted design](../discussions/agreed-design.md) requires a side drawer alongside a live single-document preview for page editing, defined block fields, basic collection schemas, and tab recovery. The [versioning and Markdown contracts](../discussions/technical-contracts.md) prohibit guessed migrations and silent loss of unsupported formatting.

DEC-052–DEC-054 established the Add block header action and separate Content and Collection schemas areas. DEC-074 replaces the standalone Home menu with persistent main navigation in a separate left sidebar. The current area stays highlighted even in nested editors; Pages opens by default. At widths up to 800px, Menu opens the same destinations in a Kumo dialog.

DEC-055 requires consistent form and action layout. The [editor layout contract](../journal/2026-10-05-editor-layout.md) defines 8px label/control gaps, 16px field gaps, 24px section spacing/padding, grouped navigation fields and separate terminal actions. Custom widgets follow the same contract as built-in fields.

DEC-056 adds Pages table → Page editor → Block editor. The full-page overview lists every page's title, type and URL path using [Kumo Table](https://kumo-ui.com/components/table/). It contains Add page, with no builder drawer or live preview. Main navigation remains available. Open a row (or its keyboard-accessible title button) to edit that page. Titles use plain table styling; hover/focus highlights the row, with a visible keyboard focus indicator. Adding first selects static or generic, then opens the new page; deleting returns to the table, including its empty state. Page edits survive returns and switching pages.

DEC-057 confines live rendering to an individual page or its block editor. Content, Collection schemas, Media and Site use centered admin forms/lists with no builder drawer, preview or preview-width toggle, including nested entry, model and field screens. Preview islands are unmounted when leaving page editing. The content state and shared Save draft/Publish actions remain available across all views.

DEC-076 standardizes the Pages table and every standard admin form/list at a centered 867px maximum content width, shrinking to fit narrower viewports. Both layout containers share `--admin-content-max-width`. This admin layout token is separate from the editable public-site width. The page-building drawer and compact dialogs retain their own layout.

## Entry points and prerequisites

Open `/admin/` using [setup](../verification/setup.md). Without a configured password, the Pages table opens directly. Repository credentials are needed only for remote loading/saving. The main sidebar provides Pages, Content, Collection schemas, Media and Site. Area switching preserves local content; all nested parent-navigation buttons read ← Back and return to the parent screen within that area.

## Expected outcomes

Create/edit/delete pages and entries; reorder blocks by dragging their rows (Alt+Up/Down with keyboard focus). Kumo supplies admin controls, dialogs, and toasts; its styles are scoped away from preview blocks. Select a block to edit its fields and version. This replaces the parent editor controls, including page fields and the parent back link. Back returns to the same document and restores those controls. Same-key compatible values survive a version switch, unmatched values are null, and Cancel restores the last loaded/saved instance. Unknown versions preserve raw data and prevent publication.

Schema rich-text fields and Text blocks provide visual headings, paragraphs, bold/italic, links, and lists with Markdown storage. Uploaded-image references and YouTube embeds round-trip in the visual editor. Unsupported Markdown remains available as source text. Custom React widgets and shared pure validators support compound block fields. Content browses collections → entry lists → schema-defined entry values only. Collection schemas browses models → collection definitions → individual fields, with label/key/type/required/options/default controls. Schema editing protects populated keys/types/options. Entries remain in Content and never appear in the Pages table. Add entry is confined to entry lists; Add collection belongs to the schema list. All Add actions (page, block, entry, collection, field and link) use the same blue Kumo primary variant, base size and plus icon. Add block remains aligned right beside Blocks, outside the draggable list. Main navigation preserves all local content edits. Site settings manage title, optional theme, and ID-based navigation.

Local content and its base/repository identity survive reloads silently in tab storage. This includes unfinished schema edits that cannot yet be saved. Export/import backups contain content, not credentials or binary uploads. Storage failure is visible. Lock clears GitHub/R2 credentials and returns to the gate.

Local development skips the unsaved-edit reload confirmation at the user's request; production retains it. Tab recovery continues in both. Site settings offers shared [typography, content max-width and page gutter](static-blocks.md), scoped to website rendering rather than admin layout. Typography and Layout use the same section/field spacing as other admin forms.

## Verification recipe

1. Open Pages. Verify all pages appear in a table with title/type/path columns, main navigation with Pages highlighted, and no builder drawer or preview. Open Home: page settings/blocks appear with a ← Back button, no selector or Add page. Open Hero: the sidebar starts with ← Back and shows no page fields, parent back link, or global destination menu. Back restores the page controls; reopen Hero. Change Heading and observe preview. Switch v2 → v1 → v2: Heading remains; Eyebrow/Alignment/Design start empty. Cancel restores the original.
2. Move Text up; its preview moves above Hero. Edit Body visually and reload; development reloads directly, while production may require accepting the browser warning. Order and text should persist.
3. Preview is always interactive. Increment the Svelte counter; select it in the drawer and change Starting number. Verify the preview uses the new number and retains its interactive increment until removal/reload.
4. Content → Journal shows an entry list and Add entry in a standard admin view, with no model controls or preview. Open an entry, change Title and verify its heading updates; verify there is no block list or Add block action, then return to the entry list. Values persist and no live rendering appears at any level. Collection schemas → Journal instead shows the model and compact field rows in the same admin layout. Open Title: populated key/type and removal are disabled. Add a field with a default, then create an entry through Content and verify the default. A blank required title produces no proactive issue notice; Publish reports validation through a toast.
5. Add a block through the header action and dialog. Switch directly to Site through the main sidebar; the builder drawer and preview disappear. Site → Discard edits resets local test content. Export/import and password/Lock browser paths still require a follow-up browser run.
6. Inspect Hero Design, Media and Site. Labels sit above aligned controls; settings/add actions appear beside section headings. Each navigation link is one bounded group, with removal inside it. Backups and Session are separate sections. Connection groups Close/Connect at the bottom right. Schema field removal is separated from editable fields.
7. Change a page title/path, return to Pages and open another page, then reopen the edited page: values persist and the table reflects them. Add page from the overview, choose Static page, rename it, then return. Delete that test page: Cancel keeps it; Continue returns to the table. With no pages, the table shows No pages yet and Add page remains available.
8. Visit Media and Site through the main sidebar: both use a centered admin workspace with no builder drawer, website rendering or Mobile/Desktop button. Return to Pages → Home and verify the preview and width toggle return. A page-preview navigation link to an entry opens that entry's standard Content editor. Below 800px, Menu opens all five destinations; selecting one closes the dialog and changes the area.

Generic-page binding, assignment and routing behavior is mapped in [Generic pages and collection content](generic-pages.md). Tab recovery uses a new namespace and leaves the legacy snapshot untouched.

## Coverage and limitations

The initial run observed core interactions on an intermediate build. The startup repair subsequently verified development startup, live heading edits/cancel, and production startup with Svelte/Vue interaction on the repaired build. Recovery, visual editor mounting/read-only behavior, Markdown meaning, and adapter lifecycle have unit coverage. The Kumo refinement run verifies mouse sorting, silent recovery, and submission toasts in the browser; full layout parity remains untested.

## Verification history

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
