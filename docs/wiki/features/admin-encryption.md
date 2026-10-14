---
title: Encrypted static admin
updated: 2026-10-13
---
# Encrypted static admin

**ID:** FEAT-admin-encryption

## Contract

DEC-141 replaces the optional SHA-256 browser convenience gate with an encrypted
dashboard. Both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required for production
builds. DEC-152 makes development use one fixed pair: `admin@example.com` /
`asdf1234`, regardless of configured or absent environment credentials. Email is trimmed and lowercased; password characters, case and
whitespace are preserved. The pair is encoded as a versioned JSON array before
key derivation, avoiding ambiguous concatenation. This is one shared credential
pair, not email ownership verification, a user directory, or two-factor login.

New QuineCMS builds use `quinecms:admin` as the credential encoding's domain
identifier (DEC-164). Encryption and decryption share that encoding in each build;
the rename does not change configured credentials.

Argon2id v19 derives a 32-byte key using 64 MiB of memory, three passes and one
lane, through pinned `hash-wasm`. Each encryption uses a new 32-byte random salt
and 12-byte nonce. AES-256-GCM encrypts with a 128-bit authentication tag. Version,
algorithm parameters, salt and nonce are authenticated as additional data. The
loader accepts only the fixed v1 parameters, before invoking the KDF; it never
accepts weaker or arbitrarily expensive parameters from an untrusted payload.

The public envelope contains only parameters, salt, nonce and ciphertext. It has
no configured email, password, password verifier or decryption key. Wrong email,
wrong password and failed ciphertext authentication produce the same login error.

## Build and deployment

`src/pages/admin/index.astro` validates the credentials, loads the initial content
and public repository defaults, and requests a standalone editor bundle from
`scripts/admin-build.ts`. That Vite build includes the editor, styles, provider
clients, layouts and preview renderers. It writes no files, inlines dynamic
imports and assets, and refuses unexpected external chunk/asset dependencies.
The resulting JS/CSS and initial props are serialized, gzip-compressed and
encrypted in memory. Astro writes a small login page with the encrypted envelope.
No plaintext admin island or editor bundle enters the public client graph.

Public pages still build normally. Runtime sharing is retained within each
independent bundle graph; the encrypted editor has its own bundled runtimes.
Missing credentials or an encryption/bundling error fails the build. The artifact
check rejects editor/provider modules in the public graph, a legacy verifier,
an admin Astro island, or leftover build-only prerender output.

Build locally, in CI, or in a static host's build environment. Install dependencies
with `pnpm install --frozen-lockfile`, run `pnpm build`, and deploy only `dist/` to
the chosen static host over HTTPS. See the [setup requirements](../verification/setup.md)
for Node and pnpm versions. A host without build support can serve the same output
built elsewhere. No particular hosting provider, CI service or runtime application
server is required.

For automatic deployment, configure the chosen host or CI workflow to build the
publication branch (`main` by default) after Git updates. The editor's Publish
action advances that branch; the external workflow handles building and deploying.
Manual builds and uploads use the same commands and output.

Set `ADMIN_EMAIL` and a strong unique `ADMIN_PASSWORD` as secrets in whichever
environment runs the build, never in Git or a `PUBLIC_` variable. Encryption
happens during `pnpm build`, before any output is uploaded. Limit those credentials
to trusted build contexts: do not expose them to untrusted pull-request build code.
Preview builds also need credentials or must remain disabled. Changing credentials
requires a fresh build and deployment.

## Browser and session behavior

The native login form follows the stored admin dark/light preference. Web Crypto,
WebAssembly, gzip DecompressionStream and HTTPS (or localhost) are required. The
browser derives the key, authenticates/decrypts the envelope, decompresses it,
and mounts the editor from an in-memory module URL. No external crypto CDN is
used. The submit button stays disabled until the local decryption handler is
installed, preventing native form submission when the script is unavailable.
The handler loads crypto on submission, so a failed crypto-module request shows
a reload message and restores the button instead of preventing initialization.
A custom CSP must permit the bundled WebAssembly, `blob:` script module and
decrypted style element; tightening CSP requires testing these paths explicitly.

Email/password and keys are not persisted by the application. Password fields
are cleared after an attempt. Reloading asks for credentials again; a retained
draft is restored after decryption. Lock editor clears Git/R2 credentials and
legacy gate flags, unmounts the editor, and reloads the document to discard the
decrypted module. The existing draft recovery remains intact. Provider permission
checks still authorize loading private repositories, saving, publishing and media
uploads.

Local development uses the same encrypted page with `admin@example.com` /
`asdf1234`. This replaces the configured pair in dev; it is not an additional
account. There is one shared dashboard and one set of content, with no per-user
data. Production builds (including output served by `pnpm preview`) use only the
configured pair and have no automatic development-login fallback. The Astro
configuration defines `LEAN_DEV_SERVER` from `command === 'dev'`, so `NODE_ENV`
or `--mode` cannot enable the fixed login in a static build. Refresh the
page to rebuild the standalone editor after source changes.
The development server exposes source modules and is not a security boundary.
Use `pnpm build` and a static preview for deployment-security checks.

Vite dependency caches are isolated by checkout and Astro command
(`.astro/vite/dev`, `sync`, `build`, `preview`). Checks/builds can run beside a
development server without replacing its optimized modules. After a config change,
reload an already-open page to discard old module URLs. See the
[disabled-login repair](../journal/2026-10-11-login-repair.md).

## Limits

- Anyone can download ciphertext and attempt offline guesses. Email is commonly
  knowable and is not a substitute for a strong password. There is no server-side
  lockout, MFA, per-user revocation, or email recovery flow.
- Password rotation does not revoke older downloaded/deployed copies. Remove old
  unencrypted deployments separately if they were previously published.
- Encryption protects the deployed admin bundle and its initial props. It does
  not make public pages, public block assets, R2 media, public repository contents
  or public hydration context private.
- Existing tab draft recovery and runtime Git/R2 credentials still use session
  storage. This change does not encrypt browser storage or defend an already
  compromised device, same-origin script, extension, repository or hosting account.
  Installed blocks/layouts execute as trusted code after unlock.

## Verification

`tests/admin-crypto.test.ts` covers both credential inputs, email normalization,
exact password preservation, independent Node AES-GCM decryption, random salts/
nonces, wrong credentials, tampering and unsupported KDF parameters.
`tests/local-authoring.test.ts` builds isolated sites, decrypts their real admin
payloads, checks artifacts and verifies missing-credential failure. It also starts
isolated development servers with absent and different environment credentials,
checks that the fixed dev pair decrypts their actual responses, rejects the other
pair, and verifies the dev pair cannot decrypt production fixture output.
`tests/editor-session.test.ts` covers credential clearing and retained drafts at
the editor-to-loader lock boundary.

See the [implementation and browser checks](../journal/2026-10-09-admin-encryption.md).
These checks do not establish live hosting, GitHub/GitLab or R2 behavior or replace
an independent security review.


## Engine separation verification — 2026-10-14

[Independent engine and public pilot verification](../verification/runs/2026-10-14-engine-separation.md): engine/library/clean-build/browser/live-GitHub checks pass; the maintainer subsequently deployed to Netlify (DEC-184). The [hosted smoke check](../verification/runs/2026-10-14-netlify-pilot.md) passes for public routes, assets, mobile navigation and the login page; hosted admin unlock and Save/Publish remain unverified.
