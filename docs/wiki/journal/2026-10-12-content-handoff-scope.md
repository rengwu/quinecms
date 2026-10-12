---
title: Git save status and recovery scope
updated: 2026-10-12
status: Interview complete; implementation pending
---
# Git save status and recovery scope

The user asks whether any grill-form decisions remain before work starts.
The [scope form](2026-10-12-grill-0dbc5917-8823-4085-a157-62aebd8efba5.md) asks only
whether to include browser-to-local-file transfer. Q5 selects improving the existing
Git save status and recovery only (DEC-151). Answers were received through the
grill-form automatic check and preserved before the completed form was cleaned up.

Together with DEC-148–DEC-150, the scope is clear: show a small status beside Save,
keep destination details in Settings, retain the provider stale-save guards, and
make recovery from a rejected save easier to find. No CRDT, automatic merge, enforced
editing lock or new persistence destination is included.

The previously discussed recovery design retains pending edits, offers Export
backup and Load latest version, and confirms before replacing browser content.
Dismissal leaves edits intact. The backup is a whole snapshot, so importing it is
not presented as merging it into newer work. New edits must be reapplied manually
after loading the latest version.

The initial workflow question and unanswered Q4 concerned a larger handoff choice.
They are deferred by the explicit scope decision, not silently answered. Other
retrospective improvements remain outside this increment. No consequential product
question remains; copy, control placement and state handling are implementation
choices within this scope.

Only planning records changed in this round. The status/recovery presentation is
not implemented, and no new live-provider or UI verification is claimed. The next
work is implementation and relevant stale-save, recovery and browser checks.
