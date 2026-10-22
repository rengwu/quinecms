---
title: Optional internationalization
updated: 2026-10-23
status: Engine implemented locally (DEC-232); library and Kahf work not authorized
---
# Optional internationalization

## User-selected direction

The [Kahf scope update](../journal/2026-10-19-kahf-scope.md) and DEC-194 select
internationalization as an optional engine capability. These requirements are
accepted for planning; they have not been implemented:

- Internationalization can be enabled or disabled.
- When enabled, designate the main language.
- An item can have optional copies of its content in additional languages.
- Missing translations can fall back to the main-language content.
- A configurable policy can instead enforce completeness across all enabled
  languages.

Keep this in the engine, shared by public rendering, authoring, references,
validation and publication. Do not implement it as Kahf-only duplicated
collections or site overrides of engine files. The Kahf proof uses only a couple
of entries per retained type; broader site and engine questions are deferred.
DEC-216 now hands an isolated UI spike to another agent. Production feature and
site implementation remain outside the authorized scope.

## Existing foundation

`Page`, `Entry` and layout settings currently have no language-variant model.
`publicRoutes` generates static paths and collection-prefix/entry-slug routes;
`resolveLink` resolves stable page/entry identities. References and generic bindings
already separate identity from presentation values. Public HTML currently fixes
`lang` to English. The editor already previews unsaved entry values through their
shared generic template.

A useful design would preserve stable item identity across translations so a
product reference still points to the same product when the visitor changes
language. Avoid making editors duplicate every reference for every language.
Localized values should flow through the same preview and build resolvers.
These are engineering recommendations, not a finalized storage format.

## Accepted first-round answers

The user selected the first option in all five questions, without notes. The
[saved transcript](../journal/2026-10-18-grill-ebf226eb-bcab-4ca7-ba96-11c09d4ecee9.md)
is the source for DEC-195–DEC-199. Its filename uses the form's UTC creation date;
these decisions are recorded on the local project date, 2026-10-19.

| Decision | Accepted behavior |
| --- | --- |
| DEC-195 | Fall back for the whole item when its language copy is unavailable. Do not merge untranslated fields from the main-language item into an otherwise translated copy. A page can still show independently resolved related items in different languages. |
| DEC-196 | Share page sections, their order and templates across languages; localize content values. Independent per-language page composition is outside the selected scope. |
| DEC-197 | Allow incomplete translation drafts. Strict completeness blocks Publish and production builds, not draft saves. Existing structural validation still applies to drafts. |
| DEC-198 | Keep the main language at unprefixed paths and prefix additional languages. DEC-204 subsequently selects shared paths and slugs for the first release. |
| DEC-199 | Use English as the main language and Indonesian as the second language for the small Kahf proof. This is a pilot setting, not a two-language engine limit. |

For the pilot, an English product could use `/product/example` and its Indonesian
route `/id/product/example`. If the Indonesian copy is unavailable, permissive
mode selects the main-language item as a whole; strict mode prevents publication
until the language requirement is satisfied. DEC-200 below defines availability
through validation, without a separate editorial readiness state.

## Accepted second-round answers

The [second submitted round](../journal/2026-10-19-grill-f85ebc7f-a355-4637-bbad-e6e30ca052d9.md)
is the source for DEC-200–DEC-206. The user explicitly chooses the simplest source
update behavior and invokes jstack's rule-lean guidance. In particular, the
recommendations for an explicit Ready control and source-change warnings were
not accepted.

| Decision | Accepted behavior |
| --- | --- |
| DEC-200 | A language copy becomes eligible automatically when its required fields are valid. Do not add a separate Ready switch or approval state. Eligibility does not publish changes; the normal Publish/build boundary remains. |
| DEC-201 | Main-language text edits leave an existing valid translation eligible, without tracking source changes or showing freshness/review warnings. Structural and schema validation still apply. |
| DEC-202 | Cover page/block content, entries, shared layout/navigation copy and visitor-facing metadata wherever those fields exist. Translating the admin interface is outside this scope; this choice does not independently approve a larger metadata system. |
| DEC-203 | Choose localization per field, with fields shared by default. Schema and block/layout field definitions determine what may vary; content editors fill those values. Shared values are common data, not fallback from an incomplete translation. |
| DEC-204 | Share page paths and entry slugs across languages and add only the language prefix. Localized paths/slugs are deferred beyond the first release. |
| DEC-205 | Manage i18n enablement, main/additional languages and strict/fallback policy in portal Settings, saved and published with site content. |
| DEC-206 | Fix the main language once translations exist. Defer main-language migration support beyond the first release. |

Automatic eligibility means the engine does not judge whether text was actually
translated or editorially reviewed. A valid Indonesian copy can remain unchanged
after an English edit. Missing or incomplete copies still follow the accepted
whole-item fallback or strict-publication rule. Shared page sections, their order
and templates remain common across languages.

## Proposed defaults to revisit only if consequential

Use one main content item with linked language copies and stable identity, not
unrelated duplicate entries. Keep schemas and component code shared. Apply the
accepted field localization setting consistently to entry schemas and block/layout
definitions; work out nested object/array handling against the existing model.

Disabling internationalization should publish the main-language version. DEC-226
now settles retention: turning i18n off keeps stored copies, and removing a
language deletes its copies after a confirmation with the count. Do not reassign
the main language. Keep fallback provenance visible in the editor so inherited
copy cannot be mistaken for an existing translated copy; do not introduce the
rejected source-change review workflow. The remaining defaults in this section
are proposals, not additional accepted requirements.

