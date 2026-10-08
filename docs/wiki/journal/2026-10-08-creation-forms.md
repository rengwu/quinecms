---
title: Explicit creation forms sitewide
updated: 2026-10-08
status: Implemented and locally verified
---
# Explicit creation forms sitewide

Later screenshot refinement: block and footer creation now show the action heading and selected type on separate lines, with the type as a smaller, muted subtitle. The [heading verification](../verification/runs/2026-10-08-creation-heading.md) records browser checks and the passing 159-test suite; creation and cancellation semantics remain the same.

The user identifies an editor-wide negative UX pattern: clicking Add immediately inserts a placeholder, then opens an editor with Back and Delete/Remove. Merely entering a form should not create its item. DEC-129 requires Add to open a New-item form with explicit Create and Cancel, and authorizes applying the change sitewide. The request is clear; no grill-form round is needed.

Implementation covers pages, entries, collections (including single-entry provisioning), reusable objects, nested schema fields, owned object values, structured list rows, page blocks and footer selection. Shared list controls also cover layout navigation, dropdown links, footer columns/links and block lists. Type/catalog selection may precede the form; selecting a candidate opens the uncommitted form.

Engineering approach: keep creation state local to its form owner. Create adds to the immediate parent; a child created inside an uncommitted parent stays local until the parent's Create. Cancel, leaving the screen or reload drops unfinished creation. Existing draft content and recovery remain unaffected. Existing-item editing and explicit duplication keep their established behavior. Mounted tests verify persistence boundaries, nested forms, cancellation and creation outcomes. Native Safari verifies collection/field creation and cancellation at desktop size, plus entry cancellation and visible form actions at 390 × 844. `pnpm verify` passes all 157 tests and the production build. See the [creation contract](../features/editor.md#creation-forms-dec-129) and [verification record](../verification/runs/2026-10-08-creation-forms.md); live providers were not exercised.
