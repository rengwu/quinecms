---
title: Internationalization engineering design
updated: 2026-10-22
status: Proposed for review — implementation not authorized
---
# Internationalization engineering design

DEC-231 asks for this design before any code. It fits the accepted behavior
(DEC-194–DEC-206) and presentation (DEC-217–DEC-230) of
[optional internationalization](optional-internationalization.md) into the
existing engine. Everything below is a proposal for review, not an accepted
decision, and nothing is implemented. [Review points](#review-points) lists the
choices most worth checking.

## Summary

- Language copies live inside each record as a sparse `copies` overlay holding
  only per-language values. File paths, IDs and the save format stay as they are.
- One resolver, `localize(content, language, mode)`, returns the content a
  visitor or the draft preview gets in one language, with prefixed paths.
  Existing rendering, links, bindings and collection cards then work unchanged.
- A copy is eligible when the existing validation passes on it. No new state.
- The build generates each additional language's routes from localized content.
  Fallback routes are marked `noindex` (DEC-229).
- The editor edits a merged view of shared and per-language values and splits
  each change back, so existing field components stay.

## Settings

`content/site.json` gains one optional object, saved and published with content
(DEC-205):

```json
"i18n": { "enabled": true, "main": "en", "languages": ["id"], "missing": "fallback" }
```

- `main` is the main language and `languages` the additional ones, in switcher
  order. Codes are BCP 47 tags (checked with `Intl.getCanonicalLocales`),
  lower-case, unique and different from `main`. The code is also the URL prefix.
- `missing` is `fallback` or `strict`.
- No language names are stored; the portal and designs use `Intl.DisplayNames`.
- Without `i18n` the site behaves as today. `<html lang>` uses `main` when
  present, otherwise `en`, today's fixed value.
- `main` cannot change while any record has a copy, including while i18n is off
  (DEC-206).
- Turning i18n off (`enabled: false`) keeps `languages` and every copy; the build
  and preview ignore them (DEC-226).
- Removing a language deletes `copies.<code>` from every record in the same
  draft, after a confirmation with the count (DEC-226). Git history keeps them.
- Adding a language needs nothing extra (DEC-227): under `fallback` its routes
  publish with main-language items, which DEC-229 marks `noindex`; under `strict`
  Publish waits for complete copies.

## Which fields vary

`Field` gains `localized?: true`. Absent means shared (DEC-203).

- Allowed on leaf fields: text, url, richtext, number, date, toggle, select,
  media, reference, custom and arrays of references. A localized reference list
  holds one list per language.
- Rejected on owned containers (`object`, object `array`, block `list`) and on
  `collection` pickers. Fields inside containers can be localized; rows stay
  shared (DEC-228).
- Collection and object schemas set it in the portal schema editor with a
  **Per language** switch. Block and Site Layout definitions set it in library
  code. Until a library marks its fields, its blocks have nothing to translate.
- Media: when i18n is on, `alt` is per language for every media value, and
  `localized` decides whether the image varies (DEC-222). Images inside rich
  text keep their alt in the Markdown, so they follow the rich-text field.
- Page `title` is always per language: it is visitor-facing (DEC-202) and has no
  field definition to carry the setting. Page paths and entry slugs stay shared
  (DEC-204).

## Stored copies

A copy is an optional overlay keyed by language. It holds only localized values
and mirrors the record's value tree. Rows are keyed by their existing `_rowId`,
so adding, removing or reordering rows in the main language needs no copy edits.

```json
{
  "formatVersion": 1,
  "id": "entry_rose",
  "collectionId": "collection_products",
  "slug": "rose-barrier-serum",
  "values": {
    "name": "Rose Barrier Serum",
    "size": "30 ml",
    "photo": { "mediaId": "media_rose", "alt": "Serum bottle" },
    "ingredients": [{ "_rowId": "row_a1", "name": "Squalane", "amount": "5%" }]
  },
  "copies": {
    "id": {
      "values": {
        "name": "Serum Pelindung Mawar",
        "photo": { "alt": "Botol serum" },
        "ingredients": { "row_a1": { "name": "Skualana" } }
      }
    }
  }
}
```

- Pages: `"copies": { "id": { "title": "Beranda", "blocks": { "block_hero": { "heading": "…" } } } }`,
  keyed by block ID. Block order and bindings stay shared (DEC-196).
- Site Layout configurations: `SiteLayout.copies.id.settings`, the same overlay
  over `design.settings`.
- A copy exists when its key exists, even if empty. Only Create in the New copy
  form adds one (DEC-224); it also gives rows without `_rowId` an ID.
- Entries and layout configurations with no localized fields have no copies and
  look the same in every language. Pages always need one because of the title.
- Collections, objects, media records and Settings have no copies: their text is
  admin-facing or shared.
- `filesFor()` and `parseFiles()` need no path changes; copies save with their
  record, and deleting a record deletes its copies.

Inline copies avoid new paths, orphan files and split saves. The cost is larger
record files.

## Eligibility and validation

`view(record, language)` merges the record's shared values with the copy's
localized values. A blank localized value stays blank (DEC-195).

- **Eligible:** the copy exists and `validate()` reports no issues on its view,
  including publish-phase ones. This reuses the existing required, minimum and
  reference checks, with no Ready state (DEC-200). The status line (DEC-225)
  shows the same issues as “Missing …”.
- **Structure** (blocks Save, as today): `i18n` shape and codes; copies only for
  configured languages; copy values only for localized fields and compatible with
  their type; row keys that exist in the record. The editor keeps these true; the
  checks catch hand edits by local agents.
- **Publish** (blocks Publish and the build, as today): under `strict`, every
  record with localized fields needs an eligible copy in every additional
  language (DEC-197). Under `fallback`, incomplete copies never block.
- **Routes:** a main-language path whose first segment is a language code is
  rejected: “This URL is reserved for Indonesian.”
- **Schema changes** (DEC-223): `schemaChanges()` lists copies made incomplete.
  Making a field shared drops its copy values in the same edit; the effect box
  lists those copies too.

## Resolving a language

`localize(content, language, mode)` in a new `src/core/languages.ts` returns
ordinary `Content` for one language, plus each record's provenance (`copy` or
`fallback`):

