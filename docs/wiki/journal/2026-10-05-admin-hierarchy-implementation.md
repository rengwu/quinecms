---
title: Admin hierarchy implementation
updated: 2026-10-05
status: Implemented
---
# Admin hierarchy implementation

Implemented DEC-052–DEC-053 following the accepted answers: Add block is a compact header action; Content owns collection entries; Collection schemas owns definitions and individual field settings. Entries no longer appear in the Pages selector. Parent back links preserve content edits and block details replace parent controls.

During implementation, the user rejected the sidebar destination grid and requested another nesting layer. DEC-054 records the resulting standalone Home screen with Pages, Content, Collection schemas, Media and Site. Area roots return to Home; the global menu does not appear inside the editing drawer.

The [verification run](../verification/runs/2026-10-05T1054Z-admin-hierarchy.md) records 61 passing tests, zero diagnostics, a successful static build and asset checks. Browser checks observed the header action, entry editing and Home layout; schema-screen visual inspection was interrupted by active user interaction and remains unverified. No live provider writes were performed.
