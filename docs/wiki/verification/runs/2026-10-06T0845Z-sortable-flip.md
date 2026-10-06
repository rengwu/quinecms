---
title: Optimistic FLIP sorting verification
updated: 2026-10-06
result: Untested
---
# Optimistic FLIP sorting verification

## Scope

[FEAT-editor](../../features/editor.md) and [FEAT-block-library](../../features/block-library.md). The user requested optimistic FLIP motion on all sortable lists, direct vertical carrying from mouse-down with X locked, removal of the blue insertion indicator, and commits even when released outside the list. Subsequent feedback named Chartr's sidebar space/session sorting as the behavioral reference.

`BlockList` now holds a local display order, so page content and website rendering stay unchanged during a drag. A fixed inert overlay preserves the pointer's grab offset without sidebar clipping. Only displaced list rows receive FLIP motion while held; release settles the carried row into its committed slot. Capture starts on the button to preserve normal clicks and transfers to the stable list when dragging starts. Keyboard sorting, reduced motion, snapshot invalidation and explicit/system cancellation remain supported.

## Build and environment

Dirty tree based on `02194ecefe35a72455ba807fcdd4c86566db0f8f`; macOS, Node 22.19.0, pnpm 10.34.1. [Source manifest](../../evidence/2026-10-06T0845Z-sortable-flip/source-manifest.json): 378 files, SHA-256 `ebd15ebf2bbd374354123dd5dc255aa6dc18e75108734fa5c545f58afcb2da12`. Existing uncommitted implementation work was preserved.

Read-only Chartr reference: `components/list_sorter.rs`, `chrome/tab_sorter.rs` and `chrome/sidebar.rs` under its `crates/chartr/src/` directory. [Reference hashes](../../evidence/2026-10-06T0845Z-sortable-flip/chartr-reference.json) record the inspected source. Its held-row offsets, temporary model order, interruptible 150ms slides, variable-size geometry and 32px capped edge scrolling informed the implementation. The user's explicit outside-release requirement takes precedence over Chartr's lane-exit suspension/cancellation. No Chartr files were changed, and no native Chartr/browser visual comparison was performed.

The browser implementation uses [Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) for list-only transforms and [pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) for continued tracking beyond the hit area. The 150ms cubic easing approximates Chartr's quintic ease-out rather than copying its Rust frame loop.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Local optimistic order and preview isolation | Hover reorders only the list; release commits once | Mounted controlled harness observes changed row order with unchanged committed content, then one commit on release | Passed | [Verify log](../../evidence/2026-10-06T0845Z-sortable-flip/verify.log), `tests/block-list.test.ts` |
| Exact carrying and outside release | Preserve grab offset and X; movement outside continues; outside release commits | Pointer tests cover sub-threshold motion, large positive/negative X, continued Y movement, no early commit and successful release; inert overlay removed afterwards | Passed | Verify log |
| FLIP, interruption and settle | Only neighbor rows animate while held; re-target from current visual position; held row settles on release | Animation-spy tests check displaced rows, interruption compensation, stable repeated targeting and final carried-row translation | Passed | Verify log |
| Variable heights, gutters and scrolling | Use measured slots, retain gap drops and keep held row attached during scrolling | Up/down gap cases pass; mixed-height test checks 88px neighbor displacement and exact grab offset; frame-driven edge-scroll test checks bounded scrolling without overlay drift | Passed | Verify log |
| Accessibility, lifecycle and invalidation | Clicks/keyboard work, reduced motion skips animation, canceled/conflicting work does not commit, resources stop | Keyboard/focus and short-click tests pass; reduced-motion, Escape/pointer-cancel/capture-loss, disabled/external changes, animation/frame cleanup and overlay unmount are covered | Passed | Verify log |
| Full application verification | Clean types, tests, build and artifact checks | `pnpm verify` passed: zero diagnostics, 108 tests across 16 files, six routes built, shared-runtime/asset checks passed | Passed | Verify log |
| Native motion and physical pointer check | Rendered motion matches the intended Chartr-like feel and native pointer capture behaves correctly | Not exercised: computer-use access remains restricted on the current browser URL | Untested | [Browser restriction record](2026-10-06T0619Z-catalog-polish.md) |

## Limits and follow-up

The aggregate is Untested because native visual/physical interaction remains outstanding. Geometry, animation, hit boundaries and animation-frame progression are controlled in jsdom; these tests do not certify browser paint smoothness or physical mouse/touch behavior. When access is available, compare sidebar dragging with Chartr, including fast reversals, varied row heights, edge scrolling, releasing to either side, above/below the list, and reduced motion. Confirm the website preview changes only on release and remains unanimated.

No browser sessions, servers, provider actions or content files were changed. Evidence survives cleanup of owned scratch logs. Verification was by the implementing agent; no independent review is claimed.
