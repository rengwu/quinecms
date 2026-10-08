---
title: Owned nesting — three levels accepted
updated: 2026-10-07
status: Depth accepted; Q94 completed in round two
---
# Owned nesting — three levels accepted

The user reports “done”. Collection and finish succeed, preserving [Q93](2026-10-07-grill-038e8a1b-cfdf-4610-928e-2ab1fcf1d6fd.md). The selected answer is “Allow up to three owned object/list levels”, with no notes. DEC-126 supersedes DEC-111 and the depth prohibition in DEC-119; their history remains in the decision register.

The entry is not a level. Each owned object or structured list is one level; the row wrapper does not add another; using a named definition adds no extra wrapper. The rule applies equally to named and inline shapes. Relation rules, one shape per list and dedicated nested navigation remain accepted. Product specification groups with specification rows and an inner detail object now fit the accepted model.

The consolidated plan is reconciled for three-level traversal, nested authoring, nested bindings and validation targets. Row identity/default handling and other mechanics remain engineering proposals. Neither the form answer nor interview completion authorizes application implementation.

## Follow-up Q94 — recursive reusable definitions

Q94 asks whether an object definition may contain itself, directly or through another definition. A Menu item containing child Menu items illustrates the choice. The assistant recommends rejecting recursive definition chains while permitting ordinary nested reuse; the alternative permits recursion with actual content capped at three owned levels. The latter requires a stopping policy for defaults, required fields and editor controls. A recursive schema can have finite values, so this policy is not inferred from Q93.

At this round's presentation, Q94 was unanswered. Reference cycles among independent entries remained a separate resolution concern. The later [round-two outcome](2026-10-07-nesting-round-two.md) accepts rejection of recursive owned definitions as DEC-127.

Session: `fd7057e2-84aa-4c94-8493-27b2cfa8d3dd`

Collection and finish subsequently succeeded, preserving the [Q94 transcript](2026-10-07-grill-fd7057e2-84aa-4c94-8493-27b2cfa8d3dd.md). Finish removed the temporary form and matching answer download. There is no active session for this round.

Documentation-only verification: wiki build/check validates the updated Markdown, links and reader. Application tests and live-provider checks are not rerun for this discussion.
