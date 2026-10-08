---
title: Inline block title and version verification
updated: 2026-10-08
result: Passed
---
# Inline block title and version verification

The user requests that Version sit beside the block title without a visible label, with a suitable width cap and ellipsis for overflowing titles. The [editor contract](../../features/editor.md) now records this behavior.

The header uses a flex row with a 12px gap. Its title can shrink and uses nowrap/hidden overflow/ellipsis. The selector container is 140px wide, capped at half the available row, with a full-width Kumo control inside. The accessible name remains Version; the title retains its full accessible text and a hover title. Version-switching logic is unchanged.

Verification ran on the dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`; see the [source manifest](../../evidence/2026-10-08-block-header/source-manifest.json).

- `pnpm verify`: clean type diagnostics, all 159 tests in 19 files, production build and artifact checks passed. [Log](../../evidence/2026-10-08-block-header/verify.log).
- Native Safari against the existing development server on port 4322: Hero and Version 2 appear on the same row with no separate label. Version 2 → Version 1 works with keyboard selection; Cancel block changes restores Version 2 and its fields. [Hero screenshot](../../evidence/2026-10-08-block-header/hero.png).
- The existing chartr · Durable sessions block visibly truncates with an ellipsis on one line while Version 1 remains fully readable. Its accessibility heading retains the full name. [Long-title screenshot](../../evidence/2026-10-08-block-header/long-title.png).

The isolated test tab was closed; the existing development server was left running. No provider actions or deployment occurred. Mobile viewport and additional browsers were not exercised in this run.
