---
title: Independent engine, design library and Archline pilot verification
updated: 2026-10-14
result: Untested
---
# Independent engine, design library and Archline pilot verification

Scope: DEC-172–DEC-183 and [FEAT-site-engine](../../features/site-engine.md),
including [local authoring](../../features/local-authoring.md),
[layout lifecycle](../../features/site-layouts.md),
[encrypted admin](../../features/admin-encryption.md) and
[Git save/publication](../../features/publishing.md).

**Implementation and the exercised checks passed. The aggregate remains Untested
because public hosting is part of the pilot acceptance scope and has not yet been
verified.** In [Q15](../../journal/2026-10-13-grill-2918a555-e230-4816-971e-5dab8013cba9.md),
the maintainer chose to deploy to Netlify personally and report the result (DEC-184).
The guide is ready; this pending external verification is not a discovered engine failure. Live GitLab and R2 are explicitly outside this run.

## Build and environment

- Engine: `b7f61bfdeb758a57c88343e49bffe1a2d4765bd8`, public `engine-separation` branch.
- Library: `b34392feab4beb82b6c8d6cecf0dc33905c881b2`, public `rengwu/quinecms-library`.
- Pilot: `c62d1f484c3a6ae38a01430ab8edb351f9db9e54`, public `rengwu/quinecms-site-archline`;
  both `main` and `draft` point at this reviewed upgrade commit.
- Node 22.19.0, pnpm 10.34.1, macOS arm64, Chrome. The final pilot was freshly
  cloned into a new temporary directory and installed with `--frozen-lockfile`.
  It has its own node_modules and no dependency paths into the maintainer's checkout.
  The package manager's ordinary download cache was reused.
- Production build used disposable test credentials from the environment, never
  committed. Ordinary Python static servers served `dist/` on loopback ports
  4387 (first build) and 4389 (final build), without a Node application server.
- [Identity, tracked site files and source hashes](../../evidence/2026-10-14-engine-separation/identity.json).
  Documentation/evidence added after the tested engine commit do not change runtime code.

The first broad browser journey and live GitHub transaction used engine `5612c38`
and the same library revision. Subsequent fixes corrected reset text, dev lifecycle,
route watching and source coverage under site `src/generated/`. The final engine
suite, clean pilot build, production unlock and corrected reset text were rechecked.

## Results

