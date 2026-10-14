---
title: Separate site repositories and the QuineCMS engine
updated: 2026-10-14
status: Engine and library implementation verified; maintainer Netlify deployment pending
---
# Separate site repositories and the QuineCMS engine

Explore giving each QuineCMS site its own lightweight repository while obtaining
the shared engine during development and builds. The aim is to reduce the work of
maintaining full CMS forks and distributing engine fixes and features across sites.

**The pilot's product direction is settled; implementation was authorized on 2026-10-14 with `work-until-grill`.** After
the initial deferral, the user requested study and grilling, replaced the first
unsubmitted form with direct discussion, then completed two form rounds. The
accepted choices are DEC-172–DEC-183. No further product questionnaire is needed
for the scoped pilot on current evidence. The engineering plan below has been implemented; the [verification record](../verification/runs/2026-10-14-engine-separation.md) distinguishes completed checks from pending public hosting. The earlier discussion alone did not authorize implementation; the subsequent direct instruction does.

## Direct discussion — 2026-10-14

Accepted requirements from the user's message:

- **Engine scope:** QuineCMS should contain the core engine and admin portal
  capabilities, without bundled site blocks, layouts or visual styles (DEC-172).
  This describes the destination, not the current source tree.
- **Engine upgrades:** each site pins its engine version and upgrades manually.
  Upgrades may fail verification or require changes to content/custom code; site
  maintainers perform their own migrations, optionally AI assisted. No automatic
  migration or continuing compatibility guarantee is required (DEC-173).
- **Initial scope:** one independent public pilot site first (DEC-174). The
  subsequent Q9 answer selects Archline (DEC-178); the mechanism remains open.
- **Engine access:** the user said they would make the engine public. A subsequent
  read-only repository metadata check confirms `rengwu/quinecms` is now public;
  the assistant did not change its visibility. Private engine access is no longer
  an initial distribution constraint.

The direct discussion introduced the following preferences, now clarified by
Q6–Q9 below:

- The user initially leaned toward an extensions-only interface, with each site
  owning bespoke blocks, layouts, content and configuration. Q6 confirms that
  boundary; exact authoring APIs remain engineering work.
- A separate central library repository supplies reusable layouts and blocks as
  dependencies (Q7), including designs selected for its initial contents. Sites
  configure subscriptions outside the admin portal, with installed definitions
  appearing in Add block and the layout catalog. Q10–Q14 subsequently settle
  committed configuration, independent pins, upstream-only code changes and the
  initial Archline/Intr library. This is not implemented.
- Assistant recommendation: keep the portal's own styling, field widgets,
  validation and rendering interfaces in the engine; keep public-site designs,
  assets, CSS and implementations with site/library extensions. The user has not
  specified the exact line between reusable authoring helpers and presentation.

## First submitted round — Q6–Q9

The [submitted answers](../journal/2026-10-13-grill-3f45ceb2-5c2b-407b-bbba-4d71a6e78f03.md)
settle these planned requirements. The transcript uses the collector's UTC date;
the discussion record uses the local 2026-10-14 date.

- **DEC-175:** extensions only. A missing core capability must be added to the core
  repository, as the user's note explicitly requires. Site-specific replacements
  of engine files are outside the supported model.
- **DEC-176:** consume library implementations as dependencies rather than copying
  them into every site. The subsequent round settles independent pins and rejects
  the proposed local-copy customization path.
- **DEC-177:** block both draft save and publication when the editor does not match
  the draft's engine or editable block/layout code. Preserve unsaved work for
  recovery; a matching local or deployed editor is needed to resume. This resolves
  the earlier unanswered mismatch question without requiring automatic migration.
- **DEC-178:** use the existing Archline example as the independent public pilot,
  excluding the engine from its repository. Other examples are not additional
  pilot sites by implication.

## Second submitted round — Q10–Q14

The [submitted answers](../journal/2026-10-13-grill-47541500-3fe6-4bc4-9cec-83fad35ad61c.md)
complete the scoped product interview:

