---
title: Architecture review and comparison
updated: 2026-10-07
status: Analysis complete; recommendations unaccepted
---
# Architecture review and comparison

The user requested a fresh critique of features, collection schemas, architecture, future limitations, and ideas from other site builders. The [review](../discussions/architecture-review.md) records source-backed observations, current primary-source comparisons, proposed priorities, and acceptance cases. No new product decision or implementation authorization is inferred.

The main conclusion is that the existing static stack is useful, but content relations, reusable object schemas, general queries/bindings, a page-template/slot layer, and route context are needed to broaden authoring beyond flat sections and simple entry pages. Adding visual variants alone will not remove those limits. The review preserves the rationale for schema-only entries, one active layout, optional styling adoption, and developer-owned block implementations.

Engineering observations include versioned wrappers importing unversioned theme implementations, Starter footer rendering bypassing block-version dispatch, repeated whole-content work, full content passed into activated layouts, raw internal URLs in newer controls, and coarse editorial releases. These are distinguished from accepted first-release limits and from unmeasured scaling risks. No application, fixture, or retained implementation files were changed.

## Baseline verification

Inspected revision: `30c447e3d28c6e52eb2a24d323c1086bee9001b7`. The working tree was clean before review documentation was added. Node `v22.19.0`, pnpm `10.34.1`, macOS. Committed fixtures comprise nine JSON records, including one collection and two entries; 93 block versions and two layout versions were registered. Starter remained the active site layout.

`pnpm verify` exited successfully: 322 checked files with zero diagnostics, 132 tests in 18 files passed, seven output routes built, and asset/runtime checks passed. The build reported 1.28 seconds for its build phase on these small fixtures. The Journal index and two entry routes have zero reachable JavaScript modules. The artifact check reports 240,260 gzip JavaScript bytes for admin's reachable initial module graph; it excludes lazy tools, inline hydration payloads, CSS, and subsequent content requests and is not a full transfer measurement.

See the [verification log](../evidence/2026-10-07-architecture-review/verify.log). No new browser interaction, large-data benchmark, active-Chartr payload build, or live GitHub/R2/hosting operation was performed. Existing mocked tests and build checks do not establish those outcomes. No provider credentials were accessed, no content was saved remotely, and nothing was deployed.

The review used jstack's existing planning/wiki conventions. Current official documentation for Webflow, Framer, Shopify, WordPress, Storyblok, Sanity, Decap CMS, and Astro is linked next to the corresponding comparisons. Repository records and generated wiki HTML are the only tracked changes.
