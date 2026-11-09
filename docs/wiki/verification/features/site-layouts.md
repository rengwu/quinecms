---
title: Site Layouts checks
updated: 2026-11-09
---
# Site Layouts checks

Contract: [Site Layouts](../../features/site-layouts.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/multiple-layouts.test.ts tests/layouts.test.ts tests/editor-navigation.test.ts
```

Create two configurations of an installed design, edit settings independently and assign pages. Verify usage counts, Cancel, confirmed design/version resets, protection of used and last-active configurations, unused incomplete layouts, and generic-entry inheritance. Build pages using different installed designs and compare public output with editor preview.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-10-14). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification recipe

1. Customize Archline width/gutter, preview Intr and close it. Confirm the candidate uses its own defaults and the draft is unchanged. Confirm changing the design to Intr, then Archline: each uses its defaults while content remains intact. Verify custom width, zero gutter, cleared overrides and recovery.
2. Check Pages and Site Layouts previews with static and generic pages. Visit Settings, Content, schemas and Media to confirm their normal admin layout.
3. Open header/footer list items and a nested dropdown item. Each replaces all parent controls; Back returns exactly one level. Use the same behavior for block lists, entry lists and schema default rows.
4. Recover a tab and export/import a backup. Confirm every layout ID/name/active state/design/settings and page assignment round-trips; legacy settings remain intact.
5. Open Add layout or Change design and verify all installed themes appear. Switch layouts and reopen the catalog: all remain available. Open a page’s Add block catalog and confirm blocks from other themes remain selectable.
6. Install a newer retained version beside an older selected one. Confirm public rendering and both settings/preview loaders stay pinned until explicit selection. Run `pnpm verify`.

7. Create two instances of Archline, edit their settings independently and reassign a page. Check counts, page preview and usage links. Cancel creation/design resets/deletion and confirm no unintended change.
8. Verify used layouts cannot be disabled/deleted, generic pages count without entries, the last active layout is protected, and unused incomplete layouts do not block publication. Build pages using different designs and check their wrappers, titles, spacing and assets.

## Verification history

- [Admin rework](../runs/2026-11-07-admin-rework.md): new shell, nested creation panels and shared preview workspace.

- [Multiple layout configurations](../runs/2026-10-13-multiple-site-layouts.md): lifecycle, assignments, validation, recovery and per-route builds.

- [Card hover and aligned catalog headers](../runs/2026-10-08-layout-catalog.md): automated checks pass; selected browser checks are partially incomplete.

- [Layout-owned spacing](../runs/2026-10-08-layout-spacing.md). Covers per-layout defaults, overrides, switching, candidate previews, validation and persistence.

- [Explicit creation forms and cancellation](../runs/2026-10-08-creation-forms.md).

- [chartr content width and spacing repair](../runs/2026-10-06T1426Z-chartr-spacing.md). Shared geometry applies under both layouts; chartr header/footer and block containers use consistent bounds without duplicate padding.
- [Generated layout Head dev-server repair](../runs/2026-10-06T1222Z-layout-dev-restart.md).

- [Site Layout foundation, chartr and dedicated navigation levels](../runs/2026-10-06T1140Z-site-layouts.md). Automated retention/version/whitelist checks and bounded Safari browser observations; live providers are separate and untested.


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; the maintainer subsequently [confirmed the full hosted connection, edit, draft save, publish and live deployment flow](../../journal/2026-10-14-pilot-acceptance.md). This final signed-in evidence is user-reported; pilot delivery is accepted.
