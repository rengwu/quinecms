---
title: Generic-page implementation
updated: 2026-10-06
status: Implemented locally
---
# Generic-page implementation

The user authorized implementation after the completed [design interview](2026-10-05-generic-pages-discussion.md). DEC-058–DEC-073 now have application code and fresh demo content.

Page records distinguish static/generic kinds. Entries have schema values only, and collections optionally reference a generic page. A shared route function drives static generation; collections no longer automatically create indexes. Three registered generic blocks supply heading, media and rich-text slots; the normal collection-list block supports explicitly created static indexes.

Bindings remain separate from literal props. Shared validation checks every assigned schema and resolved entry, preserving draft/publish distinctions and empty-value fallbacks. Preview uses placeholders. Rich-text Markdown stores stable media references and YouTube IDs; Lexical custom nodes and the public renderer share those references. The implementation uses Lexical's documented [custom nodes](https://lexical.dev/docs/concepts/nodes) and [Markdown transformers](https://lexical.dev/docs/packages/lexical-markdown).

Home → Pages now chooses a page kind, and each kind has its own block catalog. Entries have no block controls. Schemas gain template assignment and rich-text fields. Old tab recovery stays untouched in the previous namespace, and legacy imported entry-block records fail validation rather than losing content.

Verification caught and fixed Astro's inability to identify a renderer that returned only null for an empty media slot, and Kumo's need for an explicit placeholder when the template selector is empty. A read-only regression also checks embedded-media removal is unavailable while editing is disabled. The [run](../verification/runs/2026-10-05T1650Z-generic-pages.md) records 75 passing tests, the static build, asset-sharing checks and browser observations. No commit or provider deployment was performed.
