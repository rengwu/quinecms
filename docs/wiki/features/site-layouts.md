---
title: Site Layout library
updated: 2026-10-06
---
# Site Layout library

**ID:** FEAT-site-layouts

## Intent and basis

DEC-092–DEC-105 and DEC-107 select one versioned site wrapper, unrestricted author-owned settings, active-settings-only persistence, optional styling variables and a developer-controlled picker whitelist. DEC-108 requires dedicated nested editing levels. See the [accepted design](../discussions/site-layouts.md) and [implementation journal](../journal/2026-10-06-site-layouts-implementation.md).

## Entry points

Open `/admin/` → **Site Layout**. Select a page for the live preview and use the toolbar to switch desktop/mobile widths. **Change layout** opens the searchable catalog. A card applies its defaults to the local draft; its separate Preview action renders the selected page without changing the draft. Save draft and Publish use the existing workflow.

**Settings** contains content max-width, page gutter, Backups and Session. Other standard admin areas retain their existing layout. Generic page previews preserve field placeholders.

## Stored contract and transitions

Canonical `site.layout` is `{ id, version, settings }`. `settings` is the author's JSON object. Only the active selection is stored. Selecting a different layout or retained version starts with a fresh copy of that definition's defaults; selecting the exact current version does nothing. Pages, blocks, collections, entries, media and shared geometry remain intact. No inactive settings cache, automatic upgrade, or guessed field mapping exists.

Legacy `site.title`, `navigation`, `header`, `footer` and appearance globals convert into Starter v1 settings when loaded into the editor, imported, recovered or discarded back to the source snapshot. The shared width/gutter stay in `site.globals`. Public builds can render unchanged legacy fixtures; a subsequent editor save writes the canonical shape. Missing retained implementations preserve the data but prevent successful rendering/publication until the source is restored.

## Authoring API

Install `src/site-layouts/<id>/vN/definition.json`, a React wrapper, React settings component and pure policy module; register the directory in `layouts.config.mjs`, then rebuild. Retain previous version directories, settings components and dependencies. Both installed versions remain resolvable; the editor offers an explicit version selector when alternatives exist.

The manifest declares stable `id`, integer `version`, `label`, `description`, `defaults`, `fields`, `component`, `settingsComponent`, `policy`, optional `headComponent`, and `activation` (`never` or `load`). An empty `fields` list is valid for custom settings. `LayoutProps` supplies `settings`, public `content`, block `children`, optional `preview` and `onNavigate`. The only required visual responsibility is to contain the block children. Public rendering and editor preview share the wrapper source. An optional server-rendered Head component supplies metadata/assets; it is not mounted inside the preview document.

`LayoutSettingsProps` supplies `settings`, `content` and `onChange(settings)`. Authors may build arbitrary React settings UI or reuse `Fields` and `PanelSection`; no universal header/footer/theme schema is imposed. Repeated fields use the editor-wide `PanelNavigation` boundary. Custom drill-down controls must use `PanelLevel` so parent and sibling controls disappear until Back.

The pure policy can derive `title`, optional block-context `globals`, and validation through `fields`, `blocks` and `add`. Keep browser/editor dependencies out of this module because public content validation also loads it. Styling tokens are optional: no categories, badges, filtering, warnings or compatibility gates depend on a block's styling choices. Static/generic field-binding rules remain separate.

## Hidden whitelist

`SITE_LAYOUT_WHITELIST=starter,chartr` is a build-time comma-separated list of stable layout IDs. Unset offers all installed layouts. Whitespace and duplicates are normalized. An explicitly empty list or unknown ID produces a configuration error; these are implementation choices, not extra product decisions.

The installed resolver is independent from the filtered picker catalog. An excluded active layout still renders, previews, edits, validates and participates in normal saves/publishing. It remains absent from future choices, including search and candidate previews. After switching away it cannot be reselected until allowed again. This is selection configuration, not an access-control boundary.

## Verification recipe

1. Customize Starter, set shared width/gutter, preview chartr and close it. Confirm the draft is unchanged. Apply chartr, then Starter: each change uses defaults while content and geometry remain intact.
2. Check Pages and Site Layout previews with static and generic pages. Visit Settings, Content, schemas and Media to confirm their normal admin layout.
3. Open header/footer list items and a nested dropdown item. Each replaces all parent controls; Back returns exactly one level. Use the same behavior for block lists, entry lists and schema default rows.
4. Recover a tab and export/import a backup. Confirm active ID/version/settings round-trip and old Site Options convert without losing values.
5. Set the whitelist to Starter while chartr is active; rebuild. Confirm chartr output/settings remain available and only Starter is offered. Switching away must not make chartr selectable again.
6. Install a newer retained version beside an older selected one. Confirm public rendering and both settings/preview loaders stay pinned until explicit selection. Run `pnpm verify`.

## Verification history

- [chartr content width and spacing repair](../verification/runs/2026-10-06T1426Z-chartr-spacing.md). Shared geometry applies under both layouts; chartr header/footer and block containers use consistent bounds without duplicate padding.
- [Generated layout Head dev-server repair](../verification/runs/2026-10-06T1222Z-layout-dev-restart.md).

- [Site Layout foundation, chartr and dedicated navigation levels](../verification/runs/2026-10-06T1140Z-site-layouts.md). Automated retention/version/whitelist checks and bounded Safari browser observations; live providers are separate and untested.
