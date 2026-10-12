---
title: Local agent authoring investigation
updated: 2026-10-08
status: Historical audit; local guidance and validation implemented
---
# Local agent authoring investigation

Follow-up, 2026-10-08: the user approves the final response's steps 1–3 (concise AGENTS.md, practical authoring guide, dependable local validation) and clarifies that creative freedom is primary. Capability choices and workflows are recommendations, not requirements. DEC-134 records this direction. See the [current guide](../features/local-authoring.md) and [implementation journal](../journal/2026-10-08-local-authoring.md). The audit below describes the earlier inspected revision; its identified documentation/verification gaps are addressed in that increment. Additional examples and fresh-agent exercises remain future options.

The user's purpose is to let a developer build a client website quickly with AI while leaving its ongoing content maintenance to the client through the portal. The agent should understand and use the builder's layouts, blocks, pages, schemas, objects, collections and references, both for a new site and for later changes.

The user clarifies that agents run on the developer's machine against a cloned repository. Remote agent access and MCP are outside this investigation's proposed work. This is an investigation and recommendation, not authorization to implement new tooling.

## Assessment

The repository is already workable for a capable coding agent, but onboarding requires substantial inference and source inspection. There is no concise, complete, current guide that takes a fresh agent from a client request to an appropriate content model, implementation and verified handoff. The main next investment is a reliable local authoring contract and useful verification for arbitrary sites.

Most of the necessary product mechanisms exist. JSON records are editable directly, TypeScript describes their shapes, manifests describe installed blocks, and shared functions validate content, resolve bindings and generate routes. A local agent can use these without a remote service or a separate agent CRUD API. Browser interaction remains useful to check the client's editing experience and the rendered result.

This assessment is source-backed, with a fresh automated baseline, a small browser discovery check and an isolated new-site experiment. It is not a measured success rate for fresh agents. See the [journal and evidence](../journal/2026-10-08-ai-navigability.md).

| Area | Present capability | Remaining friction for a fresh local agent |
| --- | --- | --- |
| Learn the product | AGENTS.md, README, feature pages, technical contracts and decisions | Current instructions coexist with superseded recipes; no short operational reading path. |
| Inspect a site | Separate JSON records with stable IDs; explicit registries | Agent must assemble the site's schema, route and presentation relationships from several files. |
| Edit pages and content | Direct JSON edits; field/default helpers; common validation | No documented end-to-end file-edit recipe explaining all relevant invariants and draft sources. |
| Use objects and references | Typed owned values, arrays, stable references and forward bindings | The current feature page explains these well, but README and default fixtures do not show the full current model. |
| Author blocks and layouts | Registered manifests, shared public/preview renderers, existing examples | Custom settings and fields may require reading React controls and policy code to understand valid values. |
| Check a new client site | Production build validates and renders site content | Some tests and artifact assertions depend on the bundled demo. |
| Verify client maintainability | An actual editor, recovery and generic-page rendering | No acceptance exercise proves that a fresh agent produces content the client can maintain independently. |

## What an agent can consult today

Use this reading order for the audited revision:

1. `AGENTS.md` for current accepted constraints and the supersession rules.
2. [Feature map](../features/index.md), then [content model](../features/content-model.md), [generic pages](../features/generic-pages.md), [Site Layouts](../features/site-layouts.md), [block library](../features/block-library.md) and [publishing](../features/publishing.md) for the relevant task.
3. `src/core/types.ts`, actual `content/` records and the selected block/layout manifests for exact shapes.
4. `examples/content-model.json` for a richer composition: named objects, independent referenced entries, nested arrays, generic bindings and a single-entry collection.
5. Relevant core helpers and tests for details the prose does not resolve.

This is a usable route through the existing material. It still makes the agent reconcile implementation, examples and historical decisions before confidently authoring a site.

The audited registry contains 94 block versions across 93 block types, including 31 generic versions and three footer versions, plus two layout versions. Discovery should use `blocks.config.mjs`, `layouts.config.mjs` and their manifests rather than a manually maintained list of block names in a guide. Generated files under `src/generated/` are build output.

## Concrete findings

### 1. The main entry points contain conflicting guidance

At the audited revision, README says width and gutter belong to shared Settings and `site.globals`, and that switching layouts preserves shared geometry. DEC-130 and the current Site Layout feature contract instead place these in `site.layout.settings` and apply the selected layout's defaults. README also describes collection fields as scalar-only, omits `content/objects/` from its record map, and uses the former Collection schemas navigation. The static-block feature page retains old spacing recipes too.

