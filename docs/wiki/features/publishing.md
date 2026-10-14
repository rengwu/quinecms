---
title: Git draft saves and publishing
updated: 2026-10-14
---
# Git draft saves and publishing

**ID:** FEAT-publishing

## Intent and basis

The [save/recovery contract](../discussions/technical-contracts.md) requires one atomic draft commit, stale-save protection, immutable publication, and no forced overwrites. DEC-135 adds GitLab alongside GitHub. Hosting is independent of the repository provider; the host or CI workflow builds the configured publish branch (`main` by default) and serves `dist/`.

## Build environment setup

DEC-186 moves all Git connection settings and the access token out of the portal.
Copy the repository section of `.env.example` into the site's ignored `.env`, or
set these values in the environment that builds the site. Rebuild and redeploy
when settings or the token change. The editor connects and loads the draft
immediately after unlocking; there is no repository setup form.

| Variable | Meaning / default |
| --- | --- |
| `GIT_OWNER` | Required GitHub owner or GitLab group/subgroups when enabled |
| `GIT_REPO` | Required site repository/project name |
| `GIT_ACCESS_TOKEN` | Required provider token; never use a `PUBLIC_` prefix |
| `GIT_PROVIDER` | `github` (default) or `gitlab` |
| `GIT_DRAFT_BRANCH` | `draft` |
| `GIT_PUBLISH_BRANCH` | `main`; must differ from the draft branch |
| `GITLAB_URL` | `https://gitlab.com`; HTTPS self-managed installations may include a subpath |

