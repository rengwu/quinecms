---
title: Admin container sizing and preview overlap
updated: 2026-10-16
result: Passed
---
# Admin container sizing and preview overlap

Kumo's scoped descendant reset omitted the admin surface roots. The drawer used
content-box sizing: 360px plus 48px padding and a 1px border, covering 49px of the
preview. The top bar measured 81px against the reserved 60px.

One engine CSS rule now applies border-box sizing to `.kumo-ui` roots inside the
workspace. Archline, library pins, site content and preview rules are unchanged.

Safari on the local dev site, at a 1711px document width:

- Desktop: navigation width 216px; drawer left 216px, width 360px; preview left
  576px and top 60px. The drawer and preview boundaries now meet without overlap.
- Header height is 60px. Mobile preview starts at x=948.5px and y=60px, with a
  391px outer width (390px content plus its existing border), clear of the drawer
  and within the viewport. Logo and hero text are visibly complete.
- The 36 existing Kumo-style/navigation tests pass. No implementation-mirroring
  unit test or new browser-testing dependency was added for this CSS correction.
- The dev server was restarted with the updated engine. No content edits or
  remote writes were performed. Narrow browser windows and hosted deployments
  were not checked in this run.

For future admin-layout changes, inspect rendered drawer/preview and
header/preview boundaries in desktop and mobile preview modes; a successful
login or public homepage check alone does not cover this editor view.
