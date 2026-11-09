---
title: Optional internationalization checks
updated: 2026-11-09
---
# Optional internationalization checks

Contract: [Optional internationalization](../../features/internationalization.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/languages.test.ts tests/languages-build.test.ts tests/editor-languages.test.ts
```

Enable an additional language in an isolated site. Exercise eligible, incomplete and missing copies; text defaults and explicit shared fields; Add/Cancel/Remove copy; Draft/Visitor preview; shared row order; layout settings; language removal and off/on retention. Build fallback and strict configurations and inspect prefixed routes, lang and noindex.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-11-08). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification recipe

1. `pnpm test`: `tests/languages.test.ts` (overlays, eligibility, strict,
   reserved paths, removal), `tests/languages-build.test.ts` (prefixed routes,
   `lang`, `noindex`, language links, strict validation) and
   `tests/editor-languages.test.ts` (copy creation and editing).
2. In a disposable site with `i18n` enabled and a translatable field, run
   `validate`, `check`, `build` and `check-build`; confirm `/id/…` routes.
3. In `/admin`, switch the top-bar language and exercise an eligible, an
   incomplete and a missing copy: Draft/Visitor preview, Add → Cancel, Add →
   Create, Remove copy, a row inside a list, layout settings, the schema switch,
   Settings off/on and Remove language. Check the top bar at 390px.

## Coverage and limitations

Library text fields are translatable without extra configuration; technical
text must be explicitly shared. A public language switch is still owned by the
layout. Kahf implements one, including client title search with localized collection
URLs; the engine does not automatically translate content. Site Layouts preview the draft only, and layout copies are removed only with
their language. Preview outlines cover whole blocks, not individual cards.
New pages, entries and blocks are created with main-language values. Live Git
saves and publishing were not exercised.

## Verification history

- [2026-11-08 text localization defaults](../runs/2026-11-08-localization-defaults.md).

- [2026-10-25 Kahf library/site proof](../runs/2026-10-25-kahf.md) — real library copies, fallback routes and local editor workflows.

- [2026-10-23 engine implementation](../runs/2026-10-23-internationalization.md) — Passed locally.
