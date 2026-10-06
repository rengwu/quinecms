---
title: Site Layout discussion
updated: 2026-10-06
status: Initial discussion; subsequently resolved
---
# Site Layout discussion

The user proposes a single selectable Site Layout that owns everything surrounding page blocks: overall design, typography, navigation, header/footer, site title, theme behavior and its own unrestricted customization interface. Most existing Site Options would move into layouts. Keeping width/gutter and Backups/Session outside them is tentative. The user requests discussion, not implementation of this redesign.

Subsequent clarifications establish a block-picker-like layout dialog and minimal persistence: retain only the active layout and its current settings. Defaults may replace settings when switching, including when returning to a previous layout. The assistant's suggestion to remember settings for every layout was not accepted.

The user confirms that layouts may supply typography or other variables and each block chooses whether to follow them. An initial conceptual distinction between adaptable and rigid blocks was clarified immediately: this is a spectrum, with no actual categories or discrimination. The assistant's proposed “theme-aware” and “self-styled” labels are withdrawn. Do not introduce metadata, badges, filters, compatibility gates or preference based on styling adherence.

DEC-092–DEC-096 preserve these direct requirements. At the end of this initial discussion, the five first-round choices Q69–Q73 were unanswered. The [Site Layouts discussion](../discussions/site-layouts.md) separates accepted requirements from engineering recommendations.

Only planning records and the prepared offline questionnaire are being changed. Existing application code, content fixtures and runtime behavior remain the current implementation; wiki structural checks do not verify the proposed feature.

## Subsequent first-round outcome

The user submitted all five answers. [Round one](2026-10-06-site-layouts-round-one.md) records DEC-097–DEC-101 and completes the scoped product interview. Width/gutter remain shared; Site Layout and Settings become separate areas; layout settings gain a live preview; cards apply directly with a separate Preview action; developers install layouts in source. No application implementation took place during the discussion.
