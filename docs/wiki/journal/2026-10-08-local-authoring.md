---
title: Local agent authoring guidance and validation
updated: 2026-10-08
status: Implemented and locally verified
---
# Local agent authoring guidance and validation

The user approves steps 1–3 of the investigation's final recommendations: a concise
portable AGENTS.md, a practical authoring guide and dependable local validation.
They clarify that the repository should be a blank slate for expressive client
websites. Agents can choose which builder capabilities suit a project; guidance
should nudge rather than prescribe. DEC-134 records this accepted direction.
No further product interview is needed for this increment.

AGENTS.md and README now lead with that purpose and link to the
[local authoring guide](../features/local-authoring.md). It covers new and existing
sites, content structures, exact record/value shapes, custom blocks/layouts,
browser/Git/local boundaries and delivery. Current feature pages correct stale
spacing, schema and navigation descriptions. Historical technical discussions are
identified as history; machine-specific planning tools are optional.

`pnpm validate:content` runs the existing core rules with installed definitions.
`--draft` allows publication-incomplete content; `--base <git-ref>` adds existing
schema/deletion impact checks against a local commit. Registry-only generation
avoids requiring finished routes before validating a draft. The command changes
neither content nor Git refs and contacts no provider. A pinned development-only
`tsx` dependency runs the TypeScript entry point.

Regression sample records now live under `tests/fixtures/content/`, independent
of the client's root content. Artifact checks allow unused framework runtimes and
arbitrary client routes/custom embeds. Demo-specific zero-JavaScript and shared
runtime expectations remain checked in an isolated demo build. Absent unused content
directories are supported. A second build scenario replaces every demo record
with a canonical minimal site and home page. Existing tests were redirected to
fixtures; importing their helper no longer accidentally registers a second copy
of the content test suite. The resulting suite has 158 tests in 21 files.

Both normal `pnpm verify` and a full independent run with only minimal client
content pass. The latter confirms tests as well as production artifact checks
survive replacing the demo. Root content and concurrent admin-theme/readable-usage
work were preserved. The [verification record](../verification/runs/2026-10-08-local-authoring.md)
identifies the dirty source tree, exact minimal fixture, logs and limits.

This increment adds no remote agent service, MCP layer or general mutation API.
Additional reusable example packages and fresh-agent benchmarks remain optional
future work. Local tests do not measure an agent's discovery success or establish
live GitHub/R2/Netlify behavior. No deployment or provider write occurred.