These are operational errors for an agent: it can write a plausible property that has no intended effect on a canonical layout, or fail to use supported content features. Historical journals can remain historical; active guides need one consistent current contract.

The root AGENTS.md mostly communicates recent decisions and project-maintenance history. It also requires jstack through an absolute path on this developer's machine. A newly cloned client repository needs its core authoring instructions to work independently of that path. Local developer workflow integrations can remain separately documented.

### 2. Examples do not consistently lead with the canonical shape

The committed `content/site.json` still demonstrates legacy top-level title/navigation/globals, while the canonical layout selection is `site.layout = { id, version, settings }`. The existing reader supports that fixture, but a fresh agent learning by copying it can reproduce a superseded authoring format. The richer content-model example is available but requires discovery through the wiki.

Provide a small canonical new-site example and clearly identify the existing rich example. This does not require a migration system. Examples should teach the format new work should produce.

### 3. Some extension contracts are discoverable only through code

Starter's manifest has `fields: []`; its custom settings component and policy define navigation, header, footer and typography behavior. Hero v2's custom presentation field names a widget and validator, while the validator defines the actual accent/inset constraints. This is supported flexibility, but a manifest alone is not a complete authoring specification.

For local agents, the lean remedy is to document the relevant settings/value shape beside custom extensions, with examples and links to their validator and controls. Declarative fields can continue to describe ordinary values. A universal schema framework is not a prerequisite.

### 4. Direct file editing needs an explicit correctness recipe

Useful shared functions already exist:

| Responsibility | Existing source |
| --- | --- |
| Records, stable paths, serialization and snapshot validation | `src/core/types.ts`, `src/core/content.ts` |
| Schema depth/cycles, incoming usage and forward paths | `src/core/schema.ts` |
| Defaults, structured rows and new row identities | `src/core/lists.ts` |
| Typed binding compatibility and resolution | `src/core/bindings.ts` |
| Public routes and entry paths | `src/core/routes.ts` |
| Layout selection and resetting settings to defaults | `src/core/layouts.ts` |
| Saved snapshot transactions and publication | `src/integrations/github.ts` |

Some creation coordination lives in React: creating a single-entry collection provisions its entry in `Schemas.tsx`; page/entry creation lives in `App.tsx`. A local file-editing agent must reproduce the resulting records correctly. That does not alone justify extracting every UI operation into a new API.

The guide should explicitly cover `formatVersion`, IDs/filenames, collection ownership, `_rowId`, cloned defaults, single-entry provisioning, ordered unique reference arrays, the three owned-level limit, and typed bindings. Collection/object schemas use `array`; block/layout repeated fields retain `list`. Owned objects reuse structure while keeping values local. Entry references share independent content.

Validation has two distinct roles: `validate(next, definitions)` checks the candidate snapshot; `schemaChanges(before, next)` checks changes against a baseline, including usage/deletion and populated-field constraints. The build calls snapshot validation, while Git saving/publication also uses baseline comparisons. A successful build by itself does not establish the same transition checks as the portal.

### 5. A valid new site can fail the documented verification workflow

This was reproduced in an isolated archive of commit `348f1237f115541694f738bac77137333a4550d8`:

1. The original demo passes `pnpm verify`: 161 tests, type checking, production build and artifact checks.
2. Replace only `content/` with a canonical Starter site and one valid empty-block home page; keep the registries and application source.
3. `pnpm build` succeeds and emits the home page and admin.
4. `pnpm check:build` fails with `Collection listing should have no JS`, because `scripts/check-build.mjs` expects `journal/index.html` to exist and compares its absent result to zero.

The same script assumes all listed framework runtimes are present. Several tests also read the mutable root `content/` directory and expect demo IDs or routes. The latter are source findings; the reproduced failure above specifically establishes the missing-Journal assertion.

Separate product regression fixtures from a client's content. Keep demo-specific coverage in isolated fixtures, and make the client-site build checks inspect the routes and runtimes the site actually uses. Agents should not have to retain unwanted demo pages or remove useful tests to deliver a client site.

### 6. Local work and the client portal have different persistence boundaries

Local source/JSON edits change the checkout. Browser edits affect the browser draft and recovery state; they do not write local files. Once connected, the portal saves its full draft snapshot to GitHub and publishes the validated saved snapshot to main. New block/layout code requires a rebuild; publication checks the deployed editor's source contract.

The existing-site recipe must identify the configured shared draft and latest saved client content before editing, explain how source changes and that draft are reconciled, and preserve the Save/Publish distinction. Unsaved content in another browser session is not present in a local clone. The agent needs to state which snapshot it changed, rather than assuming every copy of the site is current.

