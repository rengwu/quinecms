---
title: Content ownership and handoff
updated: 2026-10-12
status: Git save UX implemented; local transfer deferred
---
# Content ownership and handoff

Scope: improvement #1 from the Quine retrospective, making content ownership and
transfer between browser edits, local files and saved repository drafts clearer.
Other proposed improvements remain outside scope. After the interview, the user
explicitly requested implementation with work-until-grill; see the
[implementation record](../journal/2026-10-12-git-save-ux.md).

## Accepted direction

The [first submitted round](../journal/2026-10-12-grill-a336122c-df5b-4206-8de4-fd16bd6925d4.md)
establishes:

- DEC-148: show a small save-status message beside Save, with destination details
  in Settings. This supersedes only DEC-050's removal of save-status text; silent
  recovery and submission-time validation remain unchanged.
- DEC-149: choose the simplest solution and assume the client and agent take
  turns editing. This is a workflow assumption, not an implemented lock or a reason
  to remove existing stale-save protection.
- DEC-150: reject browser saves from an outdated base Git commit. Check the remote
  draft before creating a commit and retain the existing concurrent-update guards.
  Preserve pending edits on rejection. Keep this solution without introducing a
  CRDT or automatic merge in this scope.
- DEC-151: improve only the existing Git save status and recovery in this increment.
  Browser-to-local-file transfer is deferred. See the [scope answer](../journal/2026-10-12-grill-0dbc5917-8823-4085-a157-62aebd8efba5.md)
  and [interpretation](../journal/2026-10-12-content-handoff-scope.md).

The user asks for simple language with enough context to understand each choice.
Q1 did not select a handoff priority; instead it asks whether CRDTs offer a lean,
simple and robust way to handle conflicts, and invokes rule-lean.

## Current behavior — observed

- Local `/admin/` starts from built content or retained tab recovery. Browser edits
  do not write `content/`; recovery is session storage, not a source-file save.
- Backups export content, repository identity and an optional base commit SHA.
  They exclude credentials and uploaded binaries. Local previews without a remote
  base have no base SHA, so current exports cannot by themselves prove that local
  files have remained unchanged since editing began.
- There is no supported backup-to-files command. Browser import replaces the tab
  content after validation and confirmation; it is not a merge into the checkout.
- Connected Save writes a repository draft and rejects stale updates. Developers
  can fetch saved drafts using ordinary Git. Publish additionally checks the
  deployed source contract against the saved snapshot.

See [editor behavior](../features/editor.md), [publishing](../features/publishing.md)
and [local authoring](../features/local-authoring.md). Source inspected:
`src/editor/App.tsx`, `src/editor/recovery.ts`, `src/integrations/repository.ts`
and the GitHub/GitLab adapters.

## CRDT assessment — rationale for retaining version checks

Applying rule-lean, the initial recommendation was to retain JSON records and
stale-version checks instead of adding a CRDT. The direct follow-up selects the
stale-save rule in DEC-150. CRDTs can handle
offline or asynchronous work as well as live collaboration; they do not inherently
require an always-running central server.

The integration cost is the issue here. [Yjs updates](https://docs.yjs.dev/api/document-updates)
use encoded document updates and state vectors. [Automerge documents](https://automerge.org/docs/reference/concepts/)
include change history, and its [list guidance](https://automerge.org/docs/reference/documents/lists/)
recommends fine-grained updates rather than replacing whole objects. An agent
editing our existing JSON files would need a bridge into that tracked change model.
This is an engineering inference from those APIs and our current file workflow.

Convergence also does not settle every editorial choice. For concurrent writes
to the same property, [Automerge selects a consistent visible value and retains
the alternatives](https://automerge.org/docs/reference/documents/conflicts/).
Site validation would still be needed for references, routes and schema rules.

The selected repository behavior remembers the commit editing began from,
compares it before saving, and preserves pending work if the destination has
changed. Repository saves already do this. A local-file handoff would need its own
reliable baseline and write checks; an absent baseline must not imply safety.
No CRDT, merge engine, local writer or locking mechanism has been built.

## Delivered scope and deferred work

The selected Git save UX change is implemented. Its presentation and verification
scenarios live in the [editor feature](../features/editor.md#git-save-status-and-recovery).
Keep the existing save-time remote check; no background freshness polling or
automatic content replacement is needed for this increment. A saved status describes
the last confirmed save, not a guarantee that no remote edits have happened since.

Direct local saves and export-plus-command transfer remain alternatives for a later
discussion. No local file writer, new backup format, merge engine or editing lock
is included now. The remaining implementation choices do not need another form.
