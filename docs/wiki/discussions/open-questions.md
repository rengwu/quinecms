---
title: Open questions
updated: 2026-10-05
status: Product scope resolved
---
# Open questions

The four-round interview establishes the [agreed design](agreed-design.md). No further product-choice round is needed before preparing the implementation plan. Proposed technical details remain distinct from accepted requirements.

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

Define the content/schema file formats, block authoring and preview interfaces, dependency sharing, Git save/merge concurrency handling, schema compatibility validation, and upload metadata. Propose concrete starter blocks and validation scenarios. Choose image widths/encodings/limits and browser fallbacks, and document repository permissions and R2 CORS setup. These details require engineering decisions and verification, not more speculative interview questions.

R2 credential retention was not separately selected; propose the same tab-session behavior as GitHub when specifying the editor session. Do not mistake that proposed default for an explicitly answered question. The optional future capabilities excluded above can be reconsidered if the user expands scope.

## Research

Astro documents that its Vite-provided environment values are statically replaced at build time and that public variables are available to client code. The inference for a fully static editor is that checking a configured credential in client code is a UI gate, not server-enforced authorization. [Environment variables](https://docs.astro.build/en/guides/environment-variables/).

GitHub documents repository-scoped fine-grained tokens and branch merging through its API. Exact required permissions and branch protection compatibility must be validated in implementation. [Personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [branch API](https://docs.github.com/en/rest/branches/branches#merge-a-branch).

GitHub Pages offers static hosting; private-repository availability depends on the account plan. This is a deployment option, not an accepted provider choice. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
