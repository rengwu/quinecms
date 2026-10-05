---
title: Agreed design
updated: 2026-10-05
status: Accepted
---
# Agreed design

Product scope established through four interview rounds. The [decision register](../decisions/index.md) preserves each choice and its source; this page consolidates the intended behavior. Nothing here is a claim of implemented or verified software.

DEC-058–DEC-073 subsequently revise entries to schema fields only and introduce generic page templates. The [round-one](../journal/2026-10-05-generic-pages-round-one.md) and [round-two](../journal/2026-10-05-generic-pages-round-two.md) interpretations record accepted changes. The user authorized implementation on 2026-10-06; the [implementation run](../verification/runs/2026-10-05T1650Z-generic-pages.md) records the resulting behavior and checks.

## Repository and deployment

One site repository contains the public site, static admin editor, registered block code, schemas, and content records. Media files live in Cloudflare R2 and are referenced by URL in Git. Both public and private GitHub repositories work. The user's existing Netlify integration builds and deploys main; the builder does not manage hosting infrastructure.

The application requires no always-running CMS or custom server-side service. The admin login is a convenience gate configured at build time. Repository operations use the editor's own GitHub token, retained for the tab session including reloads. Editors supply R2 credentials at runtime; upload secrets are not embedded in the public build.

## Editing and publishing

Nontechnical owners edit pages through a drawer alongside a live preview. Content, Collection schemas, Media and Site use standard admin views without live website rendering. Collection entries contain only schema fields; their generic page supplies the layout. Owners add, remove, customize, and reorder registered sections in pages using each block's fields and design controls. Save commits content/schema changes to a shared draft branch through a GitHub SDK client. Publish merges accumulated drafts into main, after which Netlify deploys.

Stale-save protection prevents silent overwrites. Recovery preserves unsaved work and uses plain language. There is no requirement for live collaborative editing or a Git merge-conflict interface.

## Blocks and styling

Blocks are independently authored in React, Svelte, Vue, or vanilla HTML/CSS/JavaScript under a common registration contract. Each supplies an immediate browser preview and published rendering behavior. Developers add new block types in source and rebuild; users add instances through the editor.

Declare dependencies and require compatible versions so shared libraries load once per page. Different frameworks retain their distinct runtimes; arbitrary self-bundled incompatible libraries are not promised deduplication. Blocks primarily own their styling. Optional global variables such as light/dark mode provide shared signals, with adoption left to each block.

## Collections

Support developer-defined schemas and portal creation/editing of collection definitions. Fields include text, number, date, toggle, select, media and visual rich text with uploaded images and YouTube embeds. Permit safe edits such as adding fields or changing labels/defaults; avoid destructive changes to populated fields.

Static pages contain predefined content. Generic pages contain only generic blocks, whose fields can optionally bind to schema field keys. Schemas can share a compatible generic page. Assigned collections generate entry routes from their prefix and entry slugs; untied collections are data-only. Generic pages have no standalone public route. Index routes require a static page whose URL matches the collection prefix, otherwise they return 404. No separate index-page assignment control is needed. Include a basic collection-list block for static pages to display collection entries.

Invalid bindings block publication but permit draft saving. Empty optional values use a block field's fixed fallback or remain empty. Generic-page previews show field-name placeholders. Initial rich-text embeds support uploaded images and YouTube; broader embed support, footer collection integration, nested models and relations remain outside the current scope. On implementation, replace the current project's demo entries with fresh schema-only content; the user does not need the existing entries preserved or converted.

## Media

Upload files to R2 and retain their metadata/URLs in content records. Media may be accessible by URL immediately, even before its page is published. Large enough image uploads generate a small set of resized, lightly compressed web variants using simple methods. Audio/video transcoding is not required.

## Implementation direction — proposed

Use browser-native image decoding, canvas resizing, and blob encoding before upload, with a small fixed set of widths and no upscaling. Record variant URLs and dimensions for responsive image markup. This avoids an image transformation service. Exact widths, encodings, limits, orientation/animation handling, and fallback behavior require implementation validation. Browser canvas supports destination resizing and export with encoding/quality settings: [drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage), [toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob).

The old astro-payload repository has separate renderer and Payload-schema registries in `sites/default/astro/src/blocks/blockRenderers.ts` and `blockSchemas.ts`. That registration concept is relevant reference material; the new core and starter blocks will be fresh, with no Payload dependency or migration commitment.

The user explicitly authorized implementation after both interviews. The [technical contracts](technical-contracts.md), [feature map](../features/index.md), and [initial verification run](../verification/runs/2026-10-05T0819Z-implementation.md) now record the resulting system and its remaining verification gaps.

## Main navigation refinement

DEC-074 replaces the Home destination menu with a main sidebar containing Pages, Content, Collection schemas, Media and Site. Page and block controls stay in their separate editing drawer. Only individual page/block editors show the live preview. See [visual editing](../features/editor.md).
