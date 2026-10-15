---
title: Declared collection field rendering and Tessera
updated: 2026-10-16
status: Accepted and implemented locally
---
# Declared collection field rendering and Tessera

## Accepted scope

After the [initial interview](../journal/2026-10-15-grill-1d27e6e2-faf2-4ef3-8e00-6201a8fea76c.md),
the user discussed the contract in chat, approved it and authorized
work-until-grill. DEC-188 completes the existing `collectionField` contract.
The earlier proposal's separate multi-collection feature is dropped. Tessera's
homepage uses separate release and blog blocks. No consequential question remains.

The user requested a lean recreation of all navigation-linked reference pages,
with reusable designs/defaults in the library and an independent subscribed dev
site. Archline content was archived before replacement. Working destinations are
accepted: the source's broken CLI route points to Installation, optional sign-in
is unconfigured, and unfinished About/Status/Privacy/Terms links are omitted.

## Rendering contract

`Field.collectionField` already tells the editor which collection selector and
field types a mapping uses. Validation already checks selected paths and types.
Rendering now consumes the same declaration instead of recognizing only five
conventional names.

`contextFor(content, instanceId, definition?)` reads top-level declared selectors
from the matching block definition. For each selector it reads the collection ID
from `props[collectionKey]` and the path from `props[field.key]`, validates the
schema type, deduplicates paths per collection, and resolves them with the existing
`resolvePath`. Values remain in `context.collections[].entries[].values`, keyed by
selected path. For example, `bylineField: "author.name"` supplies
`entry.values["author.name"]` when that mapping declares the selected collection
and a compatible text field.

Blank optional or invalid selections expose no extra values. Publication
validation still reports invalid nonempty selections. A valid selected optional
field with no value is null. IDs, labels, links and media remain as before.
This projection is not a secrecy boundary; site content is public data.

Public generation and the admin live preview pass the matching definition. Calls
without one, or definitions without declarations, retain the five-field adapter
(`titleField`, `summaryField`, `imageField`, `dateField`, `urlField`). Catalog
contexts stay synthetic. Generic detail bindings are unchanged. No content format
migration, new admin screen, data store, query language or dependency is added.

## Ownership and upgrades

- Engine: `src/core/content.ts`, `scripts/generate-blocks.mjs`,
  `src/editor/LayoutSurface.tsx`, regression tests and contract documentation.
- Library: Tessera layout, 16 block versions, scoped CSS, local assets and an
  explicit starter preset. Listing selectors, sorting and visual behavior live here.
- Dev site: independent preset copy, three saved layout configurations and its own
  environment. The verified Archline archive is
  `backups/archline-20261016-050638/site.tar.gz` in that repository.

The local engine version is 0.3.0; library 0.2.0 requires that capability
(peer `^0.3.0`, manifest `>=0.3.0`). The dev site links both sibling sources during
authoring. These are local unreleased changes, not new remote pins. Existing pinned
sites, including the live Archline pilot, do not change automatically. Manual
upgrades must update compatible dependencies and rerun site checks; no universal
migration guarantee is implied.

## Lean reference adaptation

The preset generates 59 public pages from 12 page records and five collections.
It includes marketing, docs/API, blog/customer detail routes and release content.
Interactions use local search by title/path, theme switching, native disclosures,
pricing state, simple demo tabs and clipboard controls. Detailed animation,
external product services, persistent feedback and the combined updates widget
are omitted. Existing Markdown renders prose, parameter lists and code examples;
this is an editable recreation rather than Framer runtime reproduction.

See the [verification record](../verification/runs/2026-10-16-tessera.md) for actual
checks and limits. Earlier proposal/failure descriptions in the interview are
historical and superseded by this accepted implementation.
