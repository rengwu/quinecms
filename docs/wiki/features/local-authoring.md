---
title: Local development and validation
updated: 2026-11-09
---
# Local development and validation

**ID:** FEAT-local-authoring

## Entry points and prerequisites

Run the installed `quinecms` CLI from a site repository containing
`quinecms.config.json`, content and pinned dependencies. The engine repository
maintains the CLI; it is not itself a client site. Node 22.12+ and the repository's
pinned pnpm version are required. See [Engine and extensions](site-engine.md) for
assembly and [the authoring guide](../guides/local-authoring.md) for workflows.

## Site commands

| CLI | Conventional site script | Behavior |
| --- | --- | --- |
| `quinecms dev` | `pnpm dev` | Assemble the site and start its development server with local file reload. |
| `quinecms validate` | `pnpm validate:content` | Check structural validity and publication readiness against installed definitions. |
| `quinecms check` | `pnpm check` | Assemble the site and run Astro's source/type checks. |
| `quinecms build` | `pnpm build` | Enforce production pins, assemble and build static output, then copy the successful output to site `dist/`. |
| `quinecms check-build` | `pnpm check:build` | Inspect the last generated build's assets, runtime sharing and public/editor separation without regenerating inputs. |
| `quinecms preview` | `pnpm preview` | Serve the existing generated static build; it does not rebuild content. |

Sites define these thin scripts in their own package manifest. `pnpm verify` is
an optional site convenience script, not a universal engine CLI command.
The engine repository's `pnpm verify` runs its regression suite and wiki check.

## Validation

`validate --draft` selects structural checks only, allowing incomplete required
content that cannot yet publish. `validate --base <git-ref>` also checks schema
changes and deletion impact against an explicit local Git commit. The flags can
be combined. Output names the phase, content path and issue; failures exit nonzero.

Validation refreshes generated registries without generating routes. It does
not edit site content, fetch Git history, move branches or contact a provider.
Final-state checks alone do not establish the safety of a change from an earlier
snapshot; that is the purpose of `--base`.

## Development reload

The server watches site-owned content, original extensions, source, scripts,
public assets and configuration. Saves are debounced and generation is serialized.
Content changes reload the browser after generation; route-table changes use
Astro's configuration refresh. Invalid JSON reports an error and a later valid
save recovers. Newly created optional input directories are watched too.

The watcher does not watch upstream engine/library checkouts. Restart after
changing dependencies, upstream code or environment settings. A reload can reset
public-page interaction state. Browser editor changes stay in the browser draft
until exported or saved through Git; this is not browser-to-filesystem saving.

## Assembly and limits

`.quinecms/workspace/` is disposable generated output. Installed packages and site
inputs remain the source of truth. Stop one site command before another command
assembles that same workspace. Failed validation/build generation leaves inputs
and the previous delivered `dist/` intact; a successful build replaces that output.

Artifact inspection checks generated assets and dependency graphs; it does not
establish visual fidelity, successful browser hydration or live provider behavior.
Validation checks media metadata, not whether every referenced public file exists.
Manual source/content upgrades have no automatic migration promise.

The implementation follows DEC-134 and DEC-172–DEC-183. The
[engine contract](site-engine.md) defines exact pin, extension and build boundaries.

## Checks and evidence

[Check recipes and dated evidence](../verification/features/local-authoring.md).
