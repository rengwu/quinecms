---
title: Site Layout decisions, retained versions
updated: 2026-10-06
status: Accepted; interview complete
---
# Site Layout decisions, retained versions

Interprets the [submitted Q76 answer](2026-10-06-grill-7a73a1dd-dfe9-4d9a-9118-fd7107ac2d9c.md). The user selects “Retain versions; upgrade explicitly” with no additional notes. The prepared form was collected once, its transcript saved and its temporary session/download cleaned up.

DEC-107 establishes retained selectable layout implementations, with the active selection pinned to its chosen version. Installing a newer layout version does not replace the selected implementation automatically on the next build/deployment. Explicit upgrades use the chosen version's renderer and settings implementation; older installed versions remain available.

This is source-code retention, not a reversal of DEC-095: persist only the active layout/version and its current settings. It introduces no saved settings cache per inactive layout. DEC-105 still keeps the active implementation working when its layout is excluded from future picker choices.

Exact version-picker presentation and settings-transition mechanics are engineering work. This answer does not independently choose automated migrations, inferred field mappings or an inactive-settings history. The [consolidated design](../discussions/site-layouts.md) keeps these details separate from accepted requirements.

The scoped discussion is complete. The planned sequence remains the Site Layout foundation followed by the [chartr layout and independent blocks](../discussions/chartr-recreation.md). No application source, fixtures, deployment or runtime behavior changed during this answer-collection turn; wiki validation only checks the discussion records and links.
