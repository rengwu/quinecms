---
title: Live preview during block creation
updated: 2026-10-11
status: Implemented and locally verified
---
# Live preview during block creation

The user showed a New block form whose right-hand preview still contained only
the existing page, and requested a preview of the pending block. DEC-147 extends
the creation experience while retaining DEC-129's uncommitted form contract.

The editor now derives a temporary content snapshot with the candidate appended
to its page. Both the layout and block context receive that snapshot, so ordinary
fields, selected media, collection mappings and generic placeholders follow the
existing rendering path. It never replaces the canonical content state used by
recovery, exports, saves or publication. Create commits the same block identity;
Cancel and navigation remove the candidate.

The pending block uses the normal selected outline. A short-lived ResizeObserver
waits for its asynchronous renderer to produce a visible block, scrolls it into
view once, then disconnects. Typing does not repeatedly move the viewport. This
change concerns page blocks; footer creation retains its existing behavior.

## Verification

- `pnpm verify` passed: zero errors/warnings, 195 tests in 29 files, production
  build and artifact checks. [Log](../evidence/2026-10-11-block-creation-preview/verify.log).
- Regression tests cover live field props, unchanged recovery/Save state,
  cancellation on an empty page, append order on an existing page, navigation
  cancellation, and Create preserving one rendered instance without duplication.
- In a fresh Safari session at the running Quine editor, selected Quine ·
  Introduction through Add block. The candidate appeared after the five existing
  blocks with a selected outline and automatic scroll. Changed its heading to
  “See this before you create it.”; the preview updated while Save draft stayed
  disabled. Inspected desktop and mobile preview, then cancelled. The temporary
  section disappeared and the original five-block list remained. No test content
  was saved or published; the user's separate browser draft was not changed.
- Synced the changed editor source into the running isolated example. Existing
  browser sessions need a refresh to load the rebuilt encrypted editor.
- Rebuilt the wiki, checked its internal links and ran `git diff --check`.

The regression tests mock block adapters; the browser exercise covers the real
Quine React renderer, not every installed block/framework or binding combination.
No live provider or deployment operation was performed.
