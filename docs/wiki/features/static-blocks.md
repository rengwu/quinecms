---
title: Static pages and registered blocks
updated: 2026-11-09
---
# Static pages and registered blocks

**ID:** FEAT-static-blocks

## Entry points and prerequisites

In `/admin/`, open **Pages → Add page → Static page**, complete the creation form,
then add installed blocks to the page. Developers register block definitions and
renderer source through a library or original site's `quinecms.library.json`;
see [Engine and extensions](site-engine.md#extension-manifest).

The engine ships no design catalog, sample pages or implicit Starter layout.
A site supplies its content and an installed initial layout. Existing test
fixtures are not client content.

## Pages and composition

Static pages own a title, public path, assigned active layout and ordered block
instances. Each instance stores a stable ID, type, implementation version and
props. Add stages a candidate until Create; editing/reordering operates on the
local draft. Save and Publish are separate whole-site actions.

Static pages use static block definitions. Generic templates use compatible
generic definitions and do not themselves produce public routes; see
[Generic pages](generic-pages.md). A publishable site requires a static home page
at `/`. Route collisions block publication.

All installed block themes can be used with any layout; no visual compatibility
filter restricts them. Layouts own the surrounding presentation, and block
renderers own their section appearance. The engine does not promise a fixed
number of blocks, universal navigation/footer widgets or specific typography.

## Rendering and activation

Public generation and live preview use the same block renderer source and the
page's selected layout. Definition manifests declare framework, component,
fields, defaults, dependency ranges and activation. React, Vue and Svelte use
Astro hydration; vanilla modules provide `render` and `mount` with update/destroy
lifecycle support. Public activation can be `never`, `visible`, `idle` or `load`.
Preview mounts interactive renderers immediately.

Static generation imports the implementations used by each public route. Shared
framework/runtime modules use shared emitted URLs within the public graph.
Public routes exclude editor and Git/R2 provider code. The encrypted admin has
its own bundle graph. A layout's activation can add public JavaScript even when
all page blocks are static. Static HTML does not by itself guarantee that every
custom interaction works without JavaScript.

Styles must be scoped to the website/preview surface. Shared layout globals and
spacing helpers are available, but their adoption and exposed settings belong
to the installed design; no fixed fonts, gutters or content width are imposed.

## Versions and custom fields

Existing block instances retain their stored implementation version. The catalog
selects current nondeprecated definitions for new blocks; older installed
implementations remain usable by existing records. An explicit block version
switch preserves compatible same-key values/bindings and clears incompatible
ones. Unavailable versions keep their raw content visible to recovery paths and
prevent valid publication; there is no automatic migration.

Definitions supply fields and optional registered custom React widgets/pure
validators. Missing widgets show a notice without overwriting their stored value.
[Content bindings](content-model.md#routes-and-presentation),
[block discovery](block-library.md) and [editor recovery](editor.md) describe the
related capabilities. The accepted basis is the
[block contract](../discussions/technical-contracts.md), as revised by engine/site
separation (DEC-172–DEC-183).

## Checks and evidence

[Check recipes and dated evidence](../verification/features/static-blocks.md).
