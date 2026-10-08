---
title: Layout-owned content spacing
updated: 2026-10-08
status: Implemented
---
# Layout-owned content spacing

The user requests moving the pictured Content spacing section into Site Layout and letting each layout define its default gutter and site content width. DEC-130 supersedes DEC-097’s decision to keep spacing outside layouts. This is a direct implementation request; no product interview is needed.

Both built-in layouts now store editable `contentMaxWidth` and `pageGutter` in their active settings. Their manifests own the defaults: Starter 1200px/24px, chartr 1512px/40px, using the previously recorded chartr reference geometry. These exact defaults and shared helper mechanics are engineering choices within the request.

Switching layouts or retained versions uses the selected definition’s defaults, including spacing. Selecting the current version remains a no-op. Candidate Preview uses the candidate’s defaults without changing the draft. Clearing an override falls back to that layout’s default; zero remains a valid explicit gutter. Public wrappers, live previews and block context receive the same resolved values. Settings retains Backups and Session.

The existing legacy Starter reader carries spacing into the active settings; no new migration of canonical global spacing is introduced. The chartr example backup now stores spacing with its layout. The [feature contract](../features/site-layouts.md) records ownership and validation; the [verification run](../verification/runs/2026-10-08-layout-spacing.md) covers 159 passing tests, build checks and a desktop Safari inspection. Live providers were not exercised.
