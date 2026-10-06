---
title: Block library decisions and reference sites
updated: 2026-10-06
status: Round one resolved
---
# Block library decisions and reference sites

[Submitted answers Q60–Q65](2026-10-05-grill-821c1394-1fd0-47f5-a950-f71d9c006099.md) establish the following behavior. The static form and downloaded response were collected and cleaned up with the prepared grill-form scripts.

| Question | Accepted answer | Implication |
| --- | --- | --- |
| Q60 | Add immediately; separate Preview action | Clicking the main card inserts the block. Preview has a distinct control and does not mutate content. |
| Q61 | Static blocks plus useful generic counterparts now | The import includes meaningful schema-bindable variants in this phase, with page-kind filtering retained. |
| Q62 | Editable lists | Block lists support adding, removing and reordering items; fixed numbered slots are insufficient. |
| Q63 | Collection entries with field mapping | Blog cards select a collection, map display fields, and use entry routes. |
| Q64 | Configured external form endpoint | Contact/newsletter forms require a destination before publication. The external service owns delivery/response; previews must not submit real data. |
| Q65 | Shared site-wide footer configured once | Footer variants become shared site configuration instead of separate per-page content. |

## Reference sites

The user added six capability/design benchmarks. They want the builder to be capable of recreating sites like these. This is a directional requirement; no exact-clone deliverable, asset copying, or requirement to reproduce every backend service was stated.

Reviewed the current homepage content/navigation with the web reader on 2026-10-06 local time. This was a structural review, not a completed visual/motion audit. Observed patterns and inferred implications are separate below.

| Reference | Observed homepage patterns | Inferred block/editor needs |
| --- | --- | --- |
| [TDCX](https://www.tdcx.com/) | Service/industry/insight navigation, image-led service sections, case-study links, awards and CTAs | Varied split sections, service cards, proof/logo sections and collection-driven case studies |
| [Accenture](https://www.accenture.com/en) | Grouped multi-level navigation, editorial research cards with expansion controls, carousel control, video spotlights, awards and news | Shared navigation, editorial grids/carousels, media sections and reusable content feeds |
| [ASML](https://www.asml.com/en) | Nested navigation, product/technology sections, locations, careers and investor links | Structured navigation, media/content splits, location/card lists and multiple collection types |
| [Couchbase](https://www.couchbase.com/) | Product/solution/resource navigation groups, feature sections, customer proof combining quotes and metrics, partner links and resource cards | Feature layouts, quote/stat combinations, logo sections, mapped collection cards and shared navigation/footer |
| [Convex](https://www.convex.dev/) | Product hero, copyable setup content, feature/component descriptions, quotes, team and grouped footer links | Developer-focused content/code blocks, feature cards, testimonials and team layouts |
| [Source Network](https://source.network/) | Section-led product narrative, expandable technical explanations, product imagery and developer links | Flexible editorial sections, expandable content and support for specialized authored blocks |

The block selection should cover these composition patterns, rather than merely choosing three near-identical variants in each legacy category. Site fonts, content width and page gutter remain shared defaults. Distinctive art direction or advanced animations may require additional developer-authored blocks; those are not established by this structural review.

## Remaining consequential questions

- Q66: Whether the current import should add a shared configurable header/grouped navigation, alongside the accepted shared footer.
- Q67: Whether generic blocks may bind repeated content to structured list fields within an entry. This would extend the currently primitive/rich-text schema field set.
- Q68: How much control editors get over the visual appearance of each themed block.

These decisions affect the shared contract and should precede adapting dozens of blocks. No application implementation was performed in this discussion turn.

Q66–Q68 were subsequently resolved in [round two](2026-10-06-block-library-round-two.md). See the [consolidated scope](../discussions/block-library.md).
