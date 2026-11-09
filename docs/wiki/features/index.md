---
title: Feature map
updated: 2026-11-09
---
# Feature map

QuineCMS provides the engine, admin portal and site commands described here.
Installed libraries and original site extensions supply designs and blocks;
particular recreations and starter catalogs are not bundled CMS features.

## Content and site design

| Capability | Included functionality |
| --- | --- |
| [Collections, objects and references](content-model.md) | Collection-owned schemas; many/single-entry collections; reusable objects; nested arrays; ordered references; defaults; usage and deletion guards. |
| [Static pages and registered blocks](static-blocks.md) | Page routes; ordered block composition; retained implementation versions; shared public/preview renderers; React, Vue, Svelte and vanilla activation. |
| [Generic pages and collection content](generic-pages.md) | Reusable entry templates; typed field bindings and list projections; data-only collections; explicit entry routes; live entry previews. |
| [Site Layouts](site-layouts.md) | Named configurations; per-page assignment; independent settings; activation and usage guards; explicit design/version changes; shared layout previews. |
| [Searchable block catalog](block-library.md) | Name/theme/tag search; compatible-definition filtering; rendered samples; device previews; staged block creation. |

## Editing, media and languages

| Capability | Included functionality |
| --- | --- |
| [Visual editing and recovery](editor.md) | Breadcrumbs and nested panels; staged creation; drag/keyboard ordering; visual Markdown; Split/Float previews; dark/light appearance; backups, tab recovery and reset. |
| [Media library and direct uploads](media.md) | Media records and selection; uploads from fields; image variants; alternative text; local asset URLs; direct R2 uploads when configured. |
| [Optional internationalization](internationalization.md) | Per-language copies; field localization; shared composition; eligibility; whole-item fallback or strict publication; prefixed routes; Draft/Visitor previews. |

## Saving, publishing and access

| Capability | Included functionality |
| --- | --- |
| [Git draft saves and publishing](publishing.md) | GitHub/GitLab connections; whole-draft commits; stale/source checks; recovery; publication of an exact saved snapshot to a configured branch. |
| [Encrypted static admin](admin-encryption.md) | Build-time encrypted editor/configuration; email/password unlock; in-memory provider credentials; session locking; static hosting without a runtime CMS server. |

## Developer capabilities

| Capability | Included functionality |
| --- | --- |
| [Engine and extensions](site-engine.md) | Independent site inputs; pinned engine/library dependencies; extension manifests; custom fields; shared runtimes; isolated assembly; build-source safeguards. |
| [Local development and validation](local-authoring.md) | Development server and file reload; structural/publication validation; baseline change checks; typechecking; static build, preview and artifact inspection. |

For workflows, use the [authoring guides](../guides/index.md). For evidence, use
[Trials](../trials/index.md) and [verification](../verification/index.md). Those
records describe how capabilities are used or checked, rather than additional
CMS features. [DEC-252–DEC-257](../discussions/feature-map-scope.md) define this map's scope.