| Scenario | Expected and observed outcome | Result | Evidence |
| --- | --- | --- | --- |
| Engine regression and wiki checks | 253 tests across 31 files pass; generated wiki consistent | Passed | [Engine log](../../evidence/2026-10-14-engine-separation/engine-verify.log) |
| Extracted library | Six content/media/binding/rendering tests pass using its pinned engine | Passed | [Library log](../../evidence/2026-10-14-engine-separation/library-tests.log) |
| Independent public dependency installation | Fresh site clone installs only committed Git SHA dependencies with a frozen lockfile | Passed | [Install](../../evidence/2026-10-14-engine-separation/clean-install.log), [identity](../../evidence/2026-10-14-engine-separation/identity.json) |
| Final production pilot | Content valid; 163 files typecheck with zero errors/warnings/hints; nine routes build; encrypted admin/artifact checks pass | Passed | [Pilot log](../../evidence/2026-10-14-engine-separation/pilot-verify.log) |
| Local dev changes | Existing content changes and a newly added route appear without losing the site watcher; server shuts down with its CLI | Passed | [Dev test](../../evidence/2026-10-14-engine-separation/dev-watch.log), full engine suite |
| Public pages and mobile navigation | Homepage, local imagery/fonts, generated Atelier project detail and mobile menu render; sampled browser console has no errors | Passed | [Desktop](../../evidence/2026-10-14-engine-separation/pilot-desktop-final.png), [390px mobile](../../evidence/2026-10-14-engine-separation/pilot-mobile.png) |
| Installed catalogs | Archline and Intr appear together; Intr layout preview renders Archline page blocks; Intr blocks remain available on an Archline page | Passed | [Layout preview](../../evidence/2026-10-14-engine-separation/layout-catalog.png) |
| Editor field update/cancel | Editing a hero heading immediately changes its live preview; Cancel restores text and clean draft state | Passed | [Live edit](../../evidence/2026-10-14-engine-separation/editor-live-preview.png) |
| Multiple layouts and reset | A second Archline instance has zero uses and can be disabled; used layout cannot. Reset creates one active Archline layout, even with no pages; last-active switch is disabled. Discard restores original three pages | Passed | [Table](../../evidence/2026-10-14-engine-separation/layout-table.png), [reset](../../evidence/2026-10-14-engine-separation/configured-reset.png) |
| Reset description | Final production editor names Archline, matching developer configuration | Passed | [Final label](../../evidence/2026-10-14-engine-separation/reset-label-final.png) |
| Original extensions and library coexistence | A site-owned block registers alongside library blocks; library files remain unchanged; conflicting IDs/assets and missing initial layouts fail | Passed | `tests/block-generation.test.ts` in engine suite |
| Live GitHub save/publish | A real content edit saves/reloads. Adding a real source file to draft blocks Save and Publish with no adapter writes and preserves input. Removing it restores compatibility; original records are saved and the exact snapshot published | Passed | [Live result](../../evidence/2026-10-14-engine-separation/live-github.json), [opt-in driver](https://github.com/rengwu/quinecms/blob/engine-separation/docs/wiki/verification/drivers/site-engine-github.mjs) |
| Provider source guard regression | Both adapters load and reject changed pins/config/assets/extensions, including original source under src/generated; no mutating API calls occur on mismatch | Passed | Engine suite `github.test.ts` / `gitlab.test.ts` |
| Public hosted URL | Maintainer selected Netlify and owns deployment; neither hosting deployment nor a live public URL has been verified | Untested | DEC-184; awaiting maintainer report |

## Repairs and limits

The first browser check exposed hard-coded Starter reset copy; the behavior already
used the configured initial layout. The copy now resolves the design label. A new
CLI test exposed two development issues: Astro could daemonize independently of the
site watcher, and injected routes could remain cached after generation. The engine
now owns the dev server lifecycle and watches/reloads generated route JSON. Both
content and newly added routes pass the real server regression.

The initial live driver compared top-level record-array order after concurrent
Git reads. The files themselves were restored correctly, but that assertion was
not a valid record-identity check. The driver now compares canonical record files;
the completed rerun passes. GitHub's real commits include test edits and their
restoration. No original record content was intentionally left changed. The pilot's
JSON key formatting was normalized by the ordinary editor serializer.

Live provider verification used the actual adapter with GitHub credentials held
only in the test process. It does not establish browser token entry, OAuth, live
GitLab behavior, R2 uploads, all browsers, every block at every width or any hosting
provider's build configuration. Desktop/mobile checks were representative, not a
new reference-design fidelity audit. The first library uses domain-root URLs.

Nonselected old designs, sample records and assets remain recoverable in engine
commit `bfbb522` and the local detached `quinecms-legacy-bfbb522` worktree. They are
not shipped by the new engine or silently migrated into the first library.

The current report uses valid result metadata. The repository-wide report checker
also flags seven older reports with nonstandard result labels; those historical
records were left unchanged. The wiki build/link check passes after this update.

## Next action

The maintainer will follow the
[pilot Netlify guide](https://github.com/rengwu/quinecms-site-archline#deploy-this-pilot-to-netlify),
configure production build credentials, deploy and report the result. Then verify
the hosted `/`, a project detail route and `/admin/`, and record a new dated result.
The core build remains provider agnostic; no host integration or live deployment
was performed for this handoff.

## Subsequent hosted check — 2026-10-14

The maintainer deployed the pilot and provided its public URL. The
[separate Netlify smoke check](2026-10-14-netlify-pilot.md) passes for public pages,
mobile navigation, referenced assets and the admin login page. The original run
result above is preserved as recorded; the follow-up identifies its live output
with response hashes and explicitly excludes hosted admin unlock and Save/Publish.

The maintainer then [confirmed the complete hosted edit, draft save, publish and
deployment flow](../../journal/2026-10-14-pilot-acceptance.md), including the live
content change. Pilot delivery is accepted using that user-reported evidence
together with the independently exercised checks; the original run result is
preserved rather than retroactively claiming assistant-observed hosted writes.
