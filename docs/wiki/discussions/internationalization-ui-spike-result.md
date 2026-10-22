---
title: Internationalization UI spike result
updated: 2026-10-22
status: Presentation selected (DEC-217–DEC-225); engine implemented (DEC-232)
---
# Internationalization UI spike result

Delivers the [handoff](internationalization-ui-spike-handoff.md) under DEC-207
and DEC-216. This is a disposable presentation prototype, not production i18n,
a storage format or Kahf work. Accepted behavior in
[optional internationalization](optional-internationalization.md) was applied
unchanged. The user's choices are recorded under [Grill round](#grill-round).

## Prototype

`spikes/i18n-ui/` is an isolated Vite app reusing the editor's `FormScreen`,
`PanelSection`, `PanelNavigation`/`PanelLevel`, `Navigation`, `BlockList`,
`editor.module.css` and Kumo controls read-only. Nothing under `src/` changed.
Content is in-memory invented fixtures (Botani skincare); Save draft and Publish
are labelled simulated. Launch from the repository root:

```sh
pnpm exec vite --config spikes/i18n-ui/vite.config.ts
```

Then open `http://localhost:5317/`. It opens in the selected design (A with the
top-bar language selector). The **Prototype** top-bar button (in **Menu** below
600px) switches presentation and language scope for comparison and opens each
handoff scenario on fresh fixtures; `?p=a|b|c&scope=item|portal&s=<scenario>`
deep-links. The spike's
`spikes/i18n-ui/README.md` lists files, parameters, assumptions and limits.

Presentations compared on the same fixtures:

| | Secondary-language editing | Shared fields | Drawer |
| --- | --- | --- | --- |
| **A** One language at a time | Only the selected language's values | Inline in schema order, editable, **Shared** badge | Standard 360px |
| **B** Main language beside the translation | Read-only main-language text left, input right | Grouped under **Shared by all languages**, editable | 680px from 1280px viewports; stacks below that |
| **C** Main language above each field | Read-only main-language text above each input | Grouped as in B | Standard 360px |

Main-language editing is identical in all three. Every variant shows language
tabs with per-language status marks, a status line (Main, Eligible, Incomplete
draft with missing fields, or No copy), per-field language/Shared badges,
inline notes under blank required fields of a secondary copy, an explicit
blank **New Indonesian copy** form with Cancel/Create, a **Remove … copy**
action and Draft/Visitor preview modes with dashed provenance outlines on items
shown in a different language. Language scope is a separate toggle: tabs per item
that reset to the main language, or one top-bar selector kept across the portal.

## Observations

Browser checks were run in Chrome on the local dev server at 1540px and in 390px
same-origin frames (window resizing was unavailable). Screenshots are under
`docs/wiki/evidence/2026-10-20-i18n-ui-spike/` and linked below.

| Scenario | Observed |
| --- | --- |
| Complete copies | Tabs, badges and `/id/` preview make the edited language clear in A and B. [A complete screenshot](../evidence/2026-10-20-i18n-ui-spike/a-complete-indonesian.jpg) [B complete screenshot](../evidence/2026-10-20-i18n-ui-spike/b-complete-indonesian.jpg) |
| Missing copy | Empty state and whole-English preview; no Indonesian fields shown. Add → Cancel left content unchanged and still "Saved". [Missing screenshot](../evidence/2026-10-20-i18n-ui-spike/a-missing-copy-fallback.jpg) [New copy screenshot](../evidence/2026-10-20-i18n-ui-spike/a-new-copy-creation.jpg) |
| Incomplete draft | Draft marks blanks instead of filling them; Visitor shows the whole English item; strict Publish lists items with Open into the problem language. [Draft screenshot](../evidence/2026-10-20-i18n-ui-spike/a-incomplete-draft-preview.jpg) [Visitor screenshot](../evidence/2026-10-20-i18n-ui-spike/a-incomplete-visitor-preview.jpg) [Strict screenshot](../evidence/2026-10-20-i18n-ui-spike/strict-publish-blocked.jpg) |
| Completing values | Filling Description and the Squalane row name turned the status Eligible immediately; Publish stayed a separate step. |
| Editing English | Indonesian stayed Eligible, no warning. B/C show the changed English beside the unchanged Indonesian. |
| Nested editing | Row and block levels repeat tabs and status; switching language inside a row keeps the row open. Edits survived area switches. Per-item scope reopened the layout in English; portal scope kept Indonesian. [Portal nested screenshot](../evidence/2026-10-20-i18n-ui-spike/portal-scope-nested-layout-link.jpg) |
| Independent items | Home in Indonesian mixes Indonesian, no-copy and incomplete products with labelled outlines. [Home screenshot](../evidence/2026-10-20-i18n-ui-spike/home-independent-fallback.jpg) |
| Settings | Toggle off reports 7 retained copies; main language locked; removing and re-adding `id` restored counts (retention labelled Assumption). [Settings screenshot](../evidence/2026-10-20-i18n-ui-spike/settings-languages.jpg) |
| Schema control | Making required Size per-language immediately demoted both eligible product copies. [Schema screenshot](../evidence/2026-10-20-i18n-ui-spike/schema-localization-effect.jpg) |
| Narrow and keyboard | 390px: A/C fit the 320px drawer; B stacks like C; existing horizontal page scroll remains. Portal scope's selector pushes Save/Publish off the top bar. Arrow/Enter switch tabs, announced as "Indonesian, Eligible". [Narrow screenshot](../evidence/2026-10-20-i18n-ui-spike/narrow-390-a-b-portal.jpg) |

