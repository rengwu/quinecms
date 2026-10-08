---
title: Local AI authoring investigation
updated: 2026-10-08
status: Historical analysis; steps 1–3 subsequently approved and implemented
---
# Local AI authoring investigation

Follow-up: the user subsequently approved steps 1–3 and clarified that capability
choices and client editability are recommendations, with creative freedom primary.
DEC-134 and the [implementation journal](2026-10-08-local-authoring.md) record that
outcome. The concurrent missing-page condition recorded below has since resolved;
the implementation's wiki build/check pass for 141 pages. The analysis and
observations below describe the earlier revision.

The user explains the product's motivation: AI makes initial website construction easy, but clients still need independent content maintenance. They request an investigation into whether a fresh agent can discover and use all builder capabilities to create a site or adjust an existing one. A follow-up narrows the scope to agents working locally in cloned repositories and explicitly excludes remote agent access and MCP for now.

The [investigation](../discussions/local-agent-authoring.md) concludes that the core is usable by local coding agents, but the current onboarding path requires substantial source/history reconciliation. It recommends a short portable AGENTS.md entry point, one practical authoring guide, current examples, dependable site validation and fresh-agent exercises. A broad agent API or remote service is not proposed. No implementation is authorized by this analysis request.

Concrete findings include outdated README spacing/schema/navigation instructions; a legacy default site fixture beside a canonical layout contract; custom extension values described primarily by UI/policy code; baseline transition checks distinct from final-snapshot validation; and tests/artifact assertions coupled to demo content. The report also makes the client's ongoing editability an explicit acceptance criterion for AI-authored blocks and layouts.

## Verification and identity

The initial checkout was clean at `348f1237f115541694f738bac77137333a4550d8`. Node `v22.19.0`, pnpm `10.34.1`, macOS. The first local `pnpm verify` passed. Concurrent admin-theme and usage-display edits subsequently appeared and were left untouched. To remove ambiguity about build identity, verification and the new-site experiment were repeated in an isolated `git archive` of that exact commit, reusing installed dependencies through a node_modules symlink.

| Check | Observed outcome | Evidence |
| --- | --- | --- |
| Exact-commit baseline `pnpm verify` | Passed: zero diagnostics, 161 tests in 19 files, production build and artifact checks. | [Baseline log](../evidence/2026-10-08-ai-navigability/verify-baseline.log) |
| Exact-commit source with minimal canonical client content | `pnpm build` passed; only `/` and `/admin/` emitted. | [Build log](../evidence/2026-10-08-ai-navigability/baseline-new-site-build.log), [fixture and exit codes](../evidence/2026-10-08-ai-navigability/baseline-probe.json) |
| Artifact check on that valid new site | Failed: the absent Journal route produces `undefined !== 0` in the demo-specific zero-JavaScript assertion. This is a verification-tooling limitation. | [Failure log](../evidence/2026-10-08-ai-navigability/baseline-new-site-artifacts.log) |
| Bounded native Safari discovery | Labels and controls exposed for Pages, schema disclosure, object/field creation, cancellation and generic bindings; cancelled creation left the object list empty. | [Browser observations](../evidence/2026-10-08-ai-navigability/browser.txt) |
| Fresh-agent performance and live providers | Not exercised; no claims of full agent autonomy or live-provider success. | Scope stated in the report. |

The browser ran the audit's production preview at `http://127.0.0.1:4327/admin/`. No credentials were entered and no provider writes occurred. Its owned preview process was stopped. Closing the audit tab encountered concurrent Safari activity; further browser interactions were stopped to avoid affecting another session. Temporary archive/probe directories were removed. Original content records were not changed by the audit.

The earlier working-tree [verification log](../evidence/2026-10-08-ai-navigability/verify.log) and initial probe logs are retained, but the exact-commit logs above are the authoritative automated evidence. The current dirty tree was not certified by those runs.

The report follows jstack planning/wiki conventions and the functional-core review principle proportionately: reuse existing validation and pure helpers; extract additional operations only when an actual local workflow needs them. Markdown remains authoritative. The first `node docs/wiki/_build.mjs` and `node docs/wiki/_build.mjs --check` passed for 136 pages. A final rebuild after small prose edits was blocked by concurrent work linking `features/content-model.md` to the not-yet-present `verification/runs/2026-10-08-readable-usage.md`. That unrelated record was not fabricated or altered. Rebuild/check should be repeated when the concurrent page is available; the Markdown report is complete. These commands validate documentation integrity, not product behavior.
