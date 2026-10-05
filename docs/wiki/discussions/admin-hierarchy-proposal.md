---
title: Admin actions and collection hierarchy
updated: 2026-10-05
status: Accepted
---
# Admin actions and collection hierarchy

The user requested research and alternatives after identifying an ambiguous Add block button and a Collections view that mixes schema design with content authoring. [Q46–Q47](../journal/2026-10-05-grill-d3cb2bf4-2763-40ad-bc3a-9213d73c86a4.md) subsequently selected the header action and navigation alternative B, recorded as DEC-052–DEC-053. The user authorized implementation and then requested a separate Home menu (DEC-054). The implementation and verification limits are recorded in the [run](../verification/runs/2026-10-05T1054Z-admin-hierarchy.md). The existing Kumo choice, static architecture, safe schema changes, shared draft save, and dedicated block details remain accepted constraints.

## Observed problems

The Add block button stretches to the same width as block rows and shares their rounded outline, left-aligned label and spacing. It reads as another block. Changing label alignment alone would leave this grouping problem.

Collections currently opens configuration immediately: name, path, field definitions, entry-title field and deletion. Add entry sits among those schema controls. Existing entries are reached through the live collection preview or the mixed page/entry selector; adding or opening an entry switches to the Pages tab. There is no dedicated administrative entry list. This blends collection configuration, content creation and public preview navigation.

## Research

| Source | Observed guidance or behavior | Implication for this project |
| --- | --- | --- |
| [Carbon buttons](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines) | Alignment depends on the containing component and action hierarchy; low-emphasis controls suit supporting actions. | There is no universal instruction to center every button. Choose placement and emphasis before adjusting its label. |
| [NN/g similarity](https://www.nngroup.com/articles/gestalt-similarity/) and [proximity](https://www.nngroup.com/articles/gestalt-proximity/) | Similar appearance and nearby placement communicate grouping. | Put the list action in its header; reserve repeated row styling for actual blocks. |
| [Sanity Structure](https://www.sanity.io/docs/studio/structure-introduction) and [schema definition](https://www.sanity.io/docs/sanity-studio-quickstart/defining-a-schema) | Structure provides nested type lists, document lists and document editors; schema types are defined and registered in source files. | Borrow the clear browsing hierarchy. Its Structure tool is a document workspace, not a visual schema editor. |
| [Payload collection configuration](https://payloadcms.com/docs/configuration/collections), [list view](https://payloadcms.com/docs/custom-components/list-view), [edit view](https://payloadcms.com/docs/custom-components/edit-view) | Collections/fields are configured in code. Admin browsing and editing use distinct collection-list and document-edit views. | Opening a collection should lead to its entries, rather than immediately exposing field-definition controls. |
| [Strapi Content Manager](https://docs.strapi.io/cms/features/content-manager) and [Content-type Builder](https://docs.strapi.io/cms/features/content-type-builder) | Content Manager separates entry lists and forms; Content-type Builder is a separate schema-design tool, available in development only. | Separate authoring from modeling. Our already accepted portal schema editor need not inherit Strapi's environment restriction. |

The recommendations below are design judgments based on those patterns, not usability-test results for lean-sitebuilder.

## Accepted block action

Q46 accepts one section header with Blocks on the left and a content-width, borderless + Add block button on the right. Use a Kumo ghost button, vertically center the heading and action, align the header with the list's outer edges, and retain normal button padding. The icon/label form one centered group within the button. Keep the existing row design and drag handles. Remove the bottom Add block row. The precise spacing is an implementation detail.

The alternative footer with a larger gap and a centered borderless action was not selected.

## Collection navigation alternatives

| Alternative | Navigation | Tradeoff |
| --- | --- | --- |
| A — Content first, separate schema screen (original recommendation; not selected) | Collections → Journal → entries → entry → block. Journal also has an explicit Edit schema action leading to a separate screen. | Fits the current portal with few new navigation concepts. Schema remains discoverable but off the normal editing path. |
| B — Separate top-level Content and Collection schemas areas (selected) | Content lists entries by collection. Collection schemas lists models and opens their definitions. | Strongest separation, useful for many collections or distinct author/admin roles; adds navigation and collection selection in two areas. |
| C — Entries and Schema tabs within each collection | Journal opens Entries by default; Schema replaces the entry view completely. | Smallest structural change and easy switching; gives routine authoring and occasional configuration equal navigation weight and adds another tab layer. |

## Accepted separation and implementation direction

Q47 selects two separate top-level destinations, now reached from the standalone Home screen under DEC-054. Content owns collection entry authoring. Collection schemas owns collection creation and field definitions. Do not implement the earlier A recommendation as the chosen navigation model.

The following flow applies that separation to the existing portal; detailed control arrangement is an engineering recommendation, not an additional questionnaire answer:

- Content → collection → entry list → entry values and blocks → block details. Add entry belongs in the entry list. Entry editing retains the live preview. Back restores the preceding level and All blocks returns to the same entry.
- Collection schemas → schema list → collection definition → field definition. Add collection belongs in the schema list. Model controls include name/path, entry-title field, labels/keys/types/required/default/options, and collection deletion. Entry values and Add entry do not appear here.
- Preserve standalone Pages, Media and Site destinations. Keep entries within Content rather than switching to Pages. The Pages selector contains standalone pages only. All five destinations live on Home, outside the drawer and preview. Area roots show a back link to Home; nested views show only a back link to their immediate parent.

Both paths keep the current shared Save draft/Publish contract; separate screens do not imply separate Git transactions or per-entry publication states. Existing safeguards for populated field keys/types remain in force.

## Acceptance criteria and verification

The scoped design choices are resolved. No further interview round is needed for these two issues.

A satisfactory implementation exposes distinct top-level Content and Collection schemas destinations, lets an editor find/edit a Journal entry without encountering field-definition controls, enters schema editing deliberately, returns predictably at each level, and identifies Add block as a header action rather than a draggable item. The implementation now follows this hierarchy. The [verification run](../verification/runs/2026-10-05T1054Z-admin-hierarchy.md) records passing automated checks and the interrupted schema-screen browser review.
