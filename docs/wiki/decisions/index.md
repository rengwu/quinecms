---
title: Decisions
updated: 2026-10-13
status: Accepted
---
# Decisions

Local authoring direction: DEC-134 prioritizes creative freedom and advisory guidance for agents working in cloned repositories. The user approves the short entry point, practical guide and dependable local validation. Remote agent access and MCP remain excluded. The [original investigation](../discussions/local-agent-authoring.md) records the findings; the [current guide](../features/local-authoring.md) describes the delivered workflow.

Current direction: DEC-109 permits a breaking pre-production redesign. Earlier decisions remain historical/product context, rather than compatibility obligations for the replacement model.

Relations and objects: DEC-110–DEC-114 record the first accepted choices. See the [current discussion](../discussions/relations-and-objects.md); remaining details are still open.

Collections and schemas: DEC-115–DEC-118 select collection-owned schemas, reusable object definitions, single-entry mode, route-specific URL requirements and configurable relation multiplicity. See the [topic](../discussions/collections-and-schemas.md).

DEC-119–DEC-122 settle relations inside shallow groups, editor-controlled reference order, unique targets within each relation value and direct paths for routed single-entry collections.

DEC-123–DEC-125 close the product discussion: reverse lookups serve admin usage/deletion checks only, relation controls select existing entries, and Schemas groups Collections and Objects. The [consolidated plan](../discussions/content-model-plan.md) separates these accepted choices from proposed engineering details.

Accepted on 2026-10-05 from the original request and [round-one answers](../journal/2026-10-04-grill-528c4b19-f488-4209-ab5c-b9c13f420f02.md). See the [interpretation journal](../journal/2026-10-05-round-one-decisions.md) and [remaining questions](../discussions/open-questions.md). These are intended requirements, not implemented features.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-001 | Keep the public website, static admin editor, blocks, and content records in one Git repository and deployment. Remove the always-running Payload CMS dependency. | Original request: lightweight, durable ownership with Git as the source of content. Q18 later explicitly places media files in R2; see DEC-019. |
| DEC-002 | Support GitHub first; require a user-supplied Git token for submissions. Provide editor entry using an environment-configured credential. | Q1 custom answer. DEC-009–DEC-012 clarify access/deployment; DEC-016 sets token retention. No custom auth helper is required. |
| DEC-003 | Design the first release for nontechnical clients and site owners. | Q2: editor usability must cover people without a developer workflow. |
| DEC-004 | Include pages, navigation, site settings, media, and blog posts or other repeatable content collections. | Q3 selected the collections-inclusive scope. A general visual schema builder has not been requested. |
| DEC-005 | Allow blocks from multiple frameworks subject to declared dependencies and compatible shared library versions. | Original request and Q4: deduplicate compatible shared runtimes per page; different frameworks still have distinct runtimes. |
| DEC-006 | Reorder page sections and edit each block's defined fields and design controls, with a side drawer and live preview. | Original request and Q5. Nested layout construction and arbitrary element positioning are outside the selected initial scope. |
| DEC-007 | Save creates commits on an unpublished draft branch. Publish merges that draft branch into main and then deploys. | Q6 custom answer: saving and going live are separate actions; publishing applies the branch's accumulated changes. |
| DEC-008 | Build a fresh core and entirely new starter blocks. Use astro-payload as reference only. | Q7: no migration compatibility or block porting commitment. |

## Round two — 2026-10-05

