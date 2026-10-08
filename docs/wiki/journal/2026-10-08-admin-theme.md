---
title: Admin dark and light appearance
updated: 2026-10-08
status: Implemented and locally verified
---
# Admin dark and light appearance

After asking where the green background around the mobile preview came from, the user requests a dark/light toggle under Settings, explicitly limited to the admin portal. DEC-133 records that boundary; no product questionnaire is needed.

Settings → Appearance now has a Dark mode switch. One small React context supplies the selected mode to the existing scoped Kumo surfaces, including the page list, sidebar, toolbar, form workspace, portal overlays and login gate. The sortable overlay already captures its source mode. Forced dark color-scheme rules are removed so Kumo controls follow their selected mode.

Engineering choices: retain dark as the default and store the explicit preference in browser-local storage, separately from site content and recovery. Invalid or unavailable storage falls back to dark; write failures do not stop in-session switching. A separate themed canvas fills the editor's background and replaces the inline green body color without putting the website preview inside an admin style scope.

Mounted tests verify switching, persistence after remount, unchanged site content and save state, preview isolation, page-list and dialog theming, login-gate inheritance and unavailable storage. Browser checks confirm light/dark Settings, light persistence after reload and unchanged website colors inside both light and dark preview surroundings. `pnpm verify` passes 167 tests, diagnostics, production build and artifact checks. See the [verification record](../verification/runs/2026-10-08-admin-theme.md).
