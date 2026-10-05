---
title: Open questions
updated: 2026-10-05
status: Interviews complete
---
# Open questions

The four-round product interview establishes the [agreed design](agreed-design.md). The user subsequently requested a technical grill to choose the stack, content format, block contracts, and related implementation decisions. The technical interview is now complete as well. Accepted choices are recorded below; untested engineering details are identified in the technical specification.

## Technical round one — resolved

Q25–Q32 are accepted as DEC-026–DEC-033. The additional shared-vendor direction is DEC-034. See [technical foundations](../journal/2026-10-05-technical-foundations.md).

## Technical round two — resolved

Q33–Q39 are accepted as DEC-035–DEC-041. The user chose retained deprecated block implementations and manual version switching, replacing the proposed automated migration functions. See [content/block decisions](../journal/2026-10-05-content-block-contracts.md).

## Technical round three — resolved

| Question | Decision | Accepted outcome |
| --- | --- | --- |
| Q40 | Editor UI components | Base UI primitives with CSS Modules; native controls where sufficient. |
| Q41 | Block CSS scoping | CSS Modules/framework-scoped styles, with no unscoped global resets/selectors. |
| Q42 | Save scope | All pending editor changes in one draft commit. |
| Q43 | Unsaved content recovery | Per-tab session recovery, excluding binary uploads. |
| Q44 | Markdown authoring interface | A visual editor for a limited Markdown feature set. |
| Q45 | Incomplete draft persistence | Save structurally valid incomplete drafts; block Publish until required content is valid. |

Q40–Q45 are accepted as DEC-042–DEC-047. See the [editor/saving journal](../journal/2026-10-05-editor-saving.md). Concrete definitions, engineering recommendations, and verification targets are consolidated in [technical contracts](technical-contracts.md). No further questionnaire is needed for the scoped design.

Base UI supplies unstyled React primitives and documents tree-shakable imports and CSS Modules usage: [quick start](https://base-ui.com/react/overview/quick-start). This is the selected editor library; grill-form remains native HTML.

For Git transactions, the proposed engineering path creates a tree and commit based on the loaded draft head, then advances the branch without force. A concurrent branch advance to a divergent commit must reject the update; preserve local work and explain recovery. Q42 selects all pending edits in one commit. See GitHub's [trees](https://docs.github.com/en/rest/git/trees#create-a-tree), [commits](https://docs.github.com/en/rest/git/commits#create-a-commit), and [reference updates](https://docs.github.com/en/rest/git/refs#update-a-reference). This is a design proposal requiring race-condition testing, not a claim that a preflight read alone provides locking.

Research: Astro supports static prerendering and multiple UI framework integrations, but `.astro` templates have no browser component runtime. A live unsaved editor requires browser-renderable implementations. See [static rendering](https://docs.astro.build/en/guides/on-demand-rendering/) and [framework components](https://docs.astro.build/en/guides/framework-components/). JSON Schema supplies a portable validation vocabulary; editor controls/layout still need UI metadata. See [JSON Schema](https://json-schema.org/overview/what-is-jsonschema). An iframe creates a separate browsing context; using it isolates document styling but does not share live framework instances with the parent. See [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe). The shared-document preview boundary was selected in Q31.

## Resolved in round two

Q8–Q14 are resolved by DEC-009 through DEC-015 in the [decision register](../decisions/index.md): convenience login, both repository visibilities, individual tokens, Netlify-managed deployment, shared page/post block editing, browser previews, and developer-installed blocks.

## Resolved in round three

Q15–Q17 and Q19 are resolved by DEC-016–DEC-018 and DEC-020: tab-session tokens, developer and portal collection schemas, simple shared drafts, and optional global styling. Q18 establishes R2 storage (DEC-019) but leaves upload authorization and media type scope open.

## Resolved in round four

Q20–Q24 are resolved by DEC-021–DEC-025 in the [decision register](../decisions/index.md).

| Question | Outcome | Scope |
| --- | --- | --- |
| Q20 | Runtime editor-supplied R2 credentials | Keep the application static; no secret-holding upload helper. |
| Q21 | Basic fields and safe schema changes | No nested models, relations, or migration tooling initially. |
| Q22 | Automatic standard listing and entry pages | Existing block editor supplies entry bodies. |
| Q23 | Simple image resizing and light compression | Generate web image sets for sufficiently large images; no audio/video transcoding. |
| Q24 | Media URLs may be public before Publish | Page publication remains separate. |

## Engineering work for the implementation plan

Define the content/schema file formats, block authoring and preview interfaces, dependency sharing, Git save/merge concurrency handling, schema compatibility validation, and upload metadata. Propose concrete starter blocks and validation scenarios. Choose image widths/encodings/limits and browser fallbacks, and document repository permissions and R2 CORS setup. The contract definitions now specify these behaviors. Exact library pins, build integration, limits, and validation fixtures remain engineering work. No unimplemented behavior is certified by the interview or wiki checks.

R2 credential retention was not separately selected; propose the same tab-session behavior as GitHub when specifying the editor session. Do not mistake that proposed default for an explicitly answered question. The optional future capabilities excluded above can be reconsidered if the user expands scope.

## Research

Astro documents that its Vite-provided environment values are statically replaced at build time and that public variables are available to client code. The inference for a fully static editor is that checking a configured credential in client code is a UI gate, not server-enforced authorization. [Environment variables](https://docs.astro.build/en/guides/environment-variables/).

GitHub documents repository-scoped fine-grained tokens and branch merging through its API. Exact required permissions and branch protection compatibility must be validated in implementation. [Personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [branch API](https://docs.github.com/en/rest/branches/branches#merge-a-branch).

GitHub Pages offers static hosting; private-repository availability depends on the account plan. This is a deployment option, not an accepted provider choice. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
