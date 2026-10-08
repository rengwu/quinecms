---
title: Content model implementation
updated: 2026-10-08
status: Implemented and locally verified
---
# Content model implementation

The user authorizes implementation of the [lean Sanity-style plan](../discussions/content-model-plan.md): “lets proceed with implementation. don't worry about backwards compatibility or migrations or anything. this is not deployed anywhere and has no users.” This confirms DEC-109 and authorizes the accepted scope through DEC-128. Replace prototype formats directly; no migration layer is required.

Implemented the shared object/array/reference grammar, named object records, single-entry mode, optional routing, schema traversal, usage/deletion checks and typed forward bindings with nested projections. Schemas now opens Collections and Objects; Content edits values through dedicated nested levels. Searchable reference controls select existing targets and preserve ordered unique selections. Shared defaults and populated nested values participate in impact checks. Git snapshots, backups and recovery carry the new model directly.

The [implemented feature contract](../features/content-model.md) records engineering choices separately from product decisions: compact entry-ID references, `many | single` modes, `_rowId` array identity, a 12-segment binding limit, one provisioned single entry, and explicit projection mappings. No compatibility or migration layer was added. Retained blocks/layouts continue to work through their existing field interface.

Added an importable `examples/content-model.json` and a generic Structured details block. The example exercises shared SEO across Journal and Company profile, data-only Authors, ordered related articles and three owned specification levels. It builds independently without replacing the repository's demo content.

`pnpm verify` passes 151 tests across 19 files, clean type diagnostics, the production build and artifact checks. Native Safari checks cover desktop/mobile nested editing, reload recovery, reference selection/order and public rendered values; development startup also mounts successfully. Mock GitHub tests cover new-record save/reload/publication. The [verification report](../verification/runs/2026-10-08-content-model.md) links exact build evidence and limits. Live providers and physical-device testing remain outside this run; nothing was deployed.
