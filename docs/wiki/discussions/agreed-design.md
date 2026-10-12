---
title: Agreed design
updated: 2026-10-08
status: Accepted
---
# Agreed design

DEC-129 establishes [sitewide creation forms](../features/editor.md#creation-forms-dec-129): Add opens an uncommitted New form, Create commits, and Cancel discards. Eager insertion with Back/Delete is a negative UX pattern. The direct request authorized implementation; no questions remain for this increment. See the [journal](../journal/2026-10-08-creation-forms.md) and [verification](../verification/runs/2026-10-08-creation-forms.md).

Pre-production redesign direction (DEC-109, 2026-10-07): the user permits breaking or replacing the current prototype's contracts and implementations. The prior design below describes the existing baseline; it does not impose backward compatibility on the replacement. [Relations and objects](relations-and-objects.md) have accepted named/inline objects, one target collection per relation field, one shape per list, and blocked deletion while referenced. DEC-126 replaces their original one-level boundary with up to three owned object/list levels; DEC-127 rejects recursive owned definitions. The [consolidated plan](content-model-plan.md) records the accepted scope through DEC-128; implementation was authorized and completed on 2026-10-08. See the [implemented contract](../features/content-model.md) and [verification run](../verification/runs/2026-10-08-content-model.md).

DEC-128 selects a lean Sanity-style model after the CMS comparison: independent entries, owned objects, typed arrays and stable references. Collection-owned schemas, existing scope limits, editable Git schema records and snapshot publication remain the adaptation's boundaries. The [selection journal](../journal/2026-10-07-lean-sanity-model.md) distinguishes this accepted direction from proposed field grammar and exact JSON representations.

DEC-115 additionally keeps each collection's whole schema attached to that collection, using reusable object definitions for common field groups. Independent whole schemas shared across collections are not selected. See [collections and schemas](collections-and-schemas.md).

DEC-116–DEC-118 add single-entry collection mode, require URL metadata only for routed content, and allow each relation field to select one or multiple entries from its one configured collection. These accepted design changes are implemented; lifecycle and serialized interfaces are documented in the feature contract above.

DEC-119–DEC-122 allow relations inside objects/list rows, preserve editorial order, prevent duplicate targets within a relation value, and give routed single-entry collections one explicit path without a separate slug. DEC-126 supersedes the prohibition on further owned nesting: each owned object or list counts once toward three levels; the entry, list-row wrapper and named-definition reuse add no extra level. DEC-127 rejects direct and indirect recursive owned definitions while retaining ordinary nested reuse. The same definition can be used in independent places.

DEC-123–DEC-125 keep reverse lookups for admin usage/deletion checks only, keep relation controls selection-only, and group Collections and Objects under Schemas. Entry values remain in Content. Q90–Q91 delegate the leanest choice to the assistant; Q92 is an explicit selection. The earlier recommendations for reverse template lists and integrated target authoring were not adopted.

Product scope established through four interview rounds. The [decision register](../decisions/index.md) preserves each choice and its source; this page consolidates the intended behavior. Nothing here is a claim of implemented or verified software.

DEC-106 adds [recreating chartr.dev as a layout and independent blocks](chartr-recreation.md) after the Site Layout foundation, using the adjacent `chartr-site-v2` source repository. The requested sequence is foundation first, then the chartr recreation; the [implementation journal](../journal/2026-10-06-site-layouts-implementation.md) and [verification](../verification/runs/2026-10-06T1140Z-site-layouts.md) record the completed work and checked scope.

DEC-107 additionally selects [retained layout implementation versions](site-layouts.md#layout-versions). Existing sites remain on their selected version when newer versions are installed and upgrade explicitly. Only the active layout/version and current settings are stored; no settings cache per inactive layout is required.

Latest accepted design: [Site Layouts](site-layouts.md), DEC-092–DEC-105, will move the surrounding site design and author-defined customization into one selected layout. It contains the page blocks, is selected through a picker and retains only its active settings. Layout-supplied styling variables are optional for every block, without categorization or discrimination. Site Layout settings gain a live selected-page preview; a separate Settings area retains Backups and Session. DEC-130 subsequently places editable width/gutter in Site Layout with defaults owned by each layout. Cards apply defaults to the local draft, with a separate Preview action. Developers install layouts in source and rebuild. This repository will accumulate layouts for client sites; a hidden environment whitelist limits the layouts offered to each client. An absent whitelist offers all installed layouts. An excluded active layout keeps working with its settings; only future picker choices are restricted. The scoped interview is complete and the redesign is implemented; see [Site Layouts](../features/site-layouts.md). DEC-108 additionally requires nested item editing to replace its parent controls with a dedicated level sitewide. The descriptions below retain the existing system's baseline, revised by these layout decisions where applicable.

DEC-058–DEC-073 subsequently revise entries to schema fields only and introduce generic page templates. The [round-one](../journal/2026-10-05-generic-pages-round-one.md) and [round-two](../journal/2026-10-05-generic-pages-round-two.md) interpretations record accepted changes. The user authorized implementation on 2026-10-06; the [implementation run](../verification/runs/2026-10-05T1650Z-generic-pages.md) records the resulting behavior and checks.

## Repository and deployment

One site repository contains the public site, static admin editor, registered block code, schemas, and content records. Media files live in Cloudflare R2 and are referenced by URL in Git. Both public and private GitHub repositories work. The user's configured hosting or CI workflow builds and deploys main; the builder does not manage hosting infrastructure.

The application requires no always-running CMS or custom server-side service. The admin login is a convenience gate configured at build time. Repository operations use the editor's own GitHub token, retained for the tab session including reloads. Editors supply R2 credentials at runtime; upload secrets are not embedded in the public build.

## Editing and publishing

Nontechnical owners edit pages through a drawer alongside a live preview. Content, Collection schemas, Media and Site use standard admin views without live website rendering. Collection entries contain only schema fields; their generic page supplies the layout. Owners add, remove, customize, and reorder registered sections in pages using each block's fields and design controls. Save commits content/schema changes to a shared draft branch through a GitHub SDK client. Publish merges accumulated drafts into main, after which the configured hosting or CI workflow builds and deploys the static output.

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

DEC-132 makes Schemas an expandable group with Collections and Objects as its navigable children. Non-leaf items have no route. The two child lists have no Back button; nested editors keep Back to their list. See [visual editing](../features/editor.md).

DEC-074 replaces the Home destination menu with a main sidebar containing Pages, Content, Collection schemas, Media and Site. Page and block controls stay in their separate editing drawer. Only individual page/block editors show the live preview. See [visual editing](../features/editor.md).
