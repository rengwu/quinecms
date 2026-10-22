---
title: Kahf recreation readiness study
updated: 2026-10-20
status: Scope accepted — i18n UI spike handed off
---
# Kahf recreation readiness study

## Request and boundaries

The user proposes recreating [Kahf](https://www.kahfeveryday.com/en/) as an
independent QuineCMS static site to exercise real project readiness. The recreation
remains in research and design; DEC-216 separately hands an isolated i18n UI spike
to another agent. Consider routes on the exact
`https://www.kahfeveryday.com` origin; subdomains and other origins are not
recreation targets. Outbound links and embedded services are boundary items.
Use the existing jstack interview/plan record and grill-form for decisions.

Everything below marked proposed remains a recommendation, not an accepted
feature or permission to implement. Existing engine/library/site ownership
decisions remain applicable.

## Scope revision — 2026-10-19

DEC-193 replaces the proposed full-corpus recreation with **a couple of entries
per retained content type**. The user explicitly permits omitting less important
entries, peripheral routes and less reachable links, and simplifying the site.
The 964-URL census and comprehensive mapping below remain reference research,
not a required implementation backlog. DEC-208–DEC-215 below subsequently settle
the retained families and proof criteria. Specific sample entries and slugs remain
to be selected; do not manufacture extra records just to reach two of every type.

DEC-194 selects optional engine internationalization as the next design topic:
enable/disable it, designate a main language, keep optional language copies of
content, and offer either fallback to main-language content or enforced language
completeness. The [internationalization discussion](optional-internationalization.md)
records the accepted behavior rounds and remaining engineering design. DEC-207
requires an i18n UI presentation prototype/spike before feature implementation;
the user asks to record it for later, then continue the wider Kahf interview.
No implementation or prototype has begun.

Other proposed additions and acceptance decisions were deferred while discussing
i18n. The next submitted round settles the sample and proof criteria below.
Full-corpus performance and large-list browsing remain outside the prerequisites
for this smaller proof. A small sample cannot establish production behavior at
the original site's full content volume.

## Accepted sample and proof criteria — 2026-10-20

The [scope answers](../journal/2026-10-19-grill-a3d80ba9-a41c-43d0-9a3c-c8238c5f474e.md)
select the proposed twelve-page set and add search: **thirteen logical pages
before language variants** (DEC-208, DEC-211). Page families/counts are accepted;
the representation column remains the proposed QuineCMS mapping.

| Retained family | Count | Proposed representation |
| --- | ---: | --- |
| Home | 1 | Static composition |
| Story | 1 | Static composition |
| Shop listing | 1 | Static composition with Products listing |
| Product details | 2 | Products collection and generic template |
| Blog listing | 1 | Static composition with Articles listing |
| Articles | 2 | Articles collection and generic template |
| Ingredient listing | 1 | Static composition with Ingredients listing |
| Ingredient detail | 1 | Ingredients collection and generic template |
| Concern details | 2 | Concerns collection and generic template |
| Search | 1 | Static page with client-side search over retained content |
| Total | 13 | Six static pages and seven collection detail instances |

Choose one simple and one optional-section product when selecting concrete
examples. Only one ingredient detail was observed; do not invent a second.
Additional category archives, concern indexes, events and peripheral routes are
not part of this selected set. Adapt navigation, listings and CTAs to retained
destinations rather than leaving links to omitted local routes.

- **Fidelity (DEC-209):** closely match retained desktop/mobile layouts,
  typography, images and spacing; simplify decorative motion while retaining
  necessary interaction behavior.
- **Service boundary (DEC-210):** omit account, funding-application and campaign
  service routes and entry points. The off-origin skin analyzer stays excluded.
  Ordinary marketplace product links can remain outbound navigation; do not add
  cart/checkout or simulate the omitted services.
- **Copy (DEC-212):** remove obvious placeholders; flag questionable substantive
  copy and prefer intact examples without inventing brand/product claims.
- **Languages (DEC-213):** use a partially bilingual English-main/Indonesian-
  secondary sample, with translated examples across retained families and deliberate
  missing copies for fallback. Also exercise incomplete-copy and strict rejection
  behavior locally. Verify actual copy language instead of trusting URL prefixes.
- **Authoring (DEC-214):** exercise creation/editing of entries, translations,
  media replacement, adding/reordering existing page sections, shared layout and
  navigation copy, preview, save and publish without editing source code.
- **Verification boundary (DEC-215):** require local build and editor verification
  only. The walkthrough covers local save/publish validation and UI paths; any
  provider mocks must be identified. Live Git writes, hosting rebuilds, deployment
  and production media uploads are not acceptance requirements, and local success
  must not be reported as evidence of those live behaviors.

The i18n UI presentation prototype/spike remains required before implementing
that feature (DEC-207). DEC-216 [hands this isolated work to another agent](internationalization-ui-spike-handoff.md).
Neither the spike nor production implementation has begun in this planning session.
Non-i18n engine additions below remain proposals to evaluate against the scope.

## Evidence and route census

Inspected on 2026-10-18 against engine `5d005b5`. The working tree was clean at
the start. Read the [engine contract](../features/site-engine.md),
[local authoring](../features/local-authoring.md), [layouts](../features/site-layouts.md),
[content model](../features/content-model.md), [generic pages](../features/generic-pages.md),
media, editor, decisions and recent planning records, and checked the relevant
source implementations.

The live [sitemap](https://www.kahfeveryday.com/sitemap.xml) lists **964 URLs**,
split equally between English-prefixed and unprefixed routes. These are listed
URLs, not 964 individually verified working pages or translations.

| Family | Per language in sitemap | Interpretation |
| --- | ---: | --- |
| Home | 1 | `/` and `/en/` |
| Shop | 6 | Shop landing plus Face Care, Body Care, Hair Styling, Fragrance, Others |
| Products | 40 | Shared product detail family with optional sections |
| Blog | 412 | Landing, five category archives, 406 article routes |
| Skin concerns | 11 | Index plus ten details; incomplete inventory, see below |
| Community | 3 | Landing, all events, funding |
| Other | 9 | Story, ingredients, counselor, FAQ, search, privacy, terms, login, register |
| Total | 482 | 964 across both prefixes |

Navigation reveals routes absent from that sitemap: Decode, Hydrobalance ingredient
detail, and acne-prone/oily-skin concern details. The public robots file also names
OTP/profile/account/ticket/analysis routes. Their authenticated contents were not
accessed; do not infer their screens from route names. Query parameters such as
event `status`/`page` and search `q` represent states, not separate content records.

Read HTML across top-level English families, all five product categories, all five
blog categories, concern details and one article. Read all 40 English product
pages: all returned HTTP 200. Browser inspection covered desktop and mobile home
and menus, product catalog/sorting, a product purchase modal, ingredient listing,
event archive, search, blog archive, counselor landing, Decode, login and
registration. This is a family-level planning audit, not an exhaustive visual or
content audit of every route.

Notable observations:

- Many English links use unprefixed URLs. Browser navigation can preserve the
  English locale even though direct unauthenticated HTTP reads return Indonesian
  shells. Explicit locale-aware route mapping will be needed; literal anchor
  copying alone is unreliable.
- English shells contain Indonesian article bodies. Language scope and translation
  are separate choices; do not silently translate the source.
- The product purchase modal links to marketplaces. No on-origin cart or checkout
  was observed in this flow.
- The unprefixed counselor URL redirects to `skin-analyzer.kahfeveryday.com`.
  The [English counselor landing](https://www.kahfeveryday.com/en/try-skin-counselor/)
  remains a public same-origin page. The analysis application is outside scope.
- Upcoming and past event tabs displayed no events. There is no verified event
  detail to copy yet. Search for `serum` eventually returned nine results; the
  initial empty response was a loading state, not a broken-search conclusion.
- [Decode](https://www.kahfeveryday.com/decode/) contains a third-party queue iframe
  that was blocked in the browser. Its signup/ticket CTAs link to login.
- The source contains apparent anomalies: an `AAAAAAAAA` token in story copy,
  placeholder-looking testimonial headings, and a dry-hair page with acne-routine
  copy. Review these explicitly; do not invent replacement brand content.

## Proposed ownership and primitives

Use an independent site, provisionally `quinecms-site-kahf`. Keep its content,
configuration and original asset records there. Add reusable Kahf layout/block
implementations to `quinecms-library`, with an explicit starter preset if useful;
subscription must not replace site content. Preserve asset provenance. The
same-origin route rule does not imply that a reference image served by a CDN is a
new page to recreate; asset acquisition is a separate step.

Use one versioned Kahf layout design for the announcement strip, logo, desktop
mega-menu, mobile drill-down menu, search entry, locale switch, footer, contact
links and floating CTAs. Named configurations can select standard, overlay-header
and Decode campaign settings where appropriate. A new layout implementation is
only necessary if wrapper structure actually differs. Footer promotion/contact
content belongs to layout settings; page-specific CTAs remain blocks.

Use static pages for individually composed landing pages. Use collections and
generic pages for products, articles, concerns and ingredients. Short owned
repetitions use block `list` fields or entry object `array` fields. Independently
reused records use typed references. Media fields use normal media records,
including locally stored images/video and responsive variants.

The existing strict static/generic block distinction still applies. Reuse view
components behind appropriate static and generic definitions; do not assume one
manifest can currently appear in both catalogs. Existing `collectionField`
declarations supply selected fields to listing blocks. Filtering, sorting,
carousel behavior and URL query state can be library code without a new engine
query language.

## Proposed page and section mapping

Paths below omit the reference's `/en` prefix for readability. DEC-198, DEC-199
and DEC-204 select unprefixed English and `/id`-prefixed Indonesian with shared
paths/slugs for the pilot. This table inventories the reference; DEC-193 permits
retaining only a useful subset.

| Page family | Observed sections, in order | QuineCMS representation |
| --- | --- | --- |
| Home | Video hero and two actions; five category cards; popular-product carousel; story/video section; latest articles; counselor CTA; full-width product CTA | Static page with seven editable sections. Product/category/article cards resolve shared entries; editorial ordering is explicit. Desktop/mobile video selections are media fields, not separate pages. |
| `/shop/` | Hero; category navigation; face-care feature/grid; body-care carousel; fragrance feature carousel; hair-styling products; other products | Static page with category-specific product showcase blocks, using one Products collection. Preserve differing compositions instead of replacing the whole page with one generic grid. |
| `/shop/{category}/` | Image hero and breadcrumbs; category tabs; product cards with badges/sizes; Show All/Best Seller/New Product selector; pagination; counselor CTA | Five category entries with one generic category template, or five static compositions if their structure diverges. Product listing reads category references and declared fields. Browser state controls filtering/pagination. |
| `/product/{slug}/` | Breadcrumbs; gallery, category, title and summary; marketplace modal; usage text; ingredients disclosure; optional pairings; ingredient highlights; optional routine; optional testimonials; related products | Products collection with one generic template containing overview/gallery, optional pairings, ingredients, routine, testimonials and recommendations blocks. Empty optional sections render nothing. All 40 products fit this family: 33 have the basic heading sequence; seven add sections. No per-entry block arrays needed. |
| `/skin-concern/` | Hero; concern cards; counselor CTA | Static landing plus Concern card block selecting the Concerns collection. |
| `/skin-concern/{slug}/` | Concern hero; ordered product routine; ingredient highlights; other concern cards; counselor CTA | Concerns collection and generic template. Routine is an owned ordered array of step label/copy/product reference. Product content is reused through typed projections. |
| `/ingredients-glossary/` | Hero; available-letter filter; text search; ingredient cards and associated products | Static page plus searchable Ingredients listing. Alphabet/filter controls are local interactions over built content. Only Hydrobalance was observed; do not manufacture a full alphabet of records. |
| `/ingredients-glossary/hydrobalance-1/` | Hero/breadcrumbs; three benefits; products containing ingredient; expert testimonial; FAQs; other ingredients | Ingredients collection and generic template. Benefit/FAQ arrays are owned; products and other ingredients use references. Product/ingredient relation ownership must avoid maintaining two conflicting copies. |
| `/our-story/` | Story hero; vision/mission split section; innovation/ingredient highlight; Paragon panel; partnership cards; values photo gallery; Green Trails section; latest articles; counselor CTA | Static composition using hero, image/text, ingredient feature, editorial cards, gallery, article rail and CTA blocks. Partnership cards need independent entries only if reused or given detail routes. |
| `/blog/` | Featured-story composition; General, movement, grooming, event and lifestyle article sections; product CTA | Static editorial landing with distinct featured and category listing blocks backed by Articles. |
| `/blog/{category}/` | Breadcrumbs/category heading; category selector; article cards with dates; pagination; product CTA | Five category archive compositions reading Articles. Preserve the route distinction from article slugs; central collision validation already exists. General archive showed six cards per page and 44 pages. |
| `/blog/{article}/` | Breadcrumbs; title/date/author; cover and article body; sharing; related articles; product CTA | Articles collection and one generic article template. Markdown/richtext plus registered media; author can be text unless genuinely reused as an independent record. Preserve body language and citations. Sample additional complex articles before finalizing import conversion. |
| `/community/` | Hero; introduction and photo gallery; upcoming events; funding CTA; testimonials; product CTA | Static page with shared Events listing, gallery, testimonials and CTA blocks. Empty events remain a real state. |
| `/community/all-events/` | Hero; Upcoming/Ongoing/Past tabs; event list or empty state; pagination state | Static page plus Events collection/listing. Date/status selection is library behavior. No invented event detail template is required until a public example is available or creating one is explicitly selected. |
| `/community/funding/` | Hero; funding explanation; application steps; community, contact and event fields; proposal upload | Static blocks plus a library form component. The visible upload accepts PDF/DOC/DOCX, maximum 5 MB; description has a 250-character limit. A real endpoint/storage service is required for submission. This is separate from trusted-admin R2 uploads. |
| `/decode/` | Campaign hero and venue/date strip; overview/video; five experience features; interactive venue/experience section; day-tabbed schedule; external queue; ticket CTA | Static campaign composition. Experience cards and schedule use owned lists/arrays; map hotspots and tabs are library interactions. Queue/tickets are explicit integration boundaries, not simulated services. |
| `/try-skin-counselor/` | Hero; three instructional steps; FAQs; product CTA | Static landing with hero, steps, FAQ and CTA blocks. Face scanning/recommendations are not a static CMS capability and the observed analysis app is outside the allowed origin. |
| `/faq/` | FAQ heading/accordion; product CTA | Static page plus FAQ list. Use a data-only FAQ collection only if the same questions are shared with counselor/ingredient pages. |
| `/search/` | Query field; count; grouped product/event/article results; empty states | Static search page plus client search over a compact build-time corpus. Preserve `q` and minimum-length behavior. Search UI/index generation can start in the library/site build tooling. |
| `/privacy-policy/`, `/terms-conditions/` | Heading and long-form document | Two static pages with richtext/document blocks. These are content records, not engine-specific legal page types. |
| `/login/`, `/register/`, OTP/profile routes | WhatsApp-number login; registration with consent choices; later account/ticket/analysis areas not inspected | Public forms can be rendered, but real identity, OTP, personal results and tickets need services. Recommend excluding operational account features from the static recreation and explicitly resolving linked CTAs. QuineCMS admin login is unrelated. |

## Proposed content schemas

Keep schemas expressive but small:

- **Products:** name, category reference, summary, size label, badge/featured
  settings, thumbnail/gallery, usage, ingredient text, ingredient references,
  marketplace links, optional paired products, optional routine, testimonials,
  related products, SEO fields.
- **Product categories:** name, description, hero media, ordering; routed through
  a shared category template if that option is selected.
- **Concerns:** name, hero/copy, ordered routine steps with product references,
  ingredient highlights, related concerns, SEO.
- **Ingredients:** name, overview/hero, benefits, expert quote, FAQ rows, related
  ingredients. Either curated product references or derived product usage; do not
  require editors to maintain both directions.
- **Articles:** title, category, date, author, excerpt, cover, body, related/featured
  references and SEO. Five category records are useful for navigation/archive copy.
- **Events:** title, dates, venue, summary/image and optional link. Start empty if
  the reference remains empty; keep test fixtures separate from copied content.
- **Shared object shapes:** gallery item, marketplace link, routine step, benefit,
  testimonial, FAQ item and SEO. Use named objects only where reuse helps. Stay
  within the engine's three owned levels; references do not add owned depth.

An editor should be able to change a product once and see the update in its detail,
home/category listings and related routines. Schema/template editing remains a
separate task from changing entry values, using the existing live entry preview.

## Engine gaps and proposed additions

| Priority | Evidence in current engine | Proposed response |
| --- | --- | --- |
| High | `Public.astro` hardcodes `lang="en"`. Layout/Head props have content/settings but no explicit active route/page/entry. Document title is centrally composed from page/entry label and layout title. | Add a small public-document/render-context contract: current route, page and optional entry/collection; resolved language and page metadata. Make it consistent in generation and preview. Provide one title/description/canonical/social metadata path and allow layout Head extensions without duplicate title ownership. This benefits every real content site. |
| Deferred after scope reduction | Content entry list maps every entry into a single list; Media similarly renders the complete grid. No entry-list search/pagination is present. | Simple search and bounded navigation remain potential improvements. DEC-193 removes the full corpus from this proof; these are not current prerequisites. |
| Medium | Public route generation exists, but no first-class sitemap/redirect/locale-alternate contract was found. Publication requires an exact static `/` page. | Propose sitemap/robots output from validated routes and explicit site origin. Decide root/locale aliases before implementation. Redirects may remain host configuration until there is a clear portable engine contract. Do not imply an `/en/` home alone passes validation. |
| Product behavior selected; implementation design pending | Fields and routes have no locale/translation identity model. Separate collections can use different prefixes and share templates. | DEC-194–DEC-206 select optional engine internationalization, whole-item fallback, shared composition, automatic eligibility, per-field localization and portal settings. Design the representation, resolver and editor integration before implementation; see the focused discussion. |
| Measure first | Every `contextFor` result includes collection entry summaries and all media; hydrated layouts receive the content snapshot. Larger corpora may repeat substantial data across islands. | Measure build duration, HTML/hydration payload, editor startup, preview latency, recovery and save size using the selected corpus. If necessary, scope client data to declared usage upstream while retaining existing APIs. This is a risk to verify, not a demonstrated performance failure. |

Existing primitives already cover references, arrays, gallery media, optional
template sections and live entry previews. No evidence presently justifies a
commerce engine, arbitrary per-entry blocks, generalized query language, form
backend, AI analyzer or ticketing system in QuineCMS. Search, faceting, accessible
carousels, accordions, tabs, cookie UI and map interactions are reusable library
work. Native form components can use an external endpoint under the existing
form-endpoint contract; submission storage and visitor uploads are service work.

## Proposed implementation sequence after authorization

1. Freeze the thirteen-page route manifest using concrete source examples,
   content exceptions and asset provenance. Apply the accepted language and
   service boundaries. Inspect the eventual site's working tree and saved Git
   draft before changing its content.
2. Agree on the small engine contracts exposed by this project and prototype/spike
   the i18n UI presentation methods before implementing the feature (DEC-207).
   Implement and regression-test engine changes upstream only after separate
   implementation authorization.
3. Build the shared shell and a vertical slice: home → shop → product →
   ingredient/concern. Include one product with optional sections and one without.
4. Add the agreed remaining page families and a couple of entries per retained
   type. Validate links/media, body conversion, query states and reference reuse.
5. Exercise client authoring and production output locally (DEC-214–DEC-215).
   Preserve exact dependency pins and separate library changes from content saves.
   No hosted delivery cycle is required for this proof.

## Readiness evidence to require

This project can provide stronger evidence, not certify every imaginable site.
The detailed verification recipes remain to be designed within the accepted
local-only scope:

- **Static output:** fresh install with frozen lockfile; content validation,
  assembled check, build and artifact checks; route collisions/missing targets;
  all local media and internal links; document metadata; meaningful non-JS output.
- **Reference fidelity:** compare every page family at matching desktop/mobile
  widths, including retained header/navigation, edited sample copy, fonts, images,
  optional product sections, galleries, filter/search states and reduced motion.
  Respect the accepted decorative-motion simplification. Inspect the selected
  entries without claiming visual verification of all 964 URLs.
- **Authoring:** create/edit a product, article and concern; change an ingredient
  once and inspect all uses; replace media; compose pages with existing blocks;
  edit shared navigation/layout copy and translations; reorder a routine; preview
  incomplete entries; cancel; recover/reload; exercise local save/publish paths.
  Verify reference deletion guards and shared-template effects. Identify mocked
  provider boundaries; real R2 uploads and Git writes are not required here.
- **Scale:** observe build time, payload size, startup/preview latency, recovery
  and Git snapshot size for the selected sample. Full-corpus and large-library
  testing are deferred, not implied by this smaller proof.
- **Outside acceptance:** live Git saves, hosting rebuilds, deployed content
  checks, R2 upload/read and live failed-operation recovery. DEC-215 selects local
  verification only; these are not pending hosting decisions for this proof.

No application code, library implementation, site content import, service
integration or deployment was performed during this study.

## Interview state and next design work

The initial six-question form was interrupted by a computer crash; its temporary
session directory is no longer present and no matching submitted answer download
was found. The user's chat reply settles sample size/simplification and selects
the internationalization direction. Do not re-ask full corpus versus sampling.

The replacement form focuses on the [internationalization questions](optional-internationalization.md).
Its [submitted answers](../journal/2026-10-18-grill-ebf226eb-bcab-4ca7-ba96-11c09d4ecee9.md)
select whole-item fallback, shared composition, strict publication/build checks,
unprefixed main-language routes and English-main/Indonesian-secondary for the pilot
(DEC-195–DEC-199). The [second submitted round](../journal/2026-10-19-grill-f85ebc7f-a355-4637-bbad-e6e30ca052d9.md)
adds automatic eligibility, no source-change tracking, visitor-facing coverage,
per-field localization, shared slugs, portal settings and a fixed main language
once translations exist (DEC-200–DEC-206). DEC-207 adds a required UI presentation
prototype/spike before i18n implementation. Its design, along with nested values,
preview, internal links and non-destructive retention, remains future work.

The [scope round](../journal/2026-10-19-grill-a3d80ba9-a41c-43d0-9a3c-c8238c5f474e.md)
settles page families, fidelity, service omissions, search, copy treatment,
translation coverage, authoring and local-only acceptance (DEC-208–DEC-215).
No interview form is currently pending. The subsequent handoff request assigns
the isolated i18n UI spike to another agent; start from the
[handoff brief](internationalization-ui-spike-handoff.md). Concrete sample/route
selection and fitting production behavior into engine/library/site boundaries
remain future work. Research engineering details before asking more questions;
raise only consequential choices exposed by that work. Other engine additions
remain proposals. Production feature/site implementation is outside the handoff.
See the [scope update](../journal/2026-10-19-kahf-scope.md).
