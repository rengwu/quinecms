# Regression content

`content/` is isolated sample data for the builder's regression tests. Tests map
these files to normal `content/...` record paths through `support/fixture.ts`.
Client sites can replace the repository's root `content/` without changing this
fixture. The legacy site shape is intentional: several tests exercise its reader.

The isolated build test keeps the demo's static Journal and shared-runtime checks
here. `check:build` checks the actual site's assets and public/editor separation,
without prescribing its page names, frameworks, scripts or custom embeds.
