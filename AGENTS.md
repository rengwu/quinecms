# QuineCMS

Use **QuineCMS** for display text and `quinecms` for repository names, URLs,
routes, slugs and filesystem paths.

This repository maintains the QuineCMS engine and admin portal. Sites own their
content, configuration, assets and original extensions in separate repositories.
The engine and optional design libraries are pinned dependencies. Add missing core
capabilities upstream; do not introduce site overrides of engine files.

## Finding your way

- [README](README.md): engine development and site commands.
- [Engine and extension contract](docs/wiki/features/site-engine.md): package,
  assembly, library subscriptions, initialization and upgrade boundaries.
- [Local authoring guide](docs/wiki/features/local-authoring.md): site workflows,
  record formats and custom extensions.
- `src/core/types.ts`: record/field types. `src/editor/` owns the portal;
  `src/integrations/` owns Git persistence and uploads.
- `bin/quinecms.mjs` and `scripts/site-workspace.mjs`: shared site commands.
  A site's `.quinecms/workspace/` is disposable generated output.
- `tests/fixtures/` and `tests/support/project.ts`: test-owned designs and content,
  never shipped in the engine package.

The initial library is `rengwu/quinecms-library` (Archline and Intr), and the
independent pilot is `rengwu/quinecms-site-archline`. Original bundled designs and
sample content remain recoverable at engine commit `bfbb522`.

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm verify
```

In a site repository, use its `dev`, `validate:content`, `check`, `build`,
`check:build` and `preview` scripts. Inspect its working tree and latest saved Git
draft before changing client content. Browser edits do not write local files.
Use relevant browser checks for visual changes and client editing. Describe what
was checked and its limits; mocked providers do not establish live Git/R2/hosting
behavior. No remote agent service or MCP is needed.

## Product behavior and documentation

The [editor contract](docs/wiki/features/editor.md) describes navigation, creation
and form conventions. [Site Layouts](docs/wiki/features/site-layouts.md) records
layout lifecycle and author interfaces. These describe the builder, not a visual
style imposed on sites.

Consult relevant [features](docs/wiki/features/index.md),
[decisions](docs/wiki/decisions/index.md),
[open questions](docs/wiki/discussions/open-questions.md) and recent
[wiki updates](docs/wiki/index.md). Earlier discussions are history where superseded.
Manual upgrades have no automatic migration promise; unrelated client content is
not disposable.

Keep useful documentation current and distinguish accepted choices from proposals.
Markdown is authoritative; after wiki edits:

```sh
node docs/wiki/_build.mjs
node docs/wiki/_build.mjs --check
```

jstack can optionally support the original maintainer's planning workflow; use
grill-form when conducting an interview in that workflow. Ordinary site work need
not start a product interview or install machine-specific skills.
