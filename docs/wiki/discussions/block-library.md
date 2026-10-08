---
title: Block library implementation scope
updated: 2026-10-06
status: Implemented; verification recorded
---
# Block library implementation scope

This consolidates DEC-079–DEC-091 from the [request and inventory](../journal/2026-10-06-block-library-plan.md), [round one](../journal/2026-10-06-block-library-round-one.md) and [round two](../journal/2026-10-06-block-library-round-two.md). Implementation is now recorded in the [feature map](../features/block-library.md) and [implementation journal](../journal/2026-10-06-block-library-implementation.md). The scope below remains the accepted basis.

## Accepted behavior

- Every block belongs to one theme/design family and has multiple tags. A block theme is distinct from the site's existing light/dark mode.
- Add a block becomes a large searchable dialog: controls above a visual grid, searching/filtering by theme, tags and block name. DEC-129 supersedes immediate insertion: the primary card action opens an uncommitted New block/footer form with Create and Cancel. Preview remains a separate action. Page-kind compatibility and retained-version rules continue to apply.
- Reimplement approximately 3–5 distinct variants from each of the legacy library's 15 categories in the current block system. Adapt designs rather than copying Payload schemas/Astro components unchanged. Include useful generic counterparts now.
- Repeated block content supports adding, removing and reordering rows. Collection schemas gain structured list fields so one entry can hold items such as ingredients, specifications or FAQs. Generic blocks can bind compatible lists as well as the existing field types. Initial list rows use existing supported types; unrestricted recursive schema nesting is outside this increment.
- Blog layouts use collection entries and configurable display-field mappings. They link through the existing entry-route system.
- Contact/newsletter forms submit to an editor-configured external endpoint. A destination is required before publishing a submission form. Preview interactions must not send actual submissions.
- Configure the footer once for the site. Add a shared configurable header with grouped navigation and mobile behavior in this pass.
- Block editors expose content fields. Appearance follows authored themes and shared site settings; per-block visual override panels were explicitly rejected. Retained records/versions must remain readable rather than silently discarding existing data.
- The [six reference sites](../journal/2026-10-06-block-library-round-one.md#reference-sites) guide coverage and composition quality. No exact clone or reproduction of all backend services/advanced animation was requested.

## Engineering approach

The following choices implement the accepted scope and do not add requirements:

1. Extend definitions with stable theme/tag/catalog metadata. Keep the catalog lightweight instead of mounting every interactive block while browsing. Provide accurate visual previews and clear empty/reset states.
2. Add shared repeatable-field editing, serialization and validation, then schema-list compatibility and generic binding resolution. Use stable row identities for editing/reordering. Validate list structure and required child fields consistently in preview, draft and publication flows.
3. Add site-owned header/footer configuration and render it through the same source in public pages and page previews. Edit shared settings in Site; preserve the established page-only live-preview rule. Navigation must work with keyboard and on small screens.
4. Expose collection data required for card mappings while keeping credentials out of renderer context. Handle optional images/excerpts and invalid mappings visibly through existing validation.
5. Adapt a first set of three distinct variants per category: 45 base variants, including three shared Footer choices. Add useful generic counterparts where scalar or structured list bindings provide meaningful entry layouts. The grouped site header is separate from legacy Header sections, which are page-introduction layouts.
6. Verify the contracts and each category's content/rendering behavior, then exercise the large catalog, shared header/footer and representative page compositions in the browser. Run pnpm verify and record outcomes through the existing wiki workflow.

## Proposed initial selection

The variant names refer to the legacy reference directory. Final implementations receive current-system IDs, definitions, defaults and scoped rendering code. Selection may change when source inspection reveals unsupported or redundant behavior, while retaining category coverage.

| Category | Three contrasting reference variants |
| --- | --- |
| Bento | BentoThreeColGrid, BentoTwoRowGrid, BentoTwoRowThreeColGrid |
| Blog | BlogFeaturedPost, BlogThreeColImgs, BlogSingleColImgs |
| Contact | ContactCentered, ContactSplitImg, ContactSmFourCol |
| Content | ContentCentered, ContentSplitImg, ContentStickyScreenshot |
| CTA | CtaSimpleCentered, CtaSplitWithImage, CtaDarkPanelWithAppScreenshot |
| FAQ | FaqCenteredAccordion, FaqSideBySide, FaqThreeColumns |
| Features | FeatSimple3x2Grid, FeatWithProductScreenshot, FeatWithTestimonial |
| Footer | Footer4ColSimple, FooterSmCentered, Footer4ColMission |
| Header | HeaderCentered, HeaderCtrBgImg, HeaderWithStats |
| Hero | HeroSimpleCentered, HeroSplitImg, HeroImgTiles |
| Logo cloud | LogocloudSimple, LogocloudGrid, LogocloudSplitLogosRight |
| Newsletter | NewsletterCenteredCard, NewsletterSmSbs, NewsletterSmStacked |
| Stats | StatsSimpleGrid, StatsSplitWithImage, StatsTimeline |
| Team | TeamGridRoundImgs, TeamLargeImgs, TeamFullWidthVertImgs |
| Testimonials | TestimonialsSimpleCentered, TestimonialsSideBySide, TestimonialsGrid |

## Observable completion criteria

- Search and combined theme/tag filters find the expected matching variants; zero results and reset work; keyboard users can browse, preview and add. Preview and Add do not insert; Create inserts exactly once, Cancel leaves content unchanged, and dedicated editor levels are preserved.
- Lists survive reorder/edit/delete, serialization and reload. Schema list editing and bindings preserve correctly typed values; invalid mappings/values fail at the appropriate validation phase. Empty and missing optional content has intentional rendering behavior.
- Collection-backed cards reflect entry fields and valid routes. Shared header/footer changes appear across static pages, generic entry routes and page previews.
- Form submission reaches the configured endpoint in a controlled test; no real submission is sent from editor/catalog previews. Missing endpoint and server errors are handled honestly.
- All included variants are independently selectable and have distinct layouts. Public output and live preview agree; small screens, long text, absent optional media and multiple instances remain usable. Theme styles stay scoped away from Kumo admin controls.
- The library follows the existing shared-runtime/static-output contract and site typography, content width and gutter defaults. Full checks and recorded browser checks pass; live-provider limits remain explicit.

The interview itself changed no application code. The subsequent authorized implementation and its limits are recorded in the [verification report](../verification/runs/2026-10-06T1320Z-block-library.md).
