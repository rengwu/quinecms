---
title: Collections, objects and references checks
updated: 2026-11-09
---
# Collections, objects and references checks

Contract: [Collections, objects and references](../../features/content-model.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/content-model.test.ts tests/content.test.ts tests/editor-navigation.test.ts tests/usage.test.ts tests/recovery.test.ts
```

Create and cancel collection/object schemas and nested rows in the editor panels. Exercise three owned levels, reject a fourth/cycle, select/reorder references, inspect Used in locations and deletion guards, and open a single-entry collection directly. Reload to check recovery. Check typed bindings in an isolated public build.

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

## Verification recipe and limits

Run `pnpm verify`. `tests/content-model.test.ts` covers records, depth/cycles, defaults, impact checks, usages, typed resolution, projections and routes. Mounted editor tests cover definition/single-entry creation, reload, dedicated nested levels, reference selection and projection editing. Mock GitHub tests save/reload/publish object records and references; recovery tests cover unfinished and unreadable drafts.

For browser checks, build the example in an isolated copy, open Schemas → Objects → SEO, inspect both collection uses, then edit Journal → an entry → Specifications → Dimensions → Item 1 → Detail. Reload and reopen the edited value. At mobile width, search a single reference and reorder related entries. Inspect the built entry for the SEO heading, referenced author and specification rows. Single-entry Content should open directly with no slug or Add entry control.

The [implementation run](../runs/2026-10-08-content-model.md) records local and mocked results, desktop/mobile browser evidence and production output. Live GitHub/R2/hosting behavior, physical devices and a complete browser matrix remain untested. No site was published.

The [number-input repair](../runs/2026-10-08-number-input-height.md) verifies that numeric schema limits retain standard control height inside horizontal rows.

[Explicit creation forms and cancellation](../runs/2026-10-08-creation-forms.md) verifies staged definitions, nested values, singleton provisioning and cancellation.
