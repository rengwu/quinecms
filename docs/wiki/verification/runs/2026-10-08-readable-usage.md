---
title: Readable reference summaries verification
updated: 2026-10-08
result: Passed
---
# Readable reference summaries verification

Scope: [reference-summary refinement](../../journal/2026-10-08-readable-usage.md), including source navigation and clearing stale inherited Starter navigation links. The [source manifest](../../evidence/2026-10-08-readable-usage/source-manifest.json) records the dirty tree based on `348f1237f115541694f738bac77137333a4550d8`. Concurrent admin-appearance work is present in this tree and is not attributed to this change.

- Type checking: zero errors, warnings or hints across 340 files. Both final `pnpm verify` attempts reached passing diagnostics, then failed at the default five-second test limit. The [first run](../../evidence/2026-10-08-readable-usage/verify-timeout.log) timed out in block generation/rendering; the [second run](../../evidence/2026-10-08-readable-usage/verify-timeout-rerun.log) timed out in an editor test and left later assertions without a mounted editor.
- Resource-bounded rerun: `pnpm test --maxWorkers=2` passes all **169 tests in 20 files**, with unchanged test time limits. [Log](../../evidence/2026-10-08-readable-usage/test.log). The four new pure tests cover readable navigation, declared field labels, stable nested row identities, schema defaults, source targets, missing-owner fallback and inherited-link synchronization. Mounted-editor checks cover Open → layout → remove referring link → enabled Delete, object usage → owning schema → Back → repeat, and exclusion of self-references from blockers.
- `pnpm build` and `pnpm check:build` pass. [Production build and artifact log](../../evidence/2026-10-08-readable-usage/build.log). Together with the passing diagnostics and bounded test run, these complete the checks selected for this change; the default-concurrency `pnpm verify` runs themselves did not pass.
- Native Safari at `127.0.0.1:4322/admin/?check=readable-usage`: Home shows **Used in 1 place**, the plain-language deletion explanation, **Site Layout** / **Header › Navigation › Home**, a single-line **Open** button and disabled Delete. Compare the [user's before image](../../evidence/2026-10-08-readable-usage/before.png) with the [verified summary](../../evidence/2026-10-08-readable-usage/summary.png). Open visibly reaches [Site Layout settings](../../evidence/2026-10-08-readable-usage/open-layout.png), where the accessibility tree includes the editable Home navigation item.

Open reaches the owning editor or page block; arbitrary nested fields are identified by the readable location rather than opened automatically. Browser verification used the current light admin preference; dark mode, physical mobile devices and other browsers were not selected for this run. The dedicated Safari verification tab was closed; no content was saved or published, and the existing development server remains running. Provider tests are mocked; no live GitHub, R2 or deployment operation was performed.
