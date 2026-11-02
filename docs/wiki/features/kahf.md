---
title: Kahf recreation
updated: 2026-10-25
---
# Kahf recreation

**ID:** FEAT-kahf

## Intent and basis

A real reference site exercises existing QuineCMS primitives with a small,
partially bilingual catalog/editorial sample. DEC-208–DEC-215 set thirteen logical
pages, close desktop/mobile fidelity, omitted service flows, simplified decorative
motion and local-only verification. DEC-233 authorizes implementation after the
i18n spike and engine work. See the [scope record](../discussions/kahf-recreation.md).

The design and explicit starter live in `quinecms-library`; the independent
`quinecms-site-kahf` owns its adopted content/configuration. No engine source was
changed for this recreation. Its required i18n engine revision is
`7f7a47ba8409dc1bb9cdb44777869ca7c5930328` or later.

## Entry points and representation

Use the [Kahf setup](../verification/setup.md#kahf-local-proof) for the local site,
fixture and provider boundaries. The public preview is `http://127.0.0.1:4323/`;
the editor is `/admin/`. The library preset README records source URLs, asset
provenance, editorial translations and intentional omissions.

| Page family | Editor entry point | Representation |
| --- | --- | --- |
| Home | Pages → Home | Hero, owned category cards, collection-backed products/articles, story and promotion splits |
| Story | Pages → Our Story | Story hero, image/copy splits, owned values and partnership lists |
| Shop | Pages → Shop | Second configuration of the same layout for overlay header; image hero and collection listings |
| Products (2) | Content → Products | Shared fields, gallery and benefits arrays, usage/ingredients, outbound marketplace rows; generic product template |
| Blog | Pages → News & Updates | Collection-backed featured article, filtered listing, promotion |
| Articles (2) | Content → Articles | Generic article, complete Markdown and local inline media, metadata and actual prose language |
| Ingredients index/detail | Pages → Ingredients; Content → Ingredients | Listing plus generic overview, benefits and FAQ arrays |
| Concerns (2) | Content → Concerns | Generic hero/routine, four owned steps, related concern listing |
| Search | Pages → Search | Title search across all routed entries and five editable static-page links |
| Shared shell | Site Layouts → Kahf / Kahf · overlay header | Navigation, announcement, footer, language links and layout mode |

The library has ten Kahf block definitions, including separate static/generic
listing definitions sharing one view. Short repetitions use owned lists/arrays;
reusable detail content uses four collections. Listing field selectors declare
`collectionField`; selecting Size in place of Title changes rendered product card
headings without component code changes. Styling also works in standalone catalog
previews, and responds to its container width inside the editor.

## Expected behavior

- Six static pages plus seven entries produce 13 routes; English-main and
  Indonesian-secondary produce 26 public routes. There is no `/en` alias.
- Indonesian copies cover each retained family except deliberate item fallbacks:
  Story, deodorant, mosque article and oily skin. Fallback pages have `noindex`
  and an English item wrapper inside Indonesian layout/template text. The mosque
  prose itself is Indonesian and explicitly marked as such.
- Editing an entry updates its detail and collection-backed cards. Owned row
  structure, routes and slugs are shared across languages; marked values and alt
  text vary. Incomplete copies show the English item in Visitor preview. Strict
  publication rejects missing/incomplete copies; saving a draft remains possible.
- Gallery thumbnails replace the large image. Buy opens an accessible marketplace
  dialog; Escape closes it and restores focus. Links navigate to the merchant;
  there is no checkout. FAQs and ingredient panels use native disclosures.
- Search preserves submitted `q`, returns the requested-language entry URLs and
  shows localized empty/no-result states. It searches titles in the retained
  sample, not the original site's entire corpus or article bodies.
- Videos offer pause/play, do not autoplay for reduced motion, and pause offscreen.
  The blog has one static featured article; featured products are static cards.
- Raw URL fields/Markdown stay literal under the existing engine contract. Links
  inside an English fallback item can return to an English route; collection links
  and the language switch are resolved for the requested language.

## Verification recipe

1. Run library `pnpm test` and `node scripts/verify-kahf.mjs`. The fixture validates,
   typechecks, builds 26 public routes plus admin, checks emitted assets/runtime
   separation, then audits local links, media and fallback metadata.
2. At 1440px and 390px, inspect every page family and compare with the corresponding
   reference. Test mobile menu/language switch; product thumbnails, Buy → Escape;
   ingredient FAQ; shop filters; search `Hydrobalance`, a nonexistent title and a
   direct `?q=Hydrobalance` load. Check console errors and horizontal overflow.
3. In the provider-free editor, edit a product title and replace its image; confirm
   real preview updates. Select Indonesian, clear required Title, compare Draft
   and Visitor, restore it. Create a temporary product, add its Indonesian copy,
   fill Title, and observe eligibility.
4. On Home reorder a section with Alt+ArrowDown/Up, add an Owned cards block, and
   change its heading. Change a product listing's Title field to Size and back.
   In Site Layouts change announcement/navigation copy. Confirm both previews.
5. Reload and log in again; confirm browser recovery retains the temporary entry.
   Settings → Discard edits → Continue removes all disposable edits and restores
   the two baseline products. Local files must stay identical to the baseline.
6. `tests/kahf-editor.test.ts` drives actual Save draft/Publish controls with this
   content and a mocked Git transport: fallback saves/publishes after confirmation;
   strict missing copies save but cannot publish. It mocks preview islands too;
   browser steps above establish real rendering separately.

## Coverage and limits

The four deliberately absent copies are test content, not unfinished required
translations. There is no general search engine, commerce backend, automatic URL
rewriting, sitemap/redirect addition or new workflow framework. The implementation
uses the existing engine capabilities; further engine additions require evidence
and a separate scope decision.

The current development manifests link sibling checkouts. The engine SHA was not
available through its remote archive, so the artifact fixture uses installed
checkouts with exact installed-version declarations. This proves local static
output, not a portable pinned installation. Exact release pins and a clean remote
install remain delivery work. Live Git/R2/hosting are outside DEC-215 acceptance.
A small sample does not establish 964-URL scale, assistive-technology coverage,
cross-browser compatibility or native-device performance.

## Verification history

- [2026-10-25 local recreation verification](../verification/runs/2026-10-25-kahf.md).
