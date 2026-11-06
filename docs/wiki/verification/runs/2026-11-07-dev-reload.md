---
title: Local JSON edits reload the development site
updated: 2026-11-07
result: Passed
---
# Local JSON edits reload the development site

## Scope and build

Verified [local authoring](../../features/local-authoring.md) and the
[site engine](../../features/site-engine.md): keeping `pnpm dev` running while
saving site-owned JSON, source and assets must update the site and notify an open
browser. The user authorized the engine repair and upgrading the independent
Quine site after a baseline reproduction served stale content.

Tested an isolated worktree based on engine `309c0baf8000dbda8e19363043a8565a96efd106`
plus the repair, excluding unrelated editor/branding changes in the main checkout.
The [source manifest](../../evidence/2026-11-07-dev-reload/source-manifest.json)
fingerprints the tested application, scripts, tests and dependency lockfile.
macOS 27.0, Node 22.19.0, pnpm 10.34.1, Astro 7.3.5 and Chromium 151.0.7922.34.
Dependencies were reused from the engine checkout; installation from the pushed
Git revision is checked separately when upgrading the site.

## Results

| Scenario | Observed outcome | Result | Evidence |
| --- | --- | --- | --- |
| Engine regression suite | All 281 tests in 34 files passed, including real isolated validation/check/build/artifact tests. | Passed | [Test log](../../evidence/2026-11-07-dev-reload/tests.log) |
| Page JSON, layout settings, entry values | New values were served and Vite sent browser reload messages; ordinary value edits did not restart Astro. | Passed | [Focused regression](../../evidence/2026-11-07-dev-reload/regression.log) |
| Block composition | Inserting/removing a block updated the generated page and its rendered output. | Passed | [Focused regression](../../evidence/2026-11-07-dev-reload/regression.log) |
| Open browser | Saved JSON changed visible text after automatic main-frame navigation, without manual refresh. | Passed | [Browser results](../../evidence/2026-11-07-dev-reload/browser.json) |
| Atomic replacement and rapid saves | A temporary-file rename updated the page; rapid saves converged on the final value. | Passed | [Browser results](../../evidence/2026-11-07-dev-reload/browser.json) |
| Invalid JSON and correction | Vite displayed an error overlay. Correcting the file restored the page automatically, without restarting the command. | Passed | [Browser log](../../evidence/2026-11-07-dev-reload/browser-server.log) |
| Route add/rename/delete | Routes appeared/disappeared on the same server address. Subsequent content saves still refreshed the browser. | Passed | [Browser results](../../evidence/2026-11-07-dev-reload/browser.json) |
| Original extension and public assets | An extension source edit rendered; a public directory created after startup and asset add/change/delete were detected. | Passed | [Browser results](../../evidence/2026-11-07-dev-reload/browser.json) |

[Final browser capture](../../evidence/2026-11-07-dev-reload/browser.png).
The reusable commands and cleanup are in [verification setup](../setup.md#local-file-reload-regression).
Log paths are normalized to portable placeholders. Both drivers create their own site fixtures and stop/remove them; browser evidence
is saved before cleanup. No client content or provider data is used by these tests.

## Implementation and limits

The CLI delegates ongoing watching to an Astro integration using Vite's watcher.
Native per-file events replace recursive FSEvents, which missed saves on this
machine. No polling dependency or site-specific override was introduced. Generated
Astro files are invalidated as a completed batch instead of individually triggering
route scans while old generated files are removed. Astro's watched route manifest
still performs normal configuration refreshes for route changes. A generated
package manifest no longer flips between engine-only and resolved site dependencies
on every save. Vite permits the real paths of the assembled dependencies, including
linked worktrees and pnpm's virtual store.

Earlier browser attempts exposed the generated-page deletion race and failure to
discover a newly created optional public directory; both were repaired before the
passing run. The recorded server log includes the intentionally invalid JSON and
brief errors from requests made during route configuration changes. Settled routes
and continued browser refresh were verified; seamless preservation of public-page
interaction state is not promised by a full page reload.

This run covers local macOS/Chromium development. Windows/Linux, browser editor
draft reconciliation, live Git/R2 and hosted deployments are outside its scope.
Existing browser drafts remain separate from local JSON. Dependency/environment
changes still require restarting `pnpm dev`.

The wiki build and link/current-output checks passed. The optional report metadata
checker accepted this run's `Passed` result but reported nine older reports with
legacy/missing result values; those unrelated records were left unchanged.
