---
title: Verification setup
updated: 2026-10-25
---
# Verification setup

Run engine tests in the QuineCMS repository and site commands in the independent site repository, with Node 22.12+ and pinned pnpm 10.34.1. The initial run used macOS, Node 22.19.0, and Helium via the native computer-use tool.

## Commands and readiness

```sh
pnpm install --frozen-lockfile
# First setup only: copy .env.example to .env and set ADMIN_EMAIL/ADMIN_PASSWORD.
pnpm verify                  # engine: regression suite; site: validation/check/build/artifacts
# In a site repository:
pnpm validate:content
pnpm preview --port 4321
```

The preview serves the built static `dist/` on `http://127.0.0.1:4321`. Check `/` and `/admin/` return HTTP 200. Use a different explicit port if another process owns 4321; do not stop unrelated processes. `pnpm dev` is the source development alternative. The CLI watches local site inputs and regenerates its disposable workspace. Restart after installing dependencies or changing environment values. Check both a public route and `/admin/` in the final running instance, not just an isolated production build.

For editor startup changes, exercise `/admin/` in both development and production preview. HTTP 200 and a successful build do not prove that React mounted: verify the Pages table and main sidebar first, then open a page row to check the drawer and live preview, change a block field and cancel it, and check the browser console. The [startup repair](runs/2026-10-05T0910Z-admin-startup.md) caught a development-only missing React preamble that the initial production checks missed.

For unfinished content, `pnpm validate:content --draft` runs structural checks without requiring publishable routes or required values. `--base <git-ref>` also compares schema changes/deletion impact with a local commit; it can be combined with `--draft`. The command refreshes generated registries only and does not write content or remote state.

Regression tests read `tests/fixtures/content/`, independently of the client site's root `content/`. The isolated build test retains the sample Journal zero-JavaScript assertions. `check:build` checks the actual site's assets, emitted-runtime sharing and separation from editor/provider code; it does not require demo routes, every framework, or restrict custom renderer embeds. The fixture includes legacy records intentionally, while new work can follow the canonical examples in the [authoring guide](../features/local-authoring.md).

## Identity and isolation

Record `git rev-parse HEAD` and dirty status. Hash application files, tests, content, configuration, and lockfile for a dirty build; the initial report links its manifest. `pnpm build` produces `.quinecms/workspace/.astro/client-graph.json`; `pnpm check:build` verifies output references/sharing and reports gzip module sizes. These sizes exclude the encrypted admin envelope embedded in HTML and runtime-fetched content; they are not a full page transfer measurement.

Use a fresh browser tab for local fixtures. Development and production build/preview require
the site’s configured ADMIN_EMAIL and ADMIN_PASSWORD pair. The separate `quinecms-dev-site` owns its testing login; the engine supplies no default. Provider configuration is optional for local editing. Session recovery survives reload; Settings → Discard edits resets to the loaded baseline. Browser-only changes do not alter local content files. Do not reuse the user's unrelated tabs or data as fixtures.

## Available drivers and fixtures

- Vitest unit tests cover JSON validation/versioning, Git transactions through a fake transport, recovery storage, React/Vue lifecycle, activation policy, Markdown import/export, Lexical mounting, and media uploads through mocked SDK/canvas APIs.
- Production artifact checks inspect real emitted files and their module graph.
- Native browser automation can drive the actual editor. The initial run lost window access; the startup repair subsequently verified development editing and production mounting/interactions in Safari.
- Live GitHub/GitLab/R2/hosting checks require separately configured disposable resources and credentials. GitLab mock tests cover paginated loads, temporary-branch/fast-forward transactions, races and lost responses; the [provider run](runs/2026-10-08-gitlab.md) records current limits. None of these tests establishes live account permissions or CORS.

The optional bundled public fixtures are Home, Block examples, the nine-block chartr page, an explicit static Journal index, and two entries rendered through the Journal entry generic page. To review the full recreation, select chartr in Site Layout and choose chartr as Preview page; the committed site keeps Starter selected. Generic pages are editable under Pages but have no standalone public route. Main and draft content live in Git once connected; the local demo is read-only at the filesystem boundary.

## Evidence and cleanup

### Local file reload regression

From the engine checkout, run `pnpm exec vitest run tests/local-authoring.test.ts
-t 'reloads local content'`. This creates an isolated site, starts the actual CLI
on a free port, and checks JSON/composition changes, layout settings, entries,
atomic replacement, invalid JSON recovery, route addition/rename/deletion and
creation of a new public directory. It connects to Vite's reload WebSocket as well
as checking served content. The process and fixture are removed on completion.

For the browser check, provide an existing Playwright installation with Chromium:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node --import tsx \
  tests/dev-reload.browser.mjs docs/wiki/evidence/<run-id>
