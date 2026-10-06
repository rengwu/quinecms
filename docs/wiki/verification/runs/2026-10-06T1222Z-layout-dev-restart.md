---
title: Generated layout head development-server repair
updated: 2026-10-06
result: Passed
---
# Generated layout head development-server repair

## Failure and repair

The user reported `FailedToLoadModuleSSR` for `../generated/SelectedHead.astro`. Reproduction confirmed HTTP 500 on `/` and `/chartr/`, while `/admin/` returned 200. The generated Head already existed as the valid eight-byte empty Starter component. The daemon was still the instance started before this generated import was introduced. The observed behavior is consistent with stale import resolution in that long-running development process; no typo or missing on-disk implementation was found.

Stopped that repository's development daemon, then ran `pnpm dev`, which regenerated the registered blocks/layouts and started a fresh server on `127.0.0.1:4321`. No application code or content changes were necessary. README and setup now explicitly require stopping the existing daemon before restarting after new generated imports, routes or registry entries.

The previous [layout verification](2026-10-06T1140Z-site-layouts.md) exercised public production rendering, but missed this final long-running development-server state after Head was added. This repair adds checks against the actual server being handed back to the user.

## Identity and evidence

Same application implementation as the previous run, with documentation updates. macOS, Node 22.19.0, pnpm 10.34.1, Astro 7.3.5. Dirty tree based on `a4fe1bac89a08763c388283a6ef369214d86d3fa`. [Source manifest](../../evidence/2026-10-06T1222Z-layout-dev-restart/source-manifest.json): 370 files, SHA-256 `fca4f97bc81d7a97cdabb97f953720dc3deeeb71f09e7022a82ab1eb2643d61b`.

| Scenario | Expected | Observed | Result | Evidence |
| --- | --- | --- | --- | --- |
| Reproduction | Identify public error and verify generated file | Home and chartr return 500; generated Head exists; admin returns 200 | Passed | [Before](../../evidence/2026-10-06T1222Z-layout-dev-restart/before.json) |
| Restart and route resolution | Every sampled route returns valid HTML | Home, chartr, admin and generic journal entry return 200 with expected titles and no module-load error | Passed | [After](../../evidence/2026-10-06T1222Z-layout-dev-restart/after.json), [restart](../../evidence/2026-10-06T1222Z-layout-dev-restart/restart.log) |
| Real public rendering/hydration | Public content and interactive blocks work | Home headings render; Svelte count increments and Vue FAQ expands. Chartr renders nine sections; Tabs card selects the matching native view | Passed | [Browser observations](../../evidence/2026-10-06T1222Z-layout-dev-restart/browser.txt), [fresh dev log](../../evidence/2026-10-06T1222Z-layout-dev-restart/dev.log) |

No implementation change required new unit tests or another full `pnpm verify`; the preceding implementation run passed 132 tests, type checks and production builds. This run verifies the daemon recovery itself. Live providers remain outside scope and untested. The owned Safari test tab is closed, and the repaired development server remains running. Verification was by the implementing agent.
