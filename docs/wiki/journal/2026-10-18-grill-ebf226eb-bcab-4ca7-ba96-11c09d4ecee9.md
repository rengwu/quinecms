---
title: Interview answers
section: Journal
updated: 2026-10-18
status: Submitted
---
# Interview answers

Submitted answers; interpretation and accepted decisions are recorded through grill-me/plan.

Session: `ebf226eb-bcab-4ca7-ba96-11c09d4ecee9`

## Question 1

```text
Round: Kahf proof — optional internationalization
Question: When a translation is missing, what should fall back to the main language?
Description (Markdown source):
Your direction is already recorded: optional internationalization, a designated main language, optional language copies, and a choice between strict completeness and fallback. This question resolves what a copy means. For example, a product might have an Indonesian title but no Indonesian description. Whole-item fallback keeps the product in its main language until its Indonesian copy is ready; field fallback shows the Indonesian title with the main-language description.
Recommendation: Use whole-item fallback initially. A language copy is used when ready; otherwise the main-language item is shown. This keeps each item coherent and follows your description of optional content copies. It can still produce a page containing related items in different languages.
Options: Fall back for the whole item when its language copy is unavailable / Fall back separately for each untranslated field
Selected: Fall back for the whole item when its language copy is unavailable
Notes: 
```

## Question 2

```text
Round: Kahf proof — optional internationalization
Question: Should translated pages share their section structure and order?
Description (Markdown source):
For example, the English homepage has a hero, product rail and story section. Shared composition keeps those sections and their order aligned while allowing translated copy and localized content values. Independent composition would let Indonesian omit or reorder sections. Collection schemas and rendering code would remain shared in either case.
Recommendation: Share section structure, order and templates initially. Let the translated content vary without creating separate page designs to maintain.
Options: Shared sections, order and templates; localized content values / Independent section composition for each language
Selected: Shared sections, order and templates; localized content values
Notes: 
```

## Question 3

```text
Round: Kahf proof — optional internationalization
Question: When all languages are required, when should missing translations block progress?
Description (Markdown source):
This selects enforcement timing, not whether the strict policy exists—you already requested that option. QuineCMS currently distinguishes repairable drafts from publication requirements. The definition of a complete translation will follow the fallback-unit decision.
Recommendation: Allow incomplete drafts and previews, but block Publish and production builds until the required language versions are complete. Authors can then save work in progress.
Options: Allow drafts; enforce completeness on Publish and production build / Enforce completeness on draft saves as well
Selected: Allow drafts; enforce completeness on Publish and production build
Notes: 
```

## Question 4

```text
Round: Kahf proof — optional internationalization
Question: How should language variants appear in public URLs?
Description (Markdown source):
For an English-main site, an unprefixed main language could use /product/example and Indonesian /id/product/example. Prefixing every language would use /en/product/example and /id/product/example, with a separate decision for /. Exact translated slugs can be discussed later.
Recommendation: Keep the main language at unprefixed paths and prefix additional languages. This preserves familiar single-language paths and fits the existing root homepage requirement.
Options: Main language unprefixed; additional languages prefixed / Prefix every language; decide the root destination separately
Selected: Main language unprefixed; additional languages prefixed
Notes: 
```

## Question 5

```text
Round: Kahf proof — optional internationalization
Question: Which languages should the small Kahf proof use?
Description (Markdown source):
The reduced scope is already settled: a couple of entries per retained type, with peripheral pages and links removable. Two languages are enough to exercise translated content, missing-copy fallback, strict validation and language switching. This choice concerns the proof site, not a hardcoded limit in the engine.
Recommendation: Use English as the main language and Indonesian as the second, matching your original English reference and the site's other existing language.
Options: English main, Indonesian second / Indonesian main, English second
Selected: English main, Indonesian second
Notes: 
```
