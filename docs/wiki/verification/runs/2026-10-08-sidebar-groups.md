---
title: Expandable Schemas navigation
updated: 2026-10-08
result: Passed
---
# Expandable Schemas navigation

## Scope

[FEAT-editor](../../features/editor.md) and [FEAT-content-model](../../features/content-model.md), DEC-132. Check disclosure-only parents, direct child destinations, removal of list-level Back buttons, local editing state, nested return navigation, and the shared compact menu.

## Build and environment

Dirty tree based on `30c447e3d28c6e52eb2a24d323c1086bee9001b7`; [source fingerprint](../../evidence/2026-10-08-sidebar-groups/source-manifest.json). macOS, Node 22.19.0, pnpm 10.34.1. The implementing agent used an isolated Safari window at the existing development server, `http://127.0.0.1:4322/admin/`. Pre-existing edits were retained.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Expand Schemas from Pages | Show its children without navigating | Safari retained the Pages table and exposed Collections/Objects; the disclosure changed from collapsed to expanded | Passed | [Browser observations](../../evidence/2026-10-08-sidebar-groups/browser.txt) |
| Direct child lists | Open each list without Back; highlight only its leaf | Collections and Objects displayed directly with their creation actions, no list Back; Collections was highlighted as a child | Passed | [Collections screenshot](../../evidence/2026-10-08-sidebar-groups/collections.png), [Objects state](../../evidence/2026-10-08-sidebar-groups/objects.txt) |
| Collapse on Objects | Hide children, retain current destination | Safari hid Collections/Objects while keeping the Objects workspace visible | Passed | Browser observations |
| Local state and nested editors | Disclosure preserves pending edits; switching leaves discards uncommitted creation; existing edits survive | Mounted tests verified pending collection name preservation through collapse, cancellation when switching children, retained page edits, and nested Back to Collections | Passed | [Verify log](../../evidence/2026-10-08-sidebar-groups/verify.log) |
| Compact navigation dialog | Group toggles keep menu open; leaf selection closes it; active child is revealed on reopening | Mounted real Kumo dialog test passed each behavior | Passed | Verify log |
| Required project checks | Diagnostics, tests, production output checks pass | Zero diagnostics; 161 tests in 19 files passed; build and artifact checks passed | Passed | Verify log |

## Limits and cleanup

Compact-menu behavior has mounted test coverage; narrow-viewport visual inspection and physical-device keyboard/touch checks were not selected. Live providers are unrelated to this navigation change and were not exercised. No Save draft or Publish actions were performed. The isolated browser window was closed, returning to the pre-existing Start Page; existing servers were left running. Screenshots and logs remain available.
