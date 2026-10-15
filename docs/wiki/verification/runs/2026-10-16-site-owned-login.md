---
title: Site-owned development login and local playground
updated: 2026-10-16
result: Passed
---
# Site-owned development login and local playground

DEC-187 removes the engine’s hardcoded development credentials. Both development
and static builds read the site's `ADMIN_EMAIL` and `ADMIN_PASSWORD` with no
fallback. The sibling `quinecms-dev-site` owns its public testing pair in its
`.env.example`, copied to an ignored `.env`. It links the local engine and keeps
the existing pinned Archline/Intr library and sample content.

## Checks

- Node 22.19.0 / pnpm 10.34.1 on macOS.
- Engine `pnpm verify`: all 261 tests across 31 files pass, including real
  development-response decryption with configured credentials; rejection of the
  former fixed pair; missing, email-only and password-only credential failures;
  and static-build encryption/artifact checks. [Log](../../evidence/2026-10-16-site-owned-login/verify.log).
- The initial test assertion looked for an error message in Astro's minimal HTTP
  error page; it was corrected to inspect the server log. HTTP 500 and absence of
  an encrypted payload are also asserted.
- Dev site frozen installation, content validation and 163-file typecheck pass
  with zero errors, warnings or hints. It registers 29 block and two layout versions.
- Safari: the dev-site testing login unlocks Pages with Home, Projects and Project
  detail. The public homepage renders. HTTP checks return 200 for the homepage,
  project listing and Atelier 19 detail route.
- The server remains running on `http://127.0.0.1:4322/`; port 4321 belongs to an
  unrelated application. The site's command and README now specify port 4322.
- `.env` is ignored by Git. No site content was changed. The existing local
  dev-site repository has no commits or remote; no repositories were published.

These checks establish local behavior. Git and R2 are unconfigured in the dev site;
no live provider, hosted pilot upgrade or production deployment is claimed.
Historical DEC-152 evidence is retained as history, and negative engine tests
retain the former pair only to verify that it cannot unlock other configured sites.
