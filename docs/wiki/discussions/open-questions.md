---
title: Open questions
updated: 2026-10-14
status: Independent pilot accepted; no engine-separation questions remain
---
# Open questions

## Multiple site layouts — implemented locally

DEC-165–DEC-166 settle the Pages-style table, separate configurations of the same
design, on/off switches, no disabling or deletion while pages use a layout, and
at least one active layout at all times. The user requests a simple, predictable
design under rule-lean; the short grill-form rounds are complete.

The [first answers](../journal/2026-10-13-grill-c8cb3798-7a1e-4893-82b4-af46d9db9496.md)
settle new-page assignment, generic-page inheritance, initial activation and
design changes with a reset warning (DEC-167–DEC-170).
[Q5](../journal/2026-10-13-grill-5b84ef63-3687-481f-9b0a-04a86e991a33.md)
limits publication completeness requirements to layouts used by pages (DEC-171),
while all records retain basic structural checks. No consequential product
question remains in the [selected scope](multiple-site-layouts.md). The user
subsequently authorized work-until-grill; multiple configurations are now
implemented. See [verification](../verification/runs/2026-10-13-multiple-site-layouts.md).

## Separate site repositories and engine — pilot accepted

After source study, the user explicitly discarded the form and continued in chat.
DEC-172–DEC-174 select a core/admin-only engine, manual pinned engine upgrades with
maintainer-owned migration, and one independent public pilot. The engine is now
public, verified by repository metadata after the user's visibility change.
Deployment remains provider agnostic, including bare metal (DEC-142).

The [submitted Q6–Q9 answers](../journal/2026-10-13-grill-3f45ceb2-5c2b-407b-bbba-4d71a6e78f03.md)
settle extensions-only customization, directly consumed library dependencies,
blocking draft save/publication from a mismatched editor, and Archline as the public
pilot (DEC-175–DEC-178). Required core capabilities belong in the core repository.

The [Q10–Q14 answers](../journal/2026-10-13-grill-47541500-3fe6-4bc4-9cec-83fad35ad61c.md)
settle independent manual library upgrades, committed subscription configuration,
upstream-only library code changes, a configured reset layout and Archline/Intr as
the initial library (DEC-179–DEC-183). Local-copy and patch customization were not
selected. No engine/library product question remains on current evidence.

