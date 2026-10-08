# lean-sitebuilder

A starting point for custom websites built locally by developers and their AI agents,
with a content editor for the people who maintain them afterward. Design freely;
the included pages, blocks and layouts are examples you can adapt or replace.
Use the builder's content capabilities where they help the site and its owner.

Astro produces a static website and React editor at `/admin/`. Source and content
live in one repository. The connected editor saves to a GitHub or GitLab draft branch;
publishing advances the saved snapshot to `main`. Your deployment workflow can then
build and host the static output. There is no application server in production.

Start with [AGENTS.md](AGENTS.md) and the [local authoring guide](docs/wiki/features/local-authoring.md).
The guide covers choosing content structures, building a new site, changing an
existing one and authoring custom blocks/layouts. Its design advice is optional;
the documented record formats describe the current implementation.

## Run locally

Node 22.12+ and pnpm 10.34.1:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:4321/admin/`. Without provider credentials, you can edit the
browser preview and export a content backup. Browser edits do not write local
project files. Local agents normally edit source and JSON directly, then use the
browser to inspect the result and the client's controls.

```sh
pnpm validate:content                 # all content checks
pnpm validate:content --draft         # allow incomplete publication fields
pnpm validate:content --base HEAD     # include schema/deletion impact checks
pnpm verify                          # types, tests, production build, assets
pnpm preview                         # serve dist/
```

The validator uses the same content rules as the editor/build and changes no
content or Git refs. It refreshes generated registries first, independently of
routes, so unfinished drafts can be checked. `--draft` and `--base` can be combined;
`--base` reads an existing local Git commit and does not fetch it. `tsx` is a pinned
development tool for running that TypeScript command.

Regression sample content lives in `tests/fixtures/content/`; the site's root
`content/` can be replaced without preserving demo routes. Full tests still exercise
the shipped block/layout implementations. Deliberately removing those implementations
may call for corresponding changes to their regression tests.

Astro launches background instances. Stop the owned instance with
`pnpm exec astro dev stop` or `pnpm exec astro preview stop`. After adding blocks,
layouts or routes, restart development with `pnpm dev` so generation runs again.
Starting a second launcher does not replace an existing instance. Public output
and the editor both deserve a quick check after source changes.

## Find the site's content

| Location | Contents |
| --- | --- |
| `content/site.json` | Active `layout: { id, version, settings }` and a `globals` object. Layout settings own content width/gutter and author-defined site settings. |
| `content/pages/<id>.json` | Static or generic pages and ordered block instances. Static pages own paths; generic pages are collection templates. |
| `content/collections/<id>.json` | Collection-owned fields, `many`/`single` mode, title field and optional generic-page routing. |
| `content/objects/<id>.json` | Reusable object definitions; values remain owned by their entry. |
| `content/entries/<collectionId>/<id>.json` | Schema values and, for routed ordinary entries, a slug. |
| `content/media/<id>.json` | Media URLs and variant metadata. |
| `src/core/types.ts` | Current record, field and renderer context types. |
| `src/blocks/<name>/vN/`, `blocks.config.mjs` | Installed blocks and explicit registration. |
| `src/site-layouts/<name>/vN/`, `layouts.config.mjs` | Installed layout wrappers, settings UIs, policies and registration. |

Every snapshot has a site record; publication also needs a static home page at `/`.
Directories for unused record kinds can be absent.
The committed demo includes a legacy site record supported by the existing reader;
[the guide](docs/wiki/features/local-authoring.md#starting-a-new-site) shows the canonical
shape for new work. No demo page or visual theme is required for a client site.

Pages, Content, Schemas → Collections/Objects, Media, Site Layout and Settings are
available in the editor. Collections support scalars, objects, typed arrays and
references. Generic blocks bind to typed forward paths and explicit list projections.
A collection's generic-page assignment enables entry routes; an index is an ordinary
static page. [Content model](docs/wiki/features/content-model.md) ·
[Generic pages](docs/wiki/features/generic-pages.md).

Site Layout owns width/gutter overrides and their defaults: Starter 1200px/24px,
chartr 1512px/40px. Switching layout/version uses the selected definition's defaults.
Settings contains admin Appearance, Backups and Session. Styling variables are
available to blocks; custom designs can choose how to use them.

The [authoring guide](docs/wiki/features/local-authoring.md#custom-blocks-and-layouts)
explains custom renderers, settings, styling, versions and registration. Both the
public site and browser preview use the registered implementation. New source
implementations require generation and a rebuild. Existing records name their exact
implementation version; replacing or removing one warrants checking those uses.

## Deliver and deploy

1. Put the site repository on GitHub or GitLab with a `main` branch. Configure your hosting
   or CI workflow to build `main` with `pnpm build` and serve the generated `dist/`
   directory on your chosen static host. Limit public deployments to `main` if
   drafts should remain unpublished.
2. Configure the build values described in `.env.example`: `PUBLIC_GIT_PROVIDER`
   (`github` or `gitlab`), `PUBLIC_GIT_NAMESPACE`, `PUBLIC_GIT_REPO` and
   `PUBLIC_DRAFT_BRANCH`. For GitLab, the namespace includes any subgroups;
   `PUBLIC_GITLAB_URL` defaults to `https://gitlab.com` and can point at an HTTPS
   self-managed instance. The older `PUBLIC_GITHUB_OWNER`/`PUBLIC_GITHUB_REPO`
   variables remain GitHub fallbacks when the neutral names are unset.
   `ADMIN_PASSWORD` is an optional convenience gate; it is not access control for
   the statically hosted editor, content or assets.
