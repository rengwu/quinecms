---
title: Static pages and registered blocks checks
updated: 2026-11-09
---
# Static pages and registered blocks checks

Contract: [Static pages and registered blocks](../../features/static-blocks.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/block-generation.test.ts tests/activation.test.ts tests/adapters.test.ts tests/templates.test.ts tests/local-authoring.test.ts
```

Build an isolated site using installed block definitions and inspect static/entry routes, activation timing, interactive instance isolation, retained versions, assets and public/editor runtime separation. Compare the same renderer in public output and live preview at wide/narrow widths. Use fixtures explicitly; no sample routes or design catalog ship with the engine.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-10-08). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification recipe

1. Run `pnpm verify`. Build inspection checks referenced assets, shared emitted runtimes, and absence of editor/provider code in the actual site's public graphs. The isolated regression build separately checks the demo's static Journal output; client sites need not retain those pages.
2. Open `/blocks/`. Activate **Code** on the first Tabs block; the second block should remain on **Content**. Use arrow keys between tabs.
3. Open `/`. The Svelte **Add one** button increments its counter; the Vue question toggles its answer. The vanilla quote renders without activation.
4. Open the journal index and entries with JavaScript disabled: their visible content should remain complete. With Starter selected, the isolated regression build establishes zero JavaScript module references for these fixtures; interactive layouts may add their own runtime; a final browser JavaScript-disabled check is unvalidated.
5. In Site Layout → Content spacing enter 680 for Content max-width. Open Pages → Home and inspect the centered content and full-width Hero background; switch to Journal entry to check generic blocks. Return to Site Layout and reload: the value persists. Clear it to use the active layout's default again. Invalid nonpositive values must fail Save/Publish validation. Discard browser test edits when finished. The built public HTML must expose the value from `content/site.json` without client JavaScript.

6. In an isolated admin tab, choose Arial body/Georgia headings, body size 18, line height 1.8 and gutter 40. Navigate to Home and the generic Journal entry preview; inspect font separation and horizontal insets. Reload, return to Site Layout and confirm settings persist. Clear numeric overrides to restore defaults. Close the test tab without provider saves.

## Coverage and limitations

Build graph checks establish emitted sharing, not a browser network trace. Reactive adapter updates/destruction have React/Vue unit coverage, and Svelte preview interaction was observed during implementation. The last public React interaction check was blocked by the native browser tool. Alternate renderer sources/parity fixtures are not implemented; all supplied blocks share source.

## Verification history

- [Generated layout Head dev-server repair](../runs/2026-10-06T1222Z-layout-dev-restart.md).

- [Site Layout rendering and chartr](../runs/2026-10-06T1140Z-site-layouts.md).

- [Initial implementation run](../runs/2026-10-05T0819Z-implementation.md), dirty tree based on `f699352`; final source manifest is linked in the report.

- [Generic pages and schema-only entries](../runs/2026-10-05T1650Z-generic-pages.md).

- [Shared content width and development reloads](../runs/2026-10-05T1735Z-content-width.md).

- [Site typography and page gutter](../runs/2026-10-05T1810Z-site-design.md).

- [Block library and repeated fields](../runs/2026-10-06T1320Z-block-library.md).
