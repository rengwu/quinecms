---
title: Site Layouts
updated: 2026-10-08
status: Accepted design; implemented on 2026-10-06
---
# Site Layouts

Update on 2026-10-08: DEC-130 supersedes DEC-097. Content spacing now belongs to the selected layout, with author-defined defaults and editable width/gutter in Site Layout. See the [current contract](../features/site-layouts.md) and [journal](../journal/2026-10-08-layout-spacing.md). Earlier interview choices and proposals below retain their historical context.

The user requests a site-wide layout system to replace most Site Options. This page owns the accepted product design, recorded in DEC-092–DEC-105 and DEC-107 in the [decision register](../decisions/index.md). [Round one](../journal/2026-10-06-site-layouts-round-one.md) settles shared settings, preview, picker behavior and installation; [round two](../journal/2026-10-06-site-layouts-round-two.md) settles whitelist behavior for the growing layout library; [round three](../journal/2026-10-06-site-layouts-round-three.md) settles retained layout versions and explicit upgrades. The scoped interview is complete; engineering recommendations below remain proposals. The user also requests [recreating chartr as a layout and independent blocks](chartr-recreation.md) after this foundation is implemented (DEC-106). Both phases were subsequently authorized and implemented; see the [implementation journal](../journal/2026-10-06-site-layouts-implementation.md), [current authoring contract](../features/site-layouts.md) and [verification](../verification/runs/2026-10-06T1140Z-site-layouts.md). The recommendations and unexecuted targets below preserve the interview-stage proposal, not current implementation status.

## Settled direction

- Select one Site Layout for the entire public site. It wraps and contains the page blocks, including pages rendered from generic templates.
- Each layout author owns the surrounding design and its settings page: typography, navigation approach, header, footer, site title, light/dark behavior and any other customizations the author chooses. These examples do not define a fixed required settings schema. The only required visual composition relationship is that the layout wraps and contains the blocks.
- Editors can switch layouts through a picker similar to the block picker dialog.
- Persist the selected layout and only its current settings. Switching to another layout can initialize its defaults; switching back need not restore an earlier configuration. Do not build a settings cache per layout or require mappings between unrelated layout settings.
- Retain selectable layout implementation versions and pin each site's active selection to its chosen version. Adding a new implementation version does not upgrade existing sites automatically; upgrades are explicit.
- Layouts can supply optional typography and other styling variables. A block can use any subset or none. This is a spectrum, not two block types: no styling-adherence categories, labels, badges, filters, compatibility gates or preferential treatment. Existing static/generic page-kind rules describe content binding and are a separate concern.

The main sidebar has separate **Site Layout** and **Settings** destinations. Site Layout contains the active layout, Change layout and the author's settings interface. Settings retains Backups and Session. Under DEC-130, Content spacing is part of Site Layout and switching uses the selected layout’s width/gutter defaults. The optional values do not force a container or styling on any layout or block.

Site Layout settings have a live preview alongside them, with a page selector and desktop/mobile widths. This adds Site Layout to the existing page-editing preview scope; unrelated standard admin views retain their existing behavior. Generic-page block bindings continue to preview with field-name placeholders under DEC-069.

Clicking a different layout's card applies that layout and its defaults to the local draft. The separate Preview action is for inspection and does not replace the active layout/settings. Developers install layout implementations in source and rebuild; editors choose installed layouts. An admin package-import workflow is outside the selected scope.

Existing Save draft/Publish and session recovery behavior remains the baseline. The active layout/settings participate in the same site-content save, recovery and backup snapshots. Selecting a layout does not publish it immediately.

## Growing layout library and client availability

The repository will accumulate reusable layouts as the developer builds additional client sites. A client should be offered a selected subset through a hidden layout-whitelist environment variable, which hides all other layouts from the picker. This is developer configuration, outside editor-visible settings. The library remains in source; hiding a layout for a client does not delete it from the repository or turn it into client-owned page content.

When the whitelist variable is absent, all installed layouts are available. When configured, it limits future choices in the layout picker. An already-active installed layout keeps working with its current settings even if excluded: it continues rendering, previewing and being configurable through its own settings page. Whitelist exclusion alone must not invalidate that site's build, Save or Publish, or silently switch/reset its layout.

An excluded active layout does not gain a card or candidate Preview in the filtered picker. After the editor switches to an allowed layout, the previous excluded layout cannot be chosen again through the picker unless the whitelist changes. Normal switching still initializes the newly selected layout's defaults and retains only the active settings.

This restriction concerns layout availability. It adds no block styling categories, compatibility rules or preference based on whether a block follows layout variables.

Proposed configuration:

