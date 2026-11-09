---
title: Site Layouts
updated: 2026-11-09
---
# Site Layouts

**ID:** FEAT-site-layouts

## Intent and basis

DEC-165–DEC-171 replace the single-selection model with independently named layout configurations and explicit page assignments. The [multiple-layout discussion](../discussions/multiple-site-layouts.md) records the accepted scope. DEC-092–DEC-105 and DEC-107 established versioned designs, unrestricted author-owned settings, optional styling variables and a repository-based design library. DEC-163 supersedes the picker whitelist: all installed layouts are always available in the same dashboard. DEC-247 supplies the current screen/panel navigation convention. DEC-130 moves content spacing into the layout with author-defined defaults, superseding DEC-097. See the [accepted design](../discussions/site-layouts.md) and [implementation journal](../journal/2026-10-06-site-layouts-implementation.md).

## Entry points

Open `/admin/` → **Design → Layouts** for a table showing the saved name, design/version, page count and Active switch. Open a row to edit its name/settings beside a live preview. Select a preview page and use the toolbar to switch desktop/mobile widths.

**Add layout** opens the searchable design catalog, then a named creation form. Create layout adds an active configuration with independent settings; Cancel leaves the draft unchanged. Multiple configurations can use the same design. **Change design** on an existing layout uses the same catalog, followed by a reset confirmation naming the layout and affected page count. Catalog previews never mutate the draft. Save draft and Publish remain separate.

Turning a layout off or deleting it requires zero assigned pages. At least one active layout must remain, even with no pages. Off retains settings and removes the layout from page choices. The usage list opens the assigned pages so they can be reassigned first.

The visible title and close button share a fixed header row above the scrolling catalog and preview. Hover highlights the whole card background, including the Preview row; the rendered thumbnail retains its own appearance.

Each design supplies its own settings controls. Designs using the shared spacing helpers may expose content max-width and page gutter, with their own defaults; there is no mandatory Content spacing panel. **Settings** contains admin Appearance, Languages, Backups, Session and Factory reset. Git/R2 configuration comes from the build environment, with no repository/storage setup form. Generic page previews preserve field placeholders; routed entry previews resolve entry values.

## Stored contract and transitions

Canonical `site.layouts` is an array of `{ id, name, active, design: { id, version, settings } }` in `content/site.json`. The outer ID identifies a saved configuration; the design ID/version identifies installed code. Settings belong to each configuration, including inactive ones. Pages persist `layoutId`. A new page selects the sole active layout automatically; with several active layouts, the user must choose before Create. There is no default setting or ongoing inheritance. Reassigning a page preserves its blocks.

Generic pages own the layout for all their collection entries, with no per-entry override. A generic page counts as usage even when no entry produces a route.

Changing a design or retained version resets only that configuration to fresh defaults after confirmation. All pages assigned to it receive the change. Other layouts, page blocks, collections, entries and media remain intact. Selecting the exact current design/version does nothing; there is no automatic upgrade or guessed field mapping.

Explicit legacy `site.layout` records are read into one active **Main layout**, with explicit assignments for existing pages. Saved settings and content are preserved. Public builds can read unchanged legacy records; subsequent editor saves use the new shape. `site.globals` does not override layout output. Missing retained implementations block structural validation, even for unused configurations.

All configurations must be structurally valid, all page assignments must target active layouts, and at least one layout must be active. Only layouts referenced by pages require complete required settings to publish. Unused active or inactive layouts may remain incomplete. The same checks apply to import, Git drafts, publication and local builds.

Factory reset clears the local content draft and creates one active Main layout using the configured initial design's defaults (`quinecms.config.json`). It retains the site ID. See the [reset contract](editor.md#factory-reset-and-repository-settings).

There is no implicit built-in design. Missing initial-layout configuration or an
uninstalled selection fails clearly. DEC-182 supersedes Starter's factory defaults.

## Authoring API

Install a layout definition, React wrapper, React settings component and pure policy module through a library or original site extension; register it in `quinecms.library.json`, then rebuild. See the [extension contract](site-engine.md). Retain previous version directories, settings components and dependencies. Both installed versions remain resolvable; the editor offers an explicit version selector when alternatives exist.

The manifest declares stable `id`, integer `version`, `label`, `description`, `defaults`, `fields`, `component`, `settingsComponent`, `policy`, optional `headComponent`, and `activation` (`never` or `load`). An empty `fields` list is valid for custom settings. `LayoutProps` supplies `settings`, public `content`, block `children`, optional `preview` and `onNavigate`, and, on sites with additional languages, `languages: [{ code, path, current }]` for drawing a language switch ([internationalization](internationalization.md)). The only required visual responsibility is to contain the block children. Public rendering and editor preview share the wrapper source. An optional server-rendered Head component supplies metadata/assets; it is not mounted inside the preview document.

Generated public routes import their assigned design wrapper and optional Head directly. Generic entry routes resolve the generic page's assignment. Editor page previews use the same selection for wrapper, block globals, spacing and title. The layout editor can preview its own configuration with any page without reassigning that page.

`contentForPage` and `contentForLayout` provide render-only content views. In those views, the existing `activeLayout`, `layoutGlobals` and `layoutTitle` APIs resolve the chosen configuration via `site.layout`. Do not save these views: persisted content stores `site.layouts` only. This keeps author components unchanged while supporting per-page selection.

`LayoutSettingsProps` supplies `settings`, `content` and `onChange(settings)`. Authors may build arbitrary React settings UI or reuse `Fields` and `PanelSection`; no universal header/footer/theme schema is imposed. Repeated fields use the editor-wide `PanelNavigation` boundary. Custom drill-down controls use `PanelLevel` to open a slide-over panel. The parent remains mounted and inert until the panel closes; the live preview stays available. See the [editor workspace contract](editor.md#workspace-and-navigation).

The pure policy can derive `title`, optional block-context `globals`, and validation through `fields`, `blocks` and `add`. Designs using the spacing helpers declare spacing in `defaults`; their settings controls can use those defaults as placeholders, and their policies resolve blank overrides with `contentSpacing`. Wrappers and block context can consume `layoutGlobals` for consistent public/preview rendering. In that contract, width is finite and positive and gutter finite and nonnegative; policies validate explicit overrides. These helpers do not impose a universal settings schema. Keep browser/editor dependencies out of this module because public content validation also loads it. Styling tokens are optional: no categories, badges, filtering, warnings or compatibility gates depend on a block's styling choices. Static/generic field-binding rules remain separate.

## One dashboard for all themes (DEC-163)

Run `pnpm dev` in the site repository and open `/admin/`. All definitions from
configured libraries and original extensions are available together. Subscription configuration is outside
the portal; there is no theme-specific launch command.

The block catalog independently offers all installed themes through **All themes**
and its optional theme/search filters. Its static/generic page and footer
compatibility rules remain. Choosing a layout does not restrict the block catalog.

## Checks and evidence

[Check recipes and dated evidence](../verification/features/site-layouts.md).
