---
title: Optional internationalization
updated: 2026-11-09
---
# Optional internationalization

**ID:** FEAT-internationalization

## Intent and basis

Sites can publish an item in additional languages. The behavior follows
DEC-194–DEC-206 and DEC-217–DEC-231 in
[optional internationalization](../discussions/optional-internationalization.md);
the [engineering design](../discussions/internationalization-engineering-design.md)
records how it fits the engine. DEC-251 makes text and rich-text fields
translatable by default. Particular translated designs are supplied by libraries
or original site extensions.

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

Text and rich-text fields vary by language by default (DEC-251). Set
`"localized": false` on technical text such as anchors, commands and code to
keep it shared. Other leaf types, including URLs, numbers, dates, selects,
references, reference lists and media, stay shared unless `"localized": true`.
Objects, object arrays, block lists, collection selectors and collection-field
mappings cannot vary; their inner content fields can, and rows stay shared.

- Collection and object schemas override the default with the **Per language**
  switch. Turning it off stores an explicit `false`, including on text fields.
- Block and Site Layout definitions inherit the same defaults; library authors
  only configure exceptions.
- Media alt text always varies by language; `localized` decides whether the
  image varies.
- Static page titles always vary. Paths, slugs, block order and bindings are
  shared.

The default applies to existing definitions that omit `localized`, too. Main
values and stored copies stay in place; no values are moved or automatically
translated. Newly translatable fields are blank in an existing copy until an
editor fills them. Review required-field completeness and technical-text
exceptions when upgrading an existing multilingual site. Text previously entered
in a shared field remains a main-language value; the engine cannot infer which
language the editor intended.

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
  across Pages, collection entries and Layouts.
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

## Limits

The engine does not automatically translate content or rewrite literal URLs in
URL fields and Markdown. The layout draws its own public language switch from
the supplied language links. Site Layout previews show the draft only; layout
copies are removed with their language. Preview outlines cover whole blocks,
not individual cards. New records and composition are created in the main
language. There is no source-change review state, automatic browser-language
redirect, or general sitemap/canonical-link feature.

## Checks and evidence

[Check recipes and dated evidence](../verification/features/internationalization.md).