- **DEC-179:** independently pin libraries and upgrade them manually, with
  verification and maintainer-owned migration where necessary.
- **DEC-180:** declare library sources and revisions in committed project
  configuration. Environment values supply credentials/deployment settings, without
  silently overriding library selections; the portal does not manage subscriptions.
- **DEC-181:** keep consumed library implementations unchanged. Use exposed
  settings/interfaces, and request deeper changes upstream in the library. The
  proposed local-copy and patch workflows were not selected. Sites may still
  author their own original extensions under DEC-175.
- **DEC-182:** Factory reset uses the developer-configured initial layout and that
  installed design's defaults. The engine supplies no implicit Starter fallback.
- **DEC-183:** the first shared library contains Archline and Intr. The proposal to
  move the entire existing catalog into it was not selected. Archline remains the
  only independent public pilot.

Exact configuration keys, packaging, public authoring imports and generation paths
are engineering decisions to validate against these requirements. Further grilling
is warranted only if engineering reveals a new consequential product tradeoff.

## User intent and constraints to explore

- Ideally, a site consists of its own content and configuration in its own Git
  repository, without committing the full QuineCMS engine.
- Some scaffolding and lightweight forked scripts are acceptable. Avoid requiring
  each site to maintain a full CMS fork or repeatedly merge upstream engine code.
- The initial idea is for a build script or workflow to obtain the main QuineCMS
  source, apply the site's content and configuration, then build the site.
- The workflow must be deployment-provider agnostic, including use on bare metal.
  The initial Netlify mention was explicitly withdrawn as a design constraint.
- Engine changes should be easier to distribute across sites. The subsequent
  direct answer selects manual, pinned engine upgrades as recorded above.

These capture the user's stated aims; the implementation choices below remain
open except where the direct answers settle them. Provider independence aligns with the
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
  quinecms.config.mjs   Library subscriptions, initial layout and build configuration
  package.json          Commands and engine dependency
  pnpm-lock.yaml        Resolved dependencies
  scripts/              Optional lightweight bootstrap scripts
  extensions/           Optional custom layouts, blocks and interactions
```

The optional extension directory is a proposed filesystem convention. The user
has selected site-owned extensions and separately consumed reusable libraries.
A site using only library designs might need just data/configuration
and its dependency declarations. Bundling public-site implementations into the
engine is excluded by the newly accepted engine scope.

The proposed build boundary is:

```text
Site records + configuration + assets + site-owned extensions
                          +
                Specified QuineCMS version
                          +
                 Specified library versions
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

Distribution and composition remain assistant proposals. Pinning, manual upgrades
and maintainer-owned migration are now selected; the remaining details below are
not accepted by implication:

- **Initial bootstrap option:** obtain a pinned engine commit or release in a
  disposable build directory, supply the site's inputs and run the engine build.
  Downloaded engine source would stay outside the site's committed files.
- **Package option:** distribute QuineCMS with shared development, validation and
  build commands, reducing the scripts copied into each site. A registry package,
  release archive or Git dependency are possible distribution mechanisms; no
  package name, registry or CLI contract has been selected.
- **Selected engine policy:** pin and manually change the site's engine version;
  maintainers handle resulting migrations. A lockfile plus validation and preview
  before deployment are recommended mechanics. Updating a release alone does not
  change deployed static output. Automated update tooling is outside the selected
  initial scope.
- **Development recommendation:** use the same engine selection and composition
  rules for local development and production builds.
- **Compatibility recommendation:** provide useful diagnostics and migration
  guidance without promising automatic migration. A failed upgrade should preserve
  the site's inputs; rollback must account for any content already edited under
  the newer engine. Exact mechanics remain open.

## Library contract and engineering consequences

The following combines the accepted behavior with source-derived engineering work;
no implementation or validation is implied:

- Resolve the selected, independently pinned dependencies during local development
  and builds. The portal shows installed definitions. Committed configuration owns
  library sources/revisions; environment settings must not override them (DEC-180).
