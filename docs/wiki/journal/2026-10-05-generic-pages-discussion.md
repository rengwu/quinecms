---
title: Generic pages and schema-only entries
updated: 2026-10-05
status: Accepted; subsequently implemented
---
# Generic pages and schema-only entries

The user corrected the collection/page model and explicitly requested discussion before implementation, followed by a grill-form interview. The following requirements come directly from that instruction; implementation has not started.

- Collection entries contain only their schema-defined fields, not an independent block list.
- Pages have two types: static pages with predefined content, and generic pages used as templates for collection entries.
- Generic pages permit only a special set of generic blocks; normal blocks cannot be added there.
- Each generic-block field can optionally bind to a parameter-name string. A matching collection field key supplies that entry's value.
- A collection schema can optionally select a generic page.

DEC-058–DEC-061 preserve these requirements. This supersedes the entry-block part of the previous design, while retaining the Pages-only live-preview boundary and the standard Content/schema admin views.

## Round-one outcome

The [round-one answers and interpretation](2026-10-05-generic-pages-round-one.md) settle Q48–Q55 as DEC-062–DEC-069. Templates are reusable; untied collections are data-only; entry URLs belong to collections; indexes require static pages. Invalid bindings block publication, empty optional values use a fixed fallback, rich-text fields include images/YouTube, and previews use placeholders rather than real entries.

## Round-two outcome

The [round-two answers and interpretation](2026-10-05-generic-pages-round-two.md) settle Q56–Q59 as DEC-070–DEC-073. Static index pages match collection prefixes by URL. Include a basic collection-list block; initial rich-text embeds are uploaded images and YouTube. The user wants completely new entries and does not need the existing demo entries, so implementation may replace those fixtures instead of migrating their blocks.

The scoped interview is complete. Concrete format and rendering changes are the next engineering work; the accepted behavior is consolidated in the [agreed design](../discussions/agreed-design.md).

Only discussion records and the prepared questionnaire are authorized in this phase. Do not treat questionnaire completion as authorization to implement the redesign.

## Subsequent implementation

The user authorized implementation on 2026-10-06. See the [implementation journal](2026-10-06-generic-pages-implementation.md) and its verification run. The discussion-only restriction above records the earlier phase.
