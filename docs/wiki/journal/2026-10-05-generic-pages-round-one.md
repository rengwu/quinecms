---
title: Generic-page decisions, round one
updated: 2026-10-05
status: Accepted; follow-up resolved
---
# Generic-page decisions, round one

Interprets [Q48–Q55](2026-10-05-grill-d557fd13-2a71-44e6-9b9a-4543b858f2b0.md). These are planned behaviors, not implementation results.

The questions left open in this historical round are now resolved in [round two](2026-10-05-generic-pages-round-two.md).

- A collection without a generic page remains data-only and generates no individual entry pages. A future footer-links collection illustrates the purpose; footer integration is explicitly out of scope.
- Generic pages can be shared across schemas with compatible field names and types.
- Public entry paths combine the collection prefix and entry slug. The generic page has no independent public route.
- Collection index routes are not automatically generated. A static page may occupy the index route; otherwise it returns 404. The exact assignment mechanism remains open.
- A missing field name or incompatible binding may be saved as a draft but blocks publication.
- An empty optional bound value uses the block field's fixed fallback, or remains empty when no fallback exists. This does not excuse a missing or incompatible binding.
- Schemas gain a visual rich-text field, including uploaded images and YouTube embeds. The existing Markdown storage direction remains the baseline; media round-tripping needs an extension. Broader embed support has not been selected.
- Generic-page previews show bound field-name placeholders. The proposed real-entry preview selector was not selected.

Q56–Q59 settle index assignment, whether a collection-list block is in scope now, initial embedded-media scope, and preservation of existing entry-block content. No application implementation is authorized during this discussion phase.
