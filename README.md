# QuineCMS

QuineCMS is a static website engine and content editor. Each site has its own
repository containing content, configuration, assets and original extensions.
The engine and optional design libraries are pinned dependencies, upgraded manually.
The engine contains no bundled website designs.

- [Site authoring guide](docs/wiki/features/local-authoring.md)
- [Engine and extension contract](docs/wiki/features/site-engine.md)
- [Archline pilot](https://github.com/rengwu/quinecms-site-archline)
- [Archline and Intr library](https://github.com/rengwu/quinecms-library)
- [Feature map](docs/wiki/features/index.md)

## Build a site

Use Node 22.12+ and pnpm 10.34.1. Run these commands **in the site's repository**:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm validate:content
pnpm check
pnpm build
pnpm check:build
pnpm preview
```

Development `/admin/` uses `admin@example.com` / `asdf1234`. Production builds
require `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the site's ignored `.env` or build
environment. Provider and upload tokens are entered in the editor, never built in.
Browser edits remain a local draft until saved to the configured GitHub/GitLab
repository; they do not write the local checkout.

The shared CLI assembles an ignored `.quinecms/workspace/` and writes the final
static website to the site's `dist/`. Deploy that directory with any static web
server or hosting provider, including bare metal. No application server or
provider-specific deployment integration is required. Serve at the domain root;
the initial library uses root-relative paths.

## Work on the engine

This repository maintains the engine, admin portal and extension interfaces.
Design implementations belong in a library or the site's original extensions.
Missing engine capabilities should be added here, without site-level engine patches.

```sh
pnpm install --frozen-lockfile
pnpm test       # core/editor tests and independent fixture typecheck/build/dev checks
pnpm verify     # tests plus generated wiki consistency
```

The integration suite creates disposable sites with test-owned extensions. It
checks React, Svelte, Vue and vanilla rendering, encrypted admin output, runtime
sharing, validation and source mismatch guards. Credentials in those fixtures are
for tests only. Mock Git tests do not establish live provider or hosting behavior.

The initial distribution uses full Git commit dependencies, not an npm release.
The package's `files` allowlist excludes tests, content, designs and documentation.
Installed engine files remain read-only; generated output belongs to each site.

The previous integrated prototype, including nonselected demos, is preserved at
[`bfbb522`](https://github.com/rengwu/quinecms/tree/bfbb522). It is historical material,
not a second maintained library or a required migration path.
