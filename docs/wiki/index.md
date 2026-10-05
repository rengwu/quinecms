---
title: lean-sitebuilder
updated: 2026-10-06
status: Accepted
---
# lean-sitebuilder

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