- A library extension needs its field definitions, implementations, settings and
  policy modules, assets/styles and dependencies as applicable. The current theme
  components share helpers; extracting just individual block folders is incomplete.
- Configure library implementations through their exposed fields/interfaces.
  Deeper changes go upstream (DEC-181). Do not implement the previously proposed
  local-copy, patch or silent-override workflows. Original site-authored extensions
  remain supported and need identities distinct from installed library definitions.
- Identify library and site definitions unambiguously, and report missing/conflicting
  dependencies. Removing a library used by content must not silently substitute a
  different block/layout or delete content. CSS and assets must also work across
  multiple installed designs without unwanted global effects.
- With no built-in layouts, site creation/reset cannot assume Starter v1. A usable
  site must obtain a layout from its own code or a configured library before normal
  content creation, preserving the existing at-least-one-active-layout invariant.
  Reset resolves the developer-configured initial design and uses its defaults
  (DEC-182); reject an unresolved configuration instead of guessing another design.

## Preimplementation boundaries at bfbb522

The study below records the integrated prototype before implementation. The
[current engine contract](../features/site-engine.md) supersedes these assumptions
and documents the selected packaging and composition mechanics.

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

## Source study — 2026-10-14

Read-only inspection at `bfbb522` covered generation, custom layouts/blocks,
Astro configuration, encrypted editor assembly, GitHub/GitLab persistence and
example staging. These are observations and implications, not an implemented or
tested external-engine workflow.

