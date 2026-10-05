---
title: Git draft saves and publishing
updated: 2026-10-05
---
# Git draft saves and publishing

**ID:** FEAT-publishing

## Intent and basis

The [save/recovery contract](../discussions/technical-contracts.md) requires one atomic draft commit, stale-save protection, immutable publication, and no forced overwrites. The user selected GitHub and Netlify.

## Entry points and prerequisites

`/admin/` → Connection; use a repository containing this source, a main branch, a writable draft branch, a per-editor Contents read/write token, and Netlify configured to build main. See the root README and [setup](../verification/setup.md). No live provider account was used in the initial verification.

## Expected outcomes

Connect reads content from a coherent commit and creates a missing draft branch from main. Save validates structural integrity and collection compatibility, writes a tree and one commit, then advances the draft without force. A concurrent writer rejects that update. Uncertain network responses are checked against the intended commit before edits are cleared.

Validation errors appear in Kumo toasts when Save or Publish is submitted; no proactive issue panel is shown. Publish accepts only saved, fully valid content and a matching deployed source contract. It checks main ancestry and advances main to the validated snapshot without force, preserving any newer draft commits. Divergent history requires synchronization. The success message says deployment pending; no provider status is invented.

## Verification recipe

1. `pnpm test` runs the mock Git transport scenarios: missing branch, atomic multi-record save, stale preflight, ref-update race, lost response, incomplete Publish rejection, exact-snapshot publication, divergent main, and source mismatch.
2. On a disposable real repository, connect, edit two records, Save, and inspect one commit containing both changes. Repeat with a second editor to exercise the conflict/recovery UI.
3. Publish a valid saved draft, inspect main's exact SHA and unchanged newer draft commits, then observe the Netlify build result.

Steps 2–3 are unvalidated live-provider recipes. Do not use a production site as a disposable fixture.

## Coverage and limitations

Transport mocks establish client transaction logic, not GitHub permissions, branch policies, CORS, or deployment success. The portal does not merge divergent branches, synchronize source automatically, or poll Netlify deployment status.

## Verification history

- [Initial implementation run](../verification/runs/2026-10-05T0819Z-implementation.md).
