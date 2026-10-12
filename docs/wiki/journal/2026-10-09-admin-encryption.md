---
title: Email and password encrypted admin
updated: 2026-10-09
---
# Email and password encrypted admin

The user selected build-time dashboard encryption with Argon2id and AES-256-GCM,
then requested email plus password credentials. DEC-141 accepts that replacement
for the old browser-only password check. The exact KDF parameters, structured
credential encoding, standalone in-memory bundle, gzip envelope and fresh-login
on reload behavior are implementation choices, recorded in the
[feature contract](../features/admin-encryption.md).

No remote deployment or repository operation is part of this change. Existing
connection/publication work in the working tree is preserved. The local ignored
environment is configured with the user's test credentials; production secrets
are to be supplied through the chosen local, CI or hosting build environment.

The standalone bundle is about 2.5 MB of JS plus 271 KB of CSS before gzip and
encryption for the installed catalog. The public login JS is about 13 KB gzip.
Public pages keep their original framework loading boundaries. The login script
size excludes the encrypted envelope embedded in the admin HTML.

## Verification

- Type checking: no errors, warnings or hints.
- Full regression suite: 26 files / 191 tests passing, including real Argon2id/AES-GCM and isolated static-build checks. Content validation passes.
- A real production build and artifact scan pass. No plaintext editor/provider
  module appears in the deployed client graph, and no prerender files remain.
- Safari production preview on loopback: incorrect password shows a generic
  failure and clears the password field; the configured pair opens the Pages
  table and main navigation. A different email with the correct password is also
  rejected. The login layout was visually inspected in dark mode.

- Safari production preview: React Hero editing updates the live preview; Cancel
  restores it. Svelte counter increments and Vue accordion expands. Lock editor
  returns to empty email/password fields after a document reload.
- The existing development daemon initially retained stale environment state
  after dependencies and credentials changed. Restarting that repository's daemon
  restored HTTP 200 with the encrypted login. No unrelated process was stopped.
- Development startup initially mixed development JSX with production React.
  Explicit production JSX and Svelte compilation fixed it; Safari then opened
  the Pages table using an uppercase version of the configured email. The
  console showed no startup error after that fix.
- The final artifact check also requires login submission to start disabled until
  the local decryption handler is installed. Development locking returns to empty
  credentials, and both `/` and `/admin/` respond successfully on port 4322.
- Wiki generation and link checks pass. No live hosting/provider behavior or mobile
performance has been established.

## Sources

- [OWASP password hashing guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- [hash-wasm Argon2 implementation and API](https://github.com/Daninet/hash-wasm).
- [Web Crypto AES-GCM parameters](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams).
