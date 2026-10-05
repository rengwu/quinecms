---
title: Agreed design
updated: 2026-10-05
status: Accepted
---
# Agreed design

Product scope established through four interview rounds. The [decision register](../decisions/index.md) preserves each choice and its source; this page consolidates the intended behavior. Nothing here is a claim of implemented or verified software.

## Repository and deployment

One site repository contains the public site, static admin editor, registered block code, schemas, and content records. Media files live in Cloudflare R2 and are referenced by URL in Git. Both public and private GitHub repositories work. The user's existing Netlify integration builds and deploys main; the builder does not manage hosting infrastructure.

The application requires no always-running CMS or custom server-side service. The admin login is a convenience gate configured at build time. Repository operations use the editor's own GitHub token, retained for the tab session including reloads. Editors supply R2 credentials at runtime; upload secrets are not embedded in the public build.

## Editing and publishing

Nontechnical owners edit pages and collection entries through a drawer over a live preview. They add, remove, customize, and reorder registered sections using each block's fields and design controls. Save commits content/schema changes to a shared draft branch through a GitHub SDK client. Publish merges accumulated drafts into main, after which Netlify deploys.

Stale-save protection prevents silent overwrites. Recovery preserves unsaved work and uses plain language. There is no requirement for live collaborative editing or a Git merge-conflict interface.

## Blocks and styling

Blocks are independently authored in React, Svelte, Vue, or vanilla HTML/CSS/JavaScript under a common registration contract. Each supplies an immediate browser preview and published rendering behavior. Developers add new block types in source and rebuild; users add instances through the editor.

Declare dependencies and require compatible versions so shared libraries load once per page. Different frameworks retain their distinct runtimes; arbitrary self-bundled incompatible libraries are not promised deduplication. Blocks primarily own their styling. Optional global variables such as light/dark mode provide shared signals, with adoption left to each block.

## Collections

Support developer-defined schemas and portal creation/editing of collection definitions. Start with text, number, date, toggle, select, and media fields. Permit safe edits such as adding fields or changing labels/defaults; avoid destructive changes to populated fields.

Generate standard public listing and entry pages automatically. Entry bodies use the same block editor as pages. Nested schemas, relations, migration tooling, and a visual template designer are outside the selected initial scope.

## Media

Upload files to R2 and retain their metadata/URLs in content records. Media may be accessible by URL immediately, even before its page is published. Large enough image uploads generate a small set of resized, lightly compressed web variants using simple methods. Audio/video transcoding is not required.

## Implementation direction — proposed

Use browser-native image decoding, canvas resizing, and blob encoding before upload, with a small fixed set of widths and no upscaling. Record variant URLs and dimensions for responsive image markup. This avoids an image transformation service. Exact widths, encodings, limits, orientation/animation handling, and fallback behavior require implementation validation. Browser canvas supports destination resizing and export with encoding/quality settings: [drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage), [toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob).

The old astro-payload repository has separate renderer and Payload-schema registries in `sites/default/astro/src/blocks/blockRenderers.ts` and `blockSchemas.ts`. That registration concept is relevant reference material; the new core and starter blocks will be fresh, with no Payload dependency or migration commitment.

Next, translate the accepted scope into the data model, block/preview contract, implementation plan, and observable acceptance criteria. Framework/library selection and starter-block coverage remain engineering choices to explain in that plan. Implementation has not been authorized by the interview answers alone.
