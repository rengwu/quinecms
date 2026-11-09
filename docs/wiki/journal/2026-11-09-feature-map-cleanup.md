---
title: Feature map documentation cleanup
updated: 2026-11-09
status: Applied
---
# Feature map documentation cleanup

The maintainer directed “apply it” after the
[feature-map interview](2026-11-09-grill-cbd5005e63f65a81e0129a6bc195227c.md).
This applies [DEC-252–DEC-257](../discussions/feature-map-scope.md) to the wiki.

## Changes

- The [feature map](../features/index.md) groups twelve CMS capability areas and
  names their concrete subfeatures. Developer functionality is included.
- [Trials](../trials/index.md) separates Kahf, chartr, Quine, Tessera, Archline and
  Intr from engine functionality. Kahf/chartr pages moved out of Features;
  historical IDs remain in evidence and are not reused.
- [Guides](../guides/index.md) contains local authoring and installation/upgrades.
  `FEAT-local-authoring` now describes its actual CLI/development/validation
  capabilities, linking the workflow guide separately.
- [Feature checks](../verification/features/index.md) holds current recipes and
  earlier coverage/history extracted from each contract. Original recipes are
  explicitly historical; reorganized recipes are not presented as executed runs.
- The wiki home now navigates these distinct areas. Its previous chronology is
  retained in [Project updates](project-updates.md), labeled historical.
- Affected Markdown links were repaired, including link-only corrections in
  README and AGENTS. Historical run observations and evidence files were not
  rewritten; moved links now resolve to their new records.

## Source audit

The review used engine revision `6a17b535019d42e4b5011d8cb2b210268f04e461` with
only the interview documentation pending at the start. It compared current
contracts with source, existing tests and accepted decisions. It did not change
application code, client content, dependency pins or installed libraries.

| Contract | Source and test definitions reviewed | Main correction or retained boundary |
| --- | --- | --- |
| Content model | `src/core/types.ts`, `schema.ts`, `bindings.ts`, `content.ts`; `tests/content-model.test.ts`; editor schema/reference/usage controls | Current screen/panel navigation; no bundled importable example; declared collection-field projections separated from Tessera. |
| Static pages/blocks | CLI/generators, core types/content, activation/adapter and block-generation tests | Remove bundled routes, legacy `blocks.config.mjs` author registration and mandatory Starter typography; installed extensions own designs. |
| Generic pages | `src/core/bindings.ts`, entry fields, template tests and entry-preview decisions | Installed listing definitions rather than a universal Collection list; actual routed-entry previews versus generic placeholders; current preview workspace. |
| Block catalog | `src/editor/catalog.ts`, `BlockCatalog.tsx`, `BlockCreation.tsx`, catalog tests | Search/filter/creation is the capability; remove fixed variant counts, Kumo, Starter footer and bundled form/header promises; fallback theme is Uncategorized. |
| Site Layouts | Layout types/contract, `SiteLayouts.tsx`, `LayoutCatalog.tsx`, multiple-layout tests | Current Layouts destination; independent configurations and assignments; design-owned settings; no repository setup form or mandatory spacing panel. |
| Editor | Navigation/App, panel and preview components/styles, recovery/Markdown and editor test definitions; DEC-234–DEC-250 | Remove obsolete drill-down/Back-button contract and inline test narratives; retain staged creation, recovery, backups, preview limits and reset boundaries. |
| Media | `src/admin/storage.ts`, `src/integrations/media.ts`, media controls and tests | Preserve configuration/credential boundary and local-media support; move dated grid/upload observations to evidence. |
| Languages | `src/core/types.ts`, language test definitions, DEC-251 | Preserve type-based localization defaults, sparse copies, fallback and shared composition; separate Kahf behavior from engine limits. |
| Publishing | GitHub/GitLab/repository adapters, build Git configuration and transaction tests | Replace Kumo toast claim; preserve exact-snapshot/source/stale guards; keep live-provider evidence separate. |
| Encrypted admin | `src/admin/crypto.ts`, login/build source and encryption/session tests | Retain actual KDF/cipher, unlock/storage and shared-credential limits; separate checks from behavior. |
| Engine/extensions | `scripts/site-workspace.mjs`, manifest/types and block-generation tests | Capability contract separated from installation/upgrades; catalogs derive from installed compatible definitions; no sample library is implied. |
| Local development | `bin/quinecms.mjs`, `scripts/validate-content.ts`, `dev-watch.mjs`, local-authoring test definitions | Document actual CLI commands, validation modes and reload; no universal site `verify` script or browser-to-filesystem save. |

The shared verification setup also no longer assumes bundled public fixture
routes or Starter/chartr availability. Engine tests own their fixtures, while
manual checks need an explicitly isolated site.

## Validation and limits

Completed documentation checks:

- `node docs/wiki/_build.mjs` rebuilt the reader with 249 pages.
- `node docs/wiki/_build.mjs --check` passed internal links and reader freshness.
- `git diff --check` passed.
- A structural audit confirmed twelve unique feature IDs, every contract in the
  map, a separate check page for each, existing referenced test files, and no
  links to the former Kahf/chartr feature paths.
- `node bin/quinecms.mjs --help` confirmed the documented command names.

Visual reader review was attempted through the browser tool but could not run:
the browser access host was unavailable. No visual pass is claimed. The reader's
HTML/CSS implementation was unchanged.

No application test suite, new browser CMS journey, or live Git/R2/hosting check
was run for this documentation-only change. Listed tests were inspected to ground
contracts and recipes; their presence is not a newly passing result. Historical
trial/provider observations retain their original build and scope limits.
