---
title: Searchable block library
updated: 2026-10-06
---
# Searchable block library

**ID:** FEAT-block-library

## Intent and basis

[DEC-079–DEC-091](../decisions/index.md) and the [accepted scope](../discussions/block-library.md) expand the legacy TailwindBlocks reference into current-system content blocks. The six reference websites guide coverage, not exact copies.

## Entry points and prerequisites

Pages → open a static or generic page → Add block. Site Layout → Starter → Header and Footer configure the retained shared chrome; other layouts own their own settings. Collection schemas → a field → list defines structured entry data; Content edits its values. These are local editor operations until Save/Publish is used.

## Expected outcomes

- A large Kumo dialog searches names, themes and tags. Theme and multiple tag filters combine; Reset restores all compatible choices. Clicking a card inserts immediately. Preview is separate and supports desktop/mobile widths. Thumbnails render the actual defaults and mount only near the visible grid.
- The catalog has no visible title or bottom Close action; an accessible top-right × is centered using Kumo's square icon-button shape. Filters, tags, count and cards share one vertical scroll area. Tags stay on one horizontally scrollable line with the scrollbar hidden; small left/right buttons at its ends scroll by up to 240px, disable at the corresponding edge and honor reduced motion. Reset filters stays visible, sizes to its text and disables when no filter is set. Cards cap at 270px wide. Preview uses the same scroll area and starts at the top when opened or exited. These refinements follow direct screenshot feedback on 2026-10-06.
- There are 45 Tailwind UI base variants: three each for Hero, Header introductions, Content, CTA, Bento, Features, FAQ, Stats, Team, Testimonials, Logos, Blog, Contact, Newsletter and Footer. Another 27 generic variants cover Hero, Header, Content, Bento, Features, FAQ, Stats, Team and Testimonials. Older versions remain installed. Starter is the fallback theme for older definitions.
- Only compatible page kinds and latest nondeprecated versions appear in the picker. The three Starter footer variants are selected in its layout settings rather than inserted as page blocks. Existing records keep their stored version.
- Repeated content uses stable row identities, nested item editing, add/remove, mouse dragging and Alt+Arrow keyboard ordering. The [shared sortable control](editor.md) gives page blocks and repeated items the same optimistic FLIP behavior: direct vertical carrying from the grab point, locked X position, 150ms neighbor/settle animations, edge scrolling, and commit on release even outside the list. Gaps remain valid positions. Only the list previews the new order while held; committed content and the website preview update once on release. Schema lists have one structured row level, using supported scalar/rich-text/media types. Block-owned structures can nest for footer columns and grouped navigation.
- Generic list bindings match row field keys and types. Required child fields must be available. Empty optional lists use the fixed fallback, consistently with optional scalar bindings. The generic editor names the required item shape; bound previews show the field-name placeholder.
- Blog blocks select a collection and optional title/summary/image/date mappings. Blank title mapping uses the collection title field. Only mapped entry values are added to that block's context; unrelated blocks do not receive them. Entry URLs follow the existing generic-page assignment rules.
- Header settings support brand/logo, navigation items, grouped dropdown links and an optional action. Native disclosure controls support mobile and keyboard navigation without a public client runtime. Until customized, the header uses existing navigation; customized header/footer URLs are explicit URL fields.
- Starter footer selection/content now persist in `site.layout.settings.footer`; legacy `site.footer` converts on editor load. Removing it restores the Starter site-title footer. The versioned Starter wrapper owns its three variants and shares header/footer source with preview. Other layouts are free to implement any surrounding structure. See [Site Layouts](site-layouts.md).
- Forms use native POST to an explicitly configured HTTP(S) endpoint; a destination is required for publication. Contact sends name/email/message; Newsletter sends email. Browser validation enforces required inputs. The endpoint supplies its success/error page. Editor/catalog previews cannot submit. No provider-specific form backend is included.
- Content controls have no new design panels. Layouts follow site fonts, body size/line height, gutter, content width and light/dark mode. Theme CSS is scoped; built-in abstract artwork appears until media is selected. No legacy Payload dependencies, remote placeholder images or new dependencies are introduced.

## Verification recipe

1. Run `pnpm verify`. The library tests cover every new renderer with default, empty and long escaped content, typed lists/bindings, mapped collection context, form contracts, shared chrome and retained versions. Generation tests verify footer selection, stale-file cleanup and unchanged-file preservation.
2. In a fresh admin tab open Home → Add block. Confirm the title/footer actions are absent, the centered × closes without insertion, Reset starts disabled, tags stay on one horizontal row, and vertically scrolling moves the filters with the grid. Check the tag arrows move a short distance in either direction, disable at each edge, update after resizing, and leave native horizontal scrolling usable with no visible scrollbar. Cards should remain at most 270px wide across window sizes. Search hero; combine theme and tags; try a nonexistent query and Reset. Reset clears the filters and disables again. Preview a result, toggle Mobile and go Back: no insertion, with the toolbar visible at the top. Click the card: one block appears and its content editor opens.
3. Add Split accordion. Edit a repeated question, reorder with its handle, reload and confirm value/order recovery. Drag up and down, releasing on either edge and the middle of the gap between two rows; the live row positions and final order should agree. Move sideways outside the list and release: the row stays in its original X lane, follows cursor Y and commits the shown order. Add/remove another item and try Alt+Arrow. Cancel block changes restores the captured block.
4. In a generic page add a FAQ block and bind Items to a compatible schema list with `question` (text) and `answer` (richtext). Populate an entry; published rendering uses those rows. Missing keys/types or required child values fail publication. Schema editing remains separate from entry editing.
5. Site Layout → Starter → Choose footer offers three layouts. Edit nested links; Pages previews show the same shared footer. Header → Navigation permits grouped links. Test menu disclosures with Enter/Tab at a narrow containing width.
6. For native submission verification, use a disposable loopback endpoint and test-only values. Check the received POST and both success/error responses. Verify previews remain disabled. Remove the test page and stop its endpoint afterwards.

## Coverage and limitations

All 72 new variants have automated rendering coverage. Browser checks sampled catalog, repeatable editing, shared chrome and public layouts; they are not a complete visual audit of every variant on every device. The theme is an adapted starting library, not finished brand-specific designs. External form service behavior, live GitHub/R2/Netlify operations and physical mobile devices are outside the local checks.

## Verification history

- [Layout-owned chrome, chartr blocks and dedicated list editing](../verification/runs/2026-10-06T1140Z-site-layouts.md).

- [Optimistic FLIP sorting and Chartr reference behavior](../verification/runs/2026-10-06T0845Z-sortable-flip.md).
- [Gutter drop regression repair](../verification/runs/2026-10-06T0632Z-gutter-drop.md).
- [Close-icon alignment and tag scrollbar refinement](../verification/runs/2026-10-06T0628Z-catalog-controls.md).
- [Catalog polish and automated checks](../verification/runs/2026-10-06T0619Z-catalog-polish.md); visual verification was blocked by the computer-use URL restriction.
- [Block-library implementation and checks](../verification/runs/2026-10-06T1320Z-block-library.md).