`GIT_OWNER` also covers GitLab groups/subgroups. The name deliberately avoids
[Git’s own `GIT_NAMESPACE` setting](https://git-scm.com/docs/gitnamespaces).

All three required values blank disables Git and leaves a local preview with
backup/export and tab recovery; Save and Publish are disabled. Partial or invalid
configuration fails the build. Optional defaults alone do not enable a connection.
Previous `PUBLIC_GIT_*`, `PUBLIC_GITHUB_*`, `PUBLIC_DRAFT_BRANCH` and
`PUBLIC_PUBLISH_BRANCH` values are no longer read. Move their values to the names
above and supply the token when upgrading. The implementation does not infer a
target from the clone's remote or hosting account.

Use the site repository, containing content and pinned engine/library inputs,
with the publish branch already present. GitHub requires repository Contents
read/write permission. GitLab requires `api` scope and project permissions to
create commits/branches/merge requests and merge into draft/publish branches.
GitLab projects need **Fast-forward merge** and optional or disabled squashing.
A self-managed instance must allow browser API requests from the editor's origin,
including `PRIVATE-TOKEN`. Provider policies and source checks still apply.

### Credential boundary

Git settings and the token are serialized only inside the existing encrypted
admin payload. Everyone with the admin login receives the configured repository
access and can recover the token. Scope it to the intended site. This is a shared
credential, not individual Git identities, and adds no secret-holding backend.
Use a disposable repository/token in development: the development login is fixed.
Never commit `.env` or real tokens. See [encrypted admin](admin-encryption.md).

Tokens stay in decrypted memory; they are not copied into session/local storage,
content, recovery records or backups. Legacy tab tokens are ignored and cleared
on lock. Rotating a build token requires a rebuild; revoke the old token at the
provider to stop previously downloaded/deployed copies from using it.

### Automatic connection and recovery

The header shows **Connecting…** while loading; editing and writes wait for that
attempt to finish. Network or permission failures preserve content and expose
**Retry connection** beside Save. There is no polling. Retry uses the same build
settings and does not ask the editor to enter credentials.

Recovered edits keep their original repository and base. A newer draft opens the
existing stale-work recovery. Edits without a saved base, or from a different
repository/branch, open **Recovered edits need attention**. Both offer backup and
confirmed **Load latest version**; dismissal, cancellation and failed loads keep
the edits. Save/Publish remain blocked until the destination and baseline match.
A clean recovered snapshot may load the configured repository automatically.

## Expected outcomes

Named object definitions and all nested/reference values are part of the same snapshot; [content-model validation](content-model.md) distinguishes structural draft errors from publication requirements.

Automatic connection reads content from a coherent commit and creates a missing draft branch from the selected publish branch. Save validates structural integrity and schema change impact, creates one content commit, then advances the draft without force. A concurrent writer rejects that update. Uncertain network responses are checked against the intended operation before edits are cleared.

Validation errors appear in Kumo toasts when Save or Publish is submitted; no proactive issue panel is shown. Publish accepts only saved, fully valid content and a matching deployed source contract. It checks publish-branch ancestry and advances that branch to the validated snapshot without force, preserving any newer draft commits. Divergent history requires synchronization. The success message says deployment pending; no provider status is invented.

## Publication target

Draft and publish branches must differ. Both provider adapters create a missing
draft from the configured publish branch and publish only the validated saved
SHA. Confirmation and success messages name that target. Recovered repository
metadata never overrides the build destination or receives its token. Changing
`GIT_PUBLISH_BRANCH` does not configure hosting; set the hosting build branch
separately. Historical form behavior is recorded in the
[earlier verification](../journal/2026-10-08-connection-settings.md).

## Provider mechanics

GitHub uses its Git tree, commit and non-forced ref-update APIs through Octokit. Its transaction flow is unchanged by adding GitLab.

GitLab uses its REST API through browser `fetch`. Repository trees are paginated at one fixed commit and record blobs are read by object ID. Site build-input blob IDs are compared with the deployed editor's manifest on both Save and Publish, as for GitHub. The [engine contract](site-engine.md#save-and-publish-protection) describes pin/lock/config/extension checks and recovery. This assumes the ordinary SHA-1 repository object format used by that manifest.

For Save, the commits API creates a unique `lean-save-<uuid>` branch and one commit based on the exact loaded SHA. A SHA-pinned, non-squashing fast-forward merge request advances the shared draft branch. This extra step avoids treating GitLab's per-file `last_commit_id` checks as a whole-snapshot compare-and-swap. For Publish, a `lean-publish-<uuid>` branch pins the already saved snapshot and an equivalent merge request advances the configured publish branch; newer draft commits remain untouched.

Both operations run from the editor. Merge requests remain in GitLab's history, and successful merges request removal of their temporary source branches. The adapter briefly waits for merge-request preparation, never schedules delayed automatic merges, and reports unmet approval/pipeline/permission requirements as incomplete. Failed merge requests are closed on a best-effort basis. Interrupted calls may leave temporary branches or requests requiring manual cleanup; local edits remain recoverable. These tradeoffs are an implementation choice for preserving the existing snapshot guarantees with public GitLab APIs.

The GitLab API behavior was checked against the official [commits API](https://docs.gitlab.com/api/commits/), [repository tree/blob APIs](https://docs.gitlab.com/api/repositories/), [merge requests API](https://docs.gitlab.com/api/merge_requests/#merge-a-merge-request), [merge methods](https://docs.gitlab.com/user/project/merge_requests/methods/) and [token documentation](https://docs.gitlab.com/user/profile/personal_access_tokens/). Documentation review is distinct from live account verification.

## Verification recipe

1. `pnpm test` runs both providers' mocked transaction scenarios: missing branch, atomic multi-record save, stale preflight, concurrent update, lost response, incomplete Publish rejection, exact-snapshot publication, divergent publish branches and source mismatch. GitLab adds pagination, nested project paths, merge settings, approval blocking and destination/credential isolation.
2. Configure a disposable repository/token in the build environment, unlock the editor, edit two records, Save, and inspect one commit containing both changes. Repeat with a second editor to exercise the conflict/recovery UI. For GitLab, also inspect temporary-branch removal and the merge request history.
3. Publish a valid saved draft, inspect the publish branch's exact SHA and unchanged newer draft commits, then observe the chosen hosting workflow's result. Check GitLab behavior with required approvals/pipelines and a lost connection separately.

Steps 2–3 are unvalidated live-provider recipes. Do not use a production site as a disposable fixture.

## Coverage and limitations

Transport mocks establish client transaction logic, not GitHub/GitLab permissions, branch policies, self-managed CORS, server-version compatibility or deployment success. No live GitLab write has been verified. Projects requiring human-reviewed merge requests may need a different publication workflow; this increment keeps publishing in the editor. The portal does not merge divergent history, synchronize source automatically, or poll hosting deployment status.

## Verification history

- [GitLab support, credential isolation and transaction verification](../verification/runs/2026-10-08-gitlab.md).

- [Object-record and reference save/reload/publication with a mock Git transport](../verification/runs/2026-10-08-content-model.md).

- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md).


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../verification/runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../verification/runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; the maintainer subsequently [confirmed the full hosted connection, edit, draft save, publish and live deployment flow](../journal/2026-10-14-pilot-acceptance.md). This final signed-in evidence is user-reported; pilot delivery is accepted.
