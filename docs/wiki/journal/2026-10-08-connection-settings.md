---
title: Connection placeholders, publish branch and conditional locking
updated: 2026-10-08
status: Implemented
---
# Connection placeholders, publish branch and conditional locking

The user reports a passwordless Continue screen after Lock editor and explicitly chooses hiding the button when no password is configured. They also request example connection placeholders and a Publish branch field defaulting to main, explicitly for both GitHub and GitLab. DEC-139–DEC-140 record these choices.

## Implementation

Settings hides Lock editor when `passwordHash` is absent, and the session does not render a passwordless gate. Password-configured editors retain Lock; the password field is cleared on successful entry and on locking. The existing removal of tab credentials and recovery of the draft remains in place. Connection help text reflects whether locking is available.

Both provider forms show examples for owner/namespace, repository, draft branch, publish branch and token, plus GitLab's instance URL. Publish branch starts at `main`, with an optional `PUBLIC_PUBLISH_BRANCH` build default. The field is included in the repository record, recovery validation and the destination key that binds credentials. Existing recovered records without the optional field still mean `main`; explicit recovered targets take precedence over build defaults. Changing either branch clears the token and connection.

Both provider adapters reject empty or identical draft/publish branches. Missing drafts are created from the chosen publish branch. Publication checks that branch's content/schema and ancestry and advances only the validated saved SHA, retaining existing conflict and uncertain-response handling. GitLab targets that branch in its temporary merge request and labels the request as publication independently of the branch name. Confirmation and success messages name the selected target. Hosting configuration remains separate.

## Verification

- `pnpm verify`: zero type errors/warnings, all 187 regression tests pass, production build and artifact checks pass.
- New session tests cover direct entry with no lock button and password-protected lock/re-entry with cleared passwords/credentials and preserved drafts. The dark admin theme remains applied to the password gate.
- Provider tests create a missing draft from `release/live`, save and publish the exact selected snapshot, retain a newer draft and leave `main` unchanged. Both exercise lost responses and reject a concurrent update to the custom publication target.
- Repository tests reject missing/identical targets for both providers and bind tokens to the publication branch. Recovery tests preserve custom branches and reject malformed values. Editor tests verify each provider's placeholders, `main` default, retained custom target and credential clearing on a target change.

- Safari: verified direct entry and hidden Lock editor without a password, then inspected both provider dialogs. GitHub shows owner/repository/token examples; GitLab shows instance/namespace/repository/token examples. Both show Publish branch set to `main`. The GitLab dialog scrolls to its lower fields and Close/Connect actions. Used an isolated local preview and stopped it after checking.

Live GitHub/GitLab writes, R2 and hosting were not exercised. Provider tests use mock transports. No credentials or local content records were changed.
