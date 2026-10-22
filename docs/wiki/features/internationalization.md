---
title: Optional internationalization
updated: 2026-10-23
---
# Optional internationalization

**ID:** FEAT-internationalization

## Intent and basis

Sites can publish an item in additional languages. The behavior follows
DEC-194–DEC-206 and DEC-217–DEC-231 in
[optional internationalization](../discussions/optional-internationalization.md);
the [engineering design](../discussions/internationalization-engineering-design.md)
records how it fits the engine. The engine is implemented locally; library blocks,
layouts and the Kahf site do not mark translatable fields yet.

## Settings

`content/site.json` holds an optional `i18n` object, edited in **Settings →
Languages** and saved with the draft:

```json
"i18n": { "enabled": true, "main": "en", "languages": ["id"], "missing": "fallback" }
```

- `main` serves unprefixed paths; each code in `languages` is also its URL prefix.
  Codes are lower-case BCP 47 tags. The portal offers common languages; others
  can be set in the file.
- `missing` is `fallback` (show the whole main-language item) or `strict`
  (Publish and builds need complete copies in every language).
- The main language is locked once any copy exists.
- Turning languages off keeps every copy and builds only the main language.
  Removing a language deletes its copies after a confirmation with the count.

## Which values vary

Fields are shared unless `"localized": true`. It is allowed on single-value
fields, including references, reference lists and media. Objects, object arrays
and block lists cannot vary; their inner fields can, and rows stay shared.

- Collection and object schemas set it with the **Per language** switch.
- Block and Site Layout definitions set it in their library code.
- Media alt text always varies by language; `localized` decides whether the
  image varies.
- Static page titles always vary. Paths, slugs, block order and bindings are
  shared.

## Stored copies

A copy is a sparse overlay on its record, holding only localized values. Rows are
keyed by `_rowId`, so rows need IDs before they can be translated; creating a
copy in the portal assigns missing ones.

```json
{
  "id": "entry_serum",
  "values": {
    "name": "Rose Barrier Serum",
    "photo": { "mediaId": "media_serum", "alt": "Serum bottle" },
    "ingredients": [{ "_rowId": "row_rose", "name": "Rose extract", "amount": "2%" }]
  },
  "copies": {
    "id": {
      "name": "Serum Pelindung Mawar",
      "photo": { "alt": "Botol serum" },
      "ingredients": { "row_rose": { "name": "Ekstrak mawar" } }
    }
  }
}
```

- Pages: `"copies": { "id": { "title": "Beranda", "blocks": { "block_hero": { "title": "…" } } } }`.
- Site Layout configurations: `"copies": { "id": { "announcement": "…" } }` beside `design`.
- A copy exists when its key exists, even if empty. Entries and layout
  configurations with nothing translatable never need one.

## Eligibility and validation

A copy is used for visitors when it exists and normal validation passes on it;
there is no Ready state. Blank localized values stay blank and are never filled
from the main language. Under `fallback`, incomplete copies never block Publish;
under `strict`, each missing or incomplete copy is a publish issue such as
“Indonesian copy is missing.” Copies for unknown languages are rejected on save,
and a main-language path starting with a language code is reserved.

## Public pages

Each additional language gets every route under its prefix. On `/id/…`:

- `<html lang>` is the requested language; shared and translated items render
  from their eligible copies.
- An item without a usable copy appears whole in the main language inside the
  requested-language layout and template. Its blocks are wrapped in
  `<div lang="en" style="display: contents">`, and the page gets
  `<meta name="robots" content="noindex">`.
- Layout components receive `languages: [{ code, path, current }]` for a
  language switch. There is no browser-language redirect.

## Editor

- A top-bar **Editing language** select (code only below 600px) stays selected
  across Pages, Content and Site Layouts.
- In another language, forms show that language's values; shared fields keep
  their place with a **Shared** badge and remain editable. Rows and blocks can be
  opened and translated, but are added, removed and reordered in the main
  language.
- One status line shows **Eligible**, **Incomplete** with “Missing …”, or **No
  {language} copy** with **Add {language} copy**. The New copy form starts blank
  with Create/Cancel. **Remove {language} copy** replaces Delete for pages and
  entries.
- Page and entry lists show each item's status in the selected language.
- The preview shows the draft copy, with a **Visitor** toggle for what visitors
  would get; main-language stand-ins are outlined and labelled.
- Schema changes list the copies they leave incomplete or whose translated
  values they remove.

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

Library blocks and layouts need `localized` fields and a language switch before
real designs translate block or layout text. Kahf search indexing is library
work. Site Layouts preview the draft only, and layout copies are removed only with
their language. Preview outlines cover whole blocks, not individual cards.
New pages, entries and blocks are created with main-language values. Live Git
saves and publishing were not exercised.

## Verification history

- [2026-10-23 engine implementation](../verification/runs/2026-10-23-internationalization.md) — Passed locally.
