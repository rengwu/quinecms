# QuineCMS

QuineCMS is a Git-based CMS for static websites. Developers define layouts,
blocks, and editable fields in code. Editors manage pages and structured content
through a browser interface at `/admin/`. QuineCMS stores content in Git and uses
Astro to generate the site.

[Documentation](docs/wiki/features/index.md) ·
[Site setup](docs/wiki/features/site-engine.md) ·
[Authoring guide](docs/wiki/features/local-authoring.md) ·
[Example site](https://github.com/rengwu/quinecms-site-archline)

## Features

- Page editing with blocks and desktop and mobile previews.
- Collections, references, reusable field structures, and generated entry pages.
- Custom layouts, styles, and interactions.
- Block renderers for React, Svelte, Vue, and vanilla JavaScript.
- Draft saves and publishing through GitHub or GitLab.
- Media management with optional Cloudflare R2 uploads.
- Static output built with Astro. No database or application server required.

## How it works

Each site has a separate repository and installs the QuineCMS engine and optional
design libraries as dependencies. Dependencies use exact Git commit pins;
upgrades are manual.

| Repository | Contents |
| --- | --- |
| QuineCMS (this repository) | Engine, admin portal, and CLI. |
| [Design library](https://github.com/rengwu/quinecms-library) | Reusable layouts, blocks, and assets for Archline, Intr, and Tessera. |
| Site repository | Content, configuration, assets, and custom extensions. |

1. Edit content and preview changes in the browser.
2. Select **Save draft** to commit content to the configured Git draft branch.
3. Select **Publish** to validate the saved content and update the publish branch.
4. Your hosting or CI workflow builds that branch and deploys the generated site.

Browser edits do not modify the local checkout. Until saved to Git, changes
remain in the browser.

## Set up a site

Prerequisites:

- Node.js 22.12 or later.
- pnpm 10.34.1.
- A site repository based on the [example site](https://github.com/rengwu/quinecms-site-archline)
  or [site setup guide](docs/wiki/features/site-engine.md).

1. In the site repository, install dependencies:

   ```sh
   pnpm install --frozen-lockfile
   ```

2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the site's ignored `.env` file.
3. Start the development server:

   ```sh
   pnpm dev
   ```

4. Open `/admin/` on the local server.
5. Configure [Git access](docs/wiki/features/publishing.md#build-environment-setup)
   to enable **Save draft** and **Publish**.
6. Optional: Configure [R2 uploads](docs/wiki/features/media.md#build-environment-setup).

## Build and deploy

Run these commands in the site repository:

```sh
pnpm validate:content
pnpm check
pnpm build
pnpm check:build
pnpm preview
```

Deploy the generated `dist/` directory at the domain root.

## Develop the engine

Run these commands in this repository:

```sh
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify` runs the test suite and documentation checks.
