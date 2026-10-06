---
title: Site Layout and chartr implementation
updated: 2026-10-06
status: Implemented; bounded verification recorded
---
# Site Layout and chartr implementation

After the completed interviews, the user said “lets go”, authorizing the Site Layout foundation followed by the chartr recreation. DEC-092–DEC-107 remain the product decisions. During implementation the user supplied header/footer editing screenshots and required dedicated navigation levels everywhere; DEC-108 records that correction.

Implemented one active layout ID/version/settings record, source registry, shared public/preview wrapper, author-owned settings and validation, retained version selection, candidate preview, and hidden whitelist. Core Settings now contains width/gutter, Backups and Session. Starter preserves legacy options on first conversion. Different layout/version selections reset to defaults while preserving content; there is no inactive settings cache. Optional block styling remains unrestricted.

Engineering choices are React wrappers/settings components, a pure policy module, optional server Head, JSON settings, CSV `SITE_LAYOUT_WHITELIST`, configuration errors for empty/unknown lists, and independent installed/picker registries. These implement accepted behavior without recasting earlier recommendations as user decisions. Automatic settings migrations were not added.

The chartr phase ports nine independently registered blocks, the shared header/footer and website appearance, and source-native DOM demos. Live chartr.dev supplied v0.3.0 release copy/destinations where local source was older. Shared demo primitives, motion, themes, icons/fonts and notices are retained in versioned folders. The reference repository was not modified. The sample page and optional backup preserve the existing builder content.

A common inspector navigation outlet now renders nested list editors at a dedicated level. Parent forms stay mounted for values but are hidden from display and accessibility; only the active level is visible. Back unwinds one level, focus moves to the level heading, and area/document/layout changes clear the level. This applies to reusable fields across layouts, blocks, entries and schema defaults, not just the two reported links.

Verification found and repaired an unlabeled Starter title input and a mobile-menu keyboard focus gap. The typography regression test was scoped to the open select's controlled popup to avoid selecting a stale option during close animation. A test fixture using unsupported recursively nested collection schema fields was corrected to exercise the supported nested header structure instead; this did not expand collection schema scope.

See [Site Layouts](../features/site-layouts.md), [chartr](../features/chartr.md) and the [verification report](../verification/runs/2026-10-06T1140Z-site-layouts.md). No provider writes or deployment were performed. The normal development instance is left running for review; the separate production fixture server is temporary.

## Development-server follow-up

The user subsequently reported a generated Head import failure on the long-running dev instance. The file existed and production builds were valid, but public dev routes returned 500 until the daemon was stopped and restarted. The [repair verification](../verification/runs/2026-10-06T1222Z-layout-dev-restart.md) records reproduction, four recovered routes and browser interaction checks. Future handoff checks must include the final running development public routes after adding generated modules.

## Imported block spacing follow-up

The user compared the chartr reference with the imported page under Starter and reported missing content width and spacing. The imported blocks depended on the chartr layout's outer container. Each block now owns its centered bounds and consumes the shared width/gutter variables; the chartr layout avoids adding another container. Header/footer bounds and responsive breakpoints follow the same geometry. The optional example backup uses the reference's 1512px/40px settings; the existing site's 1200px/24px values remain intact. This repairs the accepted independent-block and shared-geometry behavior without introducing a new product decision.

The [spacing verification](../verification/runs/2026-10-06T1426Z-chartr-spacing.md) records Safari checks under both layouts, custom width/gutter settings, the mobile preview, successful development routes and all 132 passing tests. Only an owned browser tab's draft was changed during inspection; no content save, provider write or deployment occurred.