```sh
SITE_LAYOUT_WHITELIST=starter,editorial
```

The name, comma-separated syntax and example IDs are proposals, not existing configuration. Use stable layout IDs rather than display names. Resolve the setting at build time, so a configuration change requires a rebuild and does not add an admin control or a visitor-facing environment lookup.

The implementation should separate the installed implementation registry from the filtered picker catalog. Rendering, settings and current-layout preview must still resolve an installed active layout that is outside the picker whitelist, including when loading saved content through the existing editor workflow. Lazy loading can keep candidate implementations out of the initial payload; stripping all excluded implementations solely because they are absent from the picker would conflict with DEC-105. Precise imports and asset generation remain engineering work, with public routes loading their active layout.

| Question | Decision | Accepted outcome |
| --- | --- | --- |
| Q74 | DEC-104 | When the variable is absent, show all installed layouts. |
| Q75 | DEC-105 | Keep an excluded active layout working with its current settings; restrict future picker choices. |

The user selected the alternative to the assistant's Q75 recommendation; requiring the active layout to appear in the whitelist is rejected. As an engineering recommendation, report unknown IDs or an explicitly configured empty list as configuration errors rather than silently broadening visibility. This is separate from the accepted absent-variable and excluded-active behavior; exact parsing has not been selected as a product requirement. The whitelist controls offered selection, not content access authorization. See the [library discussion journal](../journal/2026-10-06-site-layouts-library-discussion.md) and [round-two interpretation](../journal/2026-10-06-site-layouts-round-two.md).

## Layout versions

Q76 is resolved as DEC-107: retain selectable code versions, matching the existing block approach. The site identifies its selected layout and version, and keeps using that implementation when a newer version is installed. Editors can deliberately upgrade; older installed versions remain available. Retention includes the rendering and settings implementation needed to keep the selected version working.

This concerns implementation versions, not saved settings for inactive layouts. DEC-095 still stores only the active layout/version and its current settings. Retained source code does not add a settings cache or history per layout. No automatic upgrade is implied by a rebuild, source-library update or deployment.

The active version must also continue to resolve when its layout is excluded from the picker whitelist, under DEC-105. Versioning does not change the agreed rules for switching between different layouts or the whitelist's restriction on future picker choices.

Exact version-picker presentation and settings-transition mechanics remain engineering work. Q76 does not independently select automated settings migrations, guessed field mappings or inactive-settings retention. See the [submitted answer](../journal/2026-10-06-grill-7a73a1dd-dfe9-4d9a-9118-fd7107ac2d9c.md), [round-three interpretation](../journal/2026-10-06-site-layouts-round-three.md) and [initial readiness journal](../journal/2026-10-06-site-layout-updates.md).

## Pre-implementation design context

At the time of this discussion, the implementation put title/theme, typography, header and footer controls directly in `src/editor/App.tsx` and `src/editor/SiteDesign.tsx`. `src/layouts/Public.astro` and the page preview each compose the shared header, blocks and footer. `src/core/site-style.ts` supplies shared typography/spacing variables. These are observed implementation facts, not the proposed extension contract.

The new layout ownership revises the central typography controls from DEC-078 and the central header/footer configuration from DEC-087/DEC-089. A layout may offer those features, different ones, or no header/footer. DEC-097 preserves the advisory width/gutter controls. DEC-098 updates the Site destination from DEC-074; DEC-099 revises DEC-057's Pages-only preview boundary to include Site Layout settings. DEC-020's optional block participation remains applicable; DEC-096 makes the absence of styling categories or compatibility discrimination explicit. DEC-091's content-focused block editing does not gain new per-block Design panels through this redesign.

The [editor](../features/editor.md), [public rendering](../features/static-blocks.md) and [block library](../features/block-library.md) records still describe the implemented system. They do not claim this redesign is available.

## Engineering recommendations — not accepted decisions

- Model layout selection independently from page blocks. Switching the wrapper should preserve pages, block IDs/order/props, entries and collection schemas.
- Offer reusable field controls plus an author-supplied settings interface so the platform's current field inventory does not limit layout customizations. Settings remain compatible with the existing JSON content/save workflow; precise interfaces remain engineering work.
- Provide useful optional shared variable names for typography and spacing, with authors free to add their own. Do not score, classify or restrict blocks according to which variables they consume.
- Use the selected layout in both public rendering and browser preview, with layout styles contained to the website surface so the admin remains usable. A layout's custom features should work under the existing static-site architecture; this request does not independently replace the hosting/runtime model.
- Implement the accepted source-installation model with a registry exposing identity, display metadata, defaults, rendering and settings UI without imposing a universal header/navigation/footer schema.

