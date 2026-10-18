---
title: Generic pages and collection content
updated: 2026-10-16
---
# Generic pages and collection content

**ID:** FEAT-generic-pages

## Intent and basis

DEC-058–DEC-073 in the [decision register](../decisions/index.md) separate schema data from reusable page layouts. The [technical contracts](../discussions/technical-contracts.md#generic-pages-and-field-bindings-dec-058-dec-073) define the stored shape, binding resolution and rich-text references.

## Entry points and prerequisites

Use [verification setup](../verification/setup.md). Pages → Add page selects Static page or Generic page, then opens a New page form. Create page adds it; Cancel discards it, following the [creation contract](editor.md#creation-forms-dec-129). Schemas → Collections → Journal has the optional Generic page selector. Content → Journal opens entry fields beside a live preview when a generic page is assigned. Uploaded images must already exist in Media to insert them into rich text.

## Expected outcomes

The [block library](block-library.md) adds themed/tagged browsing, shared chrome, repeated content and schema lists. Its record owns the expanded contract and verification recipe.

- The Pages table lists title, type and URL. Generic pages have no URL field or public route. Their block catalog contains only generic blocks; static pages offer normal blocks, including Collection list.
- Generic block fields have an optional typed forward path or explicit list projection and a fixed/fallback value; see [content-model bindings](content-model.md#routes-and-presentation). Preview shows bound field-name placeholders. Compatible schemas may share a template.
- Schemas with no assignment remain data-only. Assigned ordinary entries render at collection prefix plus slug; single entries use the collection’s exact path. A static page at the prefix supplies an optional index; absent that page the route is 404. Collection list renders entry links only when entry routes exist.
- Content entries contain schema values with no block list. Entries in collections assigned a generic page preview their current values through that template and its site layout (DEC-189–DEC-192). Data-only entries retain the full-width field editor. Only routed ordinary entries require slug metadata. Rich text supports images and YouTube while preserving surrounding Markdown.
- Missing/type-incompatible bindings and missing embedded images permit drafts but block publication. Empty optional values use literal fallback or render empty; zero and false are preserved. Colliding public routes block publication.
- New schema-only fixtures replace the old demo entries. Legacy imported entry blocks are rejected, not silently deleted. Old tab recovery is left under its original key.

## Live entry preview (DEC-189–DEC-192)

Existing and pending entries use the page editor's split view, desktop/mobile
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

[Accepted scope](../discussions/entry-preview.md) ·
[Implementation verification](../verification/runs/2026-10-16-entry-preview.md).

## Verification recipe

1. Run `pnpm verify`. `tests/templates.test.ts` covers route ownership, data-only behavior, sharing, binding failures/fallbacks, legacy entry rejection, version switching and embedded references. Navigation tests exercise type selection, catalog filtering, binding edits and schema assignment. Rich-text tests exercise image insertion/removal, read-only state and Markdown round trips.
2. Pages → Journal entry: expect `{{title}}`, `{{summary}}`, `{{image}}` and `{{body}}` placeholders. Open Entry heading: enter a missing key in Bind Heading, click Publish and expect a toast naming the collection and binding. Cancel block changes restores the original binding.
3. Content → Journal → A slower way to build: expect schema fields and a live entry preview, with no Blocks controls. In Body choose YouTube, enter a valid YouTube URL and insert. Reload, reopen the entry and verify the embed and surrounding text remain in visual editing mode. Remove the embed or discard the test edits through Site.
4. Schemas → Collections → Journal: the selector offers None · data only and generic pages, excluding static pages. Choose None and verify the label remains visible; restore Journal entry. Schema editing stays separate from entry values.
5. Open `/journal/` and follow A slower way to build. The entry uses the template with actual values and formatted body, no bound-name placeholders and no missing-media prompt for an empty optional image. The production artifact check verifies zero JavaScript for the index and both demo entries.

## Coverage and limitations

Local build, mounted UI tests and native browser flows are covered by the run below. R2 upload credentials, external video playback, live GitHub saves/publishing and hosting deployment are outside this local verification. No general migration of third-party content is implemented.

## Verification history

- [Explicit creation forms and cancellation](../verification/runs/2026-10-08-creation-forms.md).

- [Collections, objects and references](../verification/runs/2026-10-08-content-model.md).

- [Generic-page implementation](../verification/runs/2026-10-05T1650Z-generic-pages.md).

- [Block library and repeated fields](../verification/runs/2026-10-06T1320Z-block-library.md).