- **Build composition is possible groundwork, not the whole change.** Generation
  mixes module-relative registry imports with working-directory paths for content,
  implementations and generated files. `scripts/admin-build.ts` also resolves the
  editor entry from the working directory. Each must agree on the assembled site.
  Astro supports configurable source, asset and output directories, but that does
  not automatically redirect QuineCMS's own scripts. See the
  [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/#srcdir).
- **A checkout-and-overlay build alone cannot publish through today's editor.**
  The generated source manifest contains engine files absent from a lightweight
  site repository. `checkPublication` rejects any mismatch. Draft loading/saving
  performs structural/schema checks and concurrency protection, but does not
  enforce that source comparison. A replacement must distinguish the editor's
  engine and site-code identity from content changes. The subsequent Q8 answer
  requires mismatches to block saving as well as publication (DEC-177).
- **Custom code already crosses the proposed boundary.** Layout settings import
  `core` types and `editor` widgets through relative paths; some blocks import
  shared theme implementations. Block dependencies are checked against one root
  package dependency tree. External customization therefore needs intentional
  authoring imports and dependency resolution, rather than arbitrary file copies
  silently overwriting engine internals.
- **Distribution is not established.** The engine repository was private at the
  initial study; the user subsequently made it public, confirmed by repository
  metadata. Its package has no engine CLI/export
  contract. Builds of an independently cloned site need an explicit way to obtain
  the engine and its dependencies. npm documents commit-pinned Git dependencies
  and install-time build handling, but this is not evidence that the current
  repository already works as an installable pnpm engine dependency. See the
  [npm Git dependency documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#git-urls-as-dependencies).
- **The example runner is a limited reference.** It copies the local builder and
  symlinks the existing `node_modules`; it does not prove a clean-machine install,
  independently selected engine version or lightweight-repository publication.
- **The encrypted editor remains part of each site's build.** It embeds the
  site's starting content, repository defaults and installed implementations.
  Serving prebuilt static output needs no engine checkout. The current build
  runtime is Node >=22.12.0 with pnpm 10.34.1; host independence does not mean a
  build can run without its toolchain or private dependency access.

The first form covered customization, updates, private access, scope and editor
mismatches. The user replaced it with the direct discussion recorded above.
Existing creative freedom (DEC-134), provider independence (DEC-142) and prototype
redesign permission (DEC-109) remain context. DEC-173 now specifies manual upgrades
and maintainer-owned migration for independent sites.

## Proposed engineering plan

This sequence interprets the settled requirements. It is not implementation
authorization or a promise that the proposed mechanisms already work.

1. **Define the engine-facing authoring boundary.** Export the existing record,
   field, block and layout contracts plus the portal controls extensions need.
   Replace relative imports into engine internals. Remove design-specific engine
   assumptions, including Starter reset/legacy handling and the Starter-specific
   usage-label branch in `src/editor/usage.ts`. Keep authoring interfaces documented
   without promising compatibility across manually selected upgrades.
2. **Provide shared commands operating on a site root.** Keep development,
   validation and production build logic engine-owned. The proposed starting point
   is an installable engine/CLI consumed from an exact public Git revision, avoiding
   a registry-release requirement for the pilot. Prove clean installation and
   dependency resolution before committing to packaging; a pinned checkout remains
   a possible implementation mechanism. Generated files/caches belong in disposable
   site build storage, not committed site code or a modified installed engine.
3. **Extract the Archline/Intr library.** Move the two designs' definitions,
   renderers, settings, policies, CSS, shared helpers and required design assets.
   Separate sample content/media from reusable presentation. Keep library and
   site-owned extension identity unambiguous, reject conflicting registrations and
   preserve correct shared framework dependency resolution. All installed designs
   remain available in the common catalogs (DEC-163).
4. **Assemble the independent Archline site.** Its repo owns records, configuration,
   site assets, dependency pins/lockfile and thin command wrappers. Configure its
   initial layout explicitly. Resolve generated registries/routes, public assets
   and the encrypted editor from the same site/engine/library inputs. Preserve
   current multiple-layout and collection/generic-page behavior.
5. **Replace the publication-only source check.** Compare the editor's built engine,
   library and site-code identity with the connected site's committed build inputs
   before both save and publication. Content-only changes must not create a code
   mismatch. Preserve stale-save protection and recoverable edits. Document the
   developer workflow for deploying a matching editor during a manual upgrade;
   a matching local editor can support that process without a host-specific service.
6. **Verify the complete pilot and document delivery.** Use the same commands in a
   fresh site checkout, local development and a clean production build. Serve the
   resulting static output through an ordinary static server. Keep build credentials
   in the build environment. Repository publication and hosting must be checked
   explicitly; mocked adapters do not establish live-provider behavior.

Before removing the nonselected demos from the engine working tree, preserve their
implementations, example records and assets in a recoverable versioned snapshot.
The initial library selection does not authorize discarding unrelated site content
or require a second maintained legacy library. Snapshot storage and cleanup are
transition details to document during implementation; converting those designs
into new independent sites is beyond the selected pilot.

### Pilot acceptance checks

- An independently cloned Archline repo installs its pinned engine and library
  without the maintainer's checkout, shared `node_modules` or copied engine files.
- The library exposes Archline and Intr in both relevant catalogs. Site-authored
  extensions coexist with them; engine/site boundaries remain intact.
- Public pages, collection detail routes and editor previews agree. Multiple saved
  layouts, activation guards, local assets and encrypted admin behavior still work.
- A content edit can save/publish normally. Changing the engine pin, library pin
  or site extension blocks writes from the old editor and retains unsaved work.
  A matching editor resumes without bypassing concurrent-change protection.
- Factory reset uses the site's configured initial design. Missing dependencies or
  duplicate extension identities fail clearly without deleting or substituting data.
- A manual incompatible upgrade fails verification with actionable diagnostics and
  leaves input files recoverable. Rollback documentation distinguishes restoring
  code from restoring content already migrated by the maintainer.
- A production build creates portable static output. A local/static-server check
  and any live Git/deployment checks report their distinct coverage and limits.

No further product questions are currently identified for this scope. Implementation is now authorized; the packaging and API choices below are undergoing engineering validation.

## References from the discussion

- [Astro deployment documentation](https://docs.astro.build/en/guides/deploy/)
  describes building static output and deploying it to a host.
- [npm dependency documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#git-urls-as-dependencies)
  describes package dependency sources, including Git references. These are
  available mechanisms, not a selected distribution contract for QuineCMS.
