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
