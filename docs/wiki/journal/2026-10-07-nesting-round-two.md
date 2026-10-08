---
title: Owned nesting — reconsideration complete
updated: 2026-10-07
status: Product scope settled; implementation pending
---
# Owned nesting — reconsideration complete

The user reports “done”. Collection and finish succeed, preserving [Q94](2026-10-07-grill-fd7057e2-84aa-4c94-8493-27b2cfa8d3dd.md). The selected answer is “Reject recursive definitions; allow ordinary nested reuse”, with no notes. DEC-127 records the choice. The temporary form and matching answer download are cleaned up by finish.

Together, DEC-126 and DEC-127 allow up to three owned object/list levels and reject direct or indirect recursive object definitions. Named and inline structures follow the same depth rule; a list-row wrapper is not an extra level. Reusing one definition in separate fields or independent branches remains supported. The decision concerns ownership and does not prohibit cycles among independent entry references.

This resolves the consequential branches of the requested nesting reconsideration. No new questionnaire is needed for this scoped change. Other accepted collection, relation, list-shape, routing and editor-navigation choices remain in force. The product scope is settled through DEC-127; application implementation has not been authorized by the interview.

The [consolidated plan](../discussions/content-model-plan.md) now proposes resolved-depth checks at each schema use, cycle-path errors, validation before default expansion, and shared-definition impact checks. These remain engineering mechanics rather than additional product decisions. Validation targets cover three-level composition, fourth-level rejection, direct/indirect recursive definitions, legal reuse across branches and separate reference handling.

Planning summaries and resume instructions are reconciled. The earlier standalone HTML brief remains a historical pre-reconsideration artifact; current Markdown and the rebuilt wiki reader are authoritative. Documentation-only verification uses the wiki build/check. Application tests and live-provider checks are not rerun, and no implementation result is implied.