3. In `/admin/` → Connection, choose the provider and repository, then enter an
   access token: GitHub needs repository Contents read/write; GitLab needs `api`
   scope and project permissions to create branches/commits and merge into the
   draft and main branches. Branch rules need to allow the intended updates.
   Connect loads the draft, creating a missing draft branch from main.
4. Save draft writes all pending records in one commit. Structurally valid incomplete
   content can be saved. Publish requires a saved, fully valid snapshot and advances
   main without force. The editor reports deployment pending; deployment success
   is tracked separately by your hosting or CI workflow.

GitLab uses temporary branches and SHA-pinned merge requests internally for both
Save and Publish. Configure the project for **Fast-forward merge**, with squashing
optional or disabled, to preserve exact saved snapshots and reject concurrent edits.
Successful operations request temporary-branch removal; merge requests remain in
the project's history. Required approvals or pipelines can block completion;
the editor does not bypass them or schedule delayed automatic merges. Interrupted
operations may leave temporary branches or requests for manual cleanup. Self-managed
instances must allow browser API requests from the editor's origin. See the
[Git publishing guide](docs/wiki/features/publishing.md) for details and verification limits.

Local code changes and client content changes can be on different branches. Before
updating an existing site, review the saved draft and reconcile source/content in
normal Git work. Rebuild/deploy the editor for changed source contracts and synchronize
main and draft; the portal rejects source mismatches and divergent publication history.
See the [existing-site workflow](docs/wiki/features/local-authoring.md#adjusting-an-existing-site).

Stale saves preserve local work. Export a backup, reload the remote draft and reconcile
edits. Backup import replaces the local content snapshot; it is not a merge. Tab recovery
survives reload, not a closed session. Git provider/R2 credentials remain in session storage,
are cleared by Lock editor and are excluded from backups and Git. Trusted installed
code shares the editor document. Changing the repository connection clears its token;
tokens are restored only for the matching provider, instance, repository and branch.

## Media

Media → Storage settings accepts runtime Cloudflare R2 credentials, account ID,
bucket and public HTTPS base URL. Uploads go directly from the browser to R2; media
records in Git hold URLs. Configure bucket CORS for the editor's exact origins.
The [media guide](docs/wiki/features/media.md) documents upload processing, settings
and verification limits.

The original is retained. Eligible static images receive smaller WebP variants;
video/audio/PDF files are not transcoded. Assets can be public before page publication.
Upload cleanup is best-effort; successful uploads from discarded drafts remain for
manual cleanup. Rich text can reference uploaded images and YouTube videos.

Live GitHub/GitLab writes, R2 credentials/CORS and hosting deployment are separate from the
mocked tests and have not been established by those tests.

## Project documentation

The [feature map](docs/wiki/features/index.md) describes current capabilities.
The [wiki](docs/wiki/index.md) retains decisions, history and build-specific evidence.
Current feature pages and source contracts take precedence over superseded proposals.
Rebuild its offline reader with `node docs/wiki/_build.mjs`; check it with
`node docs/wiki/_build.mjs --check`.
