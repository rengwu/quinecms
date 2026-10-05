---
title: Technical foundations
updated: 2026-10-05
status: Exploring
---
# Technical foundations

The [submitted answers](2026-10-05-grill-103bfb33-1e8a-4133-9528-3baf8aa57275.md) accept Astro/TypeScript, React/TypeScript for the editor, separate JSON content files, and a small field-schema vocabulary. Rendering source is shared by default, with explicit parity checks for separate renderers. Editor and preview share one document, and custom field widgets are supported. These are DEC-026 through DEC-033 in the [decision register](../decisions/index.md).

The user additionally proposes statically hosted, preferably minified registered vendor assets for libraries shared by blocks. DEC-034 captures this direction; the named library versions are examples rather than dependency pins. Build-managed, self-hosted shared chunks appear compatible with that goal, but the user has not yet chosen that mechanism over manually maintained vendor modules/import maps.

The next [contract proposals](../discussions/technical-contracts.md) cover vendor ownership, stable identities, formatted-text storage, block data evolution, preview adapter lifecycle, public activation policy, and content references. They are not accepted definitions yet. No application code has been created.
