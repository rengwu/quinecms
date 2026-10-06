---
title: Block library scope settled
updated: 2026-10-06
status: Accepted
---
# Block library scope settled

[Submitted answers Q66–Q68](2026-10-06-grill-d9dd6be8-d154-41d3-a042-1d645992c592.md) resolve the remaining contract choices. The form response was saved and its temporary session/download cleaned up through the prepared scripts.

- Q66 / DEC-089: add a shared configurable header with grouped navigation now.
- Q67 / DEC-090: add structured list fields to collection schemas and compatible bindings for generic block lists now.
- Q68 / DEC-091: editors change content only; themes and site settings control appearance. The proposed per-block Design panels were not selected.

Together with [round one](2026-10-06-block-library-round-one.md), the scoped interview is complete. No further product question is needed before implementing this phase. Metadata shape, compatible list matching, renderer reuse, list editing mechanics and exact adapted variants are engineering choices within the accepted behavior.

The [consolidated scope](../discussions/block-library.md) separates requirements from proposed implementation choices. It retains the six reference sites as capability/design benchmarks and starts with three distinct variants per legacy category, plus useful generic counterparts and a shared navigation header. Footer variants belong to site configuration. New blocks need working content controls, preview/public parity and real behavior rather than static visual placeholders.

No application code changed during the interview. Existing runtime behavior and earlier verification reports do not prove the planned features. The next work is implementing the shared field/binding and site-header/footer contracts, the catalog, and the refitted library, followed by focused and full verification.
