---
title: Generic pages and collection content checks
updated: 2026-11-09
---
# Generic pages and collection content checks

Contract: [Generic pages and collection content](../../features/generic-pages.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/templates.test.ts tests/content-model.test.ts tests/editor-navigation.test.ts tests/rich-text.test.ts
```

Use an isolated site with a static index, one generic template, a routed collection and a data-only collection. Check placeholder template preview versus actual entry preview; pending-entry Cancel must discard its values. Test a missing binding, false/zero and empty fallback, shared-template navigation, route collisions and absence of automatic index routes in built output.

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

1. Run `pnpm verify`. `tests/templates.test.ts` covers route ownership, data-only behavior, sharing, binding failures/fallbacks, legacy entry rejection, version switching and embedded references. Navigation tests exercise type selection, catalog filtering, binding edits and schema assignment. Rich-text tests exercise image insertion/removal, read-only state and Markdown round trips.
2. Pages → Journal entry: expect `{{title}}`, `{{summary}}`, `{{image}}` and `{{body}}` placeholders. Open Entry heading: enter a missing key in Bind Heading, click Publish and expect a toast naming the collection and binding. Cancel block changes restores the original binding.
3. Content → Journal → A slower way to build: expect schema fields and a live entry preview, with no Blocks controls. In Body choose YouTube, enter a valid YouTube URL and insert. Reload, reopen the entry and verify the embed and surrounding text remain in visual editing mode. Remove the embed or discard the test edits through Site.
4. Schemas → Collections → Journal: the selector offers None · data only and generic pages, excluding static pages. Choose None and verify the label remains visible; restore Journal entry. Schema editing stays separate from entry values.
5. Open `/journal/` and follow A slower way to build. The entry uses the template with actual values and formatted body, no bound-name placeholders and no missing-media prompt for an empty optional image. The production artifact check verifies zero JavaScript for the index and both demo entries.

## Coverage and limitations

Local build, mounted UI tests and native browser flows are covered by the run below. R2 upload credentials, external video playback, live GitHub saves/publishing and hosting deployment are outside this local verification. No general migration of third-party content is implemented.

## Verification history

- [Explicit creation forms and cancellation](../runs/2026-10-08-creation-forms.md).

- [Collections, objects and references](../runs/2026-10-08-content-model.md).

- [Generic-page implementation](../runs/2026-10-05T1650Z-generic-pages.md).

- [Block library and repeated fields](../runs/2026-10-06T1320Z-block-library.md).
