---
title: Block library implementation
updated: 2026-10-06
status: Implemented; local verification recorded
---
# Block library implementation

The user authorized the [accepted scope](../discussions/block-library.md). The [feature record](../features/block-library.md) now describes the implemented behavior. No existing content fixtures, retained block versions, provider credentials or deployments were changed.

## Changes

- Added a searchable visual Kumo catalog with combined theme/tag filters, direct insertion and separate responsive previews. Visible-card observation bounds rendering work.
- Added repeatable block fields, one-level schema lists, compatible generic bindings, stable row identities and typed publication checks. Existing drag/keyboard ordering is reused.
- Added 45 base and 27 generic Tailwind UI variants. Definitions remain explicit versioned JSON and thin renderer entry points; category renderers share scoped theme helpers/styles. This replaces the legacy Payload schemas and Tailwind utility markup with the current fields/context/renderer contract.
- Added collection-backed blog mappings, native endpoint forms, shared grouped header and site footer settings. Public output remains static for these layouts, including disclosures and forms.
- Made generated output idempotent: unchanged files stay in place and obsolete generated files are pruned afterwards. A dev server no longer sees the whole registry deleted during regeneration.

## Reference mapping

Each category has current IDs `tw-<category>-1`, `-2`, `-3` in the order below. Generic equivalents add `-generic`. These are design references; implementation and defaults were rewritten.

| Category ID | Legacy layout references |
| --- | --- |
| hero | HeroSimpleCentered; HeroSplitImg; HeroImgTiles |
| header | HeaderCentered; HeaderCtrBgImg; HeaderWithStats |
| content | ContentCentered; ContentSplitImg; ContentStickyScreenshot |
| cta | CtaSimpleCentered; CtaSplitWithImage; CtaDarkPanelWithAppScreenshot |
| bento | BentoThreeColGrid; BentoTwoRowGrid; BentoTwoRowThreeColGrid |
| features | FeatSimple3x2Grid; FeatWithProductScreenshot; FeatWithTestimonial |
| faq | FaqCenteredAccordion; FaqSideBySide; FaqThreeColumns |
| stats | StatsSimpleGrid; StatsSplitWithImage; StatsTimeline |
| team | TeamGridRoundImgs; TeamLargeImgs; TeamFullWidthVertImgs |
| testimonials | TestimonialsSimpleCentered; TestimonialsSideBySide; TestimonialsGrid |
| logos | LogocloudSimple; LogocloudGrid; LogocloudSplitLogosRight |
| blog | BlogFeaturedPost; BlogThreeColImgs; BlogSingleColImgs |
| contact | ContactCentered; ContactSplitImg; ContactSmFourCol |
| newsletter | NewsletterCenteredCard; NewsletterSmSbs; NewsletterSmStacked |
| footer | Footer4ColSimple; FooterSmCentered; Footer4ColMission |

Generic counterparts cover hero, header, content, bento, features, faq, stats, team and testimonials. The contact department layout includes a working form as well as its repeated contact details. Media uses uploaded assets or local CSS artwork, rather than legacy remote stock placeholders. Forms use native navigation to the endpoint response, avoiding a false success state or a new server/CORS dependency.

## Verification

See the [run report](../verification/runs/2026-10-06T1320Z-block-library.md). Browser inspection found and fixed catalog flex/grid collapse, preview stacking above a dialog and a toolbar selector affecting Kumo button content. Automated checks also caught missing schema input labels and a preview-navigation regression; both were repaired. All 89 tests, type checks, static build and artifact checks pass. The final production-browser smoke check was blocked when the native UI tool lost window access; the preceding development browser checks and production artifact checks are recorded separately.
