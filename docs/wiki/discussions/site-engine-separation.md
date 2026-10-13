---
title: Separate site repositories and the QuineCMS engine
updated: 2026-10-13
status: Proposal pending grilling; implementation deferred
---
# Separate site repositories and the QuineCMS engine

Explore giving each QuineCMS site its own lightweight repository while obtaining
the shared engine during development and builds. The aim is to reduce the work of
maintaining full CMS forks and distributing engine fixes and features across sites.

**This direction is not fully agreed.** The user explicitly requires further
grilling before settling it. For now, document the discussion and return to it
after adjustments to the QuineCMS engine. Those adjustments have not been scoped
in this discussion. No implementation, migration, package release or deployment
is authorized by this record, and no new accepted decision is registered.

## User intent and constraints to explore

- Ideally, a site consists of its own content and configuration in its own Git
  repository, without committing the full QuineCMS engine.
- Some scaffolding and lightweight forked scripts are acceptable. Avoid requiring
  each site to maintain a full CMS fork or repeatedly merge upstream engine code.
- The initial idea is for a build script or workflow to obtain the main QuineCMS
  source, apply the site's content and configuration, then build the site.
- The workflow must be deployment-provider agnostic, including use on bare metal.
  The initial Netlify mention was explicitly withdrawn as a design constraint.
- Engine changes should be easier to distribute across sites. The desired degree
  of automatic updating remains a question for grilling.

These capture the user's stated aims; they do not settle the architecture or
the implementation choices below. Provider independence also aligns with the
existing DEC-142 [deployment contract](../features/admin-encryption.md#build-and-deployment).

## Candidate architecture discussed

A site could consume a specified QuineCMS version as a build dependency. The
engine would supply the CMS, editor and build machinery; the site would supply
its records, configuration, assets and any site-specific extensions.

An illustrative structure, with names and boundaries still open:

```text
client-site/
  content/              Pages, entries, schemas and media records
  public/               Site-owned images, fonts and other assets
  quinecms.config.mjs   Theme/block selection and build configuration
  package.json          Commands and engine dependency
  pnpm-lock.yaml        Resolved dependencies
  scripts/              Optional lightweight bootstrap scripts
  extensions/           Optional custom layouts, blocks and interactions
```

The optional extension directory is a proposal to preserve freely designed sites.
A site using shared themes might need only data and configuration. Bespoke
presentation code must still live somewhere: the site repository or a separately
consumed theme/extension package are options. Requiring every client-specific
component to be added to the main engine has not been proposed as a requirement.

The proposed build boundary is:

```text
Site records + configuration + assets + optional extensions
                          +
                Specified QuineCMS version
                          |
                   Validate and build
                          |
                        dist/
                          |
                Chosen static web server
```

The same build entry point would work locally, in CI and on a suitably configured
bare-metal machine. Hosting would handle serving or transferring the resulting
files. A machine serving prebuilt output would not need the engine or build tools.
This keeps the build independent of any particular hosting API or CI service.

## Implementation options and recommendations discussed

These are assistant recommendations for evaluation during grilling, not accepted
product decisions:

- **Initial bootstrap option:** obtain a pinned engine commit or release in a
  disposable build directory, supply the site's inputs and run the engine build.
  Downloaded engine source would stay outside the site's committed files.
- **Package option:** distribute QuineCMS with shared development, validation and
  build commands, reducing the scripts copied into each site. A registry package,
  release archive or Git dependency are possible distribution mechanisms; no
  package name, registry or CLI contract has been selected.
- **Version recommendation:** pin the engine and resolve dependencies through a
  lockfile rather than fetch the changing head of `main` on every build. Otherwise
  a content-only publication could unexpectedly pick up engine behavior changes.
- **Update recommendation:** change the site's selected engine version, validate
  and preview the result, then rebuild and deploy. Automated updates across sites
  could be considered later. A new engine release alone would not change already
  deployed static output.
- **Development recommendation:** use the same engine selection and composition
  rules for local development and production builds.
- **Compatibility recommendation:** define how content formats, block/layout
  versions and extension APIs evolve. Sharing engine code reduces fork maintenance
  but does not by itself resolve compatibility or content migration questions.

## Current implementation boundaries

The current [local authoring](../features/local-authoring.md) and
[publishing](../features/publishing.md) workflows still use a repository containing
the engine source and site content together. This proposal does not change those
instructions yet.

- `scripts/generate-blocks.mjs`, `scripts/generate-layouts.mjs` and
  `astro.config.mjs` assume engine code, registered implementations and site inputs
  are available within the builder checkout. Separating them requires an explicit
  input and build-directory contract.
- Generation hashes engine source, scripts, public assets and configuration into
  `src/generated/sources.ts`. The GitHub/GitLab adapters and
  `src/integrations/repository.ts` compare the connected repository's source files
  with the deployed editor's expected files. A lightweight site repository would
  require a different compatibility check, potentially based on the engine
  identity, site configuration and extensions. Simply removing the check would
  discard protection against an editor using an outdated source contract.
- `scripts/example-site.mjs` already stages disposable builder copies with example
  content. It is a useful reference for assembly, but does not establish support
  for independent site repositories or an external engine dependency.
- Existing draft/publish branches, stale-save protection and content recovery need
  to be considered when engine versions or site extensions change. The proposal
  does not select a new content-save workflow or direct browser-to-local saving.

## Questions for the future grilling

1. What belongs to the engine, to shared themes and to each site? How should custom
   blocks, layouts, styles and interactions fit the content/configuration ideal?
2. Should the first version use a pinned checkout, a packaged engine, or another
   distribution mechanism? How should private engine access work in local and
   remote builds?
3. Who selects and updates the engine version? Should updates be manual, proposed
   automatically, or applied automatically within an agreed compatibility policy?
4. What compatibility guarantees are required for saved content and custom code?
   What should an upgrade, failed upgrade and rollback preserve?
5. What should local development and site scaffolding look like for the developer
   or AI agent? Which copied scripts, if any, are acceptable to maintain per site?
6. What replaces source-file matching in the editor? How should draft and publish
   branches, already-open editor sessions and engine upgrades remain consistent?
7. What is the minimum portable build environment and configuration contract?
   How are build credentials supplied without becoming site content?
8. How should existing sites and examples transition, and what is the smallest
   end-to-end trial that would establish the new workflow?

The suggested first trial is one independent site repository covering local
development, editor draft saving/publishing and a portable production build.
That scope is also pending grilling. Resume discussion after the engine adjustments;
do not begin this implementation automatically when other engine work finishes.

## References from the discussion

- [Astro deployment documentation](https://docs.astro.build/en/guides/deploy/)
  describes building static output and deploying it to a host.
- [npm dependency documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#git-urls-as-dependencies)
  describes package dependency sources, including Git references. These are
  available mechanisms, not a selected distribution contract for QuineCMS.
