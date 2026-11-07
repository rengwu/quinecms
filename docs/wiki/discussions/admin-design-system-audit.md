---
title: Admin design-system audit
updated: 2026-11-07
status: Research; the redesign direction is now in the admin redesign
summary: What the Kumo-based admin uses today, why it reads as basic and chunky, and the gallery that previews every component and state before a redesign.
---
# Admin design-system audit

The admin portal works, but it reads as basic and chunky. Before reworking the
design system, the maintainer asked for one page that shows every component,
input and state in use. That page is the **admin gallery** (`pnpm gallery`,
`tools/admin-gallery/`). This record
captures the baseline the gallery shows. It proposes no design and accepts no
redesign decisions.

## Scope and evidence

Audit date: **7 November 2026**. Inspected every module and stylesheet in
`src/editor/`, the login page and its script, and the
[`quinecms-library`](https://github.com/rengwu/quinecms-library) and site
repositories for editor imports. Observations below were checked in the gallery
in Chromium at 1440px, and in its editor screens at 1280px and 390px. See the
[verification run](../verification/runs/2026-11-07-admin-gallery.md).

Kumo is confined to the engine. The library's layout settings import only
`Fields` and `PanelSection`; the Archline, Kahf and dev sites import neither
Kumo nor editor modules. A redesign of engine controls therefore does not
break extension code, provided those two exports keep their props.

## Inventory

| Kumo component                          | Files | Variants and states in use                                                                                          |
| --------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------- |
| Button                                  | 24    | primary, secondary, ghost, outline, destructive, secondary-destructive; sm/base; square; icon; `aria-pressed`       |
| Input                                   | 15    | text, number, date, datalist; sm; placeholder; disabled                                                             |
| Label                                   | 13    | with an inline Shared badge                                                                                         |
| Select                                  | 12    | `renderValue`, placeholder, disabled                                                                                |
| Switch, Checkbox, Radio, InputArea      | 1–3   | labelled and `aria-label` only                                                                                      |
| Dialog, Table, Tabs, Badge, Toast, Link | 1–3   | lg dialogs and the catalog popup; segmented sm tabs; success/warning/outline/secondary badges; success/error toasts |

Icons are seven Phosphor icons: plus, close, caret left/right, drag handle,
desktop and mobile. Text glyphs stand in for icons elsewhere: `← Back`, `↑ ↓`
reference ordering, `→` on object field rows, and `¶`, `• List`, `1. List`, `B`
and `I` in the rich-text toolbar.

Engine compositions built on these are the top bar and save status, sidebar
disclosure navigation, Pages and Site Layouts tables, drawer and live preview,
`PanelSection`, field rows and widget/binding fieldsets, record lists, the
sortable `BlockList` and its drag overlay, usage rows, action footers, media
grid and upload, the rich-text toolbar and embeds, copy status, the block
header version select, block and layout catalogs, confirmation dialogs, toasts
and the login screen.

## Why it reads as basic and chunky

1. **Button is the only interactive primitive.** Navigation links, record rows,
   block rows, table titles, tag filters and catalog card overlays are all
   base-size Kumo buttons. Record and block rows have a 48px minimum height,
   navigation links 40px. Restyling them needs reset classes (`.pageTitle`,
   `.saveStatusAction`, `.cardName`) and 15 `!important` declarations (11 in
   `catalog.module.css`). Navigation item, list row, icon button, chip and card
   primitives are missing.
2. **Feedback has no component.** Twelve alerts are bare `<p role="alert">`
   text. `Fields` computes required and incompatible-value errors but passes
   them only to custom widgets, and the built-in rich-text widget ignores them.
   No built-in field shows its own required or incompatible-value error; only
   generic block bindings show an inline alert. Other errors appear as toasts
   at save or publish.
3. **Typography is unset.** Editor CSS declares `Inter`, but no font is loaded,
   so it renders in the system font. Sizes range across 10, 11, 12, 13, 14, 18
   and 22px. Rich-text headings render at paragraph size in the editor, because
   the Kumo reset removes heading sizes and the editor theme does not restore
   them. The login screen uses Arial and its own `#2563eb` palette.
4. **Colour leaks outside tokens.** `--color-kumo-subtle` does not exist in
   Kumo. Five rules use it: the block catalog count, card theme captions and
   preview caption, layout card descriptions and the catalog header
   description. That text inherits the default colour instead of a subtle one. Sixteen hard-coded colours remain, mostly preview surface,
   selection and fallback outlines.
5. **Layout is spacious only at desktop width.** The shell spends 60px on the top
   bar, 216px on the sidebar and 360px on the drawer. At 390px the Pages table
   keeps four columns and wraps long titles one word per line
   ([screenshot](../evidence/2026-11-07-admin-gallery/narrow-pages.png)).
   Block catalog card names run under their Preview buttons when the catalog
   shows five columns ([screenshot](../evidence/2026-11-07-admin-gallery/catalog-cards.png)).
6. **Some styles are dead.** No component uses `.gate`, `.navigationItem`,
   `.divider`, `.previewNav` or `.previewFooter`; `.gate h1` is the only 28px
   type in the editor.

## The gallery

The gallery renders real editor modules on test-owned fixtures, so restyling
the editor changes the gallery without further edits. Each card names its source
file and has its own pickers for the states that component has: filled, empty,
read-only, required, long text, second language, open pickers and forms, upload
outcomes and catalog filters. Interactive components also offer forced
**Hover**, **Focus** and **Pressed**. Sections cover foundations read from the
editor stylesheets, the Kumo primitives, every field type, the remaining
components, dialogs and catalogs, and the full editor and login screens in frames
at desktop and narrow widths. A sticky toggle switches dark and light mode.
`tools/admin-gallery/README.md` describes how to add a specimen and the
gallery's limits. [Screenshot of the foundations section](../evidence/2026-11-07-admin-gallery/gallery-foundations.png).

The login screen's markup and styles moved from `src/pages/admin/index.astro`
to `src/admin/login-screen.ts` and `login-screen.css`, so the page and the
gallery render the same screen. The built page is unchanged in behaviour: submit
stays disabled until `login.ts` loads, and the styles remain an external sheet.

## Open questions for the redesign

The [admin redesign](admin-redesign.md) answers three of these: replace Kumo with
our own Base UI components, use 13px text with Inter self-hosted, and drop the
preview below 800px with the sidebar behind a menu button (DEC-241–DEC-243).

- Keep Kumo and add the missing primitives and tokens, or replace it?
- Which type scale and typeface, and should the admin load a font?
- How should field-level validation appear before save and publish? (Still open.)
- What should the narrow layout do with tables and the drawer?
