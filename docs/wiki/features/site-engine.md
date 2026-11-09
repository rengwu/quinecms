---
title: Engine and extensions
updated: 2026-11-09
---
# Engine and extensions

**ID:** FEAT-site-engine

## Intent and basis

DEC-172–DEC-183 select a reusable core/admin engine, independently owned sites,
extensions-only designs and manually pinned upgrades. The
[discussion](../discussions/site-engine-separation.md) retains the accepted
boundaries. Sites consume the reusable engine/admin; libraries and original
extensions supply their designs.

## Repository and build contract

A site commits `package.json`, `pnpm-lock.yaml`, `quinecms.config.json`, `content/`,
optional `public/`, and any original extension code. Its engine and library
implementations are installed dependencies. Use full Git commit SHAs for the
initial public repositories. Exact package versions are also supported when a
registry publishes them. Floating refs, ranges and local `file:` selections are
rejected by production builds. Development permits local dependencies for engine
and library maintenance; that is not a library override delivery workflow.

```json
{
  "libraries": ["company-designs"],
  "initialLayout": { "id": "company", "version": 1 }
}
```

Library names must also be dependencies in the site's package.json. Their dependency
specifiers select the source and revision, and the lockfile resolves installation.
Environment variables cannot select or override libraries. They supply credentials
and build/deployment credentials only. Never commit provider tokens or `.env`.

Site scripts invoke the [shared CLI](local-authoring.md). The
[installation and upgrade guide](../guides/installation-and-upgrades.md) gives the
workflow. The example above assumes that dependency and layout are installed.
The CLI copies engine source,
selected extensions, assets and content into `.quinecms/workspace/`, generates
registries/routes there, and invokes the engine's Astro build. Installed packages
are read-only. The workspace and output are ignored, disposable directories;
never edit them as source. A successful build copies static output to site `dist/`.
Failed builds leave committed site inputs and the previous delivered `dist/` intact.
`check-build` checks the last workspace build without regenerating its inputs.

Development reload, validation, typechecking, static builds and artifact checks
are covered in [Local development and validation](local-authoring.md).

## Extension manifest

Both installed libraries and original site extensions use `quinecms.library.json`:

```json
{
  "id": "company-designs",
  "engine": "^0.3.0",
  "blocks": ["src/blocks/banner/v1"],
  "layouts": ["src/layouts/company/v1"],
  "public": "public",
  "customFields": [{
    "id": "company-rating",
    "validator": "src/fields/rating.ts",
    "component": "src/fields/Rating.tsx"
  }]
}
```

`blocks` and `layouts` are required arrays; either may be empty. `public`, `engine`
and `customFields` are optional. Definition paths and custom field modules live
under the extension's `src/`; sources cannot escape that directory tree or use
symlinks. A library includes all helper source, styles and assets used by its
implementations in its package. The entire source tree is available for imports;
only declared definitions are registered.

For original site code, add `"extensions": "extensions/local"` to site configuration
and put this manifest there. The extension root must be under `src/` or `extensions/`.
Use identities distinct from subscribed libraries. Duplicate source identities,
block type/version pairs, layout id/version pairs, custom fields and public asset
paths fail explicitly. Site assets cannot replace library assets. `/admin`, `/_astro`
and `/assets` are reserved output paths.

Custom field validators default-export a pure `(value: unknown) => boolean` function.
Their React controls default-export a component implementing `WidgetProps` from
`quinecms/editor/widgets`. Field definitions refer to the registered validator/widget
ID. The engine retains its Markdown control; a library cannot replace it.

Author modules import the exposed `quinecms/core/*` and `quinecms/editor/*` APIs,
not engine file paths. Public exports are enumerated in engine package.json; they
include types, content, layouts, binding, list, route, Markdown and spacing helpers,
and `Fields`, `PanelSection`, `SiteDesign` and widget types. The assembler resolves
these imports to the same generated engine instance used by the site and admin.
Core features that need a new interface should be implemented upstream.

Library runtime dependencies must be declared in its package.json. Framework
runtimes are peers shared with the engine. Conflicting direct dependency versions
fail rather than silently changing a renderer's runtime. Block manifests retain
required dependency ranges, checked against installed versions. Styles must scope
the website/preview surface so loading another library cannot restyle admin controls.

Installed blocks and layouts supply the catalogs; compatibility, deprecation
and latest-version selection govern new choices while saved records remain pinned. Subscriptions
and revisions have no admin setting. Configure library designs through their exposed
fields; deeper modifications go upstream. Copying, patching or silently shadowing
subscribed implementations is not a supported delivery workflow. Original site
designs remain welcome.

## Layout initialization and upgrades

The configured initial layout must be installed, even when current pages use other
designs. Factory reset creates one active Main layout from that definition's defaults
and keeps the site ID. It clears content locally and requires an explicit Save;
publication still needs a home page. There is no implicit Starter fallback.
Existing explicit single-layout records can still be read; the old implicit Site
Options shape requires a maintainer to select a design manually.

Engine and library pins are independent and upgrade explicitly. A matching
editor is required to write a draft with changed source inputs. There is no
automatic content/settings migration; keeping an old pin alone cannot undo
content already edited under a newer contract. See the
[upgrade guide](../guides/installation-and-upgrades.md#upgrades).

## Save and publish protection

The editor embeds Git blob hashes for the site's package.json, pnpm-lock.yaml,
quinecms.config.json, optional pnpm-workspace.yaml and files under src/, extensions/,
public/ and scripts/. Engine/library pins and lockfile therefore identify selected
code without requiring engine files in the connected repository. Content is checked
separately and does not trigger a source mismatch by itself.

Both Save and Publish compare this manifest with the loaded draft. Any added,
removed or changed build input blocks the write and tells the user to open a
matching editor. Unsaved edits/recovery remain intact. Existing exact-snapshot and
stale-ref protections still apply; neither an engine upgrade nor a matching editor
bypasses a newer Git save. Build from the same committed inputs as the connected
draft, using the frozen lockfile and the site's installed CLI. The protection is
for coherent builds, not a sandbox for executing untrusted extension packages.

## Checks and evidence

[Check recipes and dated evidence](../verification/features/site-engine.md).
