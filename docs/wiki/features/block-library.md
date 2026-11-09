---
title: Searchable block catalog
updated: 2026-11-09
---
# Searchable block catalog

**ID:** FEAT-block-library

## Entry points and prerequisites

Open **Pages → a page → Add block**. The catalog opens in an editor panel and
lists definitions installed through libraries or original site extensions.
There is no bundled collection of designs. A layout's custom settings may also
use the catalog for blocks declared with footer placement.

## Search and compatible choices

Search matches all entered terms against names, themes and tags, ignoring case.
An optional theme filter and selected tags combine with the query; every selected
tag must match. **Reset filters** clears all three. **All themes** is the default,
independent of the page's assigned layout.

The catalog shows definitions compatible with the page kind and requested
placement, selecting the latest nondeprecated version of each type. Existing
records retain their saved versions. Tags describe content or purpose; tags that
repeat the theme name are suppressed. Missing theme metadata is displayed as
**Uncategorized**.

## Preview and creation

Cards render definition defaults with sample context and expose a separate
Preview action. Device choices show desktop/mobile samples without changing the
site draft. Choosing a block opens **New block** with its fields; only **Create
block** inserts it. Cancel discards the candidate. During page-block creation,
the page preview also renders pending fields in the current layout. See the
[creation contract](editor.md#creation-forms-dec-129).

The catalog has a fixed heading/close row and one scrolling body for filters,
results and sample preview. Tags scroll horizontally, with arrow controls that
respect reduced motion. Empty results explain how to reset the filters.

Rendered thumbnails load on first visibility and stay mounted when scrolled away.
Filtering them out, opening a full preview or closing the catalog releases them.
This avoids repeated mounting on return scrolling; memory grows with visited
cards until release. Renderer authors remain responsible for pausing unnecessary
animation or work in their own blocks.

## Boundaries

The capability is discovery and selection of installed definitions. Block counts,
Hero/FAQ/Blog variants, form submission components, navigation menus and footers
belong to the supplying library or original site. No CMS-wide design system is
imposed on their public appearance.

Typed field bindings and collection-field projections are engine capabilities
covered in [Generic pages](generic-pages.md) and the
[content model](content-model.md#routes-and-presentation). Repeated editing and
sorting follow the [editor contract](editor.md). DEC-082–DEC-091 established the
catalog; DEC-129, DEC-163 and DEC-172–DEC-183 revise creation and installation.

## Checks and evidence

[Check recipes and dated evidence](../verification/features/block-library.md).
