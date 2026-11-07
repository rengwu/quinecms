---
title: Visual editing and recovery
updated: 2026-11-07
---
# Visual editing and recovery

**ID:** FEAT-editor

Sites with additional languages add a top-bar editing language, per-copy status
and Draft/Visitor previews; see [optional internationalization](internationalization.md#editor).

## Git save status and recovery

DEC-148–DEC-151 add a small status beside **Save draft**. DEC-186 removes
repository setup/details from Settings and connects from the build environment
automatically after login. This supersedes DEC-050's removal of save-status text only. Silent tab
recovery, submission-time validation and provider guards remain. Browser-to-local-file
transfer is deferred. [Implementation](../journal/2026-10-12-git-save-ux.md).

The status shows **Local preview**, **Unsaved changes**, **Saving…**, **Saved to draft**,
**Not saved**, or **Newer draft available**. Saved means content matches the last
loaded/saved repository snapshot, including a recovered snapshot. It does not promise
that the remote is still current. There is no polling; providers check the branch
before creating a save commit and retain their existing concurrent-update protections.
**Connecting…** and **Retry connection** cover initial loading and failures.
Recovered content retains its destination metadata but cannot override the
build-configured repository. See [automatic connection](publishing.md#automatic-connection-and-recovery).

A stale save opens **A newer version is available**, preserving browser edits and
offering **Export backup** and **Load latest version**. The same recovery opens when
reconnecting an outdated recovered draft to the same repository. A different repository
is handled separately, without replacing pending edits or calling it a newer version.
Save and Publish are disabled while a stale base is known. Closing the dialog preserves
edits; the status is a button that reopens recovery.

Loading asks for confirmation before replacing browser content. Cancellation and load
failure preserve content and its original baseline. A successful load resets the status
and closes obsolete document/creation selections. Export is optional; requesting a
browser download does not prove a file reached disk. Reapply wanted changes manually;
whole-backup import replaces content and is not a merge. Network, permission and
validation errors remain ordinary errors, with **Not saved** for pending content and
Save available to retry.

Verification: `pnpm exec vitest run tests/editor-save.test.ts tests/editor-submission.test.ts tests/github.test.ts tests/gitlab.test.ts`
covers normal saves, stale rejection, provider races, export payloads, cancelled/failed/
successful loads, recovered edits and destination changes. The component tests render
the real admin controls with mocked provider boundaries and preview islands.

Browser recipe: in an isolated disposable editor, connect a test repository, edit a
page, save, advance the remote separately, edit again and try saving. Inspect the status
and recovery controls at desktop and narrow widths. Close/reopen recovery, export a
backup, cancel loading, then confirm loading; verify only the successful load replaces
content. No real provider resources were available for this run. Native browser control
also failed to start; browser visuals and completed downloads remain unverified. See the
[verification run](../verification/runs/2026-10-12-git-save-ux.md).

## Workspace and navigation

The [admin redesign](../discussions/admin-redesign.md), DEC-234–DEC-248,
supersedes the original drawer and inner Back-button presentation. The engine
uses its own compact components on Base UI: 13px/18px Inter, 28px controls,
warm neutrals and dark/light modes. The ordinary primary action is neutral
(foreground fill); amber is reserved for Publish, switches, focus, the current
navigation item and the selected preview block (DEC-242). Admin resets and tokens
are scoped to `.admin-ui`; the site canvas stays outside that scope.

The top bar contains the sidebar toggle, logo, breadcrumbs, editing language,
preview toggle when available, save status with a state dot, **Save draft** and
**Publish**. The status keeps a reserved width so the controls beside it do not
shift.
Saving and publishing still operate on the entire site. The sidebar groups
Content (Pages, an expandable Collections list, Media), Design (Layouts) and
Schemas (Collections, Objects). Settings sits at the bottom. Pages opens first. The desktop sidebar has a
draggable edge, constrained to 160–360px, starts at 224px and remembers its width. Long collection
labels use an ellipsis and expose their full name on hover. The focused resize
handle also accepts arrow keys, Home and End.
Below 800px, the sidebar starts closed, opens over a dimmed workspace, and closes
after choosing a destination, on pressing the dimmed area, or when a wide window
narrows. Only the current breadcrumb shows. Expanding Collections leaves the
current screen intact.

Lists and records are screens. Their parent destinations appear as clickable
breadcrumbs; their URLs remain unchanged. Blocks, nested objects, list items,
references, schema fields, media details and the Add block library open in
slide-over panels. Panels dim the screen beneath them; each deeper level is
narrower, so the level beneath stays visible at its edge. Each panel has a close
button; Escape, pressing the dimmed area (except on creation forms) and browser
Back return one level. Parent forms stay mounted and inert while a child is open.
The split preview and global navigation remain available. Custom controls use
the existing `PanelLevel` API.

Panels share one footer: removal and secondary actions on the left, then
**Cancel** and the create action, or **Done** for edits that already apply.
Every screen uses one header: title, actions on the right, an optional
description, and a **⋯** menu for its less frequent actions. Lists share one
grouped-row style with dividers; the Pages table and entry lists offer search,
and Pages filters static pages from generic templates.

All Add forms open in panels with **Cancel** and **Create**. Existing values edit
the draft live; pending creation stays outside content, recovery and saves until
Create. A child created inside an unfinished parent belongs to that parent.
Cancelling the parent discards its staged children. Uploads still belong to the
media library even when the referencing form is cancelled. Busy upload/save
states disable panel controls as well as the underlying editor.

Page and entry screens have a main column for fields or blocks and a side column
for path/slug, layout/template, type, copy status and incoming usage. The side
column moves below the main column at 720px of editor space and disappears when
it has nothing to show. Document, schema, object and layout deletion and copy
removal are in the header's **⋯** menu, which explains any blocking reference
guard. Every screen centers its content at one 960px maximum width. Narrow
tables hide secondary columns and truncate long values with an ellipsis.

Browser Back invokes the deepest visible parent/close action and preserves
existing edits. At root screens it leaves normally. Forward does not restore
cancelled forms or old content. Navigation history holds depths, never content.
The production unsaved-change warning still applies on leaving or reloading.
See the [original Back verification](../verification/runs/2026-11-03-browser-back.md)
and [redesign verification](../verification/runs/2026-11-07-admin-rework.md).

## Live preview controls

Pages, layouts and routed entries offer **Off**, **Split** and **Float**. Split is
the initial preference; mode, device, divider and floating bounds persist in
local browser storage (`quinecms:preview-workspace`). The top-bar Preview button
shows/hides it. Its own bar holds Float/Dock, Desktop/Mobile and Close; translated
content also has Draft/Visitor controls. Below 800px the preview is hidden.

Split has a draggable divider, also adjustable with the left/right arrow keys;
the preview initially takes 45% of the workspace. Float first opens in the
workspace's bottom-right corner, can be moved by its bar and resized from any
corner (the bottom-right one shows a grip), with bounds kept 16px inside the
workspace and the device aspect ratio locked. The space around a narrower
device matches the admin canvas. Pointer interaction with
the canvas pauses during a drag. Split fills the available height below its toolbar, with an internally scrolling
canvas at a logical desktop width of 1280px or mobile width of 390px. Floating
windows retain 1280×800 or 390×844 proportions and scale to fit. Mode/device changes retain the same DOM
and mounted islands, including their interactive state. Leaving the document
can unmount its preview.

This is the same-document preview, not an iframe. Container queries respond to
the logical canvas; viewport media queries and viewport units still use the
browser window. OS picture-in-picture and inline public-page editing remain
deferred.

## Entry points and prerequisites

Open `/admin/` using [setup](../verification/setup.md). Development and production
use the site's configured `ADMIN_EMAIL` and `ADMIN_PASSWORD` to decrypt the
portal; the engine has no default login. See [encrypted admin](admin-encryption.md).
Repository credentials are required only for remote loading/saving. The
[content-model contract](content-model.md) describes shared definitions, nested
values, references and single entries. Existing provider and recovery behavior
is unchanged by the redesign.

## Expected outcomes

**Live entry preview (DEC-189–DEC-192):** Content entries with an assigned generic
page now reuse the page editor's split view. Schema fields stay on the left;
current entry values render through the shared template and its layout on the
right. Creation previews pending values until Create/Cancel, and data-only entries
keep the full-width editor. The shared-template shortcut preserves draft edits.
See the [entry-preview contract](generic-pages.md)
and [verification](../verification/runs/2026-10-16-entry-preview.md).

Incoming references appear as **Used in N places** above the deletion action, with plain-language instructions to remove or change the links first. Rows show recognizable editor locations, record names, field labels and list-item names; storage paths and IDs stay out of the summary. **Open** goes to the owning page/block, entry, collection/object schema or Site Layout. Self-references do not appear as deletion blockers. Object definitions use the same rows to explain where edits will apply. See the [reference-summary verification](../verification/runs/2026-10-08-readable-usage.md).

The mobile canvas is centered and scaled inside the preview pane. Below 800px, authoring uses the full workspace without a website preview.

The [block library](block-library.md) adds themed/tagged browsing, shared chrome, repeated content and schema lists. Its record owns the expanded contract and verification recipe.

The shared sortable list uses optimistic FLIP animations for page blocks and every repeated-content list. From mouse-down, the carried row follows cursor Y at the original grab offset, with X locked; it is drawn above clipping containers. Neighbors animate into the temporary order over 150ms and interrupted movements start from the current visual position. The blue insertion marker has been removed. Edge scrolling uses a 32px activation band and a capped speed, following Chartr's shared sorter reference. Only the list changes while held; the site's content/preview order updates once on release. Releasing outside still commits, with positions above/below the list resolving to its ends. This explicitly supersedes the earlier outside-release cancellation behavior. Escape, system pointer cancellation, or conflicting content/disabled changes abort safely. Reduced motion retains exact pointer carrying and immediate reordering while skipping FLIP/settle motion.

Create/edit/delete pages and entries; reorder blocks by dragging their rows
(Alt+Up/Down with keyboard focus). Selecting a block opens its fields and version
in a panel over the retained page editor. Same-key compatible values survive a
version switch, unmatched values are null, and **Discard changes** restores
the last loaded/saved instance. Block rows show the block name, without a design
prefix shared by every row, and a one-line summary of its first text; the
version appears only for types with several versions. A custom field whose
control is not installed shows a notice and keeps its value unchanged. Unknown versions preserve raw data and prevent
publication. Closing the panel keeps live edits.


`pnpm gallery` previews every admin control, field and editor screen in its states for design work; see the [admin design-system audit](../discussions/admin-design-system-audit.md). The admin login screen is shared with it from `src/admin/login-screen.ts`.

Opening a block also brings it into view in the right preview. This reuses the
new-block reveal behavior: wait until its preview has a visible height, scroll
smoothly once, then leave scrolling alone while fields are edited. Reduced-motion
preferences use an instant scroll instead.
The 2026-10-13 wiring change passed the 35 editor-navigation tests and type checks.
Browser automation could open the isolated Intr page but could not reliably
activate its block controls, so this run did not establish visual scrolling.

Schema rich-text fields and Text blocks provide visual headings, paragraphs, bold/italic, links, and lists with Markdown storage. Uploaded-image references and YouTube embeds round-trip in the visual editor. Unsupported Markdown remains available as source text. Custom React widgets and shared pure validators support compound block fields. Content browses collections → entry lists → schema-defined entry values only. Schemas browses Collections / Objects → definitions → individual fields, with label/key/type/required/options/default controls. Schema editing protects populated keys/types/options. Entries remain in Content and never appear in the Pages table. Add entry is confined to entry lists; Add collection belongs to the schema list. All Add actions (page, block, entry, collection, field, object, layout and item) use the same secondary button with a plus icon; create and Done actions use the neutral primary. Add block remains aligned right beside Blocks, outside the draggable list. Main navigation preserves all local content edits. Site Layouts lists named configurations with activation switches. Individual layouts delegate title, appearance and navigation to their design settings; Settings owns admin Appearance, Backups, Session and Factory reset; content spacing belongs to Site Layout.

Local content and its base/repository identity survive reloads silently in tab storage. Unreadable recovery data is preserved for download and requires explicit discard before it can be overwritten. This includes unfinished schema edits that cannot yet be saved. Export/import backups contain content, not credentials or binary uploads. Storage failure is visible. Lock clears legacy Git/R2 tab credentials, discards decrypted build configuration and returns to the gate. Git/R2 configuration lives in the build environment (DEC-185/DEC-186); there are no connection setup dialogs. Build tokens are never persisted with draft recovery. See [publishing](publishing.md).

QuineCMS uses `quinecms:recovery:v2` for tab recovery and `quinecms-backup` for
new version-1 backups (DEC-164). The previous project identifiers remain readable.
A retained draft moves to the new key only after a successful storage write;
unreadable legacy data remains downloadable until explicitly discarded. A current
record takes precedence when both keys exist. Backup import validates either
format and still asks before replacing content. [Rename verification](../verification/runs/2026-10-13-quinecms-rename.md).

Local development skips the unsaved-edit reload confirmation at the user's request; production retains it. Tab recovery continues in both. Site Layout owns content max-width/page gutter and their per-layout defaults (DEC-130); designs can also own typography controls. Settings contains admin Appearance, Backups, Session and Factory reset. Website tokens stay scoped away from admin controls. See the [Site Layout contract](site-layouts.md).

DEC-108 applies the same drill-down rule sitewide: opening a repeated item replaces all parent/sibling controls with its dedicated level. Back returns one parent at a time, including nested header dropdowns and footer columns. The inspector-wide `PanelNavigation` outlet also contains block/entry field lists and schema default rows; their parent forms remain mounted but hidden from display and accessibility. Area/document/layout changes clear the level, and focus moves to its heading. Custom settings authors use `PanelLevel` for their own drill-down screens.

The block editor places its version selector beside the block title in one non-wrapping row. The selector has no visible label, retains the accessible name **Version**, and occupies at most 140px or half the row. Long block titles truncate with an ellipsis; the full name remains in the heading's accessible text and hover title. See the [header verification](../verification/runs/2026-10-08-block-header.md).

## Factory reset and repository settings

**Lock editor** in Settings → Session clears Git/R2 credentials and legacy gate flags, preserves the tab draft, unmounts the editor and reloads the encrypted login page. Email and password are required again. Reloading also requires fresh login; the application never persists the decryption key or login credentials. See [encrypted admin](admin-encryption.md) for the storage and offline-guessing limits.

The Factory reset button uses the same left-aligned action row as the other Settings controls, directly below its description. The confirmation dialog retains right-aligned Cancel/Reset site actions; the settings button only opens that dialog and is not a terminal form action.

**Settings → Factory reset** opens a confirmation dialog with Cancel and a destructive **Reset site** action. Cancel/dismiss changes nothing. Confirming clears every static/generic page and its blocks, every collection and object schema, every entry and every media-library record. It replaces all site settings (including navigation, header, footer and globals) with the developer-configured initial layout defaults (`quinecms.config.json`), regardless of the current design. The site ID remains stable; no placeholder home page or demo records are created.

The reset is an unsaved local draft and survives tab reload through normal recovery. **Save draft** persists it to the connected draft branch; it does not publish automatically. An empty snapshot can be saved, but publication still requires a static home page at `/`. **Discard edits** restores the last loaded/saved snapshot until the reset is saved. Export a backup first to retain unsaved work. Repository identity, saved baseline, credentials and admin appearance remain intact. Uploaded R2 objects remain in storage; only their library records are cleared, as explicitly requested.

Repository connection settings and tokens are build-environment configuration
(DEC-186), with no form or repository details in Settings. The header retains
Save draft, Publish, automatic connection status and recovery actions. Settings
retains backup, session/reset and appearance controls.

## Form action alignment (DEC-131)

Terminal confirmation/cancellation groups align to the right edge of the full form, including creation screens, nested editors, dialogs and rich-text image/video insertion. Cancel/Close comes before the confirming action; the group wraps when space is limited and remains right-aligned. Single terminal actions use the same alignment. Implement with the full-width shared `dialogActions` row; `actionFooter` separates terminal actions from fields and also aligns its children right. Author-supplied admin forms follow this rule.

## Admin appearance (DEC-133)

Settings → Appearance provides a **Dark mode** switch: on selects dark, off selects light. It updates admin navigation, page lists, forms, dialogs, menus, toasts, the login gate and the empty area around a narrow preview. The admin uses the shared warm-neutral token palette; preview letterboxing stays neutral.

The preference is local to this browser and origin (`lean:admin-theme` in local storage), survives reload and defaults to dark when absent or invalid. If storage is blocked, switching still works for the current session. It is not site content: it does not change Save draft state, backups, publication or Site Layout appearance. The preview remains outside the admin theme/style scopes. [Implementation and verification](../verification/runs/2026-10-08-admin-theme.md).

## Creation forms (DEC-129)

Add opens a dedicated **New …** form. Entering or typing in that form does not add anything to site content, recovery, exports or saves. Its terminal actions are **Cancel** and **Create …**, with no Back or Delete/Remove action for the pending item. Cancel, leaving the screen or reloading discards unfinished creation. Existing items keep live editing, panel close/breadcrumb navigation and their guarded deletion controls.

Block and footer creation headings separate the action from the selected type: **New block** or **New footer** is the heading, with the definition label (for example, chartr · Workspace) directly underneath in smaller, muted text. The subtitle may wrap, and the grouped heading is separated from the first field by the standard form gap.

While a page's **New block** form is open, the right-hand preview appends and
highlights that pending block in the current layout. Field edits update it live,
including media and generic binding placeholders. The preview scrolls to the new
block once its renderer has mounted. It is a temporary rendering snapshot: Save
draft, recovery and exports still exclude it until **Create block**. Create keeps
the same instance; Cancel or leaving the form removes the temporary preview.
See [DEC-147 and verification](../journal/2026-10-11-block-creation-preview.md).

This applies to saved site layouts, static/generic pages, entries, many/single-entry collections, reusable object definitions, nested schema fields, owned object values, list rows, page blocks and footers. Shared list fields carry the same interaction into navigation links/dropdowns, footer columns/links and repeated block content. Page-kind or catalog selection may precede the form; choosing a candidate still does not insert it. Pages first collect their title/path and an active site layout (automatic only when one is active), then Create page opens the existing page editor for block authoring.

Create adds to the immediate parent. A child created inside an unfinished parent remains local to that parent; cancelling the parent discards all its staged children. A single-entry collection provisions its entry, with the completed schema's defaults, only on Create collection. Cancelling a replacement footer preserves the current footer. Create updates the local editor draft; Git Save draft and Publish remain separate actions.

**Negative UX to avoid:** Add immediately inserts a placeholder, then shows Back and Delete/Remove as the only exits. This leaves accidental empty records when a user merely explores a form and forces deletion to cancel an action. Do not introduce this pattern in new built-in or author-supplied controls. This supersedes the earlier immediate-insertion catalog behavior.

## Verification recipe

1. Run `pnpm test`, then an isolated site's `check`, `build` and `check:build`.
   `tests/editor-navigation.test.ts` covers breadcrumb/Back navigation, schema
   guards, pending creation and recovery. `tests/preview-workspace.test.tsx`
   checks mounted-state preservation, stored preferences and constrained bounds.
2. Open the Pages table, edit a page title/path, open a block panel and change a
   field. Close it and use browser Back: existing edits survive. Open a nested
   list item and return one level at a time. Create a child in a new parent,
   cancel the parent, and confirm neither entered recovery.
3. Exercise Split, divider drag/arrow keys, Float, title-bar movement, all four
   resize corners, Desktop/Mobile and Off. Increment an interactive island and
   confirm its value survives mode changes. Reload to check preferences.
4. Visit collection entries, schemas, layouts, media details and Settings.
   Create/cancel records; inspect deletion guards and upload busy states.
   Use a translation copy and the Draft/Visitor preview. Check toast errors.
5. Review dark/light at desktop and 390px: sidebar disclosure and navigation,
   scrollable tables, stack controls, and the absence of preview below 800px.
6. Verify encrypted login and the mounted portal in production preview.
   Mocked Git/media tests do not establish live provider permissions or CORS.

Generic-page binding and routing are mapped in [Generic pages](generic-pages.md).
Current observations and limits are in the [redesign run](../verification/runs/2026-11-07-admin-rework.md).

## Coverage and limitations

The initial run observed core interactions on an intermediate build. The startup repair subsequently verified development startup, live heading edits/cancel, and production startup with Svelte/Vue interaction on the repaired build. Recovery, visual editor mounting/read-only behavior, Markdown meaning, and adapter lifecycle have unit coverage. The Kumo refinement run verifies mouse sorting, silent recovery, and submission toasts in the browser; full layout parity remains untested.

## Verification history

- [Admin redesign](../verification/runs/2026-11-07-admin-rework.md).

- [Browser Back follows editor navigation](../verification/runs/2026-11-03-browser-back.md).

- [Readable reference locations and source navigation](../verification/runs/2026-10-08-readable-usage.md).

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


## R2 environment configuration — 2026-10-14

[Verification](../verification/runs/2026-10-14-r2-environment.md) covers environment
validation, encrypted credential delivery, absence of storage setup controls,
configured/unconfigured uploads and existing media behavior. Live R2 is not claimed.
