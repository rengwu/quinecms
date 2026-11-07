---
title: Admin rework review
updated: 2026-11-08
status: Mostly resolved (2026-11-08); remaining items listed below
summary: Independent review of the first admin rework pass against the accepted redesign (DEC-234–DEC-250), Statamic and Cursor. Lists defects, departures from decisions, inconsistencies and missing interactions.
---
# Admin rework review

> **Resolution, 2026-11-08.** Claude fixed sections 1–3 and most of section 4
> in a follow-up pass. Unit tests passed (293 of 293). The gallery and a
> scratchpad copy of the Tessera site were checked at 1440, 1280, 799 and 390px
> in dark and light mode. Open items are listed under **Still open**. The
> [editor contract](../features/editor.md) describes the current behaviour.

This review covers the first implementation pass described in the
[rework handoff](admin-rework-handoff.md), checked against the
[accepted redesign](admin-redesign.md) and DEC-234–DEC-250. The maintainer judged
the result not good enough and asked for a strict review. Uniformity and
interaction quality matter here, not only whether something works.

**Scope.**
- Every screen in the real-App gallery on `localhost:5319`, at 1280×800 in dark mode.
- The isolated Tessera site on `127.0.0.1:5321/admin/`, at 1440, 1100, 900, 799 and 390px in dark and light mode, driven by Playwright in Chromium.
- Checked interactions: the split divider, Float with its device toggle, block and item panels, Add block, the sidebar toggle, collection expansion, and keyboard Tab.

**Not covered.** Live Git, R2 or hosting; Safari, Firefox and touch devices; screen readers.

Screenshots are in
`docs/wiki/evidence/2026-11-08-admin-rework-review/`.

## Overall

The parts work: Split, Float, the device toggle, panels, the sidebar and dark/light all function. Density is close to the target, with 28px controls, about 36px rows and 13px text.

It still doesn't read as one product. Three things cause that:

1. **The same idea is drawn several ways.** There are five list styles, three panel footers, two panel geometries, three header-action placements and two title sizes.
2. **Amber is used as the general primary colour.** DEC-242 reserved it for a few signals.
3. **The parts that make Statamic feel finished are missing.** These are listing tables with search, block rows that summarise their content, a proper rich-text toolbar, and stacks that dim their parent.

Fix the defects in section 1 first. Then do one consistency pass driven by a few shared primitives, listed under section 6.

## 1. Defects

| # | Where | Problem | Evidence |
| --- | --- | --- | --- |
| 1.1 | Add block | The catalog dialog renders **beneath the sidebar**. About 160px on its left is hidden, including the "Add block" title, the start of the search field and the first card column. This happens at 1280 and 1440. The dialog is fixed at z 51, but it is portalled into a container whose stacking context sits below `.navigation` (z 15). | [gallery](../evidence/2026-11-08-admin-rework-review/catalog-under-sidebar.png), [Tessera](../evidence/2026-11-08-admin-rework-review/catalog-under-sidebar-tessera.png) |
| 1.2 | New block → Design | The field shows **`[object Object]`** in a text input. The `presentation` field uses the custom widget `hero-presentation`, which is not registered in this build, so `Fields.tsx` falls back to a text input with `String(value)`. Typing there would overwrite structured data. An unknown widget needs a read-only "control unavailable" state that keeps the value. | [screenshot](../evidence/2026-11-08-admin-rework-review/new-block-object-object.png) |
| 1.3 | Media | A long filename overflows its card and draws over the neighbouring card. The counts also read "1 variants" and "0 variants". | [screenshot](../evidence/2026-11-08-admin-rework-review/media-filename-overflow.png) |
| 1.4 | Float, Mobile | The phone window extends past the bottom of the viewport at 1280×800 and 1440×900. It also starts flush against the top bar (y=48), while desktop Float is inset by 24px. The bounds calculation leaves out the bar height and the margin. | [screenshot](../evidence/2026-11-08-admin-rework-review/float-mobile-past-viewport.png) |
| 1.5 | Below 800px | If the sidebar was open at desktop width, it stays open as an overlay with **no scrim**, and the content behind it stays interactive. At 390px the breadcrumb runs into Save draft ("Collections / Tessera Posts /" collides). | [799](../evidence/2026-11-08-admin-rework-review/drawer-no-scrim-799.png), [390](../evidence/2026-11-08-admin-rework-review/drawer-no-scrim-390.png) |
| 1.6 | Pages at 390px | The table clips its URL column at the container edge, with no hint that it scrolls. | [screenshot](../evidence/2026-11-08-admin-rework-review/pages-table-390.png) |
| 1.7 | Top bar | The status text changes width as it moves through "Local preview", "Unsaved changes" and "Saved to draft". Preview and the language select shift about 23px each time. | [screenshot](../evidence/2026-11-08-admin-rework-review/topbar-unsaved-shift.png) |
| 1.8 | Disabled Publish | Disabled is shown as amber at 50% opacity. That reads as mustard in dark mode and as pale yellow with white text, which fails contrast, in light mode. It looks broken rather than disabled. | [light](../evidence/2026-11-08-admin-rework-review/light-disabled-publish.png) |

