---
title: lean-sitebuilder
updated: 2026-10-08
status: Accepted
---
# lean-sitebuilder

Latest provider support: [GitHub and GitLab draft saves/publishing](features/publishing.md) (DEC-135), with configurable instances/namespaces, destination-bound session credentials and the existing snapshot validation. GitLab uses internal fast-forward merge requests; [implementation and limits](journal/2026-10-08-gitlab.md).

Latest visual repair: [consistent admin headings](verification/runs/2026-10-08-heading-typography.md). Pages now shares the other section titles' 18px typography instead of its separate 24px rule. The full verification passes, with a Safari visual check of Pages.

Building a client site: start with [the local authoring guide](features/local-authoring.md). Design freely and use pages, blocks, layouts and structured content where suitable. DEC-134 makes this guidance advisory. The refreshed entry points and independent validation/tests support replacing demo content; [implementation and verification](journal/2026-10-08-local-authoring.md).

Latest reference refinement: [readable usage summaries](journal/2026-10-08-readable-usage.md). **Used in N places** names the source and editor location, offers **Open**, and explains deletion blockers beside the action. Removing an inherited Starter navigation link now clears its reference. [Verification and limits](verification/runs/2026-10-08-readable-usage.md).

Original investigation: [local agent authoring](discussions/local-agent-authoring.md). The user scopes AI development to cloned repositories; remote access/MCP are excluded. Its documentation and validation recommendations are now implemented above. [Audit journal and exact-commit evidence](journal/2026-10-08-ai-navigability.md); expanded examples and fresh-agent benchmarks remain future options.

Latest admin preference: [dark/light mode in Settings](journal/2026-10-08-admin-theme.md) (DEC-133). The browser remembers the choice for admin controls and the preview's empty surroundings; website appearance remains independent. [Browser and 167-test verification](verification/runs/2026-10-08-admin-theme.md).

Latest navigation refinement: [expandable Schemas group](journal/2026-10-08-sidebar-groups.md) (DEC-132). Collections and Objects open directly from the sidebar without Back buttons on their lists. [Browser and 161-test verification](verification/runs/2026-10-08-sidebar-groups.md).

Latest heading refinement: [creation screen hierarchy](verification/runs/2026-10-08-creation-heading.md). **New block** and **New footer** now place the selected type beneath the heading as a smaller, muted subtitle. Both browser flows and all 159 tests pass.

