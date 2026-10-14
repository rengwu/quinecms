---
title: Separate engine, libraries and sites
updated: 2026-10-14
---
# Separate engine, libraries and sites

**ID:** FEAT-site-engine

## Intent and basis

DEC-172–DEC-183 select a reusable core/admin engine, independently owned sites,
extensions-only designs and manually pinned upgrades. Implementation was authorized
with `work-until-grill` on 2026-10-14. The [discussion](../discussions/site-engine-separation.md)
retains the study and accepted boundaries. The initial library contains Archline
and Intr; the independent pilot uses Archline.

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
  "libraries": ["quinecms-library"],
  "initialLayout": { "id": "archline", "version": 1 }
}
```

Library names must also be dependencies in the site's package.json. Their dependency
specifiers select the source and revision, and the lockfile resolves installation.
Environment variables cannot select or override libraries. They supply credentials
and deployment connection defaults only. Never commit provider tokens or `.env`.

Shared package scripts are deliberately thin:

```json
{
  "scripts": {
    "dev": "quinecms dev",
    "build": "quinecms build",
    "check": "quinecms check",
    "validate:content": "quinecms validate",
    "check:build": "quinecms check-build",
    "preview": "quinecms preview"
  }
}
```

Run `pnpm install --frozen-lockfile` before CI builds. The CLI copies engine source,
selected extensions, assets and content into `.quinecms/workspace/`, generates
registries/routes there, and invokes the engine's Astro build. Installed packages
are read-only. The workspace and output are ignored, disposable directories;
never edit them as source. A successful build copies static output to site `dist/`.
Failed builds leave committed site inputs and the previous delivered `dist/` intact.
`check-build` checks the last workspace build without regenerating its inputs.

Development watches site content, original extensions, assets and configuration.
Restart after installing a dependency or changing environment settings. Local
source edits rebuild the workspace; browser content edits stay in browser recovery
until exported or saved through Git. There is no direct browser-to-filesystem save.
Do not run concurrent commands against the same site's disposable workspace.

## Extension manifest

Both installed libraries and original site extensions use `quinecms.library.json`:

```json
{
  "id": "company-designs",
  "engine": "^0.2.0",
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

All installed blocks and layouts appear in the existing catalogs. Subscriptions
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

Engine and library pins are independent. To upgrade, first save/export the current
draft, create a branch, change one pin, install and commit the resulting lockfile.
Run content validation (including `--base` for schema changes), typecheck, build,
artifact checks and relevant browser journeys. Make any necessary content/custom
code changes yourself. Put the reviewed upgrade commit on the connected draft
branch, then deploy/open its matching editor and publish that snapshot. If deploying
through Git directly, align draft and publish branches to the same reviewed commit
without overwriting divergent work. A new editor cannot write an old-source draft. Failed checks do not migrate
or delete inputs. Keep the prior content snapshot as well as old pins: restoring
code alone does not undo content edited under a newer contract.

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

## Verification recipe and limits

Engine `pnpm test` exercises independent original extensions, multiple frameworks,
retained versions, duplicate identities/assets, missing initial designs, pin guards,
custom fields, content validation, encrypted admin, static routes and both mocked
Git providers' blocked writes. Library `pnpm test` validates its fixture content,
local media, shared edits, bindings and rendering. The pilot's `pnpm verify` validates
its actual site. A clean clone/install/build and desktop/mobile browser checks are
required before calling an engine/library revision delivered.

Portable output is checked using an ordinary static server. Live Git, browser
credentials, R2 uploads and hosting each require their own evidence; local/mocked
results must not be described as proving those integrations.


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../verification/runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../verification/runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; the maintainer subsequently [confirmed the full hosted connection, edit, draft save, publish and live deployment flow](../journal/2026-10-14-pilot-acceptance.md). This final signed-in evidence is user-reported; pilot delivery is accepted.