## 2. Departures from accepted decisions

- **Amber beyond DEC-242.** DEC-242 limits amber to Publish, switches, focus, the current item and the selected block. It currently also fills:
  - Create page, Create block, Add field, Add object, Add layout, Upload file and Unlock editor;
  - **Continue** in the delete and publish dialogs;
  - checked checkboxes and radios, "Open original" links, and the split divider on hover.

  Add a neutral, high-contrast primary button (foreground fill, as in Cursor) and use it for every form submit. Checkbox and radio colour needs a call; the default suggestion is neutral.
- **Every Add form opens in a stack (DEC-247).** Add block is a full-screen modal that hides the editor and the preview. It should be a stack panel: search plus a grouped list or grid, with an optional larger preview.
- **Stacks (DEC-239, DEC-246) don't look like stacks.**
  - The parent is never dimmed.
  - A block panel leaves an undimmed 25–65px strip of the parent ("Hom", "Page t"), which reads as a clipping bug ([screenshot](../evidence/2026-11-08-admin-rework-review/block-panel-parent-strip.png)).
  - Statamic dims the parent and offsets each nested level on purpose. Do the same: a scrim over the parent, plus a fixed inset per depth.
- **Panels use two geometries.** Block and item panels cover the editor column from the left. Add page and the field panel are 480px sheets anchored to the right. DEC-247 asks for one navigation rule, so one panel geometry should go with it.
- **Float (DEC-240) opens on top of the work.**
  - The default position is top-left of the workspace, covering the record title and the first five blocks ([screenshot](../evidence/2026-11-08-admin-rework-review/float-covers-editor.png)). A picture-in-picture window should open bottom-right and remember where it was.
  - The corner resize handles are invisible. Add a visible grip or cursor zone, and consider snapping to the corners.

## 3. Uniformity: one thing, several treatments

1. **Lists use five patterns.**
   - Tables: Pages, Layouts.
   - Two-line card rows with a chevron: collection entries ([screenshot](../evidence/2026-11-08-admin-rework-review/entries-cards.png)).
   - Single-line card rows: Objects.
   - Tall card rows: schema fields.
   - Card grid: Media.

   Statamic uses one listing table for all of these. Use the Pages table for entries, objects, schema fields and layouts. Show the entry title in the title column, with path and date as metadata columns.
2. **Page headers differ.**
   - Title size: Pages, Layouts and record titles are 18px. Journal, Objects, Media, "Journal schema" and "Main layout" are 15px.
   - Action placement: Pages, Journal and Layouts put the action right of the title. Objects and Media put it below the title, left-aligned ([screenshot](../evidence/2026-11-08-admin-rework-review/objects-header.png)).
   - Upload file has no icon.
   - Settings has no page title.
   - The page says "Site Layouts" while the sidebar and breadcrumb say "Layouts".

   Make one `PageHeader` with title, optional description and actions on the right.
3. **Content width differs.**
   - List screens are centred in an ~866px column.
   - Record editors start at x=216 with no maximum width, so in Off or Float the block rows stretch to about 970px.
   - The single-entry editor is centred.

   Use one maximum width for forms (about 720px for the main column) and one for lists.