The [authorized engineering plan](site-engine-separation.md#proposed-engineering-plan)
covers public authoring interfaces, packaging/composition, library extraction,
editor identity enforcement, preserving excluded examples and pilot acceptance
checks. Implementation was subsequently authorized with `work-until-grill` on
2026-10-14. See the [implemented interface](../features/site-engine.md); engine/library checks, a clean public dependency build, browser journeys and live
GitHub writes have passed. Public repositories are available.

[Q15 notes](../journal/2026-10-13-grill-2918a555-e230-4816-971e-5dab8013cba9.md)
select Netlify and maintainer-owned deployment (DEC-184). The
[pilot deployment guide](https://github.com/rengwu/quinecms-site-archline#deploy-this-pilot-to-netlify)
is ready. The maintainer subsequently supplied the
[live pilot](https://glowing-dodol-a3ed49.netlify.app/). Its public routes, mobile
menu, referenced assets and admin login page pass the
[hosted smoke check](../verification/runs/2026-10-14-netlify-pilot.md). No delivery
choice remains open. The maintainer subsequently [confirmed the complete hosted
GitHub connection, edit, draft save, publish and redeployment flow](../journal/2026-10-14-pilot-acceptance.md),
including the visible content change on the live site. This user-reported evidence
closes the selected pilot's delivery acceptance. The assistant did not independently
repeat the signed-in workflow.

## Upload from media fields — delivered locally

DEC-160–DEC-162 select Upload plus a small thumbnail beside the existing selector,
the existing storage dialog opened in place, and retaining uploads in Media when
block changes are cancelled. The [implemented behavior](../features/media.md#upload-from-media-fields)
reuses the existing upload path. No unresolved scope question remains.
[Local checks](../verification/runs/2026-10-13-media-fields.md) pass; live R2
upload execution remains unverified.

## Archline theme — delivered

DEC-156–DEC-159 are implemented as an installed layout, 18 editable blocks and an
isolated eight-route example. No unresolved scope question remains. See the
[scope and delivery](../journal/2026-10-13-archline-theme-scope.md) and
[local verification](../verification/runs/2026-10-13-archline-theme.md).


## Intr Studio recreation — delivered, follow-up proposals

DEC-153–DEC-155 select a homepage, project listing, and one sample detail page in
an isolated Intr example, using the reference content with obvious placeholders
corrected. The direct brief prioritizes a simple static layout over motion.
See the [scope and engineering choices](../journal/2026-10-13-intr-rebuild-scope.md).
The isolated example and local verification are complete. Other project cards
remain visible without detail links as a stated
engineering choice. All five detail pages and a wider CMS redesign are outside
the selected scope.

The journal records proposals for readable reference-row labels, visible shared
editing guidance, clearer renderer data mappings, asset/staging helpers and a
smaller public navigation script using the existing non-hydrated layout option.
These are not accepted extensions to the CMS.

## Development login — resolved

DEC-152 directly requests one fixed dev login (`admin@example.com` / `asdf1234`)
for the existing shared dashboard and content. It replaces environment credentials
in dev; production retains one configured pair. No account system or separate data
is added. See the [admin contract](../features/admin-encryption.md).

## Content ownership and handoff — selected increment settled

DEC-148–DEC-151 settle the first increment: a small save-status message, destination
details in Settings and clearer recovery from a stale Git save. The client and
agent are assumed to take turns; existing remote checks remain, without CRDTs or
automatic merging. The UI is implemented; browser visual checks are blocked by
unavailable native automation. [Implementation and checks](../journal/2026-10-12-git-save-ux.md).

Q5 explicitly defers browser-to-local-file transfer. Direct local saves and an
export-plus-command path remain possible future choices, not blockers for this
increment. Other retrospective items remain outside scope. The [topic](content-handoff.md)
preserves the CRDT assessment and earlier unanswered handoff question.

## Quine recreation trial — delivered, follow-up proposals

DEC-143–DEC-146 settle the [Quine trial](../journal/2026-10-11-quine-rebuild.md).
The isolated example is implemented and locally verified; the active demo remains
intact. The journal separates delivered fixes from proposals: optional in-editor
editing guidance, content-neutral list wording, validated backup-to-files tooling,
local-asset metadata helpers and a fresh-agent benchmark. None is implicitly
approved as a larger CMS project.

## GitLab support — engineering default

DEC-135 adds GitLab beside GitHub. The implementation keeps Save/Publish in the editor, using project-configured fast-forward merges to preserve exact snapshots. An optional question about handing publication off for human review was not answered before this default was stated; that alternative remains unselected. Live GitLab permissions/CORS and operations remain unverified. See [publishing](../features/publishing.md).

## Local agent authoring — approved and implemented

DEC-134 prioritizes creative freedom and advisory guidance for local agents in cloned repositories. The user approves the concise entry point, practical guide and dependable local validation. These are implemented in the [authoring guide](../features/local-authoring.md) and [journal](../journal/2026-10-08-local-authoring.md). Remote agent access/MCP remains excluded. No further product question blocks this increment. Expanded example packages and fresh-agent benchmarks remain optional future work; they were not included in the approved steps 1–3.

## Admin appearance — resolved

DEC-133 directly authorizes a Settings dark/light toggle for the admin UI only. No interview is needed. Browser-local persistence and dark as the initial default are engineering choices; see the [implemented contract](../features/editor.md#admin-appearance-dec-133).

## Sidebar groups — resolved

DEC-132 directly requires expandable non-leaf sidebar groups without routes. Schemas contains Collections and Objects; their list screens have no Back button. The implementation preserves nested editor navigation and uses the same grouping in the compact menu. No interview is needed; see the [journal](../journal/2026-10-08-sidebar-groups.md).

## Layout spacing — resolved

DEC-130 directly moves Content spacing into Site Layout and allows each layout to supply default width/gutter values. No interview is needed. See the [current contract](../features/site-layouts.md) and [implementation journal](../journal/2026-10-08-layout-spacing.md).

DEC-129 establishes [sitewide creation forms](../features/editor.md#creation-forms-dec-129): Add opens an uncommitted New form, Create commits, and Cancel discards. Eager insertion with Back/Delete is a negative UX pattern. The direct request authorized implementation; no questions remain for this increment. See the [journal](../journal/2026-10-08-creation-forms.md) and [verification](../verification/runs/2026-10-08-creation-forms.md).

## Content-model reference — resolved

DEC-128 records the user's direct choice to model the system closely on Sanity and keep it lean. The [selection journal](../journal/2026-10-07-lean-sanity-model.md) and [plan](content-model-plan.md) apply independent entries, owned objects, typed arrays and references within the settled scope. The shared array grammar is implemented; see the [implemented contract](../features/content-model.md) and [verification run](../verification/runs/2026-10-08-content-model.md). No new product question or active form is introduced.

## Implementation readiness — engineering work

The [review before implementation](../journal/2026-10-07-content-model-preimplementation-review.md) identifies presentation integration, shared-definition impact checks, persistence/recovery and route consistency as engineering priorities. It proposes a small end-to-end fixture before the full editor rollout. These do not reopen DEC-110–DEC-127 or introduce new product questions. The [plan](content-model-plan.md) retains the original engineering work; implementation and verification are recorded above.

## Owned object/list nesting — resolved

Q93 selects up to three owned object/list levels, recorded as DEC-126. Each owned object or structured list counts once; the entry, list-row wrapper and named-definition reuse add no extra level. This replaces DEC-111 and the depth restriction in DEC-119. See the [answer and interpretation](../journal/2026-10-07-nesting-round-one.md).

Q94 selects rejection of direct and indirect recursive owned definitions, recorded as DEC-127. Ordinary nested reuse remains supported, including the same definition in independent branches. See the [answer and final interpretation](../journal/2026-10-07-nesting-round-two.md). This concludes the scoped reconsideration; no further product question blocks this increment. Named/inline support, one shape per list, relation behavior and dedicated nested navigation remain settled. Application implementation was subsequently authorized and completed on 2026-10-08.

## Collections and schemas — product discussion resolved

Q82 selects collection-owned schemas with reusable object definitions (DEC-115). See the [submitted answer](../journal/2026-10-07-grill-7f4de03d-e6cc-42a8-a3e1-e309d5efb160.md) and [interpretation](../journal/2026-10-07-collections-and-schemas-round-one.md). Whole-schema sharing, its override rules and schema switching are outside this selected scope.

Q83–Q85 select single-entry mode, route-specific URL requirements and configurable one/many relations (DEC-116–DEC-118). See the [answers and interpretation](../journal/2026-10-07-collections-and-schemas-round-two.md). Template sharing, schema-only entries and the absence of routes for unassigned collections remain accepted.

Q86–Q89 select relations inside flat groups, editor-controlled order, unique targets within each relation value and direct single-entry paths (DEC-119–DEC-122). See the [answers and interpretation](../journal/2026-10-07-collections-and-schemas-round-three.md).

Q90–Q92 resolve as DEC-123–DEC-125. The user delegates the leanest option for Q90–Q91; the assistant selects reverse lookups for admin checks only and selection-only relation controls. Q92 explicitly selects Schemas with Collections and Objects destinations. See the [final interpretation](../journal/2026-10-07-collections-and-schemas-round-four.md).

That collection/schema round and the later nesting reconsideration have completed their product questions. The [consolidated plan](content-model-plan.md) separates accepted choices from proposed lifecycle, storage, validation, binding and editor mechanics. Reverse template lists, integrated target authoring and shared whole-entry schemas are outside this scope. The interview itself did not authorize implementation; the user separately authorized it on 2026-10-08, and the implementation is now present.

## Relations and objects — resolved through the collection/schema rounds

Q77–Q81 originally resolve as DEC-110–DEC-114: named and inline object definitions, one-level objects/lists, one target collection per relation field, one shape per list for now, and blocking referenced-entry deletion. DEC-126 later replaces the depth choice with three levels. See the [original answers](../journal/2026-10-07-grill-60cae8b1-ce10-49a9-b741-7cb19b94ca6e.md), [interpretation](../journal/2026-10-07-relations-and-objects-round-one.md) and [current topic](relations-and-objects.md). The broader [CMS research](cms-objects-relations-research.md) recommendations were not all selected.

Relation placement/order/uniqueness are settled by DEC-118–DEC-121; DEC-123–DEC-125 resolve reverse data, target authoring and schema navigation. DEC-126 revises owned depth to three levels; DEC-127 rejects recursive owned definitions. See the consolidated plan above. The unused prototype remains open to a breaking redesign (DEC-109).

## Architecture breadth review — proposals open

The [2026-10-07 review](architecture-review.md) responds to the user's concern about supporting different content structures and presentations. It recommends retaining the stack while considering typed relations/objects, shared queries/bindings, page archetypes and slots, consistent route metadata, and stronger evolution/scaling boundaries. No recommendation has been accepted as a new product decision; prior implementation authorizations remain scoped to their recorded work.

Open strategic choices are the intended supported site types and content/team sizes; which bounded schema and composition extensions to adopt; whether to extend placeholder-only previews to actual entries; and when independent releases justify changing the shared draft workflow. The review proposes publication, documentation, and directory fixtures to make those choices concrete. No questionnaire round is started by this analysis, and these questions do not retroactively block the implemented scope below.

Site Layouts and chartr were authorized and implemented after the interview records below. No product question blocks this scope. [Current contracts](../features/site-layouts.md), [implementation journal](../journal/2026-10-06-site-layouts-implementation.md) and [verification](../verification/runs/2026-10-06T1140Z-site-layouts.md) distinguish shipped engineering choices from the original proposals.

## Layout updates — resolved

[Q76](../journal/2026-10-06-grill-7a73a1dd-dfe9-4d9a-9118-fd7107ac2d9c.md) is accepted as DEC-107: retain selectable layout code versions, pin the active version and upgrade explicitly. See the [version contract](site-layouts.md#layout-versions) and [round-three interpretation](../journal/2026-10-06-site-layouts-round-three.md). This retains only the active layout/version and current settings; it does not restore settings caches for inactive layouts. Exact version-picker presentation and settings-transition mechanics are engineering work, without an assumed automated migration requirement.

## chartr recreation — follow-on scope recorded

DEC-106 requests recreating [chartr.dev](https://chartr.dev/) as a layout and independent blocks after the Site Layout foundation. The [scope](chartr-recreation.md) proposes the shared shell and nine content blocks, with source references and unexecuted verification targets. No new product interview is needed for this sequencing request. Exact fields, lifecycle adaptation and reusable component boundaries are engineering work. Live release/download text differs from the local source and must be reconciled against the live target during implementation.

## Site Layout library and whitelist — superseded by DEC-163

DEC-163 removes the whitelist and makes every installed theme available in the main dashboard. The following records the earlier, superseded choices.

The user originally added a growing repository-based layout library and hidden environment-configured client whitelist (DEC-102–DEC-103). See [Site Layouts](site-layouts.md) and the [library discussion journal](../journal/2026-10-06-site-layouts-library-discussion.md). This follows, and does not undo, the accepted first-round choices below.

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

The scope includes a themed/tagged searchable catalog with catalog selection followed by a creation form (DEC-129) and separate Preview, refitted static and useful generic blocks, editable block/schema lists, generic list bindings, collection-backed Blog cards, external form submission, a shared footer and grouped-navigation header. Block appearance comes from themes and site settings; per-block visual customization was rejected. The six reference sites remain capability/design benchmarks.

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

## Encrypted admin — direct instruction, 2026-10-09

DEC-141 supersedes the convenience gate in DEC-009 and passwordless behavior in DEC-139. The user selected Argon2id + AES-256-GCM build-time encryption and email/password input. No authentication provider or runtime backend is added. Parameters and explicit limits are documented in [encrypted admin](../features/admin-encryption.md).

## Resolved in round two

Q8–Q14 are resolved by DEC-009 through DEC-015 in the [decision register](../decisions/index.md): convenience login, both repository visibilities, individual tokens, externally managed deployment, shared page/post block editing, browser previews, and developer-installed blocks.

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
