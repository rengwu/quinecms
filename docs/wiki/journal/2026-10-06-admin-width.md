---
title: Standard admin content width
updated: 2026-10-06
status: Implemented locally
---
# Standard admin content width

The user requested one 867px width across admin screens. DEC-076 replaces the Pages overview's 960px limit and standard forms' 760px limit with one shared `--admin-content-max-width` token and layout rule. This covers all standard admin areas and their nested forms. Content stays centered and fits narrower viewports. The page-building drawer and public-site content width remain separate concerns.

See the [verification run](../verification/runs/2026-10-05T1750Z-admin-width.md). No content or provider changes are involved.