4. **Panel actions differ.**

   | Panel | Actions |
   | --- | --- |
   | Block | Footer: "Cancel block changes" and "Remove", with no Done |
   | Item | "Duplicate item" and "Remove item" stacked, left-aligned in the body ([screenshot](../evidence/2026-11-08-admin-rework-review/item-panel.png)) |
   | Field | "Edit default value" in the body; "Remove field" alone in the footer ([screenshot](../evidence/2026-11-08-admin-rework-review/field-panel.png)) |
   | Add page | Footer: Cancel and Create page |

   Use one footer: secondary actions and destructive items under a ⋯ menu, or on the left; Cancel and Done/Create on the right.
5. **Document actions (⋯).**
   - The button is orphaned below the last field in Split and sits alone in the side column otherwise.
   - On a single entry, the side column holds only ⋯ beside an empty divider ([screenshot](../evidence/2026-11-08-admin-rework-review/single-orphan-actions.png)).
   - Its popup is a bordered box around a bordered button, not a menu.

   Put ⋯ in the record header next to the title, and use a Base UI Menu with menu items.
6. **Breadcrumb separators are spaced unevenly.** Compare "Pages / Home" with "Collections / Journal / Keeping drafts".
7. **Read-only properties are loose text.** Examples: "Static page" and "Template: Blog article" as small muted kickers, and "Multiple entries" between two fields on the schema screen. Show them as label/value rows.
8. **Too many separate bordered boxes.** Block rows, entry rows, field rows and object rows are each a bordered card with an 8px gap. Cursor groups rows in one bordered container with internal dividers, as the Pages table already does. This one change would do most of the work of making it look calmer and denser.
9. **Hover overrides current.** Hovering the current sidebar child removes its amber "current" treatment.

## 4. Missing interactions compared with the references

- **Listings.** There is no search, sort, filter, row hover or row actions, and no count. Pages mixes the Generic templates (API article, Blog article and so on) with the static pages, so they need a group, filter or tab.
- **Block rows** show only "Tessera · Hero v1".
  - Drop the repeated design prefix and the version. Show the version only when more than one exists.
  - Add a one-line summary (the heading or first text field), a type icon, and hover actions (duplicate, remove).
  - Move the drag handle to the left, as in Statamic.
  - Keep the amber selected-row state in step with the preview outline.
- **Rich text toolbar** ([screenshot](../evidence/2026-11-08-admin-rework-review/entry-richtext-toolbar.png)).
  - It is made of text chips: B, I, H2, H3, ¶, • List and 1. List.
  - The Link URL input sits inline in the toolbar.
  - Image and YouTube are on a separate row.
  - At 344px it wraps to three rows.

  Use one row of icon buttons with overflow, a link popover and a toolbar that sticks while scrolling.
- **Fields.**
  - The date input is the browser's native one.
  - The "Featured" checkbox sits below its label instead of beside it.
  - The media field is a select plus a disabled alt-text input, with no thumbnail, browse or drop.
  - The version select at the top of a block panel has no label.
