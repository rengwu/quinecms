---
title: Open questions
updated: 2026-10-06
status: Scoped interviews complete; implementation recorded
---
# Open questions

Site Layouts and chartr were authorized and implemented after the interview records below. No product question blocks this scope. [Current contracts](../features/site-layouts.md), [implementation journal](../journal/2026-10-06-site-layouts-implementation.md) and [verification](../verification/runs/2026-10-06T1140Z-site-layouts.md) distinguish shipped engineering choices from the original proposals.

## Layout updates — resolved

[Q76](../journal/2026-10-06-grill-7a73a1dd-dfe9-4d9a-9118-fd7107ac2d9c.md) is accepted as DEC-107: retain selectable layout code versions, pin the active version and upgrade explicitly. See the [version contract](site-layouts.md#layout-versions) and [round-three interpretation](../journal/2026-10-06-site-layouts-round-three.md). This retains only the active layout/version and current settings; it does not restore settings caches for inactive layouts. Exact version-picker presentation and settings-transition mechanics are engineering work, without an assumed automated migration requirement.

## chartr recreation — follow-on scope recorded

DEC-106 requests recreating [chartr.dev](https://chartr.dev/) as a layout and independent blocks after the Site Layout foundation. The [scope](chartr-recreation.md) proposes the shared shell and nine content blocks, with source references and unexecuted verification targets. No new product interview is needed for this sequencing request. Exact fields, lifecycle adaptation and reusable component boundaries are engineering work. Live release/download text differs from the local source and must be reconciled against the live target during implementation.

## Site Layout library and whitelist — resolved

The user adds a growing repository-based layout library and hidden environment-configured client whitelist (DEC-102–DEC-103). See [Site Layouts](site-layouts.md) and the [library discussion journal](../journal/2026-10-06-site-layouts-library-discussion.md). This follows, and does not undo, the accepted first-round choices below.

Q74–Q75 are resolved as DEC-104–DEC-105 by the [submitted answers](../journal/2026-10-06-grill-955ea450-7b57-4225-91b5-95d6a5b3986c.md); see the [round-two interpretation](../journal/2026-10-06-site-layouts-round-two.md).

| Question | Decision | Accepted outcome |
| --- | --- | --- |
| Q74 | DEC-104 | Show all installed layouts when the variable is absent. |
| Q75 | DEC-105 | Keep an excluded active layout working with current settings; restrict future picker choices. |

The recommendation to reject a build/configuration because its active layout is excluded was not selected. The active layout must remain resolvable for rendering, preview, settings and the normal save workflow. The product scope is settled. Exact variable name/format, empty/invalid-list handling, validation messages and build imports remain engineering work. Proposed mechanics are recorded in the design, not accepted by implication. No block-adherence categorization or restriction is introduced by a layout whitelist.

## Site Layouts — resolved

DEC-092–DEC-096 establish the site-wide wrapper, author-owned settings/customizations, layout picker, active-layout-only persistence and unrestricted optional adoption of layout variables by blocks. No styling categories or discrimination are wanted. See [Site Layouts](site-layouts.md) and the [discussion journal](../journal/2026-10-06-site-layouts-discussion.md).

Q69–Q73 are resolved as DEC-097–DEC-101 by the [submitted answers](../journal/2026-10-06-grill-3dfa46b2-2cec-4d74-8d0f-2079848d280d.md); see the [interpretation](../journal/2026-10-06-site-layouts-round-one.md).

| Question | Decision | Accepted outcome |
| --- | --- | --- |
| Q69 | DEC-097 | Shared, optional content max-width and page gutter values outside layouts. |
| Q70 | DEC-098 | Separate Site Layout and Settings sidebar areas. |
| Q71 | DEC-099 | Live selected-page preview alongside layout settings, with desktop/mobile widths. |
| Q72 | DEC-100 | Card applies layout/defaults to the local draft; separate Preview leaves active state intact. |
| Q73 | DEC-101 | Developer installation in source and rebuild, as with blocks. |

No consequential product questions remain from the Site Layout rounds or the versioning review. Authoring/runtime interfaces and first-time conversion of Site Options remain engineering work; proposed approaches and validation targets are recorded in [Site Layouts](site-layouts.md). They are not separately accepted product decisions. The questionnaire submissions themselves requested no implementation; the chartr follow-on request is recorded above with the foundation-first sequence.

## Block library — resolved

Q60–Q68 are resolved as DEC-082–DEC-091. See [round one](../journal/2026-10-06-block-library-round-one.md), [round two](../journal/2026-10-06-block-library-round-two.md) and the [consolidated implementation scope](block-library.md).

The scope includes a themed/tagged searchable catalog with direct add and separate Preview, refitted static and useful generic blocks, editable block/schema lists, generic list bindings, collection-backed Blog cards, external form submission, a shared footer and grouped-navigation header. Block appearance comes from themes and site settings; per-block visual customization was rejected. The six reference sites remain capability/design benchmarks.

No consequential product questions remain for this phase. The proposed first selection is three variants per category (45 base variants, including shared Footer choices), plus useful generic counterparts and a shared navigation header. Exact field/metadata interfaces and variant implementation details remain engineering choices. This is accepted scope; application implementation and verification are pending.

## Generic pages and schema-only entries — resolved

The user requested discussion before implementation. DEC-058–DEC-061 establish field-only entries, static/generic page types, generic-only blocks with optional field-name bindings, and optional collection-to-template assignment. See the [discussion journal](../journal/2026-10-05-generic-pages-discussion.md).

Q48–Q55 are resolved as DEC-062–DEC-069; see the [round-one interpretation](../journal/2026-10-05-generic-pages-round-one.md). Q56–Q59 are resolved as DEC-070–DEC-073 in [round two](../journal/2026-10-05-generic-pages-round-two.md): index pages match by URL, a basic collection-list block is included, rich-text embeds initially support uploaded images and YouTube, and the current demo entries will be replaced with fresh schema-only content. No consequential product questions remain for this scope. Concrete interfaces and rendering/validation mechanics remain engineering work. Footer integration and broader rich-text embed support are outside this version. The user authorized implementation on 2026-10-06; see the [implementation run](../verification/runs/2026-10-05T1650Z-generic-pages.md). The earlier interview-complete statements below describe the previous scope.

## Admin hierarchy refinement — resolved

Q46–Q47 select Add block beside the Blocks heading, aligned right, and alternative B: separate top-level Content and Collection schemas areas. These are DEC-052–DEC-053 in the [decision register](../decisions/index.md); see the [accepted design](admin-hierarchy-proposal.md) and [interpretation](../journal/2026-10-05-admin-hierarchy-decisions.md). The scoped choices are resolved. DEC-054 additionally moves all destinations to a standalone Home menu. Implementation is present; the [run](../verification/runs/2026-10-05T1054Z-admin-hierarchy.md) records completed checks and the remaining schema-screen browser review.

The four-round product interview establishes the [agreed design](agreed-design.md). The user subsequently requested a technical grill to choose the stack, content format, block contracts, and related implementation decisions. The technical interview is now complete as well. Accepted choices are recorded below; untested engineering details are identified in the technical specification.

## Technical round one — resolved

Q25–Q32 are accepted as DEC-026–DEC-033. The additional shared-vendor direction is DEC-034. See [technical foundations](../journal/2026-10-05-technical-foundations.md).

## Technical round two — resolved

Q33–Q39 are accepted as DEC-035–DEC-041. The user chose retained deprecated block implementations and manual version switching, replacing the proposed automated migration functions. See [content/block decisions](../journal/2026-10-05-content-block-contracts.md).

## Technical round three — resolved

| Question | Decision | Accepted outcome |
| --- | --- | --- |
| Q40 | Editor UI components | Originally Base UI; superseded by Cloudflare Kumo in DEC-048. |
| Q41 | Block CSS scoping | CSS Modules/framework-scoped styles, with no unscoped global resets/selectors. |
| Q42 | Save scope | All pending editor changes in one draft commit. |
| Q43 | Unsaved content recovery | Per-tab session recovery, excluding binary uploads. |
| Q44 | Markdown authoring interface | A visual editor for a limited Markdown feature set. |
| Q45 | Incomplete draft persistence | Save structurally valid incomplete drafts; block Publish until required content is valid. |

Q40–Q45 are accepted as DEC-042–DEC-047. See the [editor/saving journal](../journal/2026-10-05-editor-saving.md). Concrete definitions, engineering recommendations, and verification targets are consolidated in [technical contracts](technical-contracts.md). No further questionnaire is needed for the scoped design.

Base UI supplies unstyled React primitives and documents tree-shakable imports and CSS Modules usage: [quick start](https://base-ui.com/react/overview/quick-start). This records the original interview choice. DEC-048 now selects [Cloudflare Kumo](https://github.com/cloudflare/kumo) for admin UI; grill-form remains native HTML.

For Git transactions, the proposed engineering path creates a tree and commit based on the loaded draft head, then advances the branch without force. A concurrent branch advance to a divergent commit must reject the update; preserve local work and explain recovery. Q42 selects all pending edits in one commit. See GitHub's [trees](https://docs.github.com/en/rest/git/trees#create-a-tree), [commits](https://docs.github.com/en/rest/git/commits#create-a-commit), and [reference updates](https://docs.github.com/en/rest/git/refs#update-a-reference). This is a design proposal requiring race-condition testing, not a claim that a preflight read alone provides locking.

Research: Astro supports static prerendering and multiple UI framework integrations, but `.astro` templates have no browser component runtime. A live unsaved editor requires browser-renderable implementations. See [static rendering](https://docs.astro.build/en/guides/on-demand-rendering/) and [framework components](https://docs.astro.build/en/guides/framework-components/). JSON Schema supplies a portable validation vocabulary; editor controls/layout still need UI metadata. See [JSON Schema](https://json-schema.org/overview/what-is-jsonschema). An iframe creates a separate browsing context; using it isolates document styling but does not share live framework instances with the parent. See [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe). The shared-document preview boundary was selected in Q31.

## Resolved in round two

Q8–Q14 are resolved by DEC-009 through DEC-015 in the [decision register](../decisions/index.md): convenience login, both repository visibilities, individual tokens, Netlify-managed deployment, shared page/post block editing, browser previews, and developer-installed blocks.

## Resolved in round three

Q15–Q17 and Q19 are resolved by DEC-016–DEC-018 and DEC-020: tab-session tokens, developer and portal collection schemas, simple shared drafts, and optional global styling. Q18 establishes R2 storage (DEC-019) but leaves upload authorization and media type scope open.

## Resolved in round four

Q20–Q24 are resolved by DEC-021–DEC-025 in the [decision register](../decisions/index.md).

| Question | Outcome | Scope |
| --- | --- | --- |
| Q20 | Runtime editor-supplied R2 credentials | Keep the application static; no secret-holding upload helper. |
| Q21 | Basic fields and safe schema changes | No nested models, relations, or migration tooling initially. |
| Q22 | Automatic standard listing and entry pages | Existing block editor supplies entry bodies. |
| Q23 | Simple image resizing and light compression | Generate web image sets for sufficiently large images; no audio/video transcoding. |
| Q24 | Media URLs may be public before Publish | Page publication remains separate. |

## Engineering work for the implementation plan

Define the content/schema file formats, block authoring and preview interfaces, dependency sharing, Git save/merge concurrency handling, schema compatibility validation, and upload metadata. Propose concrete starter blocks and validation scenarios. Choose image widths/encodings/limits and browser fallbacks, and document repository permissions and R2 CORS setup. The contract definitions now specify these behaviors. Exact library pins, build integration, limits, and validation fixtures remain engineering work. No unimplemented behavior is certified by the interview or wiki checks.

R2 credential retention was not separately selected; propose the same tab-session behavior as GitHub when specifying the editor session. Do not mistake that proposed default for an explicitly answered question. The optional future capabilities excluded above can be reconsidered if the user expands scope.

## Research

Astro documents that its Vite-provided environment values are statically replaced at build time and that public variables are available to client code. The inference for a fully static editor is that checking a configured credential in client code is a UI gate, not server-enforced authorization. [Environment variables](https://docs.astro.build/en/guides/environment-variables/).

GitHub documents repository-scoped fine-grained tokens and branch merging through its API. Exact required permissions and branch protection compatibility must be validated in implementation. [Personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [branch API](https://docs.github.com/en/rest/branches/branches#merge-a-branch).

GitHub Pages offers static hosting; private-repository availability depends on the account plan. This is a deployment option, not an accepted provider choice. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
