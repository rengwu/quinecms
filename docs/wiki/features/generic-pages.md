---
title: Generic pages and collection content
updated: 2026-11-09
---
# Generic pages and collection content

**ID:** FEAT-generic-pages

## Intent and basis

DEC-058–DEC-073 in the [decision register](../decisions/index.md) separate schema data from reusable page layouts. The [technical contracts](../discussions/technical-contracts.md#generic-pages-and-field-bindings-dec-058-dec-073) define the stored shape, binding resolution and rich-text references.

## Entry points and prerequisites

Open **Pages → Add page**, choose Static page or Generic page, then complete the staged creation form. Create page adds it; Cancel discards it under the [creation contract](editor.md#creation-forms-dec-129). **Schemas → Collections → a collection** assigns a generic page. **Content → Collections → a collection** opens entry values and, when routed, a live preview. Uploaded images must already exist in Media to insert them into rich text.

## Expected outcomes

The [block catalog](block-library.md) discovers compatible installed definitions. Particular listing cards and shared chrome belong to their supplying designs.

- The Pages table lists title, type and URL. Generic pages have no URL field or public route. Their block catalog contains only generic blocks; static pages offer normal blocks, including any installed collection-list definitions.
- Generic block fields have an optional typed forward path or explicit list projection and a fixed/fallback value; see [content-model bindings](content-model.md#routes-and-presentation). Preview shows bound field-name placeholders. Compatible schemas may share a template.
- Schemas with no assignment remain data-only. Assigned ordinary entries render at collection prefix plus slug; single entries use the collection’s exact path. A static page at the prefix supplies an optional index; absent that page the route is 404. Collection context supplies entry links only when entry routes exist.
- Content entries contain schema values with no block list. Entries in collections assigned a generic page preview their current values through that template and its site layout (DEC-189–DEC-192). Data-only entries retain the full-width field editor. Only routed ordinary entries require slug metadata. Rich text supports images and YouTube while preserving surrounding Markdown.
- Missing/type-incompatible bindings and missing embedded images permit drafts but block publication. Empty optional values use literal fallback or render empty; zero and false are preserved. Colliding public routes block publication.
- Entries store schema values, not block lists. Legacy entry-block arrays are rejected rather than silently discarded; there is no general content migration layer.

## Live entry preview (DEC-189–DEC-192)

Existing and pending entries use the page editor's preview workspace (Off/Split/Float), desktop/mobile
preview widths and nested-field navigation. The shared `EntryFields` component
serves creation and editing. `PageBlocks` resolves actual entry values with the
same `resolveBlock` used in public generation; generic-page editing continues to
use its existing placeholder context. No content format or library change is needed.

The preview uses unsaved values, including references, media and rich text. A
blank slug or incomplete required fields does not gate preview. Missing values
use the template's literal fallbacks. Missing templates/layouts show an error
without hiding fields; layout-boundary errors retry after content changes.

The template name and **Edit shared template** control explain that template edits
affect all entries using it. The control opens the existing Pages editor and
preserves shared draft edits. There is no new return stack or per-entry layout
assignment. Preview layout navigation reuses existing page navigation; individual
block-link behavior remains renderer-owned.

New-entry values enter a render-only snapshot until Create; Cancel discards them.
The shared-template control is disabled and preview anchor/navigation actions are
blocked during creation so it stays open. This does not change existing main-area
navigation cancellation. Single-entry collections use the same preview when routed.

[Accepted scope](../discussions/entry-preview.md).

## Checks and evidence

[Check recipes and dated evidence](../verification/features/generic-pages.md).
