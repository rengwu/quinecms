---
title: Decisions
updated: 2026-10-05
status: Accepted
---
# Decisions

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
| DEC-010 | Support both private and public site repositories. | Q9. Private draft reads require GitHub authorization; public repository drafts are public. Netlify hosting does not change repository visibility. |
| DEC-011 | Each editor supplies their own GitHub token. | Q10. DEC-016 sets token retention; no tokens belong in the deployed bundle or planning records. |
| DEC-012 | Use a browser GitHub SDK client for repository changes. Publish merges to main; the user's existing Netlify Git integration owns deployment. | Q11 custom answer. No builder-managed deployment service or Netlify API integration is requested. Schema authoring is subsequently defined in DEC-017 and DEC-022. |
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
| DEC-050 | Recover silently and show validation errors in toasts on submission. | Remove saved/local/unsaved status text, recovery banners, and the proactive publication issue list. Save/Publish validation rules remain unchanged. |
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
