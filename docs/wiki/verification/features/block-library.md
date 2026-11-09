---
title: Searchable block catalog checks
updated: 2026-11-09
---
# Searchable block catalog checks

Contract: [Searchable block catalog](../../features/block-library.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/catalog-thumbnails.test.ts tests/templates.test.ts tests/block-list.test.ts tests/editor-navigation.test.ts
```

In a disposable site with several installed definitions, open Pages → a page → Add block. Combine search, theme and tags; Reset; inspect empty results; preview at both device widths. Cancel must insert nothing. Create must add exactly one block. Confirm page-kind/placement filtering and retained versions.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-10-16). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification recipe

1. Run `pnpm verify`. The library tests cover every new renderer with default, empty and long escaped content, typed lists/bindings, mapped collection context, form contracts, shared chrome and retained versions. Generation tests verify footer selection, stale-file cleanup and unchanged-file preservation.
2. In a fresh admin tab open Home → Add block. Confirm **Add block** and × align in the fixed header, the × closes without insertion, Reset starts disabled, tags stay on one horizontal row, and vertically scrolling moves the filters with the grid. Check the tag arrows move a short distance in either direction, disable at each edge, update after resizing, and leave native horizontal scrolling usable with no visible scrollbar. Cards should remain at most 270px wide across window sizes. Search hero; combine theme and tags; try a nonexistent query and Reset. Reset clears the filters and disables again. Preview a result, toggle Mobile and go Back: no insertion, with the toolbar visible at the top. Click the card: a New block form opens without inserting anything. Cancel returns unchanged. Repeat and Create block: one block appears and its existing-item editor opens.

   For catalog performance, compare the same production fixture, viewport and scroll path before/after a change. At 1440 × 1000 the current 75-card static catalog initially mounts 15 thumbnails. Scroll through all rows and back: each encountered thumbnail should mount once, with no destruction/recreation on the return trip. Check filtering, empty results, Preview → Back, resizing, and close/reopen; no removed thumbnail or observer should remain registered. Retention uses memory proportional to visited cards until they are released. `content-visibility` does not suspend arbitrary block JavaScript; custom animated blocks still need appropriate lifecycle behavior. Revisit this tradeoff if catalogs grow much larger. Local timings are observations, not performance guarantees.
3. Add Split accordion and Create block. Use Add item → Create item for a new question; Cancel leaves the list unchanged. Edit an existing repeated question, reorder with its handle, reload and confirm value/order recovery. Drag up and down, releasing on either edge and the middle of the gap between two rows; the live row positions and final order should agree. Move sideways outside the list and release: the row stays in its original X lane, follows cursor Y and commits the shown order. Add/remove another item and try Alt+Arrow. Cancel block changes restores the captured block.
4. In a generic page add a FAQ block and bind Items to a compatible schema list with `question` (text) and `answer` (richtext). Populate an entry; published rendering uses those rows. Missing keys/types or required child values fail publication. Schema editing remains separate from entry editing.
5. Site Layout → Starter → Choose footer offers three layouts. Selecting opens New footer; Cancel preserves the current footer, and Create footer applies the choice. Edit nested links; Pages previews show the same shared footer. Header → Navigation permits grouped links. Test menu disclosures with Enter/Tab at a narrow containing width.
6. For native submission verification, use a disposable loopback endpoint and test-only values. Check the received POST and both success/error responses. Verify previews remain disabled. Remove the test page and stop its endpoint afterwards.

## Coverage and limitations

All 72 new variants have automated rendering coverage. Browser checks sampled catalog, repeatable editing, shared chrome and public layouts; they are not a complete visual audit of every variant on every device. The theme is an adapted starting library, not finished brand-specific designs. External form service behavior, live GitHub/R2/hosting operations and physical mobile devices are outside the local checks.

## Verification history

- [Lean thumbnail loading and retention](../runs/2026-10-13-catalog-performance.md): 211 tests and representative production browser checks pass; return scrolling improves, while repeat opening measurements do not establish a consistent speedup.

- [Visible titles and aligned catalog headers](../runs/2026-10-08-layout-catalog.md): automated checks pass; selected browser checks are partially incomplete.

- [Explicit creation forms and cancellation](../runs/2026-10-08-creation-forms.md).

- [Layout-owned chrome, chartr blocks and dedicated list editing](../runs/2026-10-06T1140Z-site-layouts.md).

- [Optimistic FLIP sorting and Chartr reference behavior](../runs/2026-10-06T0845Z-sortable-flip.md).
- [Gutter drop regression repair](../runs/2026-10-06T0632Z-gutter-drop.md).
- [Close-icon alignment and tag scrollbar refinement](../runs/2026-10-06T0628Z-catalog-controls.md).
- [Catalog polish and automated checks](../runs/2026-10-06T0619Z-catalog-polish.md); visual verification was blocked by the computer-use URL restriction.
- [Block-library implementation and checks](../runs/2026-10-06T1320Z-block-library.md).
