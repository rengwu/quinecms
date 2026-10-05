---
title: Shared content width and development reloads
updated: 2026-10-06
status: Implemented locally
---
# Shared content width and development reloads

DEC-075 follows the user's request for one site-wide content max-width that blocks are advised to follow. Site settings now stores the optional pixel value in globals. The public layout and preview use a shared resolver and CSS variable. Starter containers, header/footer and responsive media sizing follow it; Hero retains a full-width background and its narrower text measures. Documentation tells authors that adoption is optional.

The user also requested removing the reload confirmation during development. The unsaved-edit handler is now skipped in development; tab recovery still runs. Production keeps its existing unsaved-edit warning.

The [verification run](../verification/runs/2026-10-05T1735Z-content-width.md) records 77 passing tests, the static build and an actual dirty-session reload without confirmation. The existing dev process held a stale route for a removed demo entry; restarting it on 4321 cleared that error. The isolated verification window was closed, and the user's session remains available.
