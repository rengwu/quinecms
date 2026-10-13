---
title: chartr layout and independent blocks
updated: 2026-10-06
status: Implemented after Site Layout foundation
---
# chartr layout and independent blocks

After the [Site Layout system](site-layouts.md) is implemented, the user requests recreating [chartr.dev](https://chartr.dev/) as a Site Layout plus independent blocks, using `../chartr-site-v2` as the source reference. DEC-106 records this requested sequence. This is a real use of the growing layout/block library, with a page assembled from separately registered content blocks.

The user subsequently authorized both phases. See the [implemented feature](../features/chartr.md), [journal](../journal/2026-10-06-site-layouts-implementation.md) and [verification](../verification/runs/2026-10-06T1140Z-site-layouts.md). The proposed decomposition and unexecuted targets below describe the planning stage.

## Requested outcome

- First implement the accepted Site Layout foundation, DEC-092–DEC-105, including author-owned settings, previews, picker, active-settings-only persistence and the hidden client whitelist.
- Then recreate the chartr website with its own selectable layout and independently addable, editable, removable and reorderable page blocks.
- Preserve the site's visual design and working interactions. Use the provided source to adapt its existing implementation into the builder's rendering, editing and lifecycle contracts.
- Keep the optional styling contract: chartr blocks can be used with other installed layouts and other blocks can be placed inside the chartr layout, subject to existing static/generic content rules. Do not add layout/block compatibility gates or styling-adherence categories.

The current request adds this follow-on implementation to the plan. No application implementation, source-repository edits or deployment took place while recording it.

## Source study

The live page text and the local source were inspected on 2026-10-06. The source has nine main content sections, shared header/footer, a website appearance switch, a download dialog and HTML/CSS/SVG app demonstrations. Relevant source files include `site/index.html`, `site/assets/chartr.css`, `themes.css`, `themes.js`, `theme-init.js`, `workspace-demo.js`, `pane-demo.js` and `theme-picker.js` in the reference repository.

The live site has release/download copy that differs from the local source's older placeholder state; some section copy also differs. Use the live website as the recreation target and the local repository as implementation/reference material. Recheck the actual live page and release destinations during implementation instead of copying stale local availability claims. This initial source study is not a visual parity check.

The source's current design is the one under `site/`. Its archived design rounds are historical references. Preserve the source repository, its archives and provenance records; implement the adapted layout/blocks in QuineCMS. Keep chartr branding lowercase and preserve required font/icon notices when copying assets.

## Proposed decomposition

The following component boundaries are engineering proposals derived from the source, not separately interviewed product decisions. The supplied main-page order becomes the initial assembled page; editors can subsequently arrange the independent blocks.

| Piece | Responsibility |
| --- | --- |
| chartr Site Layout | Brand/header, desktop and mobile navigation, website light/dark behavior, website typography and color variables, outer content structure, footer and their author-owned settings. |
| Introduction block | Main heading, introductory copy and primary/secondary actions. |
| Workspace block | Section copy, synchronized Tabs/Spaces/Chats selection cards and the interactive HTML app preview. Keep the cards and their associated preview together as one coherent block. |
| Agent grid block | Editable provider names, logos and destinations in the source grid arrangement. |
| Pane demonstration block | Section copy and the existing read-only pane-layout animation, with its looping, visibility and reduced-motion behavior. |
| Sessions block | Section heading and the open process-continuity/restored-workspace explanation. |
| Plugins block | Main extensibility explanation, action and repeated plugin/example cards. |
| App themes block | Native app-palette picker and its nearby app preview. Its app colors remain independent of the layout's website appearance. |
| Technical facts block | Repeated technology/fact rows and their destinations. |
| Download block | Download call to action, release/platform content and documentation links. |

Shared native-preview components, palettes, icons, fonts and motion helpers should be reusable dependencies of the relevant blocks. Independent blocks need not duplicate those implementations. The download action/dialog should likewise have a shared implementation that remains usable for the header and content actions, with working links when a caller is used outside the chartr layout.

The column and section-rail geometry can use optional layout variables with block defaults. Block content fields should cover copy, labels, links and appropriate repeated items; the faithful app-demo implementation can retain its source-defined sample states and supported controls. The page should be assembled through normal content records, not embedded as one opaque website or screenshot.

## Interactions and integration considerations

The current workspace source exports `mountWorkspaceDemo`, but also performs document-wide initialization. Other scripts directly query one page-level element and install document listeners. Adapt them to block instance roots and the existing mount/update/destroy lifecycle so that insertion, removal, repeated instances, catalog previews and layout changes work safely. Use unique instance IDs for controls and SVG definitions; clean up observers, listeners and animation clocks.

Preserve the source's demonstrated Tabs/Spaces/Chats transitions, supplied session/pane selections and keyboard behavior. The app window is rendered from HTML/CSS/text/SVG; research captures and recordings remain reference material. Avoid inventing additional live terminal or application behavior.

The pane animation loops with its source-defined rest and pauses when offscreen or the document is hidden; reduced motion shows the completed arrangement. Native-palette selection recolors the cooperating app previews without resetting their view/pane state. Scope this cooperation to the rendered page/preview so catalog cards and the admin do not affect one another. If the App themes block is absent, each demo still renders with its default palette.

Website appearance belongs to the chartr layout and preserves the source's system-preference/manual-toggle behavior. It must not recolor the native app demonstrations or the admin UI. App-theme selection belongs to the content demonstration and works with an alternative Site Layout.

These are implementation targets inferred from recreating the supplied site and source. They do not expand the underlying chartr application's capabilities or require changes to the native app repositories.

## Proposed verification — unexecuted

1. Assemble the nine blocks in the source order under the chartr layout. Compare the result with the live reference at desktop and narrow widths, in both website color modes, including typography, column/rail alignment, borders, header/footer and native-demo proportions.
2. Verify the mobile menu, keyboard/focus behavior, theme toggle, section links and download journey against the reference. Check live destinations and use current source-backed release content.
3. Exercise the workspace view/session/pane controls, animation visibility/reduced-motion handling and app-palette synchronization. Keep unrelated preview instances isolated and preserve per-demo selection state.
4. Add/remove/reorder and edit blocks through the builder. Test repeated interactive instances, catalog Preview and both page and Site Layout previews. Check lifecycle cleanup and unique DOM/SVG IDs.
5. Render these blocks in the starter layout and existing blocks in the chartr layout without style-based filtering or compatibility errors. Test native demos without the App themes block and actions outside the chartr layout.
6. Run `pnpm verify`, preserve retained block implementations, and record source-backed visual/browser results separately from automated checks and live-provider tests.

The prior source repository's tests/reports are reference evidence only. They do not validate the adapted builder implementations.
