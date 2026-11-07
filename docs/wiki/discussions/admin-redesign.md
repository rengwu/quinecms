---
title: Admin redesign
updated: 2026-11-07
status: Implemented and locally verified; optional visual polish remains
summary: A complete, compact redesign of the admin portal after Statamic's shell and editor, with split and floating live previews.
---
# Admin redesign

The maintainer finds the Kumo-based admin basic and chunky, and its menu and
sub-page navigation hurried. The redesign replaces the shell, navigation, editor
layout and components. Statamic's editor is the main reference and Cursor's
settings screen sets the density. Apostrophe-style in-page editing is deferred.
The [design-system audit](admin-design-system-audit.md) records the starting
point, and `pnpm gallery` shows every screen and state.

## Accepted direction

From the [first](../journal/2026-11-07-grill-cce6caa4f347fe8a4b850ab1b8b91990.md)
and [second](../journal/2026-11-07-grill-f90083cec02fa6ee4a9f346e3cd40120.md) rounds,
recorded as DEC-234–DEC-248 in [Decisions](../decisions/index.md):

- **Shell:** a top bar with the sidebar toggle, logo, breadcrumbs, editing
  language, save status, Save draft and Publish. These actions apply to the whole
  site, so they appear on every screen.
- **Sidebar:** Content (Pages, Collections expanding to each collection, Media),
  Design (Layouts), Schemas (Collections, Objects), and Settings at the bottom. The
  admin opens on Pages. A ⌘K jump-to is deferred.
- **Navigation rule:** lists and records are screens, shown in the breadcrumbs.
  Anything inside a record (blocks, object fields, list items, referenced entries,
  schema fields, media details) and every Add form opens in a stack, a panel that
  slides over the editor. Stacks replace the drawer and inner panels with their
  ← Back buttons. Browser Back closes the top stack or leaves the screen.
- **Editor:** a main column with the title and the fields or blocks, and a side
  column with the path, layout, page type, language status and Used by. The side
  column moves under the main column when the editor is narrower than about 560px.
- **Preview:** Off, Split and Float, opening in Split the first time and remembered
  per browser. A Preview toggle in the top bar shows or hides it. The preview's own
  bar holds Float or Dock, Desktop/Mobile and Close. There is no preview below 800px.
- **Visual system:** 13px text, 28px controls, Inter self-hosted and brand amber
  for emphasis.
- **Components:** our own, on Base UI, replacing Kumo.
- **Delivery:** change the real editor step by step and judge each step in the
  gallery.

## Live preview

Split and Float are feasible because of how the preview already works. It renders
inside the editor page, not in an iframe, and the library designs respond to
container queries, not viewport media queries. The preview therefore renders at a
fixed logical width, 1280px for desktop and 390px for mobile, and a CSS transform
scales it to the space available:

- **Split** docks the preview right of the editor, with a draggable divider. It
  fills the available height below the toolbar, without vertical letterboxing,
  following the maintainer's implementation review. Desktop retains a logical
  width of 1280px scaled to the pane; mobile stays 390px wide (or scales down to
  fit). The logical height follows the available pane, and the page scrolls inside.
- **Float** is a window above the workspace. It is dragged by its bar anywhere in
  the workspace and resized from any corner with the device's aspect ratio locked
  (1280×800 or 390×844). Its position and size are remembered.
- Switching modes changes only the CSS of a single preview element, so React, Vue
  and Svelte islands stay mounted. Pointer events on the preview pause while
  dragging or resizing.
- The scaled frame contains `position: fixed` elements such as sticky headers.
- **Limits:** viewport units and `@media` width queries still read the browser
  window. The library uses `100dvh` once. A separate always-on-top OS window
  (Document Picture-in-Picture) works only in Chrome and Edge and is not planned.

A throwaway prototype in round one showed the interaction; it is not in the
repository.

## Visual system

| Token | Value |
| --- | --- |
| Text | 13px/18px; 12px for secondary text; 15px for stack and section titles; 18px for page titles |
| Controls | 28px high, 24px inside the preview bar; sidebar rows the same height |
| Spacing | 4px grid |
| Radius | 6px controls, 8px panels and cards |
| Typeface | Inter, self-hosted; the system font as fallback |
| Colour | Warm neutrals from the brand's ink `#1d1b18` and paper `#f7f6f3`; amber `#ee9b00` for the primary action, switches that are on, focus, the current item and the selected block |

Dark and light modes remain. Components cover the 14 Kumo pieces the editor uses
today: Badge, Button, Checkbox, Dialog, Input, InputArea, Label, Link, Radio,
Select, Switch, Table, Tabs and Toast. Once Kumo is gone, its Tailwind stylesheet
and the `.kumo-ui` scoping step (`scripts/kumo-styles.mjs`) go too.

## Implementation choices and review

The maintainer's subsequent “work-until-grill” instruction authorized simple,
adjustable choices where interaction detail was unclear, with Opus 5.5 to review
and polish the result. That parallel review was later stopped at the maintainer’s
request; implementation continued independently. Panels therefore cover the editor column and keep the
split preview visible. This is an implementation default, not a newly polled
preference. Submission-time validation remains; proactive field-level validation
is still a separate proposal.

The real editor now uses the new shell, components, record columns, panels and
single-canvas preview. See the [implementation handoff](admin-rework-handoff.md)
and [verification](../verification/runs/2026-11-07-admin-rework.md).

Kumo is absent from the runtime editor, build plugins and production dependencies.
It remains a development dependency only for the older isolated i18n research
spike. Its Tailwind/postcss scoping build step is removed.

Durable copies of the original [visual references and spike images](../evidence/2026-11-07-admin-rework/reference-index.txt)
and [interactive spike source](../evidence/2026-11-07-admin-rework/preview-spike-source.txt)
are retained for the next review. The two submitted grill journals above remain
the authoritative accepted answers.
