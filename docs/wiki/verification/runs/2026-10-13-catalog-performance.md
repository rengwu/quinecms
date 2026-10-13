---
title: Block catalog performance verification
updated: 2026-10-13
result: Passed
---
# Block catalog performance verification

## Scope and implementation

The user requested optimizations for first opening, thumbnail loading and scrolling,
then selected `jstack/rule-lean` and authorized implementation with
`jstack/work-until-grill`. This run covers [FEAT-block-library](../../features/block-library.md)
and the existing creation/cancellation behavior. No product decision required an
interview. The implementing agent performed these checks; no independent review is
claimed.

The first pass prepares samples only on first visibility, shares site context and
surface styles, uses one thumbnail visibility observer and one grid size observer,
and retains visited thumbnails while scrolling. A CSS custom property supplies the
shared scale without per-card React resize state. `content-visibility: auto` on the
aspect-ratio thumbnail box skips offscreen rendering. Filters, full previews and
dialog close release the relevant thumbnails. Observer-free fallback renders them.
There are no new dependencies, loading queues, eviction caches, virtualized rows or
generated images.

Explicitly rooting the observer initially made the old 160px margin mount an extra
row (20 instead of 15 at the desktop viewport). The final implementation uses the
dialog root with no margin, restoring 15 initial thumbnails. The intermediate
measurements are retained as `after*` in the evidence; only `final*` describes the
final code.

## Build and environment

macOS, Node 22.19.0, pnpm 10.34.1, Chrome. Base revision:
`5a14f1a526e6c82efa0eb1c15a03ea3bf0a76801`, with pre-existing uncommitted Intr example
and documentation changes. The [source manifest](../../evidence/2026-10-13-catalog-performance/source-manifest.json)
identifies the dirty workspace inputs, isolated fixture and before/after code.
Unrelated changes and client content were preserved.

Disposable Intr example copies used the existing `scripts/example-site.mjs`
preparation workflow and its test-only login. The before/after fixture includes all
110 installed definitions and 75 static page-card choices. Production output was
served on loopback ports 4325 (initial baseline, then final code) and 4326 (preserved
baseline for repeated opening checks). The baseline restores only BlockCatalog.tsx
and catalog.module.css from HEAD; other fixture inputs match the final copy.
Existing user servers on 4322–4324 were untouched. Desktop viewport: 1440 × 1000;
phone viewport: 390 × 844. No provider connection was configured.

## Results

| Scenario | Expected and observed | Result | Evidence |
| --- | --- | --- | --- |
| Repository checks | 408 checked files, zero errors/warnings/hints; all 211 tests across 32 files pass; production build and artifact checks pass. | Passed | [Full log](../../evidence/2026-10-13-catalog-performance/verify.log) |
| Lazy sample preparation | Hidden thumbnails do not clone defaults. One context resolution serves encountered samples; IDs remain distinct, and blog sample collections do not replace another block's collections. | Passed | `tests/catalog-thumbnails.test.ts` |
| Lifecycle and settings | Scrolling/resizing preserves a mounted preview; filtering/full-preview transitions unregister thumbnails; returning from Preview or empty results reconnects loading. Changed site settings update retained samples. Observer-free fallback remains usable. | Passed | Thumbnail regression tests |
| Production scroll | All 75 cards encountered; no thumbnail removal on down/up scroll. Returning through visited cards adds zero surfaces. | Passed | [Metrics and mutation counts](../../evidence/2026-10-13-catalog-performance/performance.json) |
| Desktop and phone | Actual defaults render; phone card width 270px including borders, inner width 268px, scale 0.223333. Document width 375px inside the 390px viewport, with no horizontal overflow. | Passed | [Desktop](../../evidence/2026-10-13-catalog-performance/desktop.png), [phone](../../evidence/2026-10-13-catalog-performance/mobile.png) |
| Search and preview | Search `split` yields six choices; adding the hero tag yields one. Full Preview renders, Mobile measures 375px, Back restores the filtered grid. A nonexistent search shows the empty state; Reset restores 75 cards. | Passed | Browser observations |
| Creation and cleanup | Selecting Split image opens New block and an uncommitted page preview. Cancel restores the original eight blocks, with zero mounted catalog thumbnails outside the dialog. | Passed | Browser observations and existing creation tests |
| Console | No warnings or errors captured during the final production interaction checks. | Passed | Browser log inspection |

## Performance observations and limits

The [raw results](../../evidence/2026-10-13-catalog-performance/performance.json)
contain Chrome Performance-domain counter differences, in milliseconds for duration
fields, plus heap/node deltas. They are browser work totals across the interaction,
not click-to-paint latency or an FPS benchmark. Tool state inspection contributes
some overhead; collection windows and garbage collection vary. The CPU Profiler
command was unavailable through the browser driver, so no full CPU profile or
function-level attribution is claimed.

| Same four-page scroll path | Baseline | Final |
| --- | ---: | ---: |
| Downward scripting work | 360 ms | 288 ms |
| Return scripting work | 335 ms | 59 ms |
| Return layout work | 127 ms | 9 ms |
| Return style recalculation | 161 ms | 18 ms |
| Thumbnail surfaces added after initial open, down and back | 115 | 60 |
| Thumbnail surfaces removed on that trip | 115 | 0 |

Both versions initially render 15 thumbnail surfaces at this viewport. The final
full traversal retains 75 surfaces containing 3,312 descendant elements, then
releases them when leaving the grid. This is the consequential memory tradeoff.
Heap deltas include uncollected garbage and do not establish retained heap size or
absence of leaks. Automated cleanup assertions and observed DOM removal establish
the narrower lifecycle behavior.

One initial-opening observation was 342 ms scripting before and 231 ms after.
Repeated openings varied: the final runs ranged from 128–292 ms, and repeated
baseline runs from 210–257 ms. These measurements do **not** establish a consistent
opening speedup. The code removes redundant sample/context/observer work; a stronger
opening-performance claim needs controlled traces with representative client data.

This is a Chrome desktop and emulated-width check, not cross-browser or physical
mobile coverage. It does not establish performance for arbitrarily large catalogs
or third-party blocks that keep running expensive effects offscreen. Footer/generic
compatibility is covered by the existing automated library tests, not an additional
browser pass. Live GitHub/GitLab/R2, publish, hosting and form delivery were outside
scope. Nothing was committed, pushed, or deployed.

## Cleanup

The temporary performance observer and cache/viewport overrides were confined to
the owned test tabs. Overrides were reset, the tabs closed, and the two owned HTTP
servers stopped. Existing user tabs, servers, local drafts and root content were
preserved. Build copies remain in the OS temporary directory; evidence is retained
in the repository. The wiki reader and its integrity check were rebuilt after the
records were written.

The report metadata checker accepts this run but reports four pre-existing legacy
result labels in the GitLab, local-authoring, Quine and Intr reports. Their outcomes
were not rewritten by this task. See the [checker output](../../evidence/2026-10-13-catalog-performance/report-metadata.json).
This is separate from the passing wiki link/content integrity check.
