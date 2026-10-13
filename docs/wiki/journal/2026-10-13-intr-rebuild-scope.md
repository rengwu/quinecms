---
title: Intr Studio recreation and findings
updated: 2026-10-13
status: Implemented and locally verified
---
# Intr Studio recreation and findings

The user requests a second reference-site trial using
[Intr Studio](https://intrstudio.framer.website/), with study and discussion first.
The [submitted answers](2026-10-12-grill-3032223a-1a9b-4ec9-a4eb-45ccc1d071f8.md)
settle the scope below. The transcript uses UTC; this record uses the workspace's
local date. The subsequent `work-until-grill` instruction authorized implementation
through verification and records.

## Accepted scope

- Recreate the homepage, project listing, and one sample project detail page.
  Recreating all five project detail pages was not selected.
- Add a separate Intr example alongside Quine; preserve the active demo.
- Reuse the reference branding, copy, and images, correcting obvious placeholders.
- Follow the direct brief: a slick, simple static site, with content layout taking
  priority over motion. Intro animation, video, and other effects may be cut.

These choices are DEC-153–DEC-155 in the [decision register](../decisions/index.md).
The isolated example is now implemented. Run `pnpm example:intr`; see the repository's
`examples/intr/README.md` for the client editing map and source/browser boundaries.

## Observations from the reference

The live homepage, project index, one detail page, and selected phone-width views
were inspected in the user's browser. This is a design study, not verification
of a rebuild. The strongest visual features are the uneven project grid, offset
image pairs, checkerboard features/partners, dark services section, and large
photographic panels. The loaded hero used an image; no active video element was
found. Some content waits for scroll reveals, service descriptions appear on
hover, and the detail page has a draggable gallery. Supporting hero text is very
small at phone width. Some template copy is inconsistent with its project metadata.

## Implementation — engineering choices

The Intr layout and eleven named blocks use existing contracts. Editorial copy,
images, lists, links and section ordering are editable; design geometry remains
source-maintained. The ordinary records live in `examples/intr/content`, with a
matching importable backup. The runner now accepts each example's own layout and
fixture credentials rather than hardcoding Quine. Root content remains intact.

A data-only Projects collection stores five project cards. Homepage and listing
blocks select entries through ordered references; the footer reads the same
collection. Only Maison Dorée has a detail URL. Its static detail page owns its
story, hero metadata and galleries separately. Other cards remain visible without
detail links. This produces exactly three public routes without inventing pages
for the remaining projects. These are engineering choices within the agreed scope.

The rebuild keeps the uneven grid, offset image pairs, checkerboard sections,
dark services, floating glass navigation and photographic contact panel. It uses
ordinary scroll, visible content, still images, readable mobile type, visible
service descriptions and static galleries. The native details menu works without
JavaScript; the shared layout hydrates close-on-link/Escape behavior. Section
blocks do not hydrate. This layout chooses `activation: load` for those menu
behaviors; the existing contract also supports `never` for a server-only layout.

Twenty-seven images and three Inter Display weights are local, with responsive
variants, metadata, source URLs and the font license. Branding, section labels,
hero copy and the sample pull quote retain the reference. Supporting copy is
adapted for clarity; inconsistent size/location claims and unrelated footer copy
are corrected. Partner placeholders become editable categories. Reference contact
details and statistics remain demo content, not independently verified claims.

## Small capability fix and instruction improvements

- `contextFor` already provided selected title/summary/image/date fields to
  static collection blocks, but omitted a selected URL field. It now includes
  `urlField`. Intr uses it for optional links to static detail pages; tests cover
  shared edits, missing links and unsafe URL rejection. No query language or
  routing model was added.
- The [authoring guide](../features/local-authoring.md#recreating-an-existing-site)
  now contrasts Quine's block-owned projects with Intr's shared entries, explains
  the limited card-field adapter, and describes static detail ownership.
- The example's editing map names client destinations and source-maintained
  choices. It explains that adding a data-only entry does not create a page and
  that reference rows select shared content rather than edit it inline.
- Responsive-image guidance now covers tall cover crops. The first phone check
  selected an undersized source; the hero/contact sizes hint was corrected and
  the phone hero rechecked after a fresh load.

## What this trial teaches us

The structure supports this design without a new page-builder model: custom
layout geometry, ordinary blocks, local assets and shared entries were enough.
The main friction is finding and following those capabilities, not expressing
the visual composition. Collections proved useful once content appeared in more
than one place, even when most entries had no detail page.

Potential follow-ups, in priority order, are **proposals**, not additional work
approved by this trial:

1. **Show project names in reference rows.** The ordered list currently shows
   Item 1–4; a client must open each row to learn which project it selects.
   Deriving a label from the referenced entry would make ordering much clearer.
2. **Explain where shared content is edited.** The block description/editing map
   can explain Content → Projects, but the active block form does not show that
   description. A small guidance surface or explicit destination could reduce
   hunting without introducing inline editing or changing its settled contract.
3. **Make rendering data access easier to discover.** The conventional mapping
   keys are easy to miss in `contextFor`. Documenting them was sufficient here;
   a future design should assess whether explicit manifest mappings are useful
   before adding general data queries.
4. **Make example staging and asset records easier to maintain.** Staged checkouts
   intentionally do not follow source edits. Asset variants, metadata and backups
   also require coordination. A small asset-metadata helper and clearer source
   refresh handoff would save more work than a migration framework.
5. **Review the public navigation cost.** All Intr section blocks are static,
   yet its hydrated React layout brings roughly 84 KB gzip of page JavaScript.
   The builder already supports `activation: never`; no new contract is needed.
   A future pass could use it with a small public menu script, or accept native
   manual menu closing. Make this choice visible in author guidance before
   assuming that every interactive layout should hydrate React.

Existing browser-to-files handoff proposals remain relevant. No new storage,
sync, account, query or deployment system was introduced.

Continue noting concrete authoring/discoverability friction during the trial.
The existing policy of discussing larger CMS changes first remains applicable;
this interview does not approve a wider builder redesign.

## Verification and limits

The [verification report](../verification/runs/2026-10-13-intr-rebuild.md) records
207 passing tests, clean type checks, root and isolated production builds, backup
and local-asset checks, and representative Chrome desktop/phone/editor inspection.
Live title edits, shared project changes, reference ordering and pending-block
preview/cancellation were exercised and restored. The trial is not pixel-perfect
or cross-browser certification. No remote save, publish, R2 upload, hosting or
email delivery was exercised. No commit or deployment was requested.
