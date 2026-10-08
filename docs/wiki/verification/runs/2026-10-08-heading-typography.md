---
title: Consistent admin heading typography
updated: 2026-10-08
result: Passed
---
# Consistent admin heading typography

The Pages title had a dedicated 24px rule without the −0.02em tracking used by the other 18px admin titles. It now shares the existing heading rule, with an explicit 1.5 line height. Obsolete direct-child rules for 24px admin headings are also removed; the navigation wrapper had already prevented them from matching. Heading semantics and the Add page action remain unchanged.

This CSS-only change was checked in the dirty tree based on `348f1237f115541694f738bac77137333a4550d8`, alongside concurrent local-authoring and earlier editor refinements. `pnpm verify` passes: zero diagnostics, **158 tests in 21 files**, production build and artifact checks. [Full log](../../evidence/2026-10-08-heading-typography/verify.log). No new tests were added for this visual-only adjustment.

Native Safari on the existing development server at `127.0.0.1:4322` displays the [corrected Pages title](../../evidence/2026-10-08-heading-typography/pages.png). Source inspection confirms Pages, Content and the other standard headings use the same typography declaration. The Content screenshot comparison was interrupted by user interaction in Safari, so the verification tab was left open to preserve that activity. Light mode was observed; dark mode and narrow viewports were not separately rechecked. No provider operation, content save or publication was performed.
