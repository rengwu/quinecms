---
title: Installing and upgrading a site
updated: 2026-11-09
---
# Installing and upgrading a site

A site owns its content, configuration, assets and original extensions. Use the
[engine contract](../features/site-engine.md) for supported manifests and exact
pin rules; use [local authoring](local-authoring.md) for content/design workflows.

## Installation

Install the engine and selected libraries as exact versions or full Git commit
pins, and commit the lockfile. The site's `quinecms.config.json` identifies its
subscribed library dependencies and installed initial layout. Configure optional
original extensions there as well. Use actual identities from the chosen library;
QuineCMS supplies no implicit design or content.

Shared package scripts are deliberately thin:

```json
{
  "scripts": {
    "dev": "quinecms dev",
    "build": "quinecms build",
    "check": "quinecms check",
    "validate:content": "quinecms validate",
    "check:build": "quinecms check-build",
    "preview": "quinecms preview"
  }
}
```

Run `pnpm install --frozen-lockfile` in the site before CI builds. Configure the
required admin credentials and optional Git/R2 connection in the ignored `.env`
or build environment. Follow [encrypted admin](../features/admin-encryption.md#build-and-deployment),
[Git configuration](../features/publishing.md#build-environment-setup) and
[media configuration](../features/media.md#build-environment-setup).

Use the site's validation, check, build and artifact-check scripts. Preview the
built output, then deploy only `dist/` through the selected host. Hosting handles
its own build/deployment workflow; publishing a Git snapshot does not confirm
that deployment succeeded.

## Upgrades

Engine and library pins are independent. To upgrade, first save/export the current
draft, create a branch, change one pin, install and commit the resulting lockfile.
Run content validation (including `--base` for schema changes), typecheck, build,
artifact checks and relevant browser journeys. Make any necessary content/custom
code changes yourself. Put the reviewed upgrade commit on the connected draft
branch, then deploy/open its matching editor and publish that snapshot. If deploying
through Git directly, align draft and publish branches to the same reviewed commit
without overwriting divergent work. A new editor cannot write an old-source draft. Failed checks do not migrate
or delete inputs. Keep the prior content snapshot as well as old pins: restoring
code alone does not undo content edited under a newer contract.

Do not edit installed engine/library files or the generated workspace. New shared
capabilities belong upstream; original site extensions have their own identities.
