---
title: Generic pages and schema-only entries
updated: 2026-10-06
result: Passed
---
# Generic pages and schema-only entries

## Scope

[FEAT-generic-pages](../../features/generic-pages.md), [FEAT-editor](../../features/editor.md), and [FEAT-static-blocks](../../features/static-blocks.md): implement DEC-058–DEC-073 after the user's 2026-10-06 authorization. Selected checks cover content contracts, route ownership, template bindings, admin hierarchy/catalogs, rich-text embeds, recovery and the emitted static website. Live providers are excluded from this local run.

## Build and environment

macOS, Node 22.19.0, pnpm 10.34.1; dirty workspace based on `f6993528410bebeae1dafd70d52f57c1cc3e34d4`. The [SHA-256 source manifest](../../evidence/2026-10-05T1650Z-generic-pages/source-manifest.json) identifies source, content, tests and configuration. No dependencies were added. Native Safari used an isolated window against owned production preview on 4331, then the existing development server on 4321. Local browser edits never wrote repository content.

## Results

| Scenario | Expected | Observed | Result |
| --- | --- | --- | --- |
| Contracts and routes | Explicit static indexes; optional entry templates; no generic standalone URLs | Unit tests cover route plans, data-only behavior, collisions and missing assignments; six static routes built | Passed |
| Binding resolution | Compatible shared schemas, draft-safe failures, publication guards, correct empty/zero/false handling | Unit tests cover each case; browser shows missing-key toast and successful cancellation | Passed |
| Admin hierarchy/catalogs | Entries have fields only; page kind filters available blocks; schemas assign only generic pages | Mounted navigation tests and browser observations match; data-only selector label fixed and rechecked | Passed |
| Rich-text media | Uploaded-image references and YouTube survive visual editing; unsafe/missing references do not render executable content | Image insertion/removal, read-only state and Markdown round-trip tests pass; browser YouTube insertion survives reload | Passed |
| Public rendering | Real entry values replace placeholders; optional blank image renders empty | Browser entry/index checks and HTTP/artifact assertions match | Passed |
| Compilation and regression | No diagnostics and all selected tests pass | `pnpm verify`: zero errors/warnings/hints; 75 tests in 13 files pass | Passed |
| Assets and static output | One runtime copy per framework; no editor/provider imports on public routes | Build graph checks pass; Journal index and both entries have zero JavaScript modules | Passed |
| Development startup | Regenerated routes and lazy editor load without blank/error screen | Home and schema editing mount after Astro config refresh; entry Body loads formatting, Image and YouTube controls | Passed |

Evidence: [verification log](../../evidence/2026-10-05T1650Z-generic-pages/verify.log), [browser observations](../../evidence/2026-10-05T1650Z-generic-pages/browser-observations.txt), [HTTP checks](../../evidence/2026-10-05T1650Z-generic-pages/http-checks.txt).

## Limits and follow-up

Live GitHub writes, R2 upload/CORS, Netlify deployment and actual external YouTube playback were not selected and remain unverified. Image editing used existing media metadata in a mounted UI test; uploads still use the existing Media workflow. No generic third-party content migration is provided. Existing demo entries were intentionally replaced; old recovery storage is preserved separately.

An initial build failed because an empty generic media component returned null; it now emits an invisible empty node so Astro can identify its renderer. The final verification log contains the successful rerun. The initial blank data-only selector was fixed and rechecked in development and unit tests. Earlier browser checks predate these small fixes; final compilation/tests/build include them.

Test edits were reverted. Owned preview PID 88199 is stopped and the isolated Safari window is closed; the user's development server remains available on 4321. No commit, push or deployment was performed.
