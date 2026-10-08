---
title: CMS schemas and relations — refreshed comparison
updated: 2026-10-07
status: Research assessment; accepted scope unchanged
---
# CMS schemas and relations — refreshed comparison

The user requests research comparing Strapi, Sanity, Payload and other CMSes on collection schemas and relations, a tabulated brief, and a judgment about fit with this builder. Official documentation is revisited for those three plus Directus, Keystatic, TinaCMS and Storyblok. The [existing research page](../discussions/cms-objects-relations-research.md) gains a current comparison while preserving earlier research/interview history.

The assessment selects Sanity as the closest conceptual model for independent entries, owned reusable objects and stable references; Payload as a collection/field machinery reference; and Keystatic as the closest file/Git architectural reference. These recommend ideas for our design, not a platform migration or new product decisions.

Fresh checks distinguish Sanity's current singleton registry from its older custom-structure recipe, Tina's global editor shortcut from a strict singleton invariant, and strong-reference integrity from full schema validation. Keystatic's documented GitHub deployment uses Node API routes, and Tina's backend includes an indexed data layer. Neither is equated with our static browser/Git design.

The comparison clarifies that one selected reference does not imply exclusive one-to-one ownership, reused definitions do not share entry values, and derived reverse views need not store a second relationship. Accepted restrictions through DEC-127 remain unchanged; no grill-form session is opened.

Research uses official documentation, not installations, benchmarks or comparative editor trials. No application code changes or provider operations occur. The requested brief is presented as Markdown tables; existing standalone HTML briefs remain historical snapshots. Wiki build/check validates the updated records and links, not CMS behavior or application implementation.
