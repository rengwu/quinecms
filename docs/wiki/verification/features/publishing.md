---
title: Git draft saves and publishing checks
updated: 2026-11-09
---
# Git draft saves and publishing checks

Contract: [Git draft saves and publishing](../../features/publishing.md). Use the shared
[setup and isolation rules](../setup.md). Results apply only to their recorded
builds. This page is a recipe and evidence index, not a current pass claim.

## Current check recipe

From the engine repository:

```sh
pnpm exec vitest run tests/github.test.ts tests/gitlab.test.ts tests/git-config.test.ts tests/repository.test.ts tests/editor-save.test.ts tests/editor-submission.test.ts
```

Use an authorized disposable repository and build token. Edit two records and inspect a single draft commit; advance the remote independently and check recovery preserves local edits. Publish the exact saved snapshot and inspect branch SHAs separately from hosting deployment. Exercise GitLab policies and temporary-request cleanup on a live test project before claiming provider coverage.

For site build checks, use that site's `validate:content`, `check`, `build` and
`check:build` scripts, then its preview. Preserve evidence before discarding
fixture edits and stopping owned processes. Never use unrelated client content
as disposable test data. Live Git/R2/hosting require separate evidence.

These consolidated recipes were reviewed against source on 2026-11-09 but were
not executed during the documentation cleanup. See the dated runs below for
what was actually tested and its limits.

## Earlier recipes and recorded coverage

The following material was retained from the former feature page (last updated
2026-10-16). It may describe historical fixtures, commands, navigation or designs.
Use the current recipe above for new work; read each linked run at its recorded
revision. Reclassification does not rerun or recertify those checks.

## Verification recipe

1. `pnpm test` runs both providers' mocked transaction scenarios: missing branch, atomic multi-record save, stale preflight, concurrent update, lost response, incomplete Publish rejection, exact-snapshot publication, divergent publish branches and source mismatch. GitLab adds pagination, nested project paths, merge settings, approval blocking and destination/credential isolation.
2. Configure a disposable repository/token in the build environment, unlock the editor, edit two records, Save, and inspect one commit containing both changes. Repeat with a second editor to exercise the conflict/recovery UI. For GitLab, also inspect temporary-branch removal and the merge request history.
3. Publish a valid saved draft, inspect the publish branch's exact SHA and unchanged newer draft commits, then observe the chosen hosting workflow's result. Check GitLab behavior with required approvals/pipelines and a lost connection separately.

Steps 2–3 are unvalidated live-provider recipes. Do not use a production site as a disposable fixture.

## Coverage and limitations

Transport mocks establish client transaction logic, not GitHub/GitLab permissions, branch policies, self-managed CORS, server-version compatibility or deployment success. No live GitLab write has been verified. Projects requiring human-reviewed merge requests may need a different publication workflow; this increment keeps publishing in the editor. The portal does not merge divergent history, synchronize source automatically, or poll hosting deployment status.

## Verification history

- [GitLab support, credential isolation and transaction verification](../runs/2026-10-08-gitlab.md).

- [Object-record and reference save/reload/publication with a mock Git transport](../runs/2026-10-08-content-model.md).

- [Initial implementation run](../runs/2026-10-05T0819Z-implementation.md).


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; the maintainer subsequently [confirmed the full hosted connection, edit, draft save, publish and live deployment flow](../../journal/2026-10-14-pilot-acceptance.md). This final signed-in evidence is user-reported; pilot delivery is accepted.