```

The driver starts its own fixture/server and fresh Chromium session. It observes
automatic main-frame navigation and changed visible content after filesystem
saves, including error recovery, rapid saves, routes, original extensions and
public assets. It saves `browser.json`, `browser.png` and `browser-server.log`
before cleaning up. It does not edit an existing site or connect to Git providers.
Use its printed results and source fingerprint for the run report; an HTTP-only
check does not prove an open browser refreshed. See the
[2026-11-07 run](runs/2026-11-07-dev-reload.md).

For isolated entry-preview checks, copy the site's `content/`, configuration,
package/lockfile and optional `public/` into an owned temporary directory. Reuse
installed dependencies when checking local engine changes, and record that this
does not verify registry installation. Supply disposable local admin credentials
without copying provider secrets. Run the engine CLI's `dev --port <free-port>`;
stop it before running `check` or `build` because these commands assemble the same
workspace. Serve the resulting `dist/` on a separate owned port for production
browser checks. Hash tested inputs/output and compare content before cleanup.
The [entry-preview run](runs/2026-10-16-entry-preview.md) records an executed example.

For the independent pilot's public hosting check, use the maintainer-supplied
`https://glowing-dodol-a3ed49.netlify.app/` in a fresh browser tab. Follow a homepage
project link and its return link, test the mobile menu at 390px, restore the viewport,
and open `/admin/`. Capture screenshots and normal HTTPS response hashes for the
tested pages and referenced assets. A visible login form does not establish
successful decryption or editor mounting; those checks require the configured
production credentials and are separate from read-only public verification.
Do not infer the deployed Git revision without build metadata. See the
[executed public smoke check](runs/2026-10-14-netlify-pilot.md).

Store outcome logs, source manifests, and observations under `evidence/<run-id>/`, without tokens or private content. Link them from the run. Preserve evidence before cleanup.

On 2026-10-13, the QuineCMS rename editorially normalized project names in
historical repository text and replaced the local checkout prefix with
`<project-root>` in affected evidence. These files are no longer byte-for-byte
original captures; original committed versions remain in Git history. Screenshots
were preserved. The [rename record and file manifest](runs/2026-10-13-quinecms-rename.md#historical-text-normalization)
identify the affected files; historical hashes still describe their original run.

On 2026-10-09, historical hosting-specific filenames were removed from published
source manifests to keep documentation provider neutral (DEC-142). Affected
manifests retain each omitted file's hash in `redactedFiles` and explain the change
in `redactionNote`. Other file hashes are unchanged. Where present, the original
aggregate hash is retained as historical evidence; it cannot be recomputed from
the redacted manifest alone because the original filename was part of its input.

Astro 7 starts this preview in the background. Check `pnpm exec astro preview status`, then stop the owned instance with `pnpm exec astro preview stop`; verify status reports no running preview. Do not rely on closing its launcher terminal. Close/reset test tabs when the browser tool is available; if it is not, record remaining browser-only fixture edits instead of manipulating another session. Remove any exported test backups only when their identity is known. There are no polling collectors or background provider workers.

## Kahf local proof

Use separate sibling `quinecms`, `quinecms-library` and `quinecms-site-kahf`
checkouts. The site owns port 4323 and disposable login values in its ignored
`.env`; no provider secrets are needed. Do not use `quinecms-dev-site` for these
mutating checks because it has a real Git connection. The new Kahf site starts
with two products and no browser-only temporary entry.

In the library run `pnpm install --frozen-lockfile`, `pnpm test`, and
`node scripts/verify-kahf.mjs`. The latter recreates only its owned
`.quinecms/kahf-proof`, with sibling installed packages, fixture credentials and
explicit starter records. It runs validate/check/build/check-build and
`scripts/audit-kahf.mjs`, which writes `.quinecms/kahf-audit.json`. The fixture is
not a remote dependency-install check. Local linked manifests intentionally do
not pass the ordinary production pin guard.

In the independent Kahf site run `pnpm install --frozen-lockfile`,
`pnpm validate:content`, `pnpm check`, then `pnpm dev`. Stop dev before check/build
and restart it after upstream library changes. Use the editor recipe in
[FEAT-kahf](../features/kahf.md). The provider-free browser disables Save/Publish;
the library's two jsdom editor tests exercise those controls with a mocked Git
transport and mocked preview islands. Browser tests cover the actual preview.

For built-browser smoke checks, run `node ../../../quinecms/bin/quinecms.mjs preview --port 4324` from the library fixture root only after a successful build
(use the actual engine absolute path if the sibling path differs). The fixture's
static `/admin/` uses its disposable fixture credentials, not the dev site's.
The preview advertises `http://localhost:4324` (IPv6 on this machine). Check the
editor actually mounts and public links/interactions work. Before rebuilding,
stop the owned preview from its generated workspace with
`node <engine-root>/node_modules/astro/bin/astro.mjs preview stop`; the same command
with `status` confirms no server is running. The fixture has no local Astro bin. Leave the requested independent dev preview on 4323 running.

Hash the library source/preset/assets/configuration, site records/configuration,
lockfiles and built output; exclude `.env`, generated workspaces and browser
recovery. Settings → Discard edits restores disposable browser checks. The run
report records the input/output manifests and screenshots.