## UI prototype before implementation

DEC-207 requires prototyping/spiking the internationalization UI presentation
methods before implementing the feature. At that time the user asked to remember
this prerequisite and move to the next Kahf interview.

The [spike result](internationalization-ui-spike-result.md) records the built
prototype (`spikes/i18n-ui/`), browser observations, comparison and the
[submitted presentation round](../journal/2026-10-20-grill-95ba214e-a1cc-46d8-b4ff-926fdb6d958a.md).
DEC-217–DEC-225 select a deliberately simple presentation with minimal UI text
(rule-lean, rule-plain-ui):

- Edit one language at a time with no main-language reference text; switching
  keeps the scroll position.
- Use one top-bar language selector kept across the portal.
- Keep shared fields in schema order with a Shared badge, editable.
- Preview the draft copy by default, with a Visitor toggle. On a fallback page,
  the layout and template use the requested language around the main-language item.
- Alt text is always per language; a media field's setting applies to the image.
- Allow changes that make copies incomplete, list the affected copies, and
  never copy main-language values into them.
- Start a copy from an explicit blank New copy form with Create/Cancel.
- Show copy status and missing values in one status line for secondary-language
  copies, with no inline field notes.

The recommended side-by-side/stacked reference, per-item tabs, grouped shared
fields, third media setting and inline notes were not selected.

The subsequent handoff request (DEC-216) assigns the UI spike to another agent.
The [handoff brief](internationalization-ui-spike-handoff.md) contains the current
workspace state, settled behavior, proposed comparisons, scenarios and completion
boundary. The receiving agent can proceed with isolated prototypes without
re-asking settled requirements; production implementation remains deferred.

A proposed spike should compare ways to present language selection, shared versus
localized fields, missing/incomplete-copy fallback, language-specific preview and
site-wide language settings. Use representative page, entry and layout editing
flows so the approaches can be assessed concretely. Keep automatic eligibility
and the absence of source-change tracking intact; do not reintroduce Ready
switches or review queues. This scenario list is a proposal for the later spike,
not an additional set of accepted UI requirements.

## Accepted remaining choices

The [remaining-choices round](../journal/2026-10-21-grill-00807883-1ffc-42ea-96fc-bd306a8acb12.md)
accepted every recommendation (DEC-226–DEC-231):

- Turning i18n off keeps stored copies; removing a language deletes its copies
  after a confirmation with the count.
- Adding a language to a live site needs no extra state: translate under
  fallback, then switch to strict.
- List and array rows are shared; only fields inside rows can be per language.
- Fallback pages are marked `noindex`.
- No browser-language redirect; visitors use the layout's language switch.
- Write the engineering design before any code.

The [engineering design](internationalization-engineering-design.md) answers
the four areas below. DEC-232 approved it and authorized the engine-only
implementation, which is [implemented locally](../features/internationalization.md)
and [verified](../verification/runs/2026-10-23-internationalization.md). Marking
library fields, a library language switch, Kahf search and the Kahf site remain
unauthorized.

## Remaining implementation design

Both submitted rounds are complete. They settle the selected product choices,
not an approved storage format or implementation. When this work resumes, pair
the required UI exploration with a concrete technical design that fits these
choices into the existing engine:

- **Representation and validation:** distinguish an absent language copy from
  an existing valid copy, including items with no required localizable fields.
  Reuse structural validation and define language-copy creation without inventing
  a readiness state or per-field fallback.
- **Nested fields and shared composition:** define localizable object/array
  behavior, stable block/row identity and effects of shared section/schema edits.
  A field setting must not accidentally create independent page compositions.
- **Authoring and lifecycle:** reuse existing editors and preview controls for
  the DEC-217–DEC-225 presentation, current unsaved values and fallback
  indicators, and fit the top-bar selector into the narrow top bar. Specify
  disable/re-enable and language removal as DEC-226 selects.
- **Routing and metadata:** resolve stable internal references in the requested
  language; validate prefixed-route collisions; distinguish requested language
  from fallback content language in public metadata. Localized slugs and
  main-language migration are explicitly deferred.

Research these engineering details before raising another product question. Ask
only if a concrete conflict requires the user's judgment. Do not add automatic
translation, review queues, source-version tracking or a broad metadata system
under this decision. The [Kahf scope round](../journal/2026-10-19-grill-a3d80ba9-a41c-43d0-9a3c-c8238c5f474e.md)
subsequently selects thirteen logical pages including search, partially bilingual
sample content and local-only build/editor verification (DEC-208–DEC-215).
No hosting choice is required for that proof. The i18n UI spike was
[handed off](internationalization-ui-spike-handoff.md), delivered and its
presentation selected. DEC-232 later authorized the engine implementation only.

## Eventual proof, not executed

Use a small set of real content to exercise a translated item, a missing copy,
strict-mode rejection, permissive fallback, language switching through an internal
reference, unsaved preview, save/reload, shared versus localized fields, layout
copy and language settings. Also exercise a source text edit that leaves a valid
translation eligible without freshness tracking, and the main-language change
guard. Include disable/re-enable retention and language removal (DEC-226).
Check language metadata and generated paths as well as visible text.
No i18n implementation, test, migration or deployment was performed in this phase.
