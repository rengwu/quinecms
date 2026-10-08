---
title: Centered mobile preview
updated: 2026-10-08
result: Untested
---
# Centered mobile preview

## Scope

[FEAT-editor](../../features/editor.md). The user requests centering the mobile preview in the area beside the editing drawer. The mobile margin now includes half the remaining space, clamped to zero when there is no spare room. Width constraints use the containing block's width. Desktop rules and narrow-window overflow rules are unchanged.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`; [source fingerprint](../../evidence/2026-10-08-mobile-preview/source-manifest.json). macOS, Node 22.19.0, pnpm 10.34.1. The implementing agent used a fresh native Safari tab at the existing development server, `http://127.0.0.1:4322/admin/`. Existing work was retained.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Home → mobile preview | Equal empty space on each side within the preview workspace | The width toggle rendered a narrow preview centered beside the drawer | Passed | Browser observation |
| Hero editor with mobile preview | Alignment persists while editing a block | The preview remained centered, with approximately 531 screenshot pixels of spare space on each side | Passed | [Hero screenshot](../../evidence/2026-10-08-mobile-preview/mobile.png) |
| Toggle back to desktop | Preview fills available workspace | The test tab disappeared outside the agent's actions before this recheck; the existing unrelated tab was left alone | Untested | Browser state observation |
| Diagnostics, tests and build | All required checks pass | Zero diagnostics; 159 tests in 19 files, production build and artifact checks passed | Passed | [Verify log](../../evidence/2026-10-08-mobile-preview/verify.log) |

## Limits and follow-up

The mobile alignment is visually verified. Aggregate Untested reflects the interrupted desktop recheck. Narrow browser windows and live providers were outside this run. No new tests mirror the CSS change. No content edits, Save draft or Publish actions were performed. The test tab was no longer present at the final observation; existing tabs and servers were left running.
