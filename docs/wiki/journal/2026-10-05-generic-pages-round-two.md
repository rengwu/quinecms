---
title: Generic-page decisions, round two
updated: 2026-10-05
status: Accepted; interview complete
---
# Generic-page decisions, round two

Interprets [Q56–Q59](2026-10-05-grill-192c91a8-c5db-4b3b-9e4f-84772508186b.md), completing the [generic-page discussion](2026-10-05-generic-pages-discussion.md). These are planned behaviors; no application code or content was changed during the interview.

- Q56: A static page becomes the collection index by matching its URL to the collection prefix. No additional index-page assignment control is needed. Without that page, the prefix route returns 404.
- Q57: Include a basic collection-list block for static pages in this version. It lets an explicitly created index page display collection entries. This does not restore automatic index generation or add the deferred footer integration.
- Q58: Initial rich-text embeds support uploaded images and YouTube videos. Uploaded audio/video embeds and other external embed providers are outside this initial rich-text scope; this does not narrow the existing media library's upload support.
- Q59: The user supplied a custom answer: “come up with completely new entries. we don't need the existing ones”. Replace the current project's demo entries with fresh schema-only examples when implementing. Conversion or preservation of these existing entry blocks is unnecessary. This choice does not establish automatic deletion/migration behavior for imported or third-party repositories.

DEC-070–DEC-073 record these outcomes. Together with DEC-058–DEC-069, they settle the scoped redesign. No further questionnaire is needed. Concrete JSON interfaces, binding resolution, list-block controls and rich-text serialization remain engineering work governed by the accepted behavior, not additional product decisions.

The next useful step is implementation: update the content contracts and fixtures, then validation/rendering and the admin flows. The user's discussion-first instruction still applies; questionnaire completion is not authorization to begin that work.
