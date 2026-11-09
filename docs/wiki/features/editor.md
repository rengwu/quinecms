---
title: Visual editing and recovery
updated: 2026-11-09
---
# Visual editing and recovery

**ID:** FEAT-editor

## Entry points and prerequisites

Open the site's `/admin/` and unlock it using its build-configured email/password.
The engine provides no default login. See [Encrypted static admin](admin-encryption.md).
Git and R2 are optional; an unconnected editor still supports local editing,
preview, backups and tab recovery. Browser edits do not write the local checkout.

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

## Live preview controls

Pages, layouts and routed entries offer **Off**, **Split** and **Float**. Split is
the initial preference; mode, device, divider and floating bounds persist in
local browser storage (`quinecms:preview-workspace`). The top-bar Preview button
shows/hides it. Its own bar holds Float/Dock, Desktop/Mobile and Close; translated
page/entry content also has Draft/Visitor controls. Below 800px the preview is hidden.

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

## Editing content

Pages own ordered blocks; collections own schema-defined entries. Schemas and
entry values have separate destinations. Routed entries preview current values
through their generic template and layout; data-only entries have no page
preview. **Edit shared template** opens the template while preserving draft edits.

Block panels expose fields and retained implementation versions. Compatible
same-key values survive a version switch; unavailable implementations preserve
raw values and prevent publication. **Discard changes** restores the block from
the last loaded/saved baseline. Closing a panel keeps live edits. Opening a block
also scrolls its preview into view once; later field edits do not reset scrolling.

Page blocks and repeated items support drag ordering and Alt+ArrowUp/Down.
Dragging moves a temporary list order; the content and website preview update
on release, including release outside the list. Escape, pointer cancellation or
conflicting content changes cancel safely. Edge scrolling and reduced-motion
handling apply to the shared sortable control.

Rich-text fields provide visual paragraphs, headings, bold/italic, links and
lists with Markdown storage. Managed media-image and YouTube embeds round-trip;
unsupported Markdown stays available as source text. Custom registered fields
can use React widgets and pure validators. An unavailable widget preserves its
value and shows a notice.

Incoming usage appears as **Used in N places** with readable source locations
and Open actions. Reference guards protect deletion; self-references do not
block it. [Collections, objects and references](content-model.md) defines the
integrity rules. Page and entry creation, block discovery, media selection and
translations use their own linked feature contracts.

## Creation forms (DEC-129)

Add opens a dedicated **New …** form. Entering or typing in that form does not add anything to site content, recovery, exports or saves. Its terminal actions are **Cancel** and **Create …**, with no Back or Delete/Remove action for the pending item. Cancel, leaving the screen or reloading discards unfinished creation. Existing items keep live editing, panel close/breadcrumb navigation and their guarded deletion controls.

Block and footer creation headings separate the action from the selected type: **New block** or **New footer** is the heading, with the definition label (for example, the installed design and block name) directly underneath in smaller, muted text. The subtitle may wrap, and the grouped heading is separated from the first field by the standard form gap.

While a page's **New block** form is open, the right-hand preview appends and
highlights that pending block in the current layout. Field edits update it live,
including media and generic binding placeholders. The preview scrolls to the new
block once its renderer has mounted. It is a temporary rendering snapshot: Save
draft, recovery and exports still exclude it until **Create block**. Create keeps
the same instance; Cancel or leaving the form removes the temporary preview.
This follows DEC-147.

This applies to saved site layouts, static/generic pages, entries, many/single-entry collections, reusable object definitions, nested schema fields, owned object values, list rows, page blocks and footers. Shared list fields carry the same interaction into navigation links/dropdowns, footer columns/links and repeated block content. Page-kind or catalog selection may precede the form; choosing a candidate still does not insert it. Pages first collect their title/path and an active site layout (automatic only when one is active), then Create page opens the existing page editor for block authoring.

Create adds to the immediate parent. A child created inside an unfinished parent remains local to that parent; cancelling the parent discards all its staged children. A single-entry collection provisions its entry, with the completed schema's defaults, only on Create collection. Cancelling a replacement footer preserves the current footer. Create updates the local editor draft; Git Save draft and Publish remain separate actions.

**Negative UX to avoid:** Add immediately inserts a placeholder, then shows Back and Delete/Remove as the only exits. This leaves accidental empty records when a user merely explores a form and forces deletion to cancel an action. Do not introduce this pattern in new built-in or author-supplied controls. This supersedes the earlier immediate-insertion catalog behavior.

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

## Backups and tab recovery

The local content draft and its loaded repository/base identity survive reloads
in tab session storage, including unfinished schema edits. Unreadable recovery
is retained for download and requires explicit discard before overwrite. Storage
failure is visible. Pending creation is excluded until Create.

Settings → Backups exports/imports content JSON without credentials or binaries.
Import validates and confirms replacement of the browser draft; it is not a
merge and does not save or publish. Recovery uses `quinecms:recovery:v2`; new
version-1 backups use `quinecms-backup`. Earlier project identifiers remain
readable. Legacy recovery moves only after a successful storage write, and a
current record takes precedence when both exist.

Git/R2 credentials remain in decrypted memory and are excluded from recovery.
Lock retains the draft but discards decrypted configuration. Production warns
before leaving/reloading with unsaved work; local development skips that warning.
See [Git publishing](publishing.md) for stale-work recovery and source guards.

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

Confirmation/cancellation groups align right in forms, panels and dialogs.
Cancel/Close precedes confirmation; groups wrap when space is limited. Panel
footers may also place removal and secondary actions on the left. Pending forms
use Create/Cancel; existing edits apply live and use Done/close. Author-supplied
admin forms follow the same convention.

## Admin appearance (DEC-133)

Settings → Appearance provides a **Dark mode** switch: on selects dark, off selects light. It updates admin navigation, page lists, forms, dialogs, menus, toasts, the login gate and the empty area around a narrow preview. The admin uses the shared warm-neutral token palette; preview letterboxing stays neutral.

The preference is local to this browser and origin (`lean:admin-theme` in local storage), survives reload and defaults to dark when absent or invalid. If storage is blocked, switching still works for the current session. It is not site content: it does not change Save draft state, backups, publication or Site Layout appearance. The preview remains outside the admin theme/style scopes.

## Checks and evidence

[Check recipes and dated evidence](../verification/features/editor.md).
The admin gallery (`pnpm gallery`) is a developer inspection tool using test
fixtures; it is not another CMS feature or a delivered site design.
