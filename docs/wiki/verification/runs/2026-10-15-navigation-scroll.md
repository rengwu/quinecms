---
title: Dashboard section scroll reset
updated: 2026-10-15
result: Passed
---
# Dashboard section scroll reset

The admin's main sections conditionally render inside one document. They retained
its scroll position across section changes, so destination headings could appear
above the viewport. A layout effect now resets document scrolling on main section
changes before paint. Content edits and Schemas disclosure changes do not trigger
it. Nested form navigation keeps its existing behavior.

## Verification

Node 22.19.0 / pnpm 10.34.1, macOS and Chrome. A disposable original-extension site
contains 38 page records and 35 PDF media records so both lists genuinely scroll.
Production encryption uses fixture credentials; Git/R2 are disabled. No client
content or live services were changed by these browser tests.

- Reproduced before the fix: Pages at 844px → Media still at 844px, heading at
  −744px. [Before screenshot](../../evidence/2026-10-15-navigation-scroll/before.png).
- After the fix: Pages at 824px → Media at 0px, heading at 100px; returning from
  scrolled Media → Pages also opens at 0px.
  [Desktop screenshot](../../evidence/2026-10-15-navigation-scroll/media-after.png).
- Mobile 390×844: Pages at 780.5px → Menu → Media at 0px, still 0px after the
  menu finishes closing. [Mobile screenshot](../../evidence/2026-10-15-navigation-scroll/mobile-after.png).
- Expanding Schemas while Media is scrolled does not reset the current screen.
- All 48 existing navigation/save tests pass; no new implementation-mirroring
  unit test was added for this small browser behavior fix.
  [Test log](../../evidence/2026-10-15-navigation-scroll/tests.log).
- Production fixture builds all 39 routes successfully.
  [Build log](../../evidence/2026-10-15-navigation-scroll/build.log).
- No browser warnings/errors in the completed checks. Viewport reset, owned tab
  closed and fixture server stopped. Initial browser input delays were resolved
  by activating the fixture tab through native Chrome controls.

[Observed scroll positions and source hash](../../evidence/2026-10-15-navigation-scroll/observations.json).
These are local production-browser checks, not a claim that the deployed pilot
has already received the fix.