## Recommended next steps

### First: a short, portable agent entry point and one practical guide

The [AGENTS.md format](https://agents.md/) is ordinary Markdown for project-specific agent instructions; this approach needs no custom agent runtime.

Refocus root AGENTS.md around the product's purpose, the first files to inspect, the supported workflows, the commands to run, and links to detail. Keep decision history in the wiki. Add one focused local-authoring guide, with sections an agent can load according to its task:

- **Model the client's information:** use page/block props for section content; collections for independent repeated records; single-entry collections for centrally managed singleton content; objects for shared structure; arrays for owned repeated values; references for shared records; generic pages for collection presentation.
- **Build a new site:** inspect the available catalog, plan the model and routes, create canonical content, compose or implement blocks/layouts, bind fields, build and verify the client editing journey.
- **Modify an existing site:** inspect Git state and the correct draft, trace the target record and its uses, make the smallest appropriate change, compare the baseline and candidate, then verify affected routes and editor fields.
- **Author an extension:** renderer/preview contract, editable fields, custom value documentation, registration, dependency declarations, scoped styles and generation/restart steps.
- **Handoff:** identify what the client can edit, where it lives, how to save/publish, and which checks actually ran.

The audit recommended exposing client-maintained content through editable fields consumed by the renderer. The subsequent user clarification makes this a nudge, not a mandatory allocation: agents may choose the appropriate amount of structure and intentionally source-maintained content for each design and handoff.

Reconcile README and active feature recipes in the same increment. Keep examples and field inventories tied to source so the next feature does not silently invalidate the guide. This is the highest-priority work; no agent service is needed.

### Second: make local validation dependable

Fix the demo coupling described above. Add a small local content-validation command only where it simplifies access to the existing core. For example, a proposed `pnpm validate:content` could report structural versus publication issues and optionally compare against an explicit Git baseline using `schemaChanges`. This command does not exist today.

It should support incomplete drafts without requiring a successful production build first. Current generation combines registry generation with route generation, which can reject invalid routes before a separate validator runs; account for that dependency when exposing a standalone validation command. Return paths and useful messages from the existing validators, and keep JSON output optional.

Do not start by building a broad command framework. Direct file edits, a reliable validator and the existing build may be sufficient. A small read-only site/catalog inspection script can be added later if fresh-agent exercises show that discovery remains slow.

### Third: make examples and authoring contracts easy to copy correctly

Provide a minimal canonical site example, link the richer content-model example prominently, and document one ordinary block and one custom layout end to end. Include the expected portal controls and a public rendering example. Use existing examples wherever possible.

This should teach composition and the choice between content edits, schema edits and source edits. It should not require every client site to adopt every feature, or encourage agents to create duplicate collections where a simple block field is sufficient.

### Fourth: run fresh-agent acceptance exercises

Use a clean context with only a cloned repo and a client request. Repeat against a couple of representative requests and record needed hints, corrective work, final content shape and client editability. Suggested exercises:

| Exercise | Observable completion criterion |
| --- | --- |
| New company site with articles and authors | Appropriate independent records, reusable objects, references, generic entry page and explicit index; build and site checks pass. |
| Adjust an existing article page and company details | Agent finds the correct template and content records, preserves unrelated client content and verifies affected output. |
| Create a new visual block or layout from a reference | It registers and builds, previews correctly, exposes promised editable fields and uses those values in public output. |
| Change referenced/shared content | Agent identifies affected uses and receives actionable validation for invalid changes. |
| Client handoff | A person can change representative content in the portal and see it used correctly, without editing source. |

Measure success and repair effort instead of claiming that any document guarantees perfect behavior from every model. The first milestone is that common tasks can be completed through the documented reading path and commands without reconstructing product history or inferring undocumented formats.

## Scope and evidence limits

The browser check used a fresh local Safari session: Pages, Schemas expansion, Objects, nested New object/New field forms, cancellation back to an empty object list, and generic block bindings/fallback fields were accessible. Keyboard reorder instructions were exposed. This is evidence of usable UI semantics for those flows, not complete browser-agent coverage.

No fresh independent agent benchmark was run. No live GitHub, R2 or hosting-provider operation was performed. Media upload currently uses browser image-processing APIs, so local headless upload parity is not established by this audit and is not required for the proposed documentation-first milestone.

Concurrent admin-theme and usage-display work appeared during the investigation. Exact baseline verification and the new-site failure were therefore repeated in a temporary archive of the recorded commit. The findings do not certify the later working tree. The audit changes planning records and evidence only; it leaves implementation recommendations proposed.