Latest form standard: [right-aligned confirmation/cancellation actions](features/editor.md#form-action-alignment-dec-131), applied through shared creation, nested-editor and dialog layouts, including compact insert forms. [Journal](journal/2026-10-08-form-action-alignment.md) · [Verification and limits](verification/runs/2026-10-08-form-action-alignment.md).

Latest preview repair: [centered mobile preview](verification/runs/2026-10-08-mobile-preview.md). Mobile mode now centers beside the editing drawer. Browser alignment and all 159 tests pass; the desktop toggle recheck was interrupted.

Latest block-editor refinement: [inline title and version selector](verification/runs/2026-10-08-block-header.md). The label-less selector is capped at 140px; long titles stay on one line and truncate with an ellipsis. Safari checks and all 159 tests pass.

Latest catalog refinement: [card hover and dialog headers](verification/runs/2026-10-08-layout-catalog.md). Layout card hover extends through the Preview row; visible catalog titles align with ×, including the restored **Add block** title. All 159 tests pass; browser checks are partially incomplete.

Latest refinement: [layout-owned content spacing](journal/2026-10-08-layout-spacing.md) (DEC-130). Site Layout now owns editable width/gutter and their defaults: Starter 1200px/24px, chartr 1512px/40px. [Verification](verification/runs/2026-10-08-layout-spacing.md).

Latest UX standard: [explicit creation forms sitewide](features/editor.md#creation-forms-dec-129). Add opens an uncommitted New form with Create and Cancel; nested drafts remain local and cancellation leaves no placeholder behind. DEC-129 records eager insertion as a negative UX pattern. [Journal](journal/2026-10-08-creation-forms.md) · [157-test and desktop/mobile verification](verification/runs/2026-10-08-creation-forms.md).

Latest editor repair: [number-input height](verification/runs/2026-10-08-number-input-height.md). Numeric schema limits now retain the standard control height; browser verification and all 151 tests pass.

Latest implementation: [collections, objects and references](features/content-model.md), authorized on 2026-10-08 with no compatibility or migrations. The editor, persistence, routes and forward bindings now support the lean model. [Implementation journal](journal/2026-10-08-content-model-implementation.md) · [151-test and browser verification](verification/runs/2026-10-08-content-model.md). Live providers remain untested.

Latest accepted direction: [a lean Sanity-style content model](journal/2026-10-07-lean-sanity-model.md). DEC-128 selects Sanity as the primary reference for independent entries, owned objects, typed arrays and references, within the settled scope and Git architecture. The [completed nesting reconsideration](journal/2026-10-07-nesting-round-two.md) permits three owned object/list levels and rejects recursive definitions (DEC-126–DEC-127), replacing DEC-111 and the depth restriction in DEC-119.

Current plan: [collections, objects and relations](discussions/content-model-plan.md), settled through DEC-128. The earlier collection/schema interview selected admin-only reverse lookups, existing-target selection and Schemas → Collections / Objects; Q90–Q91 were delegated to the assistant under a simplicity criterion. [Round-four interpretation](journal/2026-10-07-collections-and-schemas-round-four.md). The original engineering proposals are retained as planning history; the feature contract above records their implemented form.

Latest review: [before implementing the content model](journal/2026-10-07-content-model-preimplementation-review.md). Read-only source inspection highlights presentation bindings, shared-definition impact, persistence/recovery and route consistency. These are engineering priorities within the agreed scope; no further product questionnaire is proposed.

Latest research: [seven CMS approaches to schemas and relations](discussions/cms-objects-relations-research.md), refreshed against official documentation. The assessment favors Sanity's conceptual data model, with Payload and Keystatic as secondary references. [Research journal](journal/2026-10-07-cms-schema-comparison.md). DEC-128 subsequently selects the lean Sanity direction; broader vendor features remain research rather than accepted scope.

Related discussion: [relations and objects](discussions/relations-and-objects.md). Q77–Q81 originally selected named/inline objects, one-level structures, one collection per relation field, one shape per list and blocking referenced-entry deletion. [Answers and interpretation](journal/2026-10-07-relations-and-objects-round-one.md). DEC-126 later replaces the depth choice with three levels; the other choices remain. [CMS research](discussions/cms-objects-relations-research.md) remains evidence, with broader recommendations not all selected. DEC-109 permits breaking or replacing the unused prototype.

Latest discussion: [architecture and product breadth review](discussions/architecture-review.md), comparing the current content/presentation model with other builders and identifying schema, composition, versioning and scale risks. These are proposals, not newly accepted behavior. The [review journal](journal/2026-10-07-architecture-review.md) records a fresh passing `pnpm verify` baseline and its limits.

Latest repair: [chartr content width and spacing](verification/runs/2026-10-06T1426Z-chartr-spacing.md); independent blocks now own centered bounds under either layout, consume shared geometry, and avoid duplicate gutters. Desktop/mobile browser checks and all 132 tests pass.

Implemented: [Site Layout library](features/site-layouts.md) and [chartr layout with nine independent blocks](features/chartr.md). Site Layout owns selection, author settings and a selected-page preview; DEC-130 now includes width/gutter under Site Layout with per-layout defaults; Settings retains Backups and Session. Active layout versions are pinned, switching uses defaults, and the hidden whitelist filters only future choices. The user's latest correction requires dedicated nested editor levels everywhere (DEC-108).

[Implementation journal](journal/2026-10-06-site-layouts-implementation.md) · [Verification report](verification/runs/2026-10-06T1140Z-site-layouts.md). Accepted design and interview history remain in [Site Layouts](discussions/site-layouts.md), [chartr recreation](discussions/chartr-recreation.md) and the [decision register](decisions/index.md).

Implemented: [searchable block library](features/block-library.md), with 45 base layouts, 27 generic counterparts, repeatable content/schema lists, collection mappings, native forms and shared header/footer. [Implementation journal](journal/2026-10-06-block-library-implementation.md) and [verification report](verification/runs/2026-10-06T1320Z-block-library.md).

Latest refinement: [catalog dialog polish](verification/runs/2026-10-06T0619Z-catalog-polish.md), with one scrolling body, a single-line tag strip, a persistent Reset control, smaller cards and a top-right close icon.

Sortable lists now use [optimistic FLIP motion inspired by Chartr](verification/runs/2026-10-06T0845Z-sortable-flip.md): direct vertical carrying, animated neighbors, edge scrolling and commit on release anywhere. Website preview order changes only after release.

Current design: [generic pages and schema-only entries](journal/2026-10-05-generic-pages-discussion.md). DEC-058–DEC-073 revise the collection/page model described by the existing implementation below. Reconciliation through grill-form is complete; the user authorized implementation on 2026-10-06. See [the implementation and verification](verification/runs/2026-10-05T1650Z-generic-pages.md).

[Round-one template decisions](journal/2026-10-05-generic-pages-round-one.md) and [submitted answers](journal/2026-10-05-grill-d557fd13-2a71-44e6-9b9a-4543b858f2b0.md) resolve Q48–Q55. [Round-two decisions](journal/2026-10-05-generic-pages-round-two.md) and [submitted answers](journal/2026-10-05-grill-192c91a8-c5db-4b3b-9e4f-84772508186b.md) resolve Q56–Q59. The interview itself changed only records; the subsequent implementation is documented in the [implementation journal](journal/2026-10-06-generic-pages-implementation.md).

A Git-backed static site builder with the public website, visual admin editor, block code, and content in one repository and deployment. It replaces the always-running Payload CMS used by astro-payload. The first application implementation is present. Automated checks and the admin startup repair pass; live provider behavior remains unverified.

The first round established nontechnical editors, page sections with defined controls, reusable content collections, shared block dependencies, and GitHub-based draft/publish workflows. Save commits to an unpublished branch; Publish merges that branch to main and triggers deployment. The new core and starter blocks are fresh; astro-payload is reference material.

The editor login is a convenience gate. Each editor supplies their own GitHub token; both public and private site repositories are supported. The browser uses a GitHub SDK to save and merge; the user's Netlify integration deploys main. Pages use the block editor; entries contain schema fields and optionally render through a collection-assigned generic page. Every block supports immediate browser preview, and new block types are developer-installed with a rebuild.

GitHub tokens persist for the tab session. Collections support developer-defined schemas and portal field editing. Shared drafts use stale-save protection with plain-language recovery. Media lives in Cloudflare R2, with URLs in Git. Blocks own their styling and may follow optional global settings such as dark/light mode.

R2 credentials are entered at runtime. The collection editor supports basic fields and safe changes, with explicit static indexes and optional generic entry templates. Image uploads generate simple resized and lightly compressed variants; media URLs may be public before page publication. The interview is complete; the initial implementation is recorded in the feature map.

- [Persistent admin sidebar](verification/runs/2026-10-05T1725Z-admin-navigation.md)
- [Shared content width and development reloads](verification/runs/2026-10-05T1735Z-content-width.md)
- [Standard admin content width](verification/runs/2026-10-05T1750Z-admin-width.md)
- [Table rows and consistent Back labels](verification/runs/2026-10-05T1752Z-page-row.md)
- [Site typography and page gutter](verification/runs/2026-10-05T1810Z-site-design.md)
- [Feature map](features/index.md)
- [Verification setup](verification/setup.md)
- [Initial implementation run](verification/runs/2026-10-05T0819Z-implementation.md)
- [Admin startup repair](verification/runs/2026-10-05T0910Z-admin-startup.md)
- [Kumo admin refinement](verification/runs/2026-10-05T1005Z-kumo-admin.md)
- [Implementation journal](journal/2026-10-05-implementation.md)
- [Accepted decisions](decisions/index.md)
- [Agreed design](discussions/agreed-design.md)
- [Open questions](discussions/open-questions.md)
- [Admin hierarchy implementation and Home navigation](verification/runs/2026-10-05T1054Z-admin-hierarchy.md)
- [Admin hierarchy implementation journal](journal/2026-10-05-admin-hierarchy-implementation.md)
- [Editor layout rules and research](journal/2026-10-05-editor-layout.md)
- [Editor layout verification](verification/runs/2026-10-05T1108Z-editor-layout.md)
- [Pages table hierarchy](verification/runs/2026-10-05T1124Z-page-list.md)
- [Page-only preview and standard admin views](verification/runs/2026-10-05T1303Z-admin-views.md)
- [Accepted admin hierarchy design](discussions/admin-hierarchy-proposal.md)
- [Admin hierarchy research journal](journal/2026-10-05-admin-hierarchy-research.md)
- [Admin hierarchy decisions](journal/2026-10-05-admin-hierarchy-decisions.md)
- [Submitted admin hierarchy answers](journal/2026-10-05-grill-d3cb2bf4-2763-40ad-bc3a-9213d73c86a4.md)

The technical interview has selected Astro/TypeScript, a React editor, separate JSON content files, a small field model, shared rendering source, and a single-document preview. The technical interview is complete. The [technical contracts](discussions/technical-contracts.md) specify generated vendor modules, stable-ID JSON records, Markdown authoring, retained block versions, rendering interfaces, scoped styles, session recovery, and atomic draft saves with publication validation. Untested engineering recommendations are labeled separately.

- [Round-one interpretation](journal/2026-10-05-round-one-decisions.md)
- [Submitted round-one answers](journal/2026-10-04-grill-528c4b19-f488-4209-ab5c-b9c13f420f02.md)
- [Round-two interpretation](journal/2026-10-05-round-two-decisions.md)
- [Submitted round-two answers](journal/2026-10-05-grill-1a1e4868-048d-45f3-a291-5f8b6c42aae2.md)
- [Round-three interpretation](journal/2026-10-05-round-three-decisions.md)
- [Submitted round-three answers](journal/2026-10-05-grill-c9c27420-78c7-4c08-ac09-edd5289ddf59.md)
- [Round-four interpretation](journal/2026-10-05-round-four-decisions.md)
- [Submitted round-four answers](journal/2026-10-05-grill-eb7e62a0-bf4d-4474-a805-bc47c92b41aa.md)
- [Technical foundations](journal/2026-10-05-technical-foundations.md)
- [Submitted technical-round-one answers](journal/2026-10-05-grill-103bfb33-1e8a-4133-9528-3baf8aa57275.md)
- [Content and block contract decisions](journal/2026-10-05-content-block-contracts.md)
- [Submitted technical-round-two answers](journal/2026-10-05-grill-534ae93e-c689-4899-b4a0-b2c01b8f8134.md)

- [Editor and saving decisions](journal/2026-10-05-editor-saving.md)
- [Submitted technical-round-three answers](journal/2026-10-05-grill-b9adf54c-f21e-4219-b2a3-932c862859dc.md)
