---
title: CMS research revises the objects and relations discussion
updated: 2026-10-07
status: Research complete; revised form unanswered
---
# CMS research revises the objects and relations discussion

The user asks whether other CMSes have been studied sufficiently on objects and relations and requests research before proceeding, with form adjustments if needed. The earlier architecture comparison was broad; the original Q77–Q79 had not been supported by a focused cross-CMS study.

The [research](../discussions/cms-objects-relations-research.md) compares official documentation for Sanity, Payload, Strapi, Storyblok, Directus and Keystatic. It separates observed capabilities from proposed adaptations to this Git-backed static builder. No installations, comparative editor trials or performance benchmarks were performed.

The new recommendation for Q79 allows an explicit set of target collections, with one as the usual default. Q77–Q78 still propose inline/named objects and nesting; the recursion explanation is corrected because a recursive schema can have finite values. Q80 adds typed mixed object lists and Q81 adds target deletion policy. Derived reverse views, association metadata, stable identities, type-aware bindings and bounded resolution are engineering proposals or follow-up topics.

The prior form is superseded for discussion but preserved, including any local browser draft; no submission has been reported or collected. A fresh grill-form session carries the revised Q77–Q81. All choices remain unanswered. No new DEC entry is warranted: DEC-109 still supplies the user's redesign freedom, and research recommendations are not acceptance.

The standalone HTML research brief at `output/cms-objects-relations-brief.html` is generated from the Markdown research record. Markdown remains authoritative. Changes in this turn affect discussion records and presentation artifacts only; application source and fixtures are unchanged.

Validation: the wiki rebuild and link/current-output check pass for 95 pages. Headless Chrome renders the brief and revised form at 1280px and 390px widths without page overflow or script errors; screenshots were inspected. No form answers were entered or submitted. `pnpm verify` was not rerun because application code did not change.
