---
title: chartr layout and blocks
updated: 2026-10-08
---
# chartr layout and blocks

**ID:** FEAT-chartr

## Intent and entry points

DEC-106 requests a recreation of [chartr.dev](https://chartr.dev/) after the [Site Layout foundation](site-layouts.md). The adjacent `chartr-site-v2` source remains unchanged. See the [scope](../discussions/chartr-recreation.md) and [implementation journal](../journal/2026-10-06-site-layouts-implementation.md).

In `/admin/`, choose **Site Layout → Change layout → chartr**, then set **Preview page → chartr**. The page at `/chartr` contains nine independent blocks in reference order. The committed site's existing Starter selection stays intact; the imported `examples/chartr-backup.json` instead selects chartr and contains the existing pages, collections and entries alongside the new sample. Browser backup import replaces the local draft, so use the picker when only changing layout.

## Components and behavior

| Component | Editable content / responsibility |
| --- | --- |
| chartr layout v1 | Site title/description, brand/home link, system/light/dark appearance and optional visitor switch, navigation/source/action links, footer links/copyright; shared typography, header, footer and public head assets |
| Introduction | Heading, description and actions |
| Workspace | Heading/copy and Tabs/Spaces/Chats cards with synchronized DOM app preview |
| Agents | Section heading and repeatable agent names/logos/links |
| Panes | Heading/copy and the source pane-arrangement animation |
| Sessions | Heading and repeated continuity explanations |
| Plugins | Copy/actions and repeatable plugin examples |
| Themes | Heading and fifteen app palettes with a separate native preview |
| Foundation | Repeated technologies, descriptions and destinations |
| Download | Release/platform copy, actions and six editable package links in a native dialog |

Blocks register normally and can be inserted, edited, removed and reordered. They are not gated to the chartr layout. Existing blocks render inside chartr; chartr blocks have scoped fallback styles under other layouts. Each block owns its centered content container, using the shared content max-width/page-gutter tokens with 1512px/40px fallbacks. The chartr layout defaults to the reference 1512px/40px geometry and owns editable overrides in Site Layout → Content spacing (DEC-130). The example backup stores these values with its layout settings. Narrow gutters cap at 28px, 20px and 16px, while smaller explicit values (including zero) remain effective. The chartr layout adds no second content container. Its header/footer use the same bounds, and inner containers supply responsive breakpoints. The shared demo code uses HTML/CSS/text/SVG rather than screenshots or iframes.

The website appearance switch affects only its layout surface. The app-palette picker coordinates demos inside that preview/page without changing the website appearance, another catalog preview, or each demo's view/pane selection. Repeated interactive blocks have independent state and internal IDs. Authors should give duplicated public section anchors distinct values if navigation targets them.

Workspace controls preserve the reference's supplied sessions, Tabs/Spaces/Chats transitions and pane tabs; terminals are read-only demonstrations. Pane animation pauses offscreen or when the document is hidden, loops while visible, and shows its completed arrangement for reduced motion. Mount/update/destroy handles observers, listeners and animation cleanup. Layout/context updates leave unchanged demo markup mounted.

The header and intro download actions open the first Download block's dialog in their layout surface; a Download block opens its own dialog. Without that block, action URLs remain ordinary release links. Native dialog close/Escape restores focus. Mobile navigation focuses its first link, closes with Escape and restores the menu button. Website preference storage is visitor-only; editor previews do not write it.

Release links/copy reproduce v0.3.0 observed on the live reference on 2026-10-06; this is a versioned fixture, not a latest-release service. Public assets include needed local fonts, icons and retained notices. See `src/themes/chartr/v1/README.md` for source provenance.

## Verification recipe

1. Select the chartr composition and compare desktop/mobile widths in both website modes. Check header/footer, section rails, fonts and native preview proportions. Repeat under Starter: section rules/labels must stay inside centered content bounds. Change layout width/gutter and verify only one gutter is applied; switch to chartr and confirm its 1512px/40px defaults; check the narrow preview as well.
2. Switch workspace views with cards and keyboard, then pane/session tabs. Pick an app palette; all cooperating demos change colors without resetting selection or changing the website theme.
3. Test mobile menu/Escape, internal section links and header/intro/download-block dialog actions; inspect all package destinations.
4. Insert a repeated interactive block with a unique public anchor, edit it and remove it. Check instance isolation and cleanup; try the blocks under Starter and existing blocks under chartr.
5. Run `pnpm verify`; build an isolated active-chartr fixture to exercise its public hydration and generic entry wrapper.

## Verification history

- [Content width and spacing repair](../verification/runs/2026-10-06T1426Z-chartr-spacing.md). Browser checks cover independent blocks under Starter, custom shared geometry, switching to chartr without duplicate gutters, and the mobile preview; all 132 tests pass.
- [Implementation verification](../verification/runs/2026-10-06T1140Z-site-layouts.md). Source-backed desktop/mobile review and browser interaction samples accompany automated DOM/lifecycle checks. No claim of a full pixel diff, physical-device matrix, live package installation or provider publication.