Proposed stored shape, with author-defined JSON settings and no inactive-layout settings map:

```json
{
  "layout": {
    "id": "starter",
    "version": 1,
    "settings": {}
  },
  "globals": {
    "contentMaxWidth": 1200,
    "pageGutter": 24
  }
}
```

This is a partial site-record sketch, not an accepted exact interface or format migration. Existing envelope/identity fields are omitted for clarity. The layout's own settings may contain whatever JSON its implementation needs; title, header, footer and appearance fields are not mandated by the core.

A rendering interface should pass the page's block content as a slot alongside the active settings and useful public context, such as page identity and media/content references. The author chooses the surrounding structure. A settings interface should edit those values through the shared draft state, with reusable fields available as helpers. Public rendering and immediate browser preview must both be supported within the existing static build and shared-document architecture. This describes the integration work; it does not choose a React-only public-layout contract or introduce a mandatory visual theme.

For the foundation implementation, propose adapting the current shell into a starter layout and carrying the current Site Options into its initial settings. The subsequently requested [chartr recreation](chartr-recreation.md) supplies the next real layout and independent blocks after the foundation is complete. The first-time conversion is separate from ordinary layout switching, which uses defaults and performs no cross-layout settings mapping. Exact format handling remains an engineering proposal; retained layout versions and explicit upgrades are accepted under DEC-107. The existing retained-block-version requirements continue to apply to blocks.

## First-round outcome

| Question | Decision | Accepted outcome |
| --- | --- | --- |
| Q69 | DEC-097 | Keep content max-width and page gutter as shared, optional values outside layouts. |
| Q70 | DEC-098 | Separate Site Layout and Settings areas in the main sidebar. |
| Q71 | DEC-099 | Preview a selected page alongside layout settings, with desktop/mobile widths. |
| Q72 | DEC-100 | Apply directly from a card to the local draft; a separate Preview action leaves the selection/settings intact. |
| Q73 | DEC-101 | Developers install in source and rebuild; editors choose installed layouts. |

All five were answered as recommended. No styling-category question is needed: the user's final clarification explicitly rules out such categorization. The subsequent library/whitelist requirement is resolved by Q74–Q75 above, and Q76 resolves layout code updates as DEC-107. No further product question is needed for this scope. Concrete authoring interfaces and starter implementations remain engineering work.

## Proposed validation targets — unexecuted

- Switch A → B → A: each different-layout selection starts from its defaults, while page/entry/block records and shared width/gutter values remain intact. Only the selected layout/settings are serialized. Selecting the already-active layout should be a no-op rather than an implicit Reset action.
- Open and leave a candidate Preview without applying: the active layout/settings and local draft remain identical. Apply from a card: only the local draft changes until Save/Publish.
- Exercise different settings interfaces, optional variables and a layout with a different navigation structure. The platform must not require a shared header/footer or fixed customization list.
- Render blocks that consume different subsets of variables together. Layout changes must not alter catalog eligibility/ranking or generate styling categories, warnings or compatibility failures.
- Compare public output, page editing and Site Layout previews at desktop/mobile widths, including generic-page placeholders and interactive navigation. Check that layout styles do not change admin controls and that switching/unmounting releases layout behavior.
- Save/reload, recover the tab and export/import a backup with the active layout/settings. Retain existing incomplete-draft/publication validation behavior; evaluate author-defined settings validity, not block adherence to layout styling.
- With no whitelist variable, verify that all installed layouts are offered. Configure two allowed IDs in a larger source library and verify that only those choices are offered, with no admin control for the whitelist. Picker search/filter/reset and candidate Preview must not reintroduce hidden layouts. Verify configured-empty/unknown-ID handling against the chosen implementation policy, which remains a proposal here.
- Exclude the currently active layout from the whitelist and rebuild: its output, settings and current-layout preview continue to work with unchanged values. Save/reload and Publish validation must not fail solely due to exclusion. Keep it absent from the picker; switch to an allowed layout and verify that the excluded layout remains unavailable for reselection. Load an existing content snapshot whose active installed layout is excluded and verify that implementation resolution still works.
- Add a newer version beside a selected older layout version and rebuild: public rendering, preview and settings editing continue using the selected older implementation. Exercise an explicit upgrade and Save/reload, verify the chosen version persists, and check that older installed versions remain available. Repeat the retained-active case with its layout excluded from the picker whitelist.

These are proposed tests for a future implementation. The wiki build only validates the discussion records and links.

See the [discussion journal](../journal/2026-10-06-site-layouts-discussion.md) and [open questions](open-questions.md).
