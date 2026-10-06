---
title: Site Layout decisions, round one
updated: 2026-10-06
status: Accepted; product interview complete
---
# Site Layout decisions, round one

Interprets the [submitted Q69–Q73 answers](2026-10-06-grill-3dfa46b2-2cec-4d74-8d0f-2079848d280d.md). All five select the recommended option with no additional notes. The form was collected once, its transcript saved and its temporary files cleaned up through the prepared lifecycle scripts.

- Q69 / DEC-097: content max-width and page gutter remain shared optional values outside layout settings. They survive layout switching; neither a layout nor a block is forced to follow them.
- Q70 / DEC-098: introduce separate Site Layout and Settings sidebar destinations. Site Layout owns selection and author settings; Settings retains shared width/gutter plus Backups and Session.
- Q71 / DEC-099: show a live page preview alongside layout settings, using a page selector and desktop/mobile widths. This revises DEC-057 for Site Layout without extending previews to unrelated admin screens.
- Q72 / DEC-100: a layout card applies that layout/defaults directly to the local draft, with a separate Preview action that leaves active state intact. Save draft and Publish keep their existing meanings. The active-settings-only behavior from DEC-095 remains in force.
- Q73 / DEC-101: developers install layouts in source and rebuild; editors choose among installed layouts. Package import through the admin is outside the selected scope.

The [consolidated design](../discussions/site-layouts.md) includes the direct requirements and this round. Layout-supplied styling variables remain optional for all blocks, with no categories or discrimination. Block styling has no unresolved classification branch.

The scoped product interview is complete. Rendering/settings interfaces, initial example layouts, first-time conversion of Site Options and handling layout code versions are engineering work; proposed approaches are labeled separately in the design. No further questionnaire is needed just to choose routine implementation details.

This turn updates planning records only. Completing the questionnaire is not a request to implement the redesign. Wiki structural checks do not establish implementation behavior.

## Subsequent library requirement

Before this turn finished, the user added a growing layout library and hidden client whitelist. The [library discussion](2026-10-06-site-layouts-library-discussion.md) records that extension and Q74–Q75; the original five answers above remain settled.
