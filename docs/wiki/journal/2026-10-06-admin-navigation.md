---
title: Persistent admin navigation
updated: 2026-10-06
status: Implemented locally
---
# Persistent admin navigation

The user requested moving the five Home destinations into a sidebar. DEC-074 supersedes the Home menu: Pages, Content, Collection schemas, Media and Site now live in a persistent left navigation column with an active-area highlight.

Pages opens to its existing table. Individual page/block editing adds its own drawer beside the main navigation; the preview occupies the remaining width. Parent back buttons stay within each area. Content, schemas, Media and Site retain their standard admin workspace. Switching areas preserves shared edits.

The same Kumo navigation component appears in a Menu dialog below 800px. Selecting an area closes the dialog. These responsive and initial-view details are engineering choices supporting the requested sidebar.

The [verification run](../verification/runs/2026-10-05T1725Z-admin-navigation.md) records passing automated checks and desktop/narrow browser navigation. No commit or deployment was performed.
