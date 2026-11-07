---
title: Admin rework handoff
updated: 2026-11-07
status: Implemented; local verification complete
---
# Admin rework handoff

This continues Claude Opus 5.5 session
`95360e7d-1f28-45b5-bc08-5ce746c0ad4b`. The maintainer authorized implementation
with simple, adjustable choices and requested a later Opus verification/polish
pass. The maintainer subsequently stopped that agent and asked Codex to finish
independently. No active Claude collaboration or queue delivery is assumed.
Future review findings can go in `docs/wiki/discussions/admin-rework-review.md`.

## Current implementation

- Own Base UI controls, warm dark/light tokens, self-hosted Inter and compact
  login. Kumo is only a dev dependency for the old i18n spike. The runtime build
  no longer has Kumo/Tailwind/postcss scoping plugins.
- Grouped navigation, breadcrumbs, global save/publish actions and a collapsible
  sidebar. Lists/records are screens; nested editing and Add forms use panels.
- Page/entry main and metadata columns. Document actions are under ⋯. Panel
  parents retain pending values and are inert; upload busy state also covers
  portalled controls. Browser Back, Escape and close return one level.
- One mounted live canvas across Off/Split/Float and desktop/mobile. Split has a
  pointer/keyboard divider. Float moves by its bar and resizes from all corners,
  with aspect ratio and workspace bounds constrained.
- Media details, schema/field creation, layout creation and translation flows
  retain their existing draft semantics. Gallery frames use the real App.

The maintainer corrected two details during implementation:

1. **Split must fill the available height.** It now starts immediately under the
   toolbar and scrolls internally. Desktop has a logical width of 1280px scaled
   to the pane; mobile is 390px wide or scales down. Height follows available
   space. Only Float locks 1280×800 / 390×844 proportions.
2. **The main sidebar must resize and truncate overflow.** Its edge is draggable
   between 160 and 360px, with a stored width and keyboard arrow/Home/End support.
   Long collection names use ellipsis and expose the full name on hover.

## Files and review entry points

`src/editor/App.tsx` integrates the shell and existing data flows.
`Navigation.tsx` owns sidebar rows/resize controls. `Stack.tsx`, `FormScreen.tsx`
and the retained `PanelNavigation.tsx` API own nested panels.
`PreviewWorkspace.tsx` and `preview-workspace.module.css` own preview geometry.
`src/editor/ui/` owns controls/tokens; `src/admin/font.ts` is shared with login.
`editor.module.css` owns editor layout. Original extensions keep using Fields,
PanelSection and PanelLevel; no site overrides were introduced.

Active disposable review servers (owned by this implementation run):

- `http://localhost:5319/` — gallery, with direct frames at
  `/frame.html?screen=pages.page`, `pages.block`, `pages.add`, `preview.floating`,
  `preview.mobile`, `preview.floatingMobile`, `schemas.collection`, and the other keys in
  `tools/admin-gallery/screens.ts`.
- `http://127.0.0.1:5321/admin/` — isolated copy of the library's Tessera preset.
  Local fixture login: `fixture@example.com` / `fixture-password`. No Git/R2
  providers are configured. This is not a client content repository.

The original user's Chrome review tab should remain available. The implementing
agent is using a separate Helium tab for further browser verification. Restart a
site CLI after engine changes: assembly copies engine source, so HMR in the engine
checkout alone does not update the isolated site. The library fixture path is
recorded locally in `/tmp/quinecms-rework-library-path`; the basic production
fixture path is in `/tmp/quinecms-rework-site-path`.

## Verification status

- All **293 tests in 35 files passed**, using `pnpm exec vitest run --maxWorkers=4`.
  The bounded worker count avoids the 5-second timeouts seen during an earlier
  run with simultaneous site builds and unrestricted workers. The final focused
  navigation/preview/gallery run also passed all 56 checks.
- The isolated site passes production build, encrypted-admin/public-bundle checks
  and type checking: **0 errors, 0 warnings, 6 generated-code hints**.
- Browser observations cover full-height Split, desktop/mobile Float containment,
  pointer moving and corner resizing, sidebar pointer and keyboard sizing,
  ellipsis, block panels and Escape, a light 390px creation panel, production
  login and live counter preservation across modes and close/reopen.
- A reviewed Float defect was repaired: an absolutely positioned grid child
  retained `grid-column: 2`, using the former split column as its containing
  block. Float now resets its grid area. Mobile panels also use consistent
  padding for sticky headings/footers, avoiding horizontal overflow.
- Add page/block/entry actions are neutral; page titles carry the primary table
  contrast. Programmatically focused panel headings no longer have a focus ring.
- The production test fixture's static vanilla block now implements the documented
  browser `mount` contract as well as public `render`. No runtime workaround was
  introduced for that incomplete fixture.

Screenshots, exact build fingerprint, command outcomes and limitations are in the
[verification run](../verification/runs/2026-11-07-admin-rework.md). These are local
and mocked-provider checks, not a live Git/R2/hosting verification or independent
Opus review.

## Review boundaries and source material

The working tree already contained Claude's gallery, browser-Back work, brand
assets and Statamic research. Those changes are preserved. Nothing is committed
or deployed. Do not treat this as a clean diff from HEAD. The
[editor contract](../features/editor.md) describes current behavior; the
[accepted redesign](admin-redesign.md) and its two grill journals record choices.

Original reference/spike assets are preserved under
`docs/wiki/evidence/2026-11-07-admin-rework/`; see the
[reference index](../evidence/2026-11-07-admin-rework/reference-index.txt) and
[spike source](../evidence/2026-11-07-admin-rework/preview-spike-source.txt).
The initial [gallery handoff](admin-design-system-handoff.md) predates the rework.

Useful polish targets: hierarchy/density across record and schema forms, nested
panel sizing, floating chrome and resize affordances, very long labels, keyboard
focus, mobile top-bar fitting, and real-library responsive behavior. Editor-only
panel coverage was chosen as the simple adjustable default authorized by the
latest instruction. Proactive field-level validation remains deferred; existing
submission-time validation stays intact. Live Git/R2/hosting are outside these
local and mocked-provider checks.
