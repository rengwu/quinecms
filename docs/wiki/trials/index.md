---
title: Trials
updated: 2026-11-09
---
# Trials

Recreations and pilots exercise CMS capabilities against real design, content and
editing needs. They are evidence about a recorded scope and build, not features
included in the engine. Library designs and adopted site content remain owned by
their separate repositories. See the [feature map](../features/index.md) for the
capabilities themselves.

## Kahf

[Trial record](kahf.md): a small editorial/catalog sample with 13 logical pages
and English/Indonesian routes. It exercises [languages](../features/internationalization.md),
[collection templates and bindings](../features/generic-pages.md),
[layouts](../features/site-layouts.md) and [editing](../features/editor.md).
[Local verification](../verification/runs/2026-10-25-kahf.md) records the sample,
fallbacks, public interactions and maintenance flows. Commerce, general search,
live providers and a portable remote-pin installation were outside that proof.

## chartr

[Historical trial record](chartr.md): a layout and nine independent interactive
blocks. It exercises [registered block rendering](../features/static-blocks.md),
[layouts](../features/site-layouts.md), [catalogs](../features/block-library.md)
and [nested editing](../features/editor.md).
[Implementation checks](../verification/runs/2026-10-06T1140Z-site-layouts.md) and
[spacing checks](../verification/runs/2026-10-06T1426Z-chartr-spacing.md) apply to
the former bundled fixture, recoverable at engine commit `bfbb522`.

## Quine

[Scope and findings](../journal/2026-10-11-quine-rebuild.md): an isolated recreation
and authoring-discoverability exercise. It uses [blocks](../features/static-blocks.md),
[layouts](../features/site-layouts.md), [local media](../features/media.md#locally-authored-media)
and [repeatable editing](../features/editor.md). Its
[verification](../verification/runs/2026-10-11-quine-rebuild.md) is local and records
fidelity compromises. The old example runner is historical tooling, not a current
engine command or a bundled design promise.

## Tessera

[Scope and declared-field work](../discussions/tessera-collection-context.md): a
59-page recreation that exercised [collection-field projections](../features/content-model.md#collection-context),
[templates](../features/generic-pages.md), [extensions](../features/site-engine.md)
and [media](../features/media.md). The general declared-field contract became an
engine capability; Tessera's layout, blocks and content remain library/site work.
[Implementation](../verification/runs/2026-10-16-tessera.md) and
[fidelity checks](../verification/runs/2026-10-16-tessera-fidelity.md) cover local
working trees, not a remote release or hosted deployment.

## Archline and the independent-site pilot

[Design scope](../journal/2026-10-13-archline-theme-scope.md) and
[design checks](../verification/runs/2026-10-13-archline-theme.md) exercise
[layouts](../features/site-layouts.md), [blocks](../features/static-blocks.md) and
[client editing](../features/editor.md). The independent pilot then exercises
[engine/library/site separation](../features/site-engine.md),
[encrypted admin](../features/admin-encryption.md) and
[Git publishing](../features/publishing.md).
[Separation checks](../verification/runs/2026-10-14-engine-separation.md),
[hosted smoke checks](../verification/runs/2026-10-14-netlify-pilot.md) and
[maintainer-reported end-to-end acceptance](../journal/2026-10-14-pilot-acceptance.md)
retain their different evidence boundaries. They do not establish live GitLab/R2
behavior or current status of that deployment.

## Intr

[Scope and findings](../journal/2026-10-13-intr-rebuild-scope.md) and
[verification](../verification/runs/2026-10-13-intr-rebuild.md) cover an isolated
recreation using [layout settings](../features/site-layouts.md),
[registered blocks](../features/static-blocks.md), [media](../features/media.md)
and [repeatable editing](../features/editor.md). Source-maintained design choices
and local-only verification remain explicit in those records.

Historical `FEAT-kahf` and `FEAT-chartr` references remain in dated evidence for
traceability. They are retired from the capability map and are not reassigned to
engine features.
