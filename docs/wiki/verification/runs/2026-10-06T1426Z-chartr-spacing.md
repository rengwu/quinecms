---
title: chartr content width and spacing repair
updated: 2026-10-06
result: Passed
---
# chartr content width and spacing repair

## Failure and repair

The user's imported-page screenshot showed chartr blocks extending to the viewport edges under Starter. Their outer content container existed only in the chartr layout, so independently inserted blocks lacked the reference's centered bounds. The old container CSS also hardcoded geometry rather than consuming the shared site settings.

Each chartr block now owns its centered content container, using shared content max-width and page-gutter variables with 1512px/40px fallbacks. The chartr layout no longer supplies a duplicate content container. Its header and footer use the same bounds, and inner containers drive responsive breakpoints. Narrow gutters retain the reference's 28px/20px/16px caps while respecting smaller explicit settings. The optional chartr backup stores reference geometry of 1512px/40px; the current site's 1200px/24px settings are unchanged. Retained version directories and the adjacent reference repository are preserved.

## Identity and evidence

macOS, Node 22.19.0, pnpm 10.34.1, Astro 7.3.5. Dirty tree based on `a4fe1bac89a08763c388283a6ef369214d86d3fa`. [Source manifest](../../evidence/2026-10-06T1426Z-chartr-spacing/source-manifest.json): 370 files, SHA-256 `89686821449c88b294e591c13d882e95cae0adea509b19e4267575281b1e1e88`. Verification was performed by the implementing agent.

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Public blocks under Starter | Independent chartr blocks retain centered bounds and gutters | Section labels/rules stay within centered content bounds and align with the header content edge | Passed | [Safari observations](../../evidence/2026-10-06T1426Z-chartr-spacing/browser.txt) |
| Shared geometry and layout switching | Custom width applies under both layouts with one content gutter | 680px width/48px gutter draft stays centered under Starter and chartr; chartr header responds to available content width | Passed | [Safari observations](../../evidence/2026-10-06T1426Z-chartr-spacing/browser.txt) |
| Mobile preview | Responsive spacing and content remain within preview | At 390px, one 20px gutter, fitting header actions, wrapped text, stacked cards and native preview; no visible horizontal overflow in the sample | Passed | [Safari observations](../../evidence/2026-10-06T1426Z-chartr-spacing/browser.txt) |
| Final development routes | Running server returns valid routes after changes | Home, chartr and admin return HTTP 200 without import errors; chartr has nine block-owned containers | Passed | [Route checks](../../evidence/2026-10-06T1426Z-chartr-spacing/routes.json) |
| Required repository checks | Types, existing tests and production artifact checks pass | `pnpm verify`: 322 files checked with zero errors/warnings/hints; 132 tests across 18 files pass; seven routes build and artifact checks pass | Passed | [Full verification log](../../evidence/2026-10-06T1426Z-chartr-spacing/verify.log) |

No new implementation-mirroring tests were added for this CSS/container repair. The real browser checks cover geometry that DOM-only tests do not establish. The full production build uses the committed Starter selection; the chartr wrapper was exercised through its shared React source in the editor preview.

Full pixel comparison, every gutter value, the physical-device matrix and live providers were outside this run's scope and remain untested. No provider publication or deployment occurred. Browser changes stayed in the owned tab's draft, which was closed after observation. The normal development server remains running. See [chartr](../../features/chartr.md) and [Site Layouts](../../features/site-layouts.md).
