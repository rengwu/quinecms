---
title: Git draft saves and publishing
updated: 2026-10-08
---
# Git draft saves and publishing

**ID:** FEAT-publishing

## Intent and basis

The [save/recovery contract](../discussions/technical-contracts.md) requires one atomic draft commit, stale-save protection, immutable publication, and no forced overwrites. DEC-135 adds GitLab alongside GitHub. Hosting is independent of the repository provider; the host or CI workflow builds `main` and serves `dist/`.

## Entry points and prerequisites

`/admin/` → Settings → Connection selects the provider, owner/namespace, repository and draft branch. GitLab additionally accepts an HTTPS instance URL, defaulting to `https://gitlab.com`, and nested namespaces such as `team/subgroup`. Use a repository containing this source with a `main` branch. The implementation does not infer a target from the clone's remote or hosting account.

Build defaults use `PUBLIC_GIT_PROVIDER`, `PUBLIC_GIT_NAMESPACE`, `PUBLIC_GIT_REPO`, `PUBLIC_DRAFT_BRANCH` and `PUBLIC_GITLAB_URL`; `.env.example` documents them. GitHub defaults also accept the earlier owner/repository environment names. A retained tab draft restores its own repository identity. Connection fields remain editable.

GitHub requires a token with repository Contents read/write permission. GitLab requires a token with `api` scope and project permissions to create commits/branches/merge requests and merge into draft/main. Tokens are entered at runtime and stored only for the matching provider, instance, repository and branch in session storage. Editing the destination clears the token. Lock clears retained credentials; backups exclude them.

GitLab projects need **Fast-forward merge** and optional or disabled squashing. The adapter checks these settings; it does not change project settings or bypass protected branches, required approvals or pipelines. A self-managed instance must permit browser API requests from the editor's origin, including the `PRIVATE-TOKEN` header. No proxy/backend or GitLab SDK is added. See the root README and [setup](../verification/setup.md).

## Expected outcomes

Named object definitions and all nested/reference values are part of the same snapshot; [content-model validation](content-model.md) distinguishes structural draft errors from publication requirements.

Connect reads content from a coherent commit and creates a missing draft branch from main. Save validates structural integrity and schema change impact, creates one content commit, then advances the draft without force. A concurrent writer rejects that update. Uncertain network responses are checked against the intended operation before edits are cleared.

Validation errors appear in Kumo toasts when Save or Publish is submitted; no proactive issue panel is shown. Publish accepts only saved, fully valid content and a matching deployed source contract. It checks main ancestry and advances main to the validated snapshot without force, preserving any newer draft commits. Divergent history requires synchronization. The success message says deployment pending; no provider status is invented.

## Provider mechanics

GitHub uses its Git tree, commit and non-forced ref-update APIs through Octokit. Its transaction flow is unchanged by adding GitLab.

GitLab uses its REST API through browser `fetch`. Repository trees are paginated at one fixed commit and record blobs are read by object ID. Source blob IDs are compared with the deployed editor's generated source manifest, as for GitHub. This assumes the ordinary SHA-1 repository object format used by that manifest.

For Save, the commits API creates a unique `lean-save-<uuid>` branch and one commit based on the exact loaded SHA. A SHA-pinned, non-squashing fast-forward merge request advances the shared draft branch. This extra step avoids treating GitLab's per-file `last_commit_id` checks as a whole-snapshot compare-and-swap. For Publish, a `lean-publish-<uuid>` branch pins the already saved snapshot and an equivalent merge request advances main; newer draft commits remain untouched.

Both operations run from the editor. Merge requests remain in GitLab's history, and successful merges request removal of their temporary source branches. The adapter briefly waits for merge-request preparation, never schedules delayed automatic merges, and reports unmet approval/pipeline/permission requirements as incomplete. Failed merge requests are closed on a best-effort basis. Interrupted calls may leave temporary branches or requests requiring manual cleanup; local edits remain recoverable. These tradeoffs are an implementation choice for preserving the existing snapshot guarantees with public GitLab APIs.

The GitLab API behavior was checked against the official [commits API](https://docs.gitlab.com/api/commits/), [repository tree/blob APIs](https://docs.gitlab.com/api/repositories/), [merge requests API](https://docs.gitlab.com/api/merge_requests/#merge-a-merge-request), [merge methods](https://docs.gitlab.com/user/project/merge_requests/methods/) and [token documentation](https://docs.gitlab.com/user/profile/personal_access_tokens/). Documentation review is distinct from live account verification.

## Verification recipe

1. `pnpm test` runs both providers' mocked transaction scenarios: missing branch, atomic multi-record save, stale preflight, concurrent update, lost response, incomplete Publish rejection, exact-snapshot publication, divergent main and source mismatch. GitLab adds pagination, nested project paths, merge settings, approval blocking and destination/credential isolation.
2. On a disposable real repository, connect, edit two records, Save, and inspect one commit containing both changes. Repeat with a second editor to exercise the conflict/recovery UI. For GitLab, also inspect temporary-branch removal and the merge request history.
3. Publish a valid saved draft, inspect main's exact SHA and unchanged newer draft commits, then observe the chosen hosting workflow's result. Check GitLab behavior with required approvals/pipelines and a lost connection separately.

Steps 2–3 are unvalidated live-provider recipes. Do not use a production site as a disposable fixture.

## Coverage and limitations

Transport mocks establish client transaction logic, not GitHub/GitLab permissions, branch policies, self-managed CORS, server-version compatibility or deployment success. No live GitLab write has been verified. Projects requiring human-reviewed merge requests may need a different publication workflow; this increment keeps publishing in the editor. The portal does not merge divergent history, synchronize source automatically, or poll hosting deployment status.

## Verification history

- [GitLab support, credential isolation and transaction verification](../verification/runs/2026-10-08-gitlab.md).

- [Object-record and reference save/reload/publication with a mock Git transport](../verification/runs/2026-10-08-content-model.md).

- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md).
