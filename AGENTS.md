# lean-sitebuilder

A starting point for freely designed, AI-built websites that clients can maintain
through a content editor. Work locally in this clone. Let the brief, references
and your design judgment lead; the bundled pages, layouts and block catalog are
examples and useful materials, not a prescribed visual style.

Consider the builder's pages, editable block fields, collections, objects and
references wherever they make the site easier to deliver or maintain. There is
no expectation to use every capability. Custom layouts, blocks, interactions and
site-specific code are welcome. For content a client is likely to change, editable
fields are often helpful; choose the amount of structure that suits the project.

## Finding your way

- [README](README.md): local setup, content locations and deployment.
- [Local authoring guide](docs/wiki/features/local-authoring.md): suggested workflows
  for a new site, an existing site and custom blocks/layouts, with current formats.
- `content/`: this site's records. `blocks.config.mjs` and `layouts.config.mjs` point
  to installed definitions and implementations; inspect those relevant to the task.
- `src/core/types.ts`: exact record/field types. The [feature map](docs/wiki/features/index.md)
  links current behavior in more detail. `src/generated/` is regenerated build output.
- Recreating an existing site: the [recreation workflow](docs/wiki/features/local-authoring.md#recreating-an-existing-site)
  maps reference sections to editable content. The [isolated Quine example](examples/quine/README.md)
  demonstrates a custom layout, blocks, local media and a client editing map.

For an existing client site, it is useful to check the working tree and the latest
saved client draft before making changes. Browser edits do not write local files.
The guide explains the local/Git/browser boundaries and source rebuilds.

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm validate:content                 # publication-ready content
pnpm validate:content --draft         # structurally valid work in progress
pnpm validate:content --base HEAD     # also compare changes with a Git baseline
pnpm verify                          # types, regression tests, build, artifacts
```

Use a relevant browser check for visual work and the client editing experience.
Describe what was checked and any limits; mocked provider tests do not establish
live GitHub/GitLab, R2 or hosting behavior. No remote agent service or MCP is needed.

## Working on the builder itself

The [editor contract](docs/wiki/features/editor.md) records its existing navigation,
creation and form conventions. [Site Layouts](docs/wiki/features/site-layouts.md)
records layout-owned spacing and extension interfaces. These describe the builder
UI and data contracts, not a visual style imposed on client websites.

For changes to the builder's product behavior, consult the relevant current
feature page, [decisions](docs/wiki/decisions/index.md), [open questions](docs/wiki/discussions/open-questions.md)
and recent [wiki updates](docs/wiki/index.md). Earlier discussions are history where
superseded. The prototype redesign explicitly excludes compatibility/migrations;
that does not make unrelated client content disposable.

Keep useful documentation current with substantive changes and distinguish accepted
choices from proposals. Markdown is authoritative; after wiki edits:

```sh
node docs/wiki/_build.mjs
node docs/wiki/_build.mjs --check
```

The repo contains its own guide, checks and wiki reader. No machine-specific skill
installation is needed to build a site. jstack can optionally support the original
maintainer's planning workflow; use grill-form if conducting an interview in that
workflow. Ordinary site work need not start a product interview.
