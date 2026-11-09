---
title: Visual editing and recovery checks
updated: 2026-11-09
---
# Visual editing and recovery checks

Contract: [Visual editing and recovery](../../features/editor.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/editor-navigation.test.ts tests/editor-save.test.ts tests/editor-submission.test.ts tests/preview-workspace.test.tsx tests/recovery.test.ts tests/rich-text.test.ts tests/block-list.test.ts
```

Exercise breadcrumb/browser Back and nested panel close, staged parent/child creation and cancellation, block drag/keyboard ordering, rich text, backup import/export and recovery. Check Split/Float/Off and device changes preserve mounted preview state, and that narrow screens hide preview. Test factory reset only in a disposable draft, then restore its baseline.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier save-status checks

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
[verification run](../runs/2026-10-12-git-save-ux.md).

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-11-07). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

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

Generic-page binding and routing are mapped in [Generic pages](../../features/generic-pages.md).
Current observations and limits are in the [redesign run](../runs/2026-11-07-admin-rework.md).

## Coverage and limitations

The initial run observed core interactions on an intermediate build. The startup repair subsequently verified development startup, live heading edits/cancel, and production startup with Svelte/Vue interaction on the repaired build. Recovery, visual editor mounting/read-only behavior, Markdown meaning, and adapter lifecycle have unit coverage. The Kumo refinement run verifies mouse sorting, silent recovery, and submission toasts in the browser; full layout parity remains untested.

## Verification history

- [Admin redesign](../runs/2026-11-07-admin-rework.md).

- [Browser Back follows editor navigation](../runs/2026-11-03-browser-back.md).

- [Readable reference locations and source navigation](../runs/2026-10-08-readable-usage.md).

- [Expandable Schemas navigation and direct leaf lists](../runs/2026-10-08-sidebar-groups.md).

- [Creation heading hierarchy](../runs/2026-10-08-creation-heading.md).

- [Sitewide form-action alignment](../runs/2026-10-08-form-action-alignment.md).

- [Centered mobile preview](../runs/2026-10-08-mobile-preview.md).

- [Explicit creation forms and cancellation](../runs/2026-10-08-creation-forms.md).

- [Number-input height repair](../runs/2026-10-08-number-input-height.md).
- [Content model, nested editors and recovery](../runs/2026-10-08-content-model.md).

- [Site Layouts, chartr and dedicated nested editing](../runs/2026-10-06T1140Z-site-layouts.md).

- [Optimistic FLIP sorting and Chartr reference behavior](../runs/2026-10-06T0845Z-sortable-flip.md).
- [Gutter drop regression repair](../runs/2026-10-06T0632Z-gutter-drop.md).
- [Initial implementation run](../runs/2026-10-05T0819Z-implementation.md).
- [Admin startup repair](../runs/2026-10-05T0910Z-admin-startup.md).

- [Kumo admin refinement](../runs/2026-10-05T1005Z-kumo-admin.md).

- [Block sidebar hierarchy](../runs/2026-10-05T1014Z-block-sidebar.md).

- [Admin hierarchy and Home navigation](../runs/2026-10-05T1054Z-admin-hierarchy.md).

- [Editor layout consistency](../runs/2026-10-05T1108Z-editor-layout.md), including the previously outstanding schema-field browser inspection.

- [Pages table hierarchy](../runs/2026-10-05T1124Z-page-list.md).

- [Page-only preview and standard admin views](../runs/2026-10-05T1303Z-admin-views.md).

- [Generic pages and schema-only entries](../runs/2026-10-05T1650Z-generic-pages.md).

- [Persistent admin sidebar](../runs/2026-10-05T1725Z-admin-navigation.md).

- [Shared content width and development reloads](../runs/2026-10-05T1735Z-content-width.md).

- [Standard admin content width](../runs/2026-10-05T1750Z-admin-width.md).

- [Table rows and consistent Back labels](../runs/2026-10-05T1752Z-page-row.md).

- [Site typography and page gutter](../runs/2026-10-05T1810Z-site-design.md).

- [Block library and repeated fields](../runs/2026-10-06T1320Z-block-library.md).


## R2 environment configuration — 2026-10-14

[Verification](../runs/2026-10-14-r2-environment.md) covers environment
validation, encrypted credential delivery, absence of storage setup controls,
configured/unconfigured uploads and existing media behavior. Live R2 is not claimed.
