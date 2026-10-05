---
title: Site typography and page gutter
updated: 2026-10-06
status: Implemented
---
# Site typography and page gutter

The user selected body/heading fonts, body font size/line height and page gutter from the suggested site globals (DEC-078). Other suggested controls were not selected.

Site settings now groups these under Typography and Layout. One shared resolver supplies defaults and safe CSS tokens for public pages and the live preview. The starter block containers use the gutter, text inherits body line height, relative font sizes scale from the site's body size, and headings follow the heading font. Admin typography and 867px workspace width are independent.

Implementation choices: built-in font stacks (System sans, Arial, Georgia, Times New Roman, Monospace), 16px body size, unitless 1.6 line height and 24px horizontal gutter. No font downloads/dependencies were added. Cleared or omitted values fall back; explicit invalid settings prevent saving/publishing through existing validation. Zero gutter is valid. Retained block versions remain available, with their shared style defaults updated.

See [verification](../verification/runs/2026-10-05T1810Z-site-design.md) and [block behavior](../features/static-blocks.md).
