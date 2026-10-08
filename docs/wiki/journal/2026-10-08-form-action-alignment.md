---
title: Right-aligned form actions
updated: 2026-10-08
status: Implemented
---
# Right-aligned form actions

The user requires a sitewide standard: confirmation/cancellation actions align to the right edge of their form. The supplied creation screenshots are examples, not an exhaustive scope. DEC-131 records the direct instruction; AGENTS.md and the [editor layout contract](../features/editor.md#form-action-alignment-dec-131) carry the rule forward.

The existing `dialogActions` row used `justify-content: flex-end` but shrank to its buttons inside the flex-based creation footer. Giving the shared row full width fixes all creation forms, including nested rows and objects. Terminal `actionFooter` groups also align right. Image/video insert controls now use the shared row with Cancel before Insert; the login form's Continue action uses that row too. Existing connection, storage, confirmation and close/cancel dialog actions share the same styling. Wrapping remains available in narrow forms.

`pnpm verify` passes 159 tests, diagnostics, the production build and artifact checks. Desktop Safari confirms the New object actions align with the right edge of the fields. The [verification record](../verification/runs/2026-10-08-form-action-alignment.md) distinguishes this observation from incomplete additional browser checks. No new tests mirror CSS declarations.