Accepted from [round-two answers](../journal/2026-10-05-grill-1a1e4868-048d-45f3-a291-5f8b6c42aae2.md); see the [interpretation](../journal/2026-10-05-round-two-decisions.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-009 | The environment-configured login is a convenience gate; GitHub authorization protects repository access. | Q8 explicitly accepts the static gate's limits. It must not be described as protection for private resources. |
| DEC-010 | Support both private and public site repositories. | Q9. Private draft reads require GitHub authorization; public repository drafts are public. The hosting provider does not change repository visibility. |
| DEC-011 | Each editor supplies their own GitHub token. | Q10. DEC-016 sets token retention; no tokens belong in the deployed bundle or planning records. |
| DEC-012 | Use a browser GitHub SDK client for repository changes. Publish merges to main; the user's configured hosting or CI workflow owns deployment. | Q11 custom answer. No builder-managed deployment service or hosting API integration is requested. Schema authoring is subsequently defined in DEC-017 and DEC-022. |
| DEC-013 | Posts and collection entries use the same block editor as pages, alongside structured metadata. | Q12. |
| DEC-014 | Every block must support immediate browser preview of unsaved changes. | Q13. Shared rendering logic is preferred where feasible; preview/published parity must be verified during implementation. |
| DEC-015 | Developers install and register new block types in source, followed by a rebuild. | Q14. Adding instances of existing blocks remains an editor action. No portal block marketplace is required. |

## Round three — 2026-10-05

Accepted from [round-three answers](../journal/2026-10-05-grill-c9c27420-78c7-4c08-ac09-edd5289ddf59.md); see the [interpretation](../journal/2026-10-05-round-three-decisions.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-016 | Retain the editor's GitHub token for the browser tab's session, including reloads. | Q15. Session retention is intended; persistent device-wide remembering was not selected. |
| DEC-017 | Support developer-defined schemas and allow users to create collections and edit collection fields in the portal. | Q16 selects option 2 and notes “1 and 2.” Visual editing of block field definitions was not selected; DEC-022 narrows the collection editor. |
| DEC-018 | Use shared drafts with stale-save protection and a simple recovery flow. | Q17 accepts manual reapplication but stresses nontechnical users. Preserve unsaved work, prevent silent overwrites, and explain recovery in plain language. No Git conflict editor or live collaboration is required; freedom from all concurrent changes cannot be guaranteed. |
| DEC-019 | Store media in Cloudflare R2; Git content references media URLs. | Q18 custom answer supersedes the earlier in-repository upload proposal. The accompanying request for environment-based upload credentials is superseded by runtime credentials in DEC-021; DEC-024 defines upload processing. |
| DEC-020 | Blocks primarily own their styling. Expose optional global variables/settings such as dark/light mode; each block decides whether to follow them. | Q19 selected shared defaults with overrides and explicitly made adherence optional. A mandatory shared theme is not required. |

## Round four — 2026-10-05

Accepted from [round-four answers](../journal/2026-10-05-grill-eb7e62a0-bf4d-4474-a805-bc47c92b41aa.md); see the [interpretation](../journal/2026-10-05-round-four-decisions.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-021 | Supply R2 upload credentials in the editor at runtime, preserving the entirely static application. | Q20. This replaces the earlier request to provide upload secrets through build environment variables. Public bucket configuration may still use environment settings. No secret-holding upload helper is required. |
| DEC-022 | Start with basic text, number, date, toggle, select, and media fields, with safe schema changes only. | Q21. Support additions and label/default edits; avoid destructive changes to populated fields. Nested models, relations, and migration tooling are outside the selected first-release scope. |
| DEC-023 | Generate standard listing and entry pages automatically for collections created through the portal. | Q22. Entry bodies use the block editor. A portal template designer is not required initially. |
| DEC-024 | Automatically produce a web-optimized image set from sufficiently large uploads, using resizing and light compression with simple methods. | Q23 selection and notes. This extends original-file media uploads with image processing; it does not request a Next.js image server or audio/video transcoding. Exact widths, encodings, quality, and limits are implementation choices. |
| DEC-025 | Media URLs may be publicly accessible immediately after upload, before the referencing page is published. | Q24. Page publication remains governed by the Git draft/main workflow; private draft-media promotion is unnecessary. |

## Technical foundations — 2026-10-05

Accepted from [technical-round-one answers](../journal/2026-10-05-grill-103bfb33-1e8a-4133-9528-3baf8aa57275.md); see the [interpretation](../journal/2026-10-05-technical-foundations.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-026 | Use Astro with TypeScript as the public site's static build foundation. | Q25. |
| DEC-027 | Use React with TypeScript for the admin drawer and CMS screens. | Q26. Blocks retain their independent framework choice. |
| DEC-028 | Store structured content and definitions as JSON. | Q27. |
| DEC-029 | Use separate files per page, entry, and definition. | Q28. DEC-036 subsequently selects permanent-ID filenames; concrete records are defined in the technical contracts. |
| DEC-030 | Use a small purpose-built, serializable field model. | Q29. The agreed basic collection field set remains in force. |
| DEC-031 | Share rendering source between published output and preview by default; separate implementations require parity checks. | Q30. No requirement to make build-only templates magically browser-renderable. |
| DEC-032 | Keep editor and preview in one document, scope their styles, and share runtimes. | Q31. No iframe exception to runtime sharing is selected. |
| DEC-033 | Offer built-in field controls and optional custom widgets. | Q32. The technical contracts define the React custom-widget interface; implementation remains unverified. |
| DEC-034 | Serve shared block libraries as registered static vendor assets, minified where practical; avoid duplicate compatible framework/library versions. | Q30 custom suggestion reinforces DEC-005. Package/version examples in the answer are illustrative, not version pins. DEC-035 subsequently selects build-generated shared assets. |

## Content and block contracts — 2026-10-05

Accepted from [technical-round-two answers](../journal/2026-10-05-grill-534ae93e-c689-4899-b4a0-b2c01b8f8134.md); see the [interpretation](../journal/2026-10-05-content-block-contracts.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-035 | The build generates self-hosted shared vendor modules. | Q33 settles the mechanism left open in DEC-034. Keep compatible dependencies shared and minified where practical. |
| DEC-036 | Use permanent IDs for document filenames, with editable public paths/slugs inside. | Q34. Content identity does not change when a URL changes. |
| DEC-037 | Store formatted block prose as Markdown strings inside JSON props. | Q35. This does not enable executable MDX or arbitrary scripts. DEC-046 subsequently selects visual formatting controls. |
| DEC-038 | Retain deprecated block implementations alongside newer versions and expose a version selector. | Q36 custom answer. Users manually switch and fill unmatched/new/renamed/incompatible fields, which start empty. Preserve directly compatible fields; do not infer renamed-field mappings. Explicit automated migration functions were not selected. |
| DEC-039 | Use framework adapters with mount/update/destroy for browser preview. | Q37. Normal framework components use adapters; custom/vanilla blocks implement the shared lifecycle. |
| DEC-040 | Block authors declare never/visible/idle/load public activation behavior. | Q38. Immediate editor preview is separate from public activation timing. |
| DEC-041 | Use stable IDs for internal content/media references, and URLs for external resources. | Q39. Resolve references when rendering output. |

## Editor and saving — 2026-10-05

Accepted from [technical-round-three answers](../journal/2026-10-05-grill-b9adf54c-f21e-4219-b2a3-932c862859dc.md); see the [interpretation](../journal/2026-10-05-editor-saving.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-042 | Original choice: Base UI with CSS Modules for the React editor. **Superseded by DEC-048.** | Q40. Preserved as interview history; grill-form stays native HTML. |
| DEC-043 | Use CSS Modules or framework-scoped styles for blocks. | Q41. Shared shell owns global styles; block styles must not leak into the editor or other blocks. |
| DEC-044 | Save all pending editor changes in one draft commit. | Q42. Related page, schema, navigation, and media metadata changes persist together. |
| DEC-045 | Recover unsaved edits within the tab session, including reloads. | Q43. This does not select indefinite device-wide recovery or storing binary uploads. |
| DEC-046 | Provide visual formatting controls that save Markdown. | Q44. Keep the supported formatting set small and round-trip it consistently. |
| DEC-047 | Save incomplete drafts; require valid required content and references before Publish. | Q45. Structural corruption is still rejected. Newly empty fields after a version switch may be saved for later completion. |

## Admin refinement — 2026-10-05

Accepted directly from the user's implementation feedback.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-048 | Use Cloudflare Kumo for all admin UI controls, dialogs, and notifications. | Replaces DEC-042. Keep its styling scoped to admin surfaces so preview blocks retain their designs. |
| DEC-049 | Keep the live preview interactive at all times and sort block rows by dragging. | Remove Interact/Edit blocks toggle and visible up/down buttons. Keyboard sorting remains available for accessibility. |
| DEC-050 | Recover silently and show validation errors in toasts on submission. | Remove saved/local/unsaved status text, recovery banners, and the proactive publication issue list. Save/Publish validation rules remain unchanged. DEC-148 later supersedes the save-status-text removal only; that change is implemented in the [save UX update](../journal/2026-10-12-git-save-ux.md). |
| DEC-051 | Opening a block replaces parent-level sidebar navigation with the block editor. | Direct UI feedback: hide tabs, page/entry selector and Add page; All blocks returns to the parent view. |

## Admin hierarchy choices — 2026-10-05

Accepted from [Q46–Q47](../journal/2026-10-05-grill-d3cb2bf4-2763-40ad-bc3a-9213d73c86a4.md). See the [design](../discussions/admin-hierarchy-proposal.md) and [interpretation](../journal/2026-10-05-admin-hierarchy-decisions.md). Implementation is recorded in the [admin hierarchy run](../verification/runs/2026-10-05T1054Z-admin-hierarchy.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-052 | Place a compact, borderless + Add block action beside the Blocks heading, aligned right. Remove the list-footer action. | Q46 selects header placement to distinguish the action from draggable block rows. A visible label remains alongside the plus icon. Affects [visual editing](../features/editor.md). |
| DEC-053 | Provide separate top-level Content and Collection schemas areas for collection entry authoring and schema editing. | Q47 selects alternative B over the recommended A and per-collection tabs. Content browses collections and edits entry values/bodies; Collection schemas edits model definitions. This makes the two tasks explicit and keeps their controls out of one another's views. Affects [visual editing](../features/editor.md); shared Save draft/Publish and safe schema changes remain in force. |

## Home navigation — 2026-10-05

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-054 | Put Pages, Content, Collection schemas, Media and Site on a separate Home menu screen, outside the editing sidebar. | Direct implementation feedback rejected the sidebar destination grid and requested another nesting level. Each area returns to Home; nested collection, entry, field and block screens return to their immediate parent. Affects [visual editing](../features/editor.md). |

## Editor layout consistency — 2026-10-05

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-055 | Apply a shared layout standard across admin forms, custom widgets, sections and action groups. | Direct feedback identified inconsistent Design, Media and Site layouts and requested research into sidebar editors and Kumo. The [research and implemented layout contract](../journal/2026-10-05-editor-layout.md) distinguish the user's requirement from our specific spacing choices. Kumo continues to own all controls. |

## Pages overview — 2026-10-05

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-056 | Add a Pages table between Home and an individual page editor. | Direct feedback requested one more hierarchy level listing all pages in a table. The overview shows titles and URL paths; opening a page enters its settings/blocks, and its back link returns to Pages. Add page belongs to the overview. See [visual editing](../features/editor.md). |

## Preview scope — 2026-10-05

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-057 | Show the live website preview only while editing pages and their blocks. Content, Collection schemas, Media and Site use standard admin views. | Direct instruction limits right-side rendering to Pages. Other areas use a centered, wider form/list workspace with no drawer, live rendering or preview-width control. Entry block editing and shared draft saves remain available. Home and the Pages table keep their existing overview layouts. Affects [visual editing](../features/editor.md). |

## Generic pages — discussion requirements, 2026-10-05

Direct requirements from the user, recorded in the [discussion journal](../journal/2026-10-05-generic-pages-discussion.md). Not implemented; follow-up choices are open.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-058 | Collection entries contain schema-defined fields only, with no independent blocks. | Replaces the entry-block editing portion of the earlier design and DEC-057's retained entry blocks. The user distinguishes content data from its rendering layout. |
| DEC-059 | Pages have static and generic types. Generic pages contain only registered generic blocks, not normal blocks. | Static pages hold predefined content; generic pages define reusable entry layouts. |
| DEC-060 | Each generic-block field can optionally bind to a schema field by its parameter-name string. | The matching field supplies the selected entry's content/value. DEC-066–DEC-067 resolve missing, empty and incompatible binding behavior. |
| DEC-061 | Each collection schema can optionally select a generic page. | Makes layout assignment a collection-level choice. DEC-062–DEC-064 resolve template sharing, entry URLs and behavior without an assignment. |

## Generic pages — round one, 2026-10-05

Accepted from [Q48–Q55](../journal/2026-10-05-grill-d557fd13-2a71-44e6-9b9a-4543b858f2b0.md); see the [interpretation](../journal/2026-10-05-generic-pages-round-one.md). These changes are not implemented.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-062 | Without a generic page, a collection is data-only and generates no individual entry routes. | Q48. Footer links are a motivating example, explicitly outside this implementation's scope. |
| DEC-063 | Allow one generic page to serve multiple compatible collection schemas. | Q49. Bound field names and value types must be compatible across assigned schemas. |
| DEC-064 | Entry URLs use collection prefix plus entry slug; generic pages have no standalone public URL. | Q50. Layout identity is independent of the collection's route. |
| DEC-065 | A collection index route exists only when a static page occupies it; otherwise it returns 404. | Q51 custom answer rejects automatic listing generation. DEC-070–DEC-071 subsequently settle assignment mechanics and a collection-list block. |
| DEC-066 | Missing or incompatible field bindings may be saved in drafts but prevent publication. | Q52. Fixed fallback values do not conceal invalid bindings. |
| DEC-067 | An empty optional bound value uses the block field's fixed fallback, otherwise renders empty. | Q53. Applies to a valid binding whose entry value is empty. |
| DEC-068 | Add visual rich-text schema fields, with uploaded images and YouTube embeds. | Q54 and custom note expand basic fields and the current formatting-only editor. DEC-072 subsequently limits the initial embed scope to these two types. |
| DEC-069 | Generic-page previews display bound field-name placeholders. | Q55. A real-entry selector or separate sample-data authoring UI was not chosen. |

## Generic pages — round two, 2026-10-05

Accepted from [Q56–Q59](../journal/2026-10-05-grill-192c91a8-c5db-4b3b-9e4f-84772508186b.md); see the [interpretation](../journal/2026-10-05-generic-pages-round-two.md). The scoped interview is complete; these changes are not implemented.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-070 | Match a static page's URL to the collection prefix to supply its index page. | Q56. No separate index-page assignment control; the static page owns the route. |
| DEC-071 | Include a basic collection-list block for static pages in this version. | Q57. An explicitly created index page can show collection entries without automatic index generation. Footer integration remains out of scope. |
| DEC-072 | Limit initial rich-text embeds to uploaded images and YouTube videos. | Q58. Other providers and uploaded audio/video embeds are outside this initial rich-text scope. |
| DEC-073 | Replace the current project's existing demo entries with completely new schema-only entries when implementing. | Q59 custom answer explicitly says the existing entries are unnecessary. No conversion/preservation workflow is required for these fixtures; this is not a general destructive migration policy. |

Implementation of DEC-058–DEC-073 was authorized on 2026-10-06 and is recorded in the [generic-page implementation journal](../journal/2026-10-06-generic-pages-implementation.md).

## Main navigation — 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-074 | Move Pages, Content, Collection schemas, Media and Site into a persistent main sidebar. | Direct screenshot feedback replaces the Home destination menu from DEC-054. The page/block drawer remains a separate nested editor; preview scope from DEC-057 is unchanged. Defaulting to Pages, active-area highlighting and a narrow-screen Menu dialog are implementation choices. See the [implementation journal](../journal/2026-10-06-admin-navigation.md). |

## Shared content width — 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-075 | Content max-width is a site-wide variable that blocks are advised to follow. | Direct user instruction. Block styling remains independent; there is no forced wrapper. The 1200px default, pixel input and `--site-content-max-width` naming are implementation choices. See [static blocks](../features/static-blocks.md). |

## Admin content width — 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-076 | Standardize admin main content at 867px across screens. | Direct user instruction. Pages, Content, Collection schemas, Media and Site, including nested standard admin editors, share one centered maximum width and shrink on narrow viewports. See [visual editing](../features/editor.md). |

## Admin action consistency — 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-077 | Use ← Back for every parent-navigation button and the blue primary variant for every Add action. | Direct screenshot feedback. This supersedes the borderless Add block styling from DEC-052 while retaining its header placement. [Implementation](../journal/2026-10-06-table-and-back.md). |

## Site typography and gutter — 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-078 | Add site-wide body font, heading font, body font size, body line height and page gutter settings. | Direct user selection from the proposed globals. These supplement content max-width and apply to public rendering/live preview; block adoption remains advised. Section spacing, text width, palette and radius were not selected. [Implementation](../journal/2026-10-06-site-design.md). |

## Block library — 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-079 | Each block belongs to one theme and has multiple tags. | Direct user request, with Tailwind UI / hero / header examples. Theme denotes the block library/design family; detailed metadata mechanics remain implementation work. |
| DEC-080 | Enlarge and redesign Add a block for searching and filtering by theme, tags and block name, with controls above a block grid. | Direct screenshot feedback anticipates a large catalog. Card preview/selection behavior remains open. |
| DEC-081 | Adapt approximately 3–5 distinct blocks per category from the legacy TailwindBlocks library to the current system. | User requests refitting/reimplementation and working behavior, not verbatim copying. Inventory contains 15 categories and 123 variants. [Planning record](../journal/2026-10-06-block-library-plan.md); behavioral scope remains under discussion. |

## Block library — round one, 2026-10-06

Accepted from [Q60–Q65](../journal/2026-10-05-grill-821c1394-1fd0-47f5-a950-f71d9c006099.md); [interpretation and references](../journal/2026-10-06-block-library-round-one.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-082 | The block card's primary action adds immediately; Preview is a separate action. | Q60 rejects preview-before-add as the default click behavior. |
| DEC-083 | Include useful generic counterparts with the static block import now. | Q61; retain the distinction between fixed page content and schema-bound generic layouts. |
| DEC-084 | Repeated block content supports adding, removing and reordering items. | Q62 selects editable lists over fixed item slots. Whether collection schemas also gain list fields remains Q67. |
| DEC-085 | Blog blocks populate cards from collection entries using field mappings. | Q63 selects collection data rather than duplicate manually authored article cards. |
| DEC-086 | Contact and newsletter forms submit to an editor-configured external endpoint. | Q64; an actual destination is required for publication, with delivery handled outside the static builder. |
| DEC-087 | Footer layouts are configured once as a shared site-wide footer. | Q65 rejects ordinary per-page footers. Shared header/navigation remains Q66. |
| DEC-088 | Use TDCX, Accenture, ASML, Couchbase, Convex and Source Network as capability/design benchmarks. | Direct user clarification of the desired range of sites. This does not independently select exact reproduction, every animation, or new backend integrations. |

## Block library — round two, 2026-10-06

Accepted from [Q66–Q68](../journal/2026-10-06-grill-d9dd6be8-d154-41d3-a042-1d645992c592.md); see the [round-two interpretation](../journal/2026-10-06-block-library-round-two.md) and [consolidated scope](../discussions/block-library.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-089 | Add a shared configurable header with grouped navigation in this pass. | Q66 selects shared header/navigation now, alongside the shared footer from DEC-087. |
| DEC-090 | Add structured list fields to collection schemas and compatible list bindings in generic blocks. | Q67 extends the earlier scalar/rich-text field contract. Initial rows use existing field types; unrestricted recursive nesting is outside this selected increment. |
| DEC-091 | Block authoring edits content only; appearance comes from the block theme and site settings. | Q68 rejects the proposed per-block Design controls. New theme blocks should not expose arbitrary color, spacing, alignment or CSS override panels. Shared site typography/width/gutter remain available. |

## Site Layouts — direct discussion requirements, 2026-10-06

From the user's request and follow-up clarifications; see the [discussion](../discussions/site-layouts.md) and [journal](../journal/2026-10-06-site-layouts-discussion.md). These are accepted design directions, not implemented behavior. Q69–Q73 were subsequently resolved in the next section.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-092 | Select one Site Layout for the entire public site, wrapping and containing its page blocks. | Direct request uses the familiar application-layout analogy. The required visual composition contract is the block-containing wrapper, not a fixed header/footer/navigation arrangement. Affects [public rendering](../features/static-blocks.md). |
| DEC-093 | Each layout owns its own settings page and surrounding design/customizations, without a fixed product-imposed list of options. | The user explicitly includes fonts, navigation, header/footer, theme behavior and site title as examples, not limits. Revises central ownership in DEC-078, DEC-087 and DEC-089; DEC-097 subsequently retains width/gutter outside layouts. Affects the [editor](../features/editor.md) and [shared chrome](../features/block-library.md). |
| DEC-094 | Editors switch the site layout through a picker similar to the block picker dialog. | Direct follow-up. DEC-100 subsequently settles card activation/preview behavior. |
| DEC-095 | Persist only the selected layout and its current settings; switching layouts may reset settings to the selected layout's defaults. | The user rejects the assistant's per-layout settings-retention suggestion and accepts resets on repeated switches. No retained configuration per inactive layout or cross-layout settings mapping is required. |
| DEC-096 | Layouts can supply optional styling variables; each block independently consumes any subset or none, with no styling-adherence categorization or discrimination. | The user clarifies that adaptability/rigidity is a spectrum. Do not add styling categories, badges, filters, compatibility restrictions or preferential treatment. Reinforces DEC-020; static/generic content-binding rules remain a separate dimension. |

## Site Layouts — round one, 2026-10-06

Accepted from [Q69–Q73](../journal/2026-10-06-grill-3dfa46b2-2cec-4d74-8d0f-2079848d280d.md); see the [interpretation](../journal/2026-10-06-site-layouts-round-one.md) and [consolidated design](../discussions/site-layouts.md). The scoped product interview is complete; implementation is pending.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-097 | Original choice: keep content max-width and page gutter outside individual layouts. **Superseded by DEC-130.** | Q69. Values survive layout switches; layouts/blocks may consume them without a forced container. Retains DEC-075's advisory width contract and DEC-078's gutter control. |
| DEC-098 | Separate Site Layout and Settings destinations in the main sidebar. | Q70. Site Layout contains selection and author settings; Settings contains shared width/gutter, Backups and Session. Revises the Site destination from DEC-074. Affects the [editor](../features/editor.md). |
| DEC-099 | Show a live selected-page preview alongside Site Layout settings, with desktop/mobile widths. | Q71. Revises DEC-057's preview boundary for Site Layout; other standard admin areas keep their existing behavior. Generic-page field placeholders remain governed by DEC-069. |
| DEC-100 | A layout card applies the layout and its defaults directly to the local draft; a separate Preview action inspects without applying. | Q72. Extends the block picker's interaction pattern. Save draft/Publish remain the persistence/publication workflow; DEC-095 governs resets and active-settings-only storage. |
| DEC-101 | Developers install layout implementations in project source and rebuild; editors choose installed layouts. | Q73. Follows the existing block installation model. An admin-side package import workflow was not selected. |

## Site Layout library — direct requirements, 2026-10-06

Added after the first-round answers; see the [library discussion journal](../journal/2026-10-06-site-layouts-library-discussion.md) and [consolidated design](../discussions/site-layouts.md). The core choices above remain accepted; Q74–Q75 were subsequently resolved in the next section.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-102 | Maintain this repository as a growing library of reusable Site Layouts, accumulating implementations as the developer builds client sites. | Direct user clarification. Layout registration must support continued additions; this does not itself select a multi-tenant runtime or a repository distribution strategy. |
| DEC-103 | Provide a hidden layout-whitelist environment variable that exposes only selected layouts and hides other layouts from the picker. | Direct user requirement for client-specific choices. This is developer configuration outside editor settings. DEC-104–DEC-105 subsequently settle absent-variable and excluded-active behavior. It does not introduce styling-based block discrimination. |

## Site Layouts — round two, 2026-10-06

Accepted from [Q74–Q75](../journal/2026-10-06-grill-955ea450-7b57-4225-91b5-95d6a5b3986c.md); see the [interpretation](../journal/2026-10-06-site-layouts-round-two.md) and [consolidated design](../discussions/site-layouts.md). The scoped product interview is complete; implementation remains pending.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-104 | Show all installed layouts when the whitelist environment variable is absent. | Q74 selects full-library availability by default. Client-specific configuration narrows the offered choices. |
| DEC-105 | Keep an excluded active layout working with its current settings; apply the whitelist to future picker choices. | Q75 selects the alternative to the recommended build/configuration rejection. Continue rendering, previewing and configuring the active layout under the normal save workflow. Once switched away, it cannot be reselected while excluded. Whitelist exclusion alone must not invalidate existing content, block a build/publication or reset settings. |

## chartr recreation — follow-on request, 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-106 | After implementing the Site Layout system, recreate chartr.dev as a selectable layout and independent content blocks, using `../chartr-site-v2` as the source reference. | Direct user request. The [scope](../discussions/chartr-recreation.md) and [journal](../journal/2026-10-06-chartr-recreation-plan.md) separate the requested result from proposed component boundaries and unexecuted validation. The recreation follows the foundation and uses the ordinary layout/block contracts. |

## Site Layouts — retained versions, 2026-10-06

Accepted from [Q76](../journal/2026-10-06-grill-7a73a1dd-dfe9-4d9a-9118-fd7107ac2d9c.md); see the [round-three interpretation](../journal/2026-10-06-site-layouts-round-three.md) and [design](../discussions/site-layouts.md#layout-versions).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-107 | Retain selectable layout implementation versions and pin the active version; upgrade only through an explicit selection. | Q76 selects the recommended retained-version model, following blocks. Adding a new version must not automatically replace the selected renderer/settings implementation on the next deployment. The site still stores only the active layout/version and current settings, without inactive-layout settings caches. |

Implementation of DEC-092–DEC-107 was authorized by “lets go” and is recorded in the [Site Layout/chartr journal](../journal/2026-10-06-site-layouts-implementation.md). Earlier pending-status descriptions above refer to their interview stage.

## Editor navigation — direct implementation correction, 2026-10-06

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-108 | Nested editing always opens a dedicated navigation level, replacing the parent controls; never show a Back/detail editor inline among sibling settings. | Direct user correction, with header-navigation and footer-link screenshots, explicitly extended sitewide. Applies to layout settings, block lists, entry lists and schema defaults. Back returns one level; deeper nested lists follow the same rule. |

## Pre-production redesign — 2026-10-07

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-109 | Permit breaking existing contracts, behavior and implementations, including a complete redesign; compatibility with the current prototype is not required. | The user says the builder is not in use or production and explicitly releases the obligation to protect existing promises. This removes preservation of current formats/retained versions as a redesign constraint, including constraints derived from DEC-038/DEC-107. It does not select the replacement model or settle the future product's versioning policy. The immediate requested work is discussion of relations and objects; see the [journal](../journal/2026-10-07-relations-and-objects.md). |

## Relations and objects — round one, 2026-10-07

Accepted from [Q77–Q81](../journal/2026-10-07-grill-60cae8b1-ce10-49a9-b741-7cb19b94ca6e.md). See the [interpretation](../journal/2026-10-07-relations-and-objects-round-one.md). These selections do not authorize implementation.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-110 | Support both named reusable object definitions and inline field groups. | Q77 selects both. Reuse shares field structure; values belong to each containing entry. The subsequent question about collection schemas requests an explanation, not a changed selection. |
| DEC-111 | Original choice: keep objects and lists to one level. **Superseded by DEC-126.** | Q78 originally rejects nested objects/lists; DEC-119 clarifies that original boundary. Q93 subsequently selects three owned levels. The earlier answer is preserved as history. |
| DEC-112 | Each relation field targets one collection. | Q79 chooses the single-collection limit over the researched multi-collection recommendation. This does not decide whether a field selects one or multiple entries from that collection. |
| DEC-113 | Each list uses one object shape for now. | Q80 declines mixed object variants for this scope. Separate lists can still have different schemas. |
| DEC-114 | Block deletion of a referenced entry until incoming links are removed or reassigned. | Q81 selects explicit repair before deletion. Automatic clearing, dangling references and cascading deletion are not selected. |

## Collections and schemas — ownership, 2026-10-07

Accepted from [Q82](../journal/2026-10-07-grill-7f4de03d-e6cc-42a8-a3e1-e309d5efb160.md); see the [interpretation](../journal/2026-10-07-collections-and-schemas-round-one.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-115 | Each collection owns its whole entry schema; reuse named object definitions for shared field groups. | Q82 selects collection-owned schemas rather than independent whole schemas shared by several collections. Collection-wide field changes remain local except when they alter a shared object definition. This does not undo template sharing, share entry values or expand a relation field beyond its one target collection. No implementation is authorized by the form submission. |

## Collections and schemas — content models, 2026-10-07

Accepted from [Q83–Q85](../journal/2026-10-07-grill-62a9fc65-afb5-4c46-bb07-9da151affd7f.md); see the [interpretation](../journal/2026-10-07-collections-and-schemas-round-two.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-116 | Support single-entry and ordinary collection modes. A single-entry model opens its content editor directly and prevents additional entries. | Q83 accepts a home for one centrally managed record, such as Company Profile. Its schema belongs to the model. Shared values remain distinct from reusable object definitions. Creation/deletion, mode conversion and routed single-entry URL behavior require further detail. |
| DEC-117 | Require routing metadata only when a collection generates entry pages; data-only content does not require a URL prefix or entry slug. | Q84 accepts stable IDs and useful display labels without unnecessary URLs. Enabling routes requires valid routing metadata before publication; previously configured URL values may remain stored when routes are disabled. Ordinary routed collection URLs still use prefix plus slug; DEC-122 subsequently selects a direct path for single-entry mode. |
| DEC-118 | Configure each relation field to select one or multiple entries from its one target collection. | Q85 accepts multiplicity independently of DEC-112's single target-collection limit. Ordering, repeated selection of the same entry, reverse views and relations inside owned groups are not settled by this answer. |

## Collections and schemas — shape and behavior, 2026-10-07

Accepted from [Q86–Q89](../journal/2026-10-07-grill-a0fd15b5-4c31-4b31-800c-1b302fae7558.md); see the [interpretation](../journal/2026-10-07-collections-and-schemas-round-three.md).

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-119 | Allow single/multiple relation fields at the entry's top level and inside objects or structured list rows. **The original prohibition on further owned nesting is superseded by DEC-126.** | Q86 clarifies the original one-level boundary. References identify independent entries; they do not embed those entries' field structures. Relation placement remains accepted; Q93 later permits owned nesting to three levels. |
| DEC-120 | Editors control the stored order of a multiple-relation selection; rendering receives that order. | Q87 selects explicit ordering for featured content, co-author credits and similar curated lists. Automatically queried results are a different operation. |
| DEC-121 | A target entry can appear only once in a given multiple-relation field value. | Q88 rejects duplicate targets within one field value. The same entry may appear in other fields, entries or separate association rows, such as credits with different roles. |
| DEC-122 | A routed single-entry collection uses one explicit public path, without a separate entry slug. | Q89 selects a path such as `/about`. This is an explicit single-entry exception to DEC-064's ordinary prefix-plus-slug rule. A generic page assignment is still required to generate the route; public-path collision validation still applies. |

## Collections and schemas — lean usage and navigation, 2026-10-07

From [Q90–Q92](../journal/2026-10-07-grill-5a1974a4-c958-426a-affb-bcb9cfb7c8d4.md); see the [interpretation](../journal/2026-10-07-collections-and-schemas-round-four.md). Q90–Q91 explicitly delegate the choice to the assistant under the criterion “choose the leanest, simplest option.” They are resolved through that delegation, not treated as unanswered or as acceptance of the earlier recommendations.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-123 | Keep reverse lookups for admin incoming-usage/deletion checks; exclude derived reverse lists from the template feature set for this scope. | Assistant's choice under the user's Q90 delegation. The deletion index is necessary already; exposing a template query/configuration surface would add work. This replaces the earlier recommendation to include reverse template lists. Forward relations remain usable in rendering. |
| DEC-124 | Relation controls select existing targets. Create and edit target entries separately through Content. | Assistant's choice under the user's Q91 delegation. Reuses the existing content workflow and avoids an additional linked-entry creation/editing navigation flow. Unsaved work still follows the established shared draft/recovery behavior. |
| DEC-125 | Use one Schemas area with separate Collections and Objects destinations; Content continues to manage entry values. | Q92 selects this navigation. Replaces the Collection schemas area label/organization; object definitions contain structure, not independent shared values. Dedicated navigation levels remain required by DEC-108. |

## Owned nesting — reconsidered, 2026-10-07

Accepted from [Q93](../journal/2026-10-07-grill-038e8a1b-cfdf-4610-928e-2ab1fcf1d6fd.md); see the [interpretation and follow-up](../journal/2026-10-07-nesting-round-one.md). Implementation remains pending.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-126 | Allow up to three owned object/list levels, equally for named and inline structures. | Q93 selects the recommended option with no notes. The entry itself is not a level; an owned object or structured list counts as one; a list-row wrapper adds no level; named-definition reuse adds no extra wrapper. This supersedes DEC-111 and the depth restriction in DEC-119. One shape per list, relation rules and dedicated nested navigation remain accepted. DEC-127 subsequently settles recursive reusable definitions; reference traversal is separate from owned depth. |

## Owned nesting — recursive definitions, 2026-10-07

Accepted from [Q94](../journal/2026-10-07-grill-fd7057e2-84aa-4c94-8493-27b2cfa8d3dd.md); see the [interpretation](../journal/2026-10-07-nesting-round-two.md). This completes the nesting reconsideration, without authorizing application implementation.

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-127 | Reject direct and indirect recursive owned object definitions; allow ordinary nested reuse within the three-level limit. | Q94 selects the recommended option with no notes. A definition cannot contain itself through owned objects/lists, including through another definition. The same definition may still be reused in independent places. This avoids depth-dependent field/default behavior while retaining nested composition. It does not settle or prohibit reference cycles among independent entries; reference resolution remains a separate engineering concern. |

## Content-model reference — direct selection, 2026-10-07

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-128 | Model the content system closely on Sanity and keep the adaptation lean. | Direct user instruction after the CMS comparison: “let's model ours closely to sanity's. keep it lean.” Sanity becomes the primary reference for independent entries, owned objects, typed arrays and stable references, within the accepted scope through DEC-127. Collections retain their own schemas; existing Git storage/publication and authoring choices remain. This selects a modeling direction, not a CMS backend, every Sanity feature or an exact serialized format. See the [selection journal](../journal/2026-10-07-lean-sanity-model.md) and [updated plan](../discussions/content-model-plan.md). |


## Content-model implementation — 2026-10-08

The user separately authorizes implementation of DEC-110–DEC-128, explicitly excluding compatibility and migrations. The [implementation journal](../journal/2026-10-08-content-model-implementation.md), [feature contract](../features/content-model.md) and [verification run](../verification/runs/2026-10-08-content-model.md) record the delivered model. Exact serialized types and resolver limits are engineering choices, not additional interview decisions.

## Creation forms — direct instruction, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-129 | Standardize Add → uncommitted New-item form → Create or Cancel sitewide. | The user explicitly rejects creating records on entry to their editors. New-item forms have Create and Cancel in place of Back and item deletion. Only Create adds the new item; Cancel leaves no new item behind. Apply across page/content/schema creation, blocks and repeated nested content, superseding earlier direct-add catalog behavior. The old add-immediately/edit-or-delete interaction is a negative UX pattern. Existing-item editing remains separate. |

## Layout-owned spacing — direct instruction, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-130 | Move Content spacing into Site Layout; each layout supplies its own default content width and page gutter. | Direct user instruction with the current Settings screenshot. Supersedes DEC-097: spacing belongs to the active layout settings and follows its normal switching/defaults behavior. Editors can override the values in Site Layout. Optional block participation remains unchanged. See the [implementation journal](../journal/2026-10-08-layout-spacing.md). |

## Form action alignment — direct instruction, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-131 | Align confirmation/cancellation button groups to the right edge of their form or dialog sitewide. | Direct user request after screenshots of creation forms. The examples are explicitly non-exhaustive: apply the standard to all comparable forms, including nested creation, compact insert forms and dialogs. See the [implementation journal](../journal/2026-10-08-form-action-alignment.md). |

## Expandable sidebar groups — direct instruction, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-132 | Non-leaf sidebar items expand/collapse their children and have no route. Schemas contains Collections and Objects; their lists have no Back button. | Direct user request and follow-up screenshots. Replaces the intermediate Schemas destination from DEC-125 with an in-place disclosure, retaining its grouping and dedicated nested editors. Individual schema editors still return to their respective list. See the [journal](../journal/2026-10-08-sidebar-groups.md). |

## Admin appearance — direct instruction, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-133 | Add a dark/light mode toggle under Settings that affects only the admin portal UI. | Direct user instruction after tracing the empty mobile-preview background to a hard-coded admin body color. Public-site appearance and Site Layout settings remain independent. Browser-local persistence and retaining dark as the initial default are implementation choices. See the [journal](../journal/2026-10-08-admin-theme.md). |

## Creative freedom and local authoring — direct instruction, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-134 | Treat the repository as a blank slate for freely designed client sites. Offer capabilities and workflows as recommendations; let local developer agents choose what fits. | The user explicitly prioritizes full creative freedom, easy delivery/deployment and optional use of builder capabilities. They approve steps 1–3 of the investigation's final recommendations: a concise portable AGENTS.md, a practical local authoring guide, and verification independent of demo content. Technical formats remain documented accurately; capability adoption is not a strict rule. Remote access/MCP stays outside scope. See the [implementation journal](../journal/2026-10-08-local-authoring.md). |

## Repository providers — direct request, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-135 | Support GitLab alongside GitHub as a configurable repository provider. | The user asks for GitLab compatibility after clarifying repository targeting and deployment-platform independence. The provider choice is accepted; the small shared store interface, HTTPS self-managed option and internal fast-forward merge requests are engineering choices. Publishing from the editor is the stated default, not a separately answered interview decision. See the [implementation journal](../journal/2026-10-08-gitlab.md) and [current contract](../features/publishing.md). |

## Factory reset and connection location — direct requests, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-136 | Add Factory reset to Settings with confirmation; clear pages, content, schemas and media-library records, and reset Site Layout to Starter. | Direct user request. The user explicitly chose to keep uploaded R2 files. Using a local draft followed by existing Save draft/Publish, preserving site identity and connection/session settings, and choosing installed Starter v1 defaults are engineering choices. See the [journal](../journal/2026-10-08-factory-reset.md) and [contract](../features/editor.md#factory-reset-and-repository-settings). |
| DEC-137 | Move Connection from the header to Settings. | Direct follow-up instruction with a screenshot of the header button. The existing connection dialog and provider behavior remain available from Settings → Repository. |

## Starter factory defaults — screenshot instruction, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-138 | Match Starter factory layout settings to the supplied screenshots. | The user specifies Welcome, light theme, Arial body/headings, 16px body size, 1.5 line height, 1200px width, 0px gutter, Your Brand, no logo, Home/Journal/Blocks navigation and Contact Us → `https://google.com`. Navigation paths `/`, `/journal`, `/blocks` are inferred from the existing site; they are URL links so factory reset can still clear all pages. These defaults also apply on a new Starter selection. Existing saved settings remain unchanged. This supersedes the Starter 24px gutter default in DEC-130. |

## Connection settings and conditional locking — direct requests, 2026-10-08

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-139 | Hide Lock editor when no editor password is configured. | The user reports the passwordless Continue screen and explicitly chooses hiding the button. Configured-password sites retain Lock editor and return to an empty password prompt. |
| DEC-140 | Add example placeholders and a Publish branch field, default `main`, to both GitHub and GitLab connection forms. | Direct user request, explicitly extended to GitLab. Publication and missing-draft creation use the selected target. Requiring distinct draft/publish branches, including both in credential identity, and exposing `PUBLIC_PUBLISH_BRANCH` are implementation choices within the existing save/publish contract. See the [current contract](../features/publishing.md#connection-fields-and-publication-target). |


## Encrypted admin — direct instruction, 2026-10-09

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-141 | Encrypt the static dashboard at build time with Argon2id-derived AES-256-GCM, using environment-set email and password together. | The user explicitly selected these algorithms and email/password login after reviewing static hosting and build-time deployment. Supersedes DEC-009's convenience gate and DEC-139's passwordless startup. Both credentials are required. The separate in-memory editor build, fixed parameters, normalized email, no persisted decryption key and per-reload login are implementation choices; runtime sharing is now scoped separately to the public and encrypted bundle graphs. See [contract and limits](../features/admin-encryption.md). |

## Provider-neutral deployment — direct instruction, 2026-10-09

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-142 | Keep deployment and hosting provider agnostic, including documentation. | Direct user request. Local, CI and host-managed builds use the same commands and static `dist/` output. Build secrets belong to the selected build environment; the builder does not require a particular host, CI service or hosting API. Historical hosting references are generalized, with explicit annotations where transcript wording or evidence filenames were redacted. See the [deployment contract](../features/admin-encryption.md#build-and-deployment). |

## Quine recreation trial — interview, 2026-10-11

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-143 | Recreate Quine closely with small usability fixes, reusing assets but independently implementing all components. | Q1 delegates live/source differences to the agent; Q2 selects close fidelity; Q3 explicitly excludes component-code reuse. See the [scope journal](../journal/2026-10-11-quine-rebuild.md) and its linked transcript. |
| DEC-144 | Keep the active demo and build Quine as an isolated example. | Q4 selects isolation instead of replacing root content. Existing unrelated work must remain intact. |
| DEC-145 | Make editorial content and section ordering editable; store portfolio projects as a repeatable Works-block list. | Q5–Q6 select client editing without extra design controls or independent project entries. Do not add collections just to exercise capabilities. |
| DEC-146 | Improve proven instruction gaps and small rebuild blockers; discuss larger CMS changes before implementing them. | Q7 authorizes bounded improvements and an evidence-based discoverability assessment during this trial. |

## Block creation preview — direct instruction, 2026-10-11

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-147 | Render a new page block in the right-hand preview while its creation form is open. | Direct user request after a screenshot showed fields without their pending block. Field edits update a temporary page snapshot; Create commits, while Cancel/navigation discard it. This extends the preview while preserving DEC-129's uncommitted creation contract. See [implementation and checks](../journal/2026-10-11-block-creation-preview.md). |

## Content ownership and handoff — interview, 2026-10-12

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-148 | Show a small save-status message beside Save, with details in Settings. | Q2 accepts the first option. Supersedes only DEC-050's removal of save-status text; recovery and validation behavior remain. Implemented [editor behavior](../features/editor.md#git-save-status-and-recovery). See [answers](../journal/2026-10-12-grill-a336122c-df5b-4206-8de4-fd16bd6925d4.md) and [interpretation](../journal/2026-10-12-content-handoff-round-one.md). |
| DEC-149 | Design the content handoff for the simplest workflow, assuming the client and agent take turns editing. | Q3's notes explicitly say to assume they should not work together. This is not a lock requirement or permission to overwrite stale work. Existing save protection remains; first save path and CRDT assessment are tracked in the [discussion](../discussions/content-handoff.md). No implementation is authorized by these answers alone. |
| DEC-150 | Reject a browser save when its base Git commit is not the latest draft-branch commit. | Direct clarification: keep it simple under rule-lean; do not allow commits from outdated browser Git state. Reaffirms the existing [publishing contract](../features/publishing.md): compare against the remote before commit creation, preserve pending edits on rejection, and protect the shared branch against concurrent updates. Retain this approach without adding a CRDT or automatic merge for this scope. See the [follow-up record](../journal/2026-10-12-content-handoff-round-one.md#direct-follow-up). |
| DEC-151 | Limit this increment to the existing Git save status and recovery experience. | Q5 selects the smaller scope. Browser-to-local-file transfer, a backup-application command and direct local saves are deferred, so the earlier unanswered Q4 does not block this increment. See [submitted answer](../journal/2026-10-12-grill-0dbc5917-8823-4085-a157-62aebd8efba5.md), [completed scope](../journal/2026-10-12-content-handoff-scope.md) and implemented [editor behavior](../features/editor.md#git-save-status-and-recovery). |

Implementation of DEC-148–DEC-151 was explicitly authorized with work-until-grill
and is recorded in the [save UX journal](../journal/2026-10-12-git-save-ux.md).

## Development login

| ID | Decision | Basis |
| --- | --- | --- |
| DEC-152 | Development always uses `admin@example.com` / `asdf1234` as the single shared login. Production retains its configured credential pair. | Direct user request and clarification: one account guards one dashboard and one set of content. The dev pair replaces environment credentials in dev; it is not a second account or a separate data store. See [admin contract](../features/admin-encryption.md). |

## Intr Studio recreation trial — interview, 2026-10-13

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-153 | Recreate the homepage, project listing, and one sample project detail page as a simple static site, prioritizing content layout. | Q1 selects this smaller scope rather than all five detail pages. The direct brief allows cutting intro animation, video, and other effects. See the [scope record and transcript](../journal/2026-10-13-intr-rebuild-scope.md). |
| DEC-154 | Keep Intr as a separate example alongside Quine, preserving the main demo. | Q2 explicitly selects the isolated example. |
| DEC-155 | Reuse Intr's reference branding, copy, and images while correcting obvious placeholders. | Q3 selects reference content rather than a new studio identity. This defines the trial's content basis, not an implementation or verification result. |

## Archline theme — interview, 2026-10-13

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-156 | Install Archline as a reusable layout and blocks with an isolated example and backup; retain the active demo. | Q1 in the [scope record](../journal/2026-10-13-archline-theme-scope.md). |
| DEC-157 | Include the full homepage, project index and reusable project detail template. | Q2 selects this scope over homepage-only or a full multi-page recreation. |
| DEC-158 | Aim for close desktop/mobile visual fidelity with reference demo branding and local imagery. | Q3–Q4 accept the design and content basis; record asset provenance. |
| DEC-159 | Include useful controls and subtle motion with reduced-motion support and ordinary scrolling. | Q5 accepts the menu, FAQ, carousel and hover/reveal approach, excluding elaborate distortion effects. |

## Upload from media fields — interview, 2026-10-13

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-160 | Keep the media dropdown and add Upload plus a small thumbnail to the shared media field. Reuse the existing uploader and select the uploaded file on success. | Q1 explicitly selects the thumbnail as well as Upload. Simple field status/errors and preserving the previous selection on failure are part of the presented flow. See the [submitted answers](../journal/2026-10-13-grill-3216fc08-5d84-4f48-92f3-20bf92b7afd7.md) and [implemented behavior](../features/media.md#upload-from-media-fields). |
| DEC-161 | Open the existing storage settings dialog from the field when upload storage is not configured. | Q2 selects staying in the block. Preserve field edits; after saving settings, the user clicks Upload again. |
| DEC-162 | Keep a successfully uploaded file in the Media library when block changes are cancelled. | Q3 selects reuse: Cancel restores the block's previous selection, without deleting the uploaded file or its draft media record. Existing Save/Publish behavior remains. |

Implementation was subsequently authorized with work-until-grill. See the
[local verification and limits](../verification/runs/2026-10-13-media-fields.md).

## One main dashboard — direct instruction, 2026-10-13

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-163 | Make all installed themes and blocks available in one main dashboard, with `pnpm dev` as the normal workflow. Remove theme-specific layout restrictions. | The user explicitly corrected the isolated-mode workflow: “all themes and blocks available to one dashboard.” This supersedes DEC-103–DEC-105's hidden whitelist. Example content/backups remain optional developer fixtures; they are not separate capabilities or required modes. Existing site content, page-kind rules and active-layout settings semantics remain intact. See [current contract](../features/site-layouts.md#one-dashboard-for-all-themes-dec-163). |

## QuineCMS name — direct instruction, 2026-10-13

| ID | Decision | Basis and rationale |
| --- | --- | --- |
| DEC-164 | Name the project QuineCMS, using `quinecms` for package and new machine identifiers. Replace the former project name across repository text. | Direct user instruction. The implementation retains two read-only compatibility identifiers so existing tab drafts and backup files remain usable; it does not require a content migration. Historical text is editorially normalized and original screenshots are preserved. See [verification and normalization record](../verification/runs/2026-10-13-quinecms-rename.md). |
