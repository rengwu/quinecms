---
title: Quine recreation trial
updated: 2026-10-11
status: Implemented and locally verified
---
# Quine recreation trial

The user requests a recreation of [Quine Systems](https://quinesystems.com/),
using the sibling `astro-payload/sites/quine/astro` project as reference, and an
assessment of local-agent instructions and CMS capability discoverability.
The [submitted interview](2026-10-10-grill-70f0a843-a76a-4f07-abad-276578c76dd8.md)
settles the scope below. The transcript's date is UTC; this interpretation uses
the workspace's local date.

## Accepted scope

- Choose between live-site and source details using engineering judgment.
- Reproduce the appearance and interactions closely, allowing small usability fixes.
- Reuse assets; independently implement every component rather than adapting old code.
- Preserve the active demo and build Quine as an isolated example.
- Expose editorial content and section ordering through the existing editor.
- Keep projects in a repeatable Works-block list; no Projects collection or new detail routes.
- Improve clear instruction gaps and fix small blockers. Discuss larger CMS changes first.

These are DEC-143–DEC-146 in the [decision register](../decisions/index.md).
The original request authorizes implementation; no second approval is needed.

## Implementation approach — engineering choices

Use an installed Quine layout for typography and navigation, and independently
registered blocks for the hero, statement, services, works and contact sections.
Keep an ordinary content snapshot under `examples/quine/`, with an isolated local
runner using the same builder source. The root `content/` remains unchanged.
The runner is development tooling, not a second CMS or a new multisite product.

Use original assets locally where possible. Editorial images should be represented
by media records so existing Media selectors work. Design geometry, effect code
and decorative branding remain source-maintained. Validate the content snapshot,
public rendering and representative editor changes. Live provider operations and
hosting are outside this local trial.

## Delivered

`pnpm example:quine` stages a separate checkout with the Quine snapshot, copied
source/assets and shared installed dependencies. It prints the actual local URL
and public fixture login. It never swaps root content or copies the repository's
private `.env`. Astro backgrounds the server; stop it from the printed directory.
`pnpm example:quine build` validates and builds the same snapshot in isolation.

Five registered blocks cover the introduction, statement, services, works and
contact. The Quine layout owns the shell, fonts and navigation. Editorial fields,
service rows, project rows, images and section order use existing editor controls.
The project gallery has stable row identities, keyboard selection and meaningful
server-rendered content. The example README maps each client task to its editor
location and describes the source/browser boundary. An initial importable backup
is included beside the canonical content files.

Original fonts, logo, textures and project screenshots are local assets with
provenance recorded in `public/quine/v1/sources.json`. The independently written
Canvas 2D halftone is an approximation of the original shader, drawing on load and
resize rather than continuously. This is a visible fidelity compromise. Typography,
section composition, project selection and narrow layouts preserve the reference's
identity; reduced-motion handling and keyboard gallery controls are small usability
improvements. No old component/effect implementation was copied.

## Observed friction and changes made

| Observation | Consequence | Delivered improvement |
| --- | --- | --- |
| The source contains hard-coded project data, but the client's chosen ownership is one Works section. | Porting the old application model or insisting on a collection would add unnecessary structure. | A block-owned list, plus a capability-to-client-task table in the authoring guide. |
| Local image files could be rendered, but media validation accepted only HTTPS URLs. | A faithful local rebuild could not expose copied images through normal CMS selectors without external hosting. | Safe root-relative media URLs are now valid; selectors and renderers needed no special path. Unsafe/protocol-relative URLs remain rejected. |
| Media values, block lists and collection arrays have different exact shapes. | Guessing an ID string, `array`, or `list` in the wrong contract leads to validation failures. | Concrete value examples and source pointers in the guide, including `{mediaId, alt}` and `_rowId`. |
| There was no isolated complete-site launch path. | Swapping root content would violate the selected preservation scope. | A small staging runner using normal content and build contracts; no alternate CMS content-root API. |
| Linked dependencies initially produced a forbidden hydration renderer; shared Vite caches also produced a stale module request. | The static page looked correct while the gallery or login remained inactive. | Explicitly allow the linked dependency directory and keep Vite caches per checkout; exercise real controls after starting the server. |
| An occupied preferred port opened the existing demo instead of Quine. | A successful HTTP response did not establish which site was being checked. | Read Astro's actual URL and check page identity, documented in both entry points. |
| The editor preview does not mount layout Head and can be narrow inside a wide window. | Fonts/responsive styles can work publicly but fail in preview. | Renderer-loaded scoped styles, local fonts and container queries; documented as a recreation check. |
| Layout regressions require explicit geometry defaults consistent with policy output. | The first full verification caught missing Quine defaults. | Added 1440px/32px defaults and shared spacing resolution; the existing check remains intact. |
| Browser editing affects a tab draft rather than local source. | A successful preview edit is easy to mistake for a saved source change. | An explicit editing map, backup snapshot and preservation instructions; cancellation was exercised. |

The local-media change does not add browser filesystem access. New uploads still
use R2; deleting a record does not remove a copied `public/` file. Core validation
does not prove local files exist, so the example checks their presence separately.

## Wordmark spacing follow-up

The user's desktop comparison exposed a missed space in the animated wordmark.
Splitting the text into words had discarded the separator between Quine and Systems;
the flex row redistributed that width among narrow letters, making “Qui ne” appear
separated. Restored a separator item on desktop and hid it when words stack on
narrow screens. The shared component also corrects the contact wordmark.

Compared the desktop hero directly with the live reference in Safari and checked
the hero/contact wordmarks at 320px. Full `pnpm verify` passed with 195 tests,
zero type errors/warnings, and passing build/artifact checks. The running isolated
preview received the updated source; already-open editor sessions need a reload.
The authoring guide now calls for a same-viewport typography comparison after
fonts and animations settle. Correct font metadata alone did not catch this bug.

## Proposals for a future discussion

These are observations and options, not accepted product changes:

1. **Expose a site-specific editing map in the CMS.** The README now explains
   where each Quine task lives; an optional author-supplied help panel could make
   that discoverable without leaving the editor. First test whether clients need it.
2. **Use content-neutral language in reusable list controls.** Project rows currently
   inherit “With a block focused” and “Block moved” wording. A shared item noun could
   make list instructions clearer without changing navigation or list behavior.
3. **Consider a validated backup-to-files command.** Export/import is available,
   but preserving browser experiments in a local clone still requires reconciling
   snapshots manually. Any command should show its destination and change impact.
4. **Consider a local-asset import helper only if repeated migrations justify it.**
   Today authors create metadata records and copy files. A helper could measure
   dimensions/bytes and catch missing files; remote URLs and uploads remain separate.
5. **Benchmark the new instructions with another fresh agent/site.** This trial
   establishes concrete friction and a runnable example, not a measured improvement
   in agent success rate. Avoid turning the successful five-block model into a rule
   for every future recreation.

## Verification and limits

[The verification record](../verification/runs/2026-10-11-quine-rebuild.md) links
command logs and browser observations. Full repository verification passes with
193 tests; the isolated example validates and builds `/` and `/admin/`. Safari checks
cover desktop, 390px/320px layouts, gallery interaction and representative editor
changes, cancellation and project reordering. Root `content/` remains unchanged.

No remote draft save, publication, deployment or live R2 operation was attempted.
Browser export reached Safari's download-permission prompt and was cancelled;
completed browser download/import is not claimed. The included backup is compared
with source records separately. Reduced-motion behavior is implemented but was not
exercised through an OS preference change. No cross-browser or pixel-diff benchmark
is claimed. Existing unrelated work in this dirty checkout was preserved.