Additional views: [B incomplete](../evidence/2026-10-20-i18n-ui-spike/b-incomplete-draft.jpg),
[C incomplete](../evidence/2026-10-20-i18n-ui-spike/c-incomplete-stacked.jpg),
[B data-only full width](../evidence/2026-10-20-i18n-ui-spike/b-data-only-full-width.jpg).

## Comparison

| Criterion | A | B | C |
| --- | --- | --- | --- |
| Clarity of edited language | Good: tabs and badges | Good, plus visible source | Good, plus visible source |
| Translation effort | Highest: switch tabs to read English | Lowest | Low; longer scrolling |
| Shared-field mistakes | Most exposed: shared inputs interleaved | Reduced: grouped section | Reduced: grouped section |
| Fallback comprehension | Same status line and preview in all three | Same | Same |
| Preview space | Unchanged | Preview shrinks to ~600–850px at 1280–1540px | Unchanged |
| Fit with current editor | Exact | New variable drawer width | Exact width; new reference rows |

Data-only entries already use the 867px form, where B's columns fit without
cost. Optional blank localized values (for example alt text or a row benefit)
render blank in an eligible copy, as DEC-195 requires; B/C make such gaps
visible beside the source without any freshness tracking.

**Recommendation (not selected; see [Grill round](#grill-round)):** C in the split editor and B's columns in full-width forms
(one rule: show the main-language text beside each translated field when width
allows, above it otherwise), with per-item tabs that reset to the main
language. This keeps the existing drawer and preview, removes tab-switching while
translating and separates shared fields. A remains the main-language view.

## Questions exposed

The [grill round](#grill-round) asks only presentation choices and consequential
ambiguities the spike surfaced: secondary-language layout, shared-field
placement, language scope, preview default, page chrome on fallback pages, media
alt text, schema/structure changes that demote copies, copy creation, and
proactive missing-field cues.

## Grill round

The [submitted answers](../journal/2026-10-20-grill-95ba214e-a1cc-46d8-b4ff-926fdb6d958a.md)
are recorded as DEC-217–DEC-225. The user chose the simpler option wherever the
recommendation added layout or settings, and asked for rule-lean and
rule-plain-ui: minimal UI text. The Q21 screenshot marked the status-line sentence
“Visitors to … see this Indonesian copy after Publish” as unnecessary.

| Question | Selected | Recommendation accepted? |
| --- | --- | --- |
| Q21 Secondary-language layout | A: one language at a time; switching keeps the scroll position | No (adaptive C/B) |
| Q22 Shared fields | Schema order with Shared badge, editable | No (grouped) |
| Q23 Language selection | One top-bar selector across the portal | No (per-item tabs) |
| Q24 Preview default | Draft, with Visitor toggle | Yes |
| Q25 Fallback page chrome | Requested language; only the fallback item is in the main language | Yes |
| Q26 Media alt text | Always per language; field setting applies to the image | No (three settings) |
| Q27 Changes that demote copies | Allow; list affected copies; no copying | Yes |
| Q28 Starting a copy | Explicit blank form with Create/Cancel | Yes |
| Q29 Missing-value cues | Status line only | No (plus inline notes) |

The prototype now defaults to this combination. Explanatory sentences were
removed from the status line, empty and new-copy states, preview bar, list/block
notes, schema and Settings. The status line appears only for secondary-language
copies, as a badge plus “Missing …” when incomplete. Media fields lost the third
setting. The schema control lists only copies missing that field, and a new list
item names the copies it leaves incomplete. Retention stays labelled
**Assumption**.

Browser checks on the updated prototype at 1440px (scaled frame) and 390px:
incomplete, missing-copy, new-copy, schema, Settings, nested list and Visitor
flows behave as above with no console errors. Switching English/Indonesian from the top bar
kept the editor in place; the browser adjusted the scroll offset by the removed
status line height. At 390px the top bar fits Menu, the language code, an icon
preview-width toggle, Save draft and Publish exactly (Publish ends at the
padding edge); the spike-only Prototype button moved into the menu. The
production top bar still has to be fitted. [Selected design screenshot](../evidence/2026-10-20-i18n-ui-spike/selected-incomplete-indonesian.jpg)
[Selected narrow screenshot](../evidence/2026-10-20-i18n-ui-spike/selected-narrow-390.jpg)

No consequential presentation question remains. DEC-226 later settles retention:
copies are kept when i18n is off and deleted when a language is removed. The
prototype still shows the earlier **Assumption** (kept on removal) and was not
changed. The [engineering design](internationalization-engineering-design.md) is
proposed for review. Production implementation needs separate authorization.

## Limits

A mock UI does not verify engine persistence, routing, generated paths, `lang`
metadata, recovery, real site designs or live Git/R2/hosting. Not exercised:
adding blocks or entries, block reveal scrolling in preview, drag-sort fidelity
under language switching, multiple secondary languages beyond add/remove, and
screen-reader output beyond accessible names. Type checking passed for the spike
and the editor modules it imports; no automated tests were added for this
disposable code. After the grill round the Chrome window could not be resized,
so the 1440px checks used a scaled same-origin frame.
