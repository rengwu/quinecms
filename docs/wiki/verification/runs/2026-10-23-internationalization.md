---
title: Internationalization engine verification
updated: 2026-10-23
result: Passed
---
# Internationalization engine verification

The engine implementation of [optional internationalization](../../features/internationalization.md)
passed automated tests, an isolated site's validation/typecheck/build/artifact
checks and Chrome editor checks. Library designs, the Kahf site and live Git
publishing were not part of this run.

## Scope and build

Covers FEAT-internationalization against DEC-194–DEC-231 and the
[engineering design](../../discussions/internationalization-engineering-design.md).
Engine revision `f7de3dbde3e047913b4306bf684c8e3216a19b39` (clean for source and
tests; documentation was updated afterwards). macOS, Node 22.19.0, pnpm 10.34.1,
Chrome through the Claude in Chrome extension.

Browser and build checks used a disposable site generated outside the repository
by a scratch script: three local test blocks (two with translatable fields, one
generic), a local layout with a translatable announcement and language links,
three products (an eligible, an incomplete and a missing Indonesian copy) and a
translated home page. It linked this engine checkout, used disposable local admin
credentials and had no Git or R2 configuration, so Save draft and Publish were
unavailable. The dev server ran on port 4331. The user's dev site was not used
because it is connected to a real repository.

## Results

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Regression suite | Existing behavior and new language tests pass | 34 files, 281 tests passed | Passed | `pnpm test` |
| Copy overlays and eligibility | Shared/localized split, rows by `_rowId`, whole-item fallback, eligibility from validation, strict issues, reserved paths, pruning, removal | Unit tests pass | Passed | `tests/languages.test.ts` |
| Built output | `/id/…` routes, `<html lang>`, `noindex` and `lang="en"` wrapper on fallbacks, language links, strict validation failure | Build test passes; scratch site served the same on the dev server | Passed | `tests/languages-build.test.ts` |
| Site checks | Validation, assembled typecheck, build and artifact check succeed | Valid; 0 errors/warnings/hints; 4 English + 4 Indonesian pages + admin; public pages ship no JavaScript | Passed | Scratch site output |
| Editing in Indonesian | Top-bar select, list status, Shared badges, translated values, English unchanged, block/row editing with fixed structure | All observed; switching language kept the open block | Passed | [Incomplete copy](../../evidence/2026-10-23-i18n-editor/incomplete-copy-draft.jpg) |
| Status and eligibility | Incomplete copy lists missing fields with context; filling them makes it Eligible immediately | “Missing Description, Key ingredients › Name”; Eligible after filling | Passed | [Incomplete copy](../../evidence/2026-10-23-i18n-editor/incomplete-copy-draft.jpg) |
| Draft and Visitor preview | Draft shows the copy with blanks; Visitor shows the whole English item inside Indonesian layout/template, outlined | Observed, with “Cari toko” template text around the English item | Passed | [Visitor fallback](../../evidence/2026-10-23-i18n-editor/incomplete-copy-visitor-fallback.jpg) |
| Copy creation and removal | Add → Cancel leaves nothing; Add → Create makes a copy; Remove copy confirms and deletes it | Observed; editor test also covers Cancel/Create | Passed | `tests/editor-languages.test.ts` |
| Layout settings | Layout copy status, translated announcement, Shared site name, localized preview | Observed | Passed | Browser check |
| Schema switch | Turning Per language off lists removed translations; on again lists newly incomplete copies | Both notices observed | Passed | Browser check |
| Settings | Off keeps copies (count shown) and hides the select; Remove language confirms with count and deletes copies; re-adding shows No copy | Observed: 6 kept; “deletes 5 Indonesian copies”; all No copy after re-adding | Passed | Browser check |
| Narrow top bar | Menu, preview toggle, language, save status, Save draft and Publish fit at 390px | First check overflowed by 14px; after making the preview toggle icon-only, Publish ended at the padding edge with no overflow | Passed | Measured in a same-origin 390px frame |
| Console | No errors during the checks | None reported | Passed | Browser console |

## Limits and follow-up

- Real library designs do not yet mark translatable fields or draw a language
  switch, so block and layout translation was only exercised with local test
  extensions.
- The 390px check used a same-origin frame with a scrollbar (375px usable), not a
  device. Tab recovery kept local edits across a reload; nothing was saved to Git.
- Strict-mode Publish toasts were covered by validation tests, not clicked in the
  browser, because Publish needs a Git connection.
- Not exercised: multiple additional languages in the editor, screen readers,
  Kahf search and live hosting.
