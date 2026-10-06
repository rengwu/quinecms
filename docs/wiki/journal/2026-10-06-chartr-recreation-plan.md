---
title: chartr recreation added after Site Layouts
updated: 2026-10-06
status: Requested follow-on scope
---
# chartr recreation added after Site Layouts

The user asks to recreate `https://chartr.dev/`, with `../chartr-site-v2` as the source, as a Site Layout and independent blocks after the Site Layout implementation. DEC-106 records the requested ordering. The [chartr recreation scope](../discussions/chartr-recreation.md) owns the decomposition and proposed verification targets.

Read the reference repository's instructions, current source structure, relevant component scripts and documentation; inspected the live page text. The local source supplies nine main content sections plus shared site chrome. The proposed split gives header/footer/site appearance to the layout and makes each main content section a separate block. Native-demo components and palettes can be shared implementation dependencies without coupling blocks to the chartr layout.

The live page and local source differ in release/download text and some copy. The live site is the recreation target; use the source implementation without reintroducing old download placeholders. The website theme and native-preview theme picker remain separate. The source's global initializers need adaptation for independently mounted, repeated blocks and editor cleanup.

This requirement supplies the second real layout planned after adapting the current shell into the starter layout. It does not reopen block styling classification: optional variable participation and no discrimination remain accepted. No additional questionnaire is needed to record the requested follow-on phase; exact field definitions and component boundaries are engineering work.

Only planning records changed in this turn. Source inspection and wiki validation are not claims that the recreation or the Site Layout foundation is implemented or visually verified.
