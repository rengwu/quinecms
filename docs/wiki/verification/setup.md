---
title: Verification setup
updated: 2026-10-13
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

Use a fresh browser tab for local fixtures. Development uses `admin@example.com` / `asdf1234`. Production build/preview requires
the configured ADMIN_EMAIL and ADMIN_PASSWORD pair. Provider configuration is optional for local editing. Session recovery survives reload; Settings → Discard edits resets to the loaded baseline. Browser-only changes do not alter local content files. Do not reuse the user's unrelated tabs or data as fixtures.

## Available drivers and fixtures

- Vitest unit tests cover JSON validation/versioning, Git transactions through a fake transport, recovery storage, React/Vue lifecycle, activation policy, Markdown import/export, Lexical mounting, and media uploads through mocked SDK/canvas APIs.
- Production artifact checks inspect real emitted files and their module graph.
- Native browser automation can drive the actual editor. The initial run lost window access; the startup repair subsequently verified development editing and production mounting/interactions in Safari.
- Live GitHub/GitLab/R2/hosting checks require separately configured disposable resources and credentials. GitLab mock tests cover paginated loads, temporary-branch/fast-forward transactions, races and lost responses; the [provider run](runs/2026-10-08-gitlab.md) records current limits. None of these tests establishes live account permissions or CORS.

The optional bundled public fixtures are Home, Block examples, the nine-block chartr page, an explicit static Journal index, and two entries rendered through the Journal entry generic page. To review the full recreation, select chartr in Site Layout and choose chartr as Preview page; the committed site keeps Starter selected. Generic pages are editable under Pages but have no standalone public route. Main and draft content live in Git once connected; the local demo is read-only at the filesystem boundary.

## Evidence and cleanup

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