- Each record becomes its copy's view when the copy is usable; otherwise the
  main-language record is used whole (DEC-195). Usable means eligible in
  `visitor` mode, and existing in the editor's `draft` mode (DEC-220).
- Page and collection paths gain the language prefix. `publicRoutes()`,
  `resolveLink()`, `contextFor()` links and collection card URLs then produce
  `/id/…` without changes. Raw URLs typed into rich text are not rewritten.
- On a generic page, the template page and the entry resolve independently: the
  template uses the requested language and only the entry falls back (DEC-221).
  `resolveBlock()` is unchanged.
- Referenced entries and collection cards resolve per entry (DEC-195).

The main language uses `content` as-is, so single-language sites keep today's path.

## Build and public pages

- `scripts/generate-blocks.mjs` loops over the main language and, when enabled,
  each additional language. Generated pages call `localize()` before the existing
  rendering code. `loadContent()` validation already fails the build under
  `strict`.
- `Public.astro` takes the route's language for `<html lang>`. On a fallback route
  it adds `<meta name="robots" content="noindex">` (DEC-229) and wraps the page's
  blocks in `<div lang="en" style="display: contents">`. The fallback content is
  then marked English while the layout stays Indonesian.
- Layout components receive a route context:
  `{ path, language, languages: [{ code, path }] }`. Designs draw their own
  language switch from it. There is no browser-language redirect, and `/` always
  serves the main language (DEC-230).
- Kahf search builds one index per language from `localize()` output, so
  Indonesian search shows what Indonesian visitors get, including fallback items.
- No sitemap, canonical or alternate links are added; DEC-202 does not approve a
  metadata system.

## Editor

- **Settings → Languages:** on/off, main language (locked once copies exist),
  additional languages with Add/Remove, and the missing-translation policy. This
  is the first Settings section that changes site content, so it saves with the
  draft. Off shows how many copies are kept; Remove confirms with the count.
- **Top bar:** a language select between the preview-width toggle and the save
  status (DEC-219). Below 600px it shows the code and the preview toggle becomes
  an icon, as in the spike. The selection is editor state kept across
  navigation, not content.
- **Forms:** fields edit `view(record, language)`, and one `split()` writes each
  change to the copy (localized) or the record (shared). Existing field
  components stay. Additions: a Shared badge (DEC-218), per-language alt on media,
  and locked row structure outside the main language (DEC-228). Switching
  language keeps the scroll position (DEC-217).
- **No copy:** the status line and an **Add {language} copy** button. The New
  copy form reuses the pending-creation path, so Cancel leaves nothing (DEC-224).
- **Status:** one status line on secondary-language copies (DEC-225), and
  per-language marks on page and entry list rows, as in the spike.
- **Preview:** renders `localize(content, language, 'draft' | 'visitor')` with a
  Draft/Visitor toggle (DEC-220). A block whose content comes from a fallback item
  gets the spike's dashed outline. Cards inside a block cannot be outlined without
  design changes, so referenced items in another language are not marked.
- **Strict Publish:** the existing toast names each record and language that is
  missing or incomplete.
- **Recovery and backups:** copies are part of content, so tab recovery, export
  and save include them.

## Library work

- Mark translatable block and layout fields `localized: true` in the Kahf blocks
  and layout, and in Archline, Intr or Tessera when a site needs them.
- Kahf layout: a language switch from the route context.
- Kahf search: one index per language.

## Order of work

1. **Core:** types, `i18n` validation, copy overlays, `view`/`split`,
   eligibility, `localize()`, reserved prefixes. Unit tests reuse the spike's
   scenarios.
2. **Build:** per-language routes, `lang`, `noindex`, route context. A build-check
   fixture with a copy, a fallback, an incomplete copy and strict rejection.
3. **Editor:** Settings, top-bar select, forms, status, New copy form, preview
   modes, schema switch and effect box. Browser checks of the DEC-214 walkthrough
   at desktop width and 390px.
4. **Docs:** record formats in [content model](../features/content-model.md) and
   [local authoring](../features/local-authoring.md).
5. **Library and Kahf site:** as above, verified locally only (DEC-215).

## Review points

1. Copies stored inline in each record rather than in per-language files.
2. Page titles always per language.
3. Images inside rich text follow the rich-text field's setting, an exception to
   DEC-222.
4. Fallback content marked with a `display: contents` wrapper. Layout CSS that
   targets the blocks as direct children would need checking.
5. Referenced items shown in another language are not individually marked in the
   preview.
6. `<html lang>` uses `main` even when i18n is off, which also fixes `lang` for
   single-language sites in another language.

The `spikes/i18n-ui/` prototype predates DEC-226: it still labels retention as an
Assumption and keeps copies when a language is removed. It was not changed,
because DEC-231 asks for no code.
