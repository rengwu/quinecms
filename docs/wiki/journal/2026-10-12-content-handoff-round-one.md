---
title: Content handoff — first decisions
updated: 2026-10-12
status: Interview in progress
---
# Content handoff — first decisions

The user starts an item-by-item interview after the Quine retrospective, beginning
with content ownership and synchronization. Two wording revisions precede the
[submitted round](2026-10-12-grill-a336122c-df5b-4206-8de4-fd16bd6925d4.md): use
simple terms with brief context, rather than long explanations or unexplained labels.

Q2 accepts a small save-status message beside Save with details in Settings
(DEC-148). Q3 asks for the simplest possible solution and assumes the agent and
client do not work at the same time (DEC-149). This does not select automatic
merging, an enforced lock, or removal of stale-write protection.

Q1 leaves the first handoff undecided and asks whether a lean CRDT solution exists.
The requested rule-lean skill and current source were reviewed. Primary Yjs and
Automerge documentation supports recommending ordinary version checks for the
selected turn-taking workflow; the [topic record](../discussions/content-handoff.md)
links the evidence and distinguishes this recommendation from accepted choices.

Next: select how browser changes should reach the developer's project. Only
planning records changed; no product implementation, save or publication occurred.

## Direct follow-up

The user clarifies: “keep it simple here (rule-lean skill). we don't allow commits
when local git state in the browser is not up to date.” DEC-150 records this as
the save rule, retaining the existing version-check approach without a CRDT or
automatic merge for this scope.

Source inspection confirms both provider adapters compare the current draft ref
with `base.sha` before creating a commit. The existing non-forced branch updates
and GitLab guarded fast-forward flow also protect against changes during a save.
The editor only replaces its pending content after a successful save; rejected
saves retain it. This is source inspection, not a new live-provider test.

The existing next form (Q4) still asks how browser edits should reach the project
files. That save-path choice is separate from this settled stale-save rule.
