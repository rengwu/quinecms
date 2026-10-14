---
title: Git environment configuration and automatic connection
updated: 2026-10-14
result: Passed
---
# Git environment configuration and automatic connection

Scope: DEC-186 and the [publishing contract](../../features/publishing.md).
Repository/provider/branch settings and the token come from non-public build
variables; no repository setup/details remain in Settings. The key-file login
proposal was cancelled and is not implemented.

## Environment and identity

- Engine base `f948d7e`; [source manifest](../../evidence/2026-10-14-git-environment/source-manifest.json)
  identifies the tested implementation.
- Node 22.19.0 / pnpm 10.34.1, macOS, Chrome.
- Production browser checks used a disposable original-extension site, test admin
  credentials and a dummy token, served on loopback port 63983. Only that generated
  workspace's Git transport was replaced with a deterministic in-memory fixture.
  The engine source was unchanged. No live Git/R2 credentials or writes were used.
- Mobile viewport 390×844 was reset and owned tabs/server closed afterward.

## Results

| Scenario | Observed outcome | Result | Evidence |
| --- | --- | --- | --- |
| Engine suite | 259 tests across 31 files pass; wiki links/currentness pass | Passed | [Log](../../evidence/2026-10-14-git-environment/engine-verify.log) |
| Configuration | Blank required values disable Git; partial config, invalid provider/URL or identical branches fail; GitHub/GitLab defaults and custom targets normalize | Passed | `tests/git-config.test.ts` |
| Encrypted delivery | Real production output decrypts to exact Git/R2 config; all published files exclude plaintext dummy token and repository markers; build output excludes token | Passed | `tests/local-authoring.test.ts` |
| Build failure | Partial Git config fails and preserves previous published output | Passed | `tests/local-authoring.test.ts` |
| Automatic login connection | Dashboard reaches Saved to draft without repository form interaction; save and publication confirmation/completion work with mock transport | Passed | [Observations](../../evidence/2026-10-14-git-environment/browser-observations.json), [build](../../evidence/2026-10-14-git-environment/browser-build.log) |
| Settings | Appearance, backup, session and factory reset remain; no repository fields/token input | Passed | [Screenshot](../../evidence/2026-10-14-git-environment/settings-connected.png) |
| Failed connection | Network/permission failures preserve edits, disable writes and expose retry; retry succeeds with configured token | Passed | Component tests; [mobile screenshot](../../evidence/2026-10-14-git-environment/retry-mobile.png) |
| Recovery | Stale, unbased and different-repository edits retain content and original metadata; only confirmed loading replaces work; cancellation/failure preserve it | Passed | `tests/editor-save.test.ts`; [browser stale dialog](../../evidence/2026-10-14-git-environment/stale-recovery.png) |
| Token isolation | Legacy tab credentials cannot override build configuration; token absent from recovery/backup/new session storage; GitLab instance/namespaces use configured target | Passed | `tests/editor-save.test.ts` |
| Unconfigured site | Local editing/recovery/backup remain; Save and Publish disabled and no connection form | Passed | `tests/editor-navigation.test.ts` |

## Repairs and limits

Initial test failures were obsolete connection-form/disabled-button expectations
and comparisons against unmigrated legacy fixture content. Assertions now reflect
the environment-only connection and existing layout normalization. A temporary
browser runner initially referenced an unexported Astro CLI path; correcting the
runner allowed the production fixture build to pass, without an engine change.
Final review caught that `GIT_NAMESPACE` is a native Git environment variable;
the engine/template use `GIT_OWNER` for the owner or group instead. The complete
suite was rerun after this correction. Browser behavior is unchanged. The final `pnpm verify` completed all 259 tests,
then detected a stale wiki because its linked evidence log had changed. Rebuilding
the reader and running `node docs/wiki/_build.mjs --check` afterward passed.
Browser warning/error logs are empty in the completed journeys.

These checks do not establish live GitHub/GitLab permissions, token validity,
self-managed CORS or hosting deployment. Existing provider transaction tests still
cover concurrency and source-contract guards. Everyone with the admin login can
recover and use the shared Git token; the build does not provide per-editor Git
identities or server-side secret isolation. Token rotation requires a rebuild and
provider revocation if older copies must stop working.
