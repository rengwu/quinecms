---
title: Static pages and registered blocks
updated: 2026-10-06
---
# Static pages and registered blocks

**ID:** FEAT-static-blocks

## Intent and basis

The [accepted block contracts](../discussions/technical-contracts.md) require static public HTML, shared dependencies, retained block versions, and one renderer source for public and preview paths.

## Entry points and prerequisites

Run the [standard setup](../verification/setup.md). Public fixtures are `/`, `/blocks/`, `/journal/`, and `/journal/a-slower-way-to-build/` and `/journal/keep-the-essentials/`. Developer registrations live in `blocks.config.mjs` and `src/blocks/<name>/vN/definition.json`.

## Expected outcomes

Astro generates static-page routes and assigned collection-entry routes with imports for only their used blocks. Generic pages themselves have no public route; collection indexes require an explicit static page. See [generic pages](generic-pages.md). React/Svelte/Vue use Astro hydration; vanilla modules expose render/mount with matching activation timing. Preview mounts immediately. Root dependency pins and manifest compatibility checks govern all retained implementations. Framework/runtime modules have one emitted implementation and shared URLs. Public routes never load the editor, GitHub client, or R2 client. Styles are scoped; the shell owns resets.

DEC-075 adds **Site → Content max-width (px)**, persisted in `site.globals.contentMaxWidth`. Omitted or cleared values use 1200px. Public output and preview inherit `--site-content-max-width`; starter block containers and header/footer follow it, while blocks may retain narrower text measures or opt out. Admin workspace widths are unaffected.

DEC-078 adds Site → Typography (separate body/heading font selectors, body size and unitless line height) and Layout → Page gutter. These persist with content, survive tab recovery, and apply equally to public HTML and page previews. Fonts use built-in stacks; defaults are system sans, 16px, 1.6 and 24px gutter. The starter blocks follow these shared styles without affecting admin controls. [Contract](../discussions/technical-contracts.md#block-source-contract-and-styles).


## Verification recipe

1. Run `pnpm verify`. Build inspection checks static output, referenced assets, unique runtime modules, and absence of editor/provider code in public graphs.
2. Open `/blocks/`. Activate **Code** on the first Tabs block; the second block should remain on **Content**. Use arrow keys between tabs.
3. Open `/`. The Svelte **Add one** button increments its counter; the Vue question toggles its answer. The vanilla quote renders without activation.
4. Open the journal index and entries with JavaScript disabled: their visible content should remain complete. The artifact check establishes zero JavaScript module references for these fixtures; a final browser JavaScript-disabled check is unvalidated.
5. In Site settings enter 680 for Content max-width. Open Pages → Home and inspect the centered content and full-width Hero background; switch to Journal entry to check generic blocks. Return to Site and reload: the value persists. Clear it to use 1200 again. Invalid nonpositive values must fail Save/Publish validation. Discard browser test edits when finished. The built public HTML must expose the value from `content/site.json` without client JavaScript.

6. In an isolated admin tab, choose Arial body/Georgia headings, body size 18, line height 1.8 and gutter 40. Navigate to Home and the generic Journal entry preview; inspect font separation and horizontal insets. Reload, return to Site and confirm settings persist. Clear numeric overrides to restore defaults. Close the test tab without provider saves.

## Coverage and limitations

Build graph checks establish emitted sharing, not a browser network trace. Reactive adapter updates/destruction have React/Vue unit coverage, and Svelte preview interaction was observed during implementation. The last public React interaction check was blocked by the native browser tool. Alternate renderer sources/parity fixtures are not implemented; all supplied blocks share source.

## Verification history

- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md), dirty tree based on `f699352`; final source manifest is linked in the report.

- [Generic pages and schema-only entries](../verification/runs/2026-10-05T1650Z-generic-pages.md).

- [Shared content width and development reloads](../verification/runs/2026-10-05T1735Z-content-width.md).

- [Site typography and page gutter](../verification/runs/2026-10-05T1810Z-site-design.md).
