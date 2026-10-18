---
title: Live entry preview
updated: 2026-10-16
status: Accepted and implemented locally
---
# Live entry preview

## Basis and decisions

The user selected collection-entry preview after comparing QuineCMS with Decap
CMS, proposing the existing page editor's fields-left/preview-right arrangement
for individual entries under Content. The follow-up accepts the proposed baseline
and explicitly requests jstack rule-lean and maximum reuse.
The [submitted answers](../journal/2026-10-16-grill-e90ee7a7-4a3f-4933-82e6-d588426c739e.md)
settle the remaining choices (DEC-189–DEC-192). The user subsequently invoked
work-until-grill, authorizing implementation, verification and records. The
[feature contract](../features/generic-pages.md) describes the delivered behavior;
[verification](../verification/runs/2026-10-16-entry-preview.md) records this build.

## Agreed experience

- An entry whose collection has an assigned generic page uses the page editor's
  split view. Its schema fields and applicable slug control appear on the left;
  its actual values render through the generic page and inherited site layout on
  the right, including the header and footer.
- Edits preview immediately from the current draft, including references, media,
  rich text and nested fields. Reuse desktop/mobile preview widths and scrolling.
  Keep the preview visible while drilling into nested fields.
- New entries use the same preview with pending values before Create. Cancel
  discards the pending entry. Preview navigation must not abandon creation.
- Routed single-entry collections use the same experience. Data-only collections
  retain the existing full-width field editor, with no page chooser or inferred
  preview of a place where the entry is used (Q1).
- Show the template name and an **Edit shared template** link (Q2). Make clear
  that editing this template affects all entries using it. Template blocks and
  layout assignment retain their existing ownership; there are no entry overrides.
- Existing-entry previews reuse current page-preview navigation (Q3), retaining
  unsaved edits in the shared draft. This does not promise new link interception
  for individual block implementations.
- Incomplete required values or a blank slug do not prevent rendering available
  content. Reuse current binding fallbacks. Missing or broken templates/layouts
  show an explanation while entry fields remain editable.

## Lean implementation approach

Before this change, `App.tsx` enabled the split view only for existing pages. Entry fields already use `Fields`, and pending documents already
use `DocumentCreation`. `LayoutSurface` and `PageBlocks` own preview rendering;
the public generator resolves entry blocks with `resolveBlock` and selects the
template's layout with `contentForPage`.

The implementation extends those paths without a separate entry renderer, editor
shell, content format or preview service. Shared `EntryFields` removes duplicated
creation/editing controls. `PageBlocks` passes entry values and the collection
schema to the existing binding resolver. Pending-entry preview content is a
render-only view; it must not enter saved content or recovery before Create.
Keep generic-page editing previews with their existing field placeholders.

Routine engineering choices: use existing document navigation for the shared
template link, without a new return stack; keep it unavailable during creation
until Create or Cancel so navigation cannot discard pending values. Reuse existing
error handling where practical and avoid copying rendering or field logic.
These choices apply the accepted reuse constraint, rather than adding product
features requiring another interview.

## Scope and verification plan

This increment does not add entry layout overrides, template entry pickers,
data-only usage previews, publishing changes or a new validation dashboard.
No consequential product question remains in the selected scope.

Verification covers real-value bindings and references,
unsaved updates, new-entry Create/Cancel isolation, singleton/data-only behavior,
template navigation and retained edits, missing-template recovery, and existing
page/template preview behavior. The [run](../verification/runs/2026-10-16-entry-preview.md) separates automated
coverage, browser observations and limits. The generic-page and editor contracts
are updated. Deployment and dependency-pin upgrades are outside this local task.
