---
title: Disabled editor login repair
updated: 2026-10-11
status: Implemented and locally verified
---
# Disabled editor login repair

After the Quine handoff, the user reported a waiting cursor over a disabled
**Unlock editor** button. The affected Helium tab was the existing root demo at
`127.0.0.1:4322/admin`. Its console showed HTTP 504 **Outdated Optimize Dep** for
`hash-wasm.js`. The script's static crypto import prevented the submit handler
from installing; the initial disabled state therefore never cleared. Refreshing
the page alone did not restore it.

The earlier checkout-specific cache fix was incomplete: `astro check`/sync and
production builds could still share one checkout's Vite cache with the running
development server. The on-disk cache lacked the requested module/version after
the previous verification run. The configuration now uses the documented
[`astro:config:setup` command and updateConfig hook](https://docs.astro.build/en/reference/integrations-reference/#astroconfigsetup)
to separate dev, sync, build and preview caches within each checkout. Installed
Astro types were also checked against that interface.

The login handler now installs before requesting crypto. If that dynamic import
fails, submission remains local, the password field is cleared, a reload message
appears, and the button becomes available again. Encryption, required credentials
and provider authorization are unchanged. A new regression test rejects the
crypto import and asserts those observable behaviors.

## Verification

- Reproduced the disabled button and dependency error in the user's Helium tab.
- Refreshed the root demo in Safari after the fix; Unlock was enabled.
- Ran `pnpm verify` with the root development server still running: zero errors
  or warnings, 194 tests in 29 files, production build and artifact checks passed.
- Started a fresh isolated Quine example on port 4323, then ran its build/artifact
  checks while its development server was running. Checks passed.
- In a fresh Safari tab, `quine@example.test` / `quine-preview` unlocked the
  Quine editor and displayed Pages → Home. No content was changed or published.
- Rebuilt/checked the wiki and ran `git diff --check`.

[Repository verification log](../evidence/2026-10-11-login-repair/verify.log) ·
[Concurrent Quine build log](../evidence/2026-10-11-login-repair/example-build.log).
These checks cover the observed local development failure, not every browser or
network interruption. The import-failure regression is mocked. No live provider
operation or deployment was attempted. Existing root content and unrelated work
were preserved. The Quine dev server was left running for the user's review.