- **Media library.** There is no search and no list/grid toggle, and thumbnails are letterboxed with black bars.
- **Split proportions.** At 1440 the editor gets two columns of 344px and 187px beside a 620px preview, which is cramped. Fold the side column earlier, or start Split nearer 55/45 in favour of the editor.
- **Mobile split.** The letterbox around the phone is light grey (#d8d6d1) in dark mode, which glares. Use the admin canvas colour.
- **Sidebar.**
  - At the default 192px, three of five Tessera collection names are truncated. Statamic's width is about 240px.
  - Content and Schemas each have a "Collections" item with the same icon. Give them different icons.
- **Top bar.**
  - The 150px language select dominates.
  - The status is plain text with no indicator dot.
  - Below 800px the save status disappears entirely.
- **Focus.** When a dialog opens by mouse, its initial focus ring lands on Cancel, or on the Add block close button, so amber appears with no keyboard use. Put initial focus on the dialog, or show the ring only for keyboard opening.
- **Dialog wording.**
  - "Delete this document?" with Continue should read "Delete page?" with a danger-styled **Delete page** button.
  - The publish dialog's confirm button should say **Publish**.
  - "This updates main…" exposes a Git branch name.

## 5. Outside the admin

The Tessera schema labels "Actionlabel" and "Secondarylabel" come from the library's generated definitions. Fix them in `rengwu/quinecms-library`, not in the engine.

## 6. Suggested order for the next pass

1. **Fix the defects in section 1.**
   - Portal dialogs into the root `admin-ui` container, above the shell.
   - Add an unknown-widget fallback.
   - Truncate media names.
   - Correct the Float bounds.
   - Add a scrim to the narrow drawer and close it on resize.
   - Reserve width for the status text.
   - Add a neutral disabled style.
2. **Add shared primitives and use them on every screen.**
   - `PageHeader`: title, description, actions.
   - `List` and `Table`: one listing style with hover, row actions and search.
   - `RowGroup`: one container with internal dividers, used for blocks, fields, objects and settings sections.
   - `PanelFooter`.
   - `Menu`.
   - A neutral `primary` Button variant, keeping amber only for Publish.
3. **Make stacks behave as DEC-239, DEC-246 and DEC-247 describe.**
   - One panel geometry.
   - A dimmed parent and a fixed inset per depth.
   - Add block as a stack.
4. **Upgrade the editor.**
   - Block rows with summaries.
   - A one-row rich-text toolbar.
   - Inline checkbox labels.
   - A proper media field.
   - A styled date control.
5. **Polish.**
   - Float opens bottom-right with visible resize grips.
   - Split proportions.
   - Dark letterbox around the mobile preview.
   - Sidebar width and icons.
   - Dialog wording and initial focus.

Re-run the gallery at 1280×800 and Tessera at 1440 and 390 after each step. Add gallery frames for Off, Float with the window moved, the stacked catalog and a two-level panel.

## What changed

- **Defects.**
  - Dialogs now portal above the shell: Add block no longer hides behind the sidebar, and backdrops dim the top bar and sidebar.
  - A custom field whose control is not installed shows a notice and keeps its value.
  - Media cards truncate long names and say "1 size".
  - Float stays 16px inside the workspace and accounts for its border.
  - The narrow sidebar starts closed, gets a scrim, and closes when a wide window narrows. Narrow screens show only the current breadcrumb.
  - Tables hide secondary columns when narrow.
  - The save status has a reserved width and a state dot.
  - Disabled primary buttons are neutral.
- **DEC-242 colours.** `primary` is now a neutral foreground fill. A new `accent` variant is used only by Publish and its confirmation. Checkboxes, radios, links, tag filters and the divider hover are neutral.
- **DEC-247 and stacks.**
  - Add block is a stack panel (`BlockCatalog embedded`).
  - Stacks dim their parent, and each deeper level is 32px narrower. Pressing the dimmed area closes a non-creation panel.
  - All panels share one footer through `FormScreen`: `actions` on the left, then Cancel/Create or Done.
- **Uniformity.**
  - `PageHeader` serves Pages, collection entries, schema and object lists, Media, Layouts, Settings and every record editor. Record editors put their title and ⋯ menu in it.
  - The `Menu` component in `src/editor/ui/menu.tsx` holds document, schema, object and layout deletion, with a hint when a reference blocks it.
  - Grouped rows with dividers are used for entries, schema fields, objects, references, usages and languages.
  - Every screen uses one 960px content width.
  - Confirmation buttons name their action: Delete page, Publish, Restore backup, Discard edits.
- **Editor.**
  - Block rows show the drag handle on the left, the name without a shared design prefix, and a one-line summary. The version appears only when a type has several.
  - The rich-text toolbar is one row of icons, with link, image and YouTube panels underneath.
  - Toggles sit beside their label.
  - Pages and entry lists have search, and Pages can filter templates.
- **Preview.** Split starts at 45% for the preview. Float opens bottom-right with a resize grip. The letterbox around a narrower device follows the admin theme. The side column folds below 720px of editor space and disappears when it is empty.
- **Sidebar.** The default width is 224px, and schema Collections has its own icon.

## Still open

- Block rows have no hover actions (duplicate, remove).
- The media field is still a select with a separate alt-text input, with no thumbnail or browse.
- Date fields use the browser's native control.
- The media library has no search or list view.
- Field labels such as "Actionlabel" need fixing in `rengwu/quinecms-library`.
- When the gallery's scripted clicks open a dialog, the focus ring appears on Cancel. Real pointer use in the Tessera site did not show it.
- These checks were local and in Chromium only. Live Git, R2 and hosting are untested.
