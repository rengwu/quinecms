---
title: lean-sitebuilder
updated: 2026-10-05
status: Accepted
---
# lean-sitebuilder

A Git-backed static site builder with the public website, visual admin editor, block code, and content in one repository and deployment. It replaces the always-running Payload CMS used by astro-payload. Planning only; no application behavior is implemented or verified.

The first round established nontechnical editors, page sections with defined controls, reusable content collections, shared block dependencies, and GitHub-based draft/publish workflows. Save commits to an unpublished branch; Publish merges that branch to main and triggers deployment. The new core and starter blocks will be fresh; astro-payload is reference material.

The editor login is a convenience gate. Each editor supplies their own GitHub token; both public and private site repositories are supported. The browser uses a GitHub SDK to save and merge; the user's Netlify integration deploys main. Pages and collection entries share the block editor. Every block supports immediate browser preview, and new block types are developer-installed with a rebuild.

GitHub tokens persist for the tab session. Collections support developer-defined schemas and portal field editing. Shared drafts use stale-save protection with plain-language recovery. Media lives in Cloudflare R2, with URLs in Git. Blocks own their styling and may follow optional global settings such as dark/light mode.

R2 credentials are entered at runtime. The collection editor supports basic fields and safe changes, with automatic listing/entry pages. Image uploads generate simple resized and lightly compressed variants; media URLs may be public before page publication. The interview is complete; the agreed product scope is ready for an implementation plan.

- [Accepted decisions](decisions/index.md)
- [Agreed design](discussions/agreed-design.md)
- [Open questions](discussions/open-questions.md)
- [Round-one interpretation](journal/2026-10-05-round-one-decisions.md)
- [Submitted round-one answers](journal/2026-10-04-grill-528c4b19-f488-4209-ab5c-b9c13f420f02.md)
- [Round-two interpretation](journal/2026-10-05-round-two-decisions.md)
- [Submitted round-two answers](journal/2026-10-05-grill-1a1e4868-048d-45f3-a291-5f8b6c42aae2.md)
- [Round-three interpretation](journal/2026-10-05-round-three-decisions.md)
- [Submitted round-three answers](journal/2026-10-05-grill-c9c27420-78c7-4c08-ac09-edd5289ddf59.md)
- [Round-four interpretation](journal/2026-10-05-round-four-decisions.md)
- [Submitted round-four answers](journal/2026-10-05-grill-eb7e62a0-bf4d-4474-a805-bc47c92b41aa.md)
