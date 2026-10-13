---
title: QuineCMS rename verification
updated: 2026-10-13
result: Passed for selected local scenarios
---
# QuineCMS rename verification

DEC-164 renames the product to QuineCMS and the package to `quinecms`. The login
heading, page title, dashboard header, storage connection-test label, docs,
generated wiki, example backup identifiers and planning outputs use the new name.
The active workspace directory and remote repository were not moved or renamed.
Existing media-field work was retained, and root site content was not changed.

New backups use `quinecms-backup`; import also accepts the prior version-1 format
through one read-only identifier in `src/editor/legacy-brand.ts`. Tab recovery uses
`quinecms:recovery:v2` with a fallback to the previous key in that same file. Those
two compatibility strings are the only old full-name references in repository
text. They prevent the rename from making existing drafts or backups inaccessible.
The new recovery record is written before removing the old one. Malformed records
remain available to download, and explicit discard clears both keys.

## Checks

- `pnpm verify` passed: 458 files checked with zero errors/warnings, 244 tests in
  36 files, the seven-route production build and emitted artifact checks.
  [Verification log](../../evidence/2026-10-13-quinecms-rename/verify.log).
- New regressions cover importing both backup formats after confirmation,
  recovering pre-rename drafts, preserving them when storage writes fail,
  preserving malformed data, explicit discard and current-record precedence.
- Chrome at `http://127.0.0.1:4322/admin/` showed the QuineCMS title and login,
  unlocked with the shared development account, and mounted the Pages table
  with QuineCMS in the dashboard header. Save draft remained disabled and
  the captured browser error log was empty.
  [Login](../../evidence/2026-10-13-quinecms-rename/login.jpg) and
  [dashboard](../../evidence/2026-10-13-quinecms-rename/dashboard.jpg) screenshots.
- Wiki generation/link checks, the repository name scan and `git diff --check`
  passed. The only old-name matches are the two compatibility constants above.

Production login encryption/decryption has automated coverage; the manual browser
check used development. No live Git provider, R2 or hosting operation was performed.
No commit, push or deployment was performed for this rename.

## Historical text normalization

The user's replacement request includes prior documentation, interview transcripts,
planning outputs and stored verification logs. The project name in those texts
was editorially normalized to QuineCMS (`quinecms` for package log lines). Local
checkout path prefixes were normalized to `<project-root>`; this does not imply
that the original run occurred under the new name or that the workspace was moved.
New verification logs use the same path placeholder.

The [normalization manifest](../../evidence/2026-10-13-quinecms-rename/text-normalization.json)
lists historical text files touched by this replacement. Their results and dates
are historical, and their original committed versions remain in Git history.
Original screenshots were left intact; embedded old branding remains historical
evidence. Existing source-manifest hashes refer to the original run, not this
editorial rewrite.
