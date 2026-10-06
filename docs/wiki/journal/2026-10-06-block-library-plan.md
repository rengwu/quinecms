---
title: Block library and Tailwind-inspired catalog
updated: 2026-10-06
status: Exploring
---
# Block library and Tailwind-inspired catalog

The user requested a larger Add a block dialog with search/filter controls above a block grid. Each block belongs to one theme and has multiple tags; theme, tags and block name must be searchable/filterable. Tailwind UI is the example theme, with hero/header as example tags.

The user also requested adapting approximately 3–5 blocks from every category in the previous astro-payload TailwindBlocks library. They must be refitted to the current system rather than copied verbatim. The current turn invites questions before implementation.

## Inspected source

Reference directory: `/Users/rengwu/Desktop/Projects/astro-payload/sites/default/astro/src/blocks/components/TailwindBlocks`.

Counting variant directories with schema.ts gives 123 blocks in 15 categories:

| Category | Variants |
| --- | ---: |
| Bento | 3 |
| Blog | 7 |
| Contact | 7 |
| Content | 7 |
| Cta | 11 |
| Faq | 7 |
| Feat | 15 |
| Footer | 7 |
| Header | 8 |
| Hero | 12 |
| LogoCloud | 6 |
| Newsletter | 6 |
| Stats | 8 |
| Team | 9 |
| Testimonials | 10 |

Representative reads: HeroSimpleCentered, FeatSimple, BlogThreeColImgs, NewsletterSmSbs and Footer4ColSimple. The old code uses Payload array/group/upload fields, Astro renderers and Tailwind styles. Several newsletter forms have no submission action. Footer variants contain nested navigation lists. These are reference designs, not compatible current-system block modules.

The current block Definition has no theme/tags/thumbnail metadata. Its catalog filters by page kind and latest nondeprecated version and immediately inserts on click. Current block fields support primitive fields and custom widgets, but no standard repeatable groups. Collection-list context currently exposes entry titles/links only. The public shell has its own header/footer. These facts make list authoring, blog data, form behavior, generic variants and footer ownership consequential choices.

## Proposed approach, awaiting answers

Start with three distinct variants per category (45 blocks), within the requested range. Use a larger Kumo dialog, name/theme/tag search, a theme selector, tag filters and a preview grid. Give each adapted block current metadata/defaults, scoped styles, shared public/preview rendering, and support for site typography/width/gutter. Keep old retained block versions available. Q60–Q65 have since been resolved; see [round-one decisions and reference sites](2026-10-06-block-library-round-one.md). The original recommendations below do not override those answers.

No application code or reference-repository files were changed in this planning turn. User requirements are DEC-079–DEC-081; recommendations are not accepted answers.
