---
title: Internationalization UI spike handoff
updated: 2026-10-20
status: Spike delivered — presentation selected (DEC-217–DEC-225)
---
# Internationalization UI spike handoff

**2026-10-20 update:** the spike was built and compared, and the user selected
the presentation (DEC-217–DEC-225); see the
[spike result](internationalization-ui-spike-result.md). The text below is the
original brief.

## Task and authorization

Build an isolated, interactive spike of **QuineCMS internationalization UI
presentation methods**. The user requires this exploration before feature
implementation (DEC-207) and now requests handing it to another agent (DEC-216).
Proceed with prototype work; do not ask again whether a spike is wanted. Make
presentation tradeoffs concrete enough for the user to choose.

This handoff does not authorize production i18n, content-format migrations, the
Kahf recreation, deployment, live Git writes or production uploads. Keep prototype
state/fixtures separate from real content and production imports. Work locally.
No prototype or production i18n work has started in this planning session.

## Workspace and reading

Workspace: `/Users/rengwu/Desktop/Projects/quinecms`. At handoff the branch is
`main`, HEAD `5d005b5`. Planning documents and the generated wiki are modified or
untracked and **not committed**. Inspect the working tree and preserve these
files. A fresh clone of HEAD alone will not contain this handoff or the accepted
planning record; use this workspace or carry the uncommitted documents into the
next checkout. Do not reset or clean them.

Read the repository `AGENTS.md`, then:

1. [Optional internationalization](optional-internationalization.md): authoritative
   accepted behavior, proposed defaults and remaining engineering questions.
2. [Decision register](../decisions/index.md): DEC-194–DEC-207 and DEC-216.
3. [Editor contract](../features/editor.md), [live entry preview](entry-preview.md)
   and [Site Layouts](../features/site-layouts.md): fit the existing portal.
4. [Kahf study](kahf-recreation.md): context only; the spike does not require
   recreating or scraping the public site.

Apply jstack's rule-lean. Local skills used here are under
`/Users/rengwu/Desktop/Projects/jstack/skills/`: `rule-lean`, `grill-me`,
`grill-form`, `plan` and `wiki`, each with a `SKILL.md`. Verify paths if the
environment differs. Use grill-form for consequential questions after showing
the prototype; do not start another broad requirements questionnaire.

## Settled behavior — do not re-ask

- I18n is optional. Portal Settings manages enablement, main/additional languages
  and strict-versus-fallback policy, saved/published with site content.
- English is main and Indonesian secondary for the pilot; the engine is not
  limited to these languages or to two languages. Main-language URLs are
  unprefixed; secondary languages add a prefix. Paths/slugs stay shared.
  The main language is fixed once translations exist.
- Pages, entries, shared layout/navigation copy and existing visitor-facing
  metadata are covered. Fields are shared by default and explicitly marked
  localizable in their definitions. Page sections, their order and templates
  remain shared.
- Fallback selects the **whole item** when its language copy is unavailable.
  Do not fill individual missing localized fields from English inside an
  otherwise Indonesian copy. Deliberately shared fields are common data;
  independently referenced items may resolve to different languages.
- Incomplete translation drafts are allowed. Copies become eligible
  automatically when required fields are valid, subject to structural validation.
  Strict completeness blocks Publish/production build, not draft saves.
  Eligibility does not publish immediately.
- **No Ready switch, review queue, source-change tracking, stale-translation
  warning or automatic translation service.** Editing English leaves valid
  Indonesian content eligible without freshness tracking. The user explicitly
  chose this simpler behavior over the recommendations.

Retaining translations when i18n is disabled or a language is removed is a
**proposed non-destructive default**, not a separately accepted decision. Stable
item identity, nested field representation and exact preview controls still need
design. Preserve data in the spike; expose consequential ambiguity instead of
quietly turning prototype assumptions into engine requirements.

## Presentation comparisons

Prototype two materially different editing presentations using the same fixtures
and scenarios. Suggested candidates, not selected designs:

- One language at a time, with a clear language control and shared-field labels,
  fitted into the existing fields-left/preview-right editor.
- Source/translation comparison, such as a read-only source pane beside target
  fields, with a workable place for live preview.

Assess whether language selection should carry across portal navigation or be
scoped to the item, and how comparison fits a narrow editor and nested drill-down.
Follow the existing spacing, typography, controls, navigation and create/cancel
conventions. Routed entries already use the split view; data-only entries retain
full-width forms. Individual Site Layout editors have preview; their table does
not. Repeated objects open in dedicated nested levels.

Useful source entry points:

| Area | Files |
| --- | --- |
| Portal state/navigation, Settings and preview assembly | `src/editor/App.tsx` |
| Entry and general field presentation | `src/editor/EntryFields.tsx`, `Fields.tsx`, `BlockFields.tsx` |
| Nested fields and drill-down | `src/editor/ObjectField.tsx`, `ListField.tsx`, `PanelNavigation.tsx` |
| Schema field configuration | `src/editor/SchemaFieldEditor.tsx`, `CollectionSchema.tsx` |
| Layout configuration and preview | `src/editor/SiteLayouts.tsx`, `LayoutSettings.tsx`, `LayoutSurface.tsx` |
| Visual conventions | `src/editor/FormScreen.tsx`, `PanelSection.tsx`, `editor.module.css` |
| Model/resolution boundaries | `src/core/types.ts`, `content.ts`, `routes.ts` |

Reuse components/styles where practical without changing production behavior.
Choose a small isolated prototype directory and document its launch command and
paths. Use in-memory fixtures and clearly identified simulated Save/Publish
feedback; no credentials or live providers should be needed.

## Review scenarios

Use an illustrative product with localized name/description, a shared size or
reference, localized media/alt text and a nested list. Also represent a page
block, shared navigation/layout copy, schema localization control and Settings.
Fixtures are demonstrations, not verified Kahf claims or imported client content.

| Scenario | What the user must be able to assess |
| --- | --- |
| Complete English and Indonesian copies | Editing language, shared values and preview language are clear. |
| Missing Indonesian copy | Whole-item English fallback is visible without pretending an Indonesian copy exists. |
| Incomplete Indonesian draft | Draft remains editable; fallback preview and strict publish validation are understandable. No Ready state appears. |
| Completing required localized values | Eligibility changes automatically without immediately publishing. |
| Editing English after Indonesian exists | Indonesian stays eligible without a freshness/review workflow. |
| Navigation and nested editing | Pending edits survive switches as appropriate; language and shared composition stay clear. |
| Site language settings | On/off, languages, strict/fallback policy and the main-language lock are understandable. Retention is labeled as an assumption. |
| Narrow viewport and keyboard | Controls, comparison panes, errors and preview remain usable. |

Distinguish editable draft values from resolved public preview where necessary;
never silently replace an unfinished draft with fallback values. Simulate the
minimal behavior and document assumptions rather than implementing the production
resolver to support the spike.

## Deliverables and stopping point

1. Runnable local interactive prototype comparing the presentations, with
   launch/reopen instructions and reusable fixtures.
2. Browser observations and useful screenshots, including a narrow view. Report
   unexercised behavior honestly; a mock UI does not verify engine persistence,
   routing or live publishing.
3. A short comparison and recommendation grounded in interactions: clarity,
   editing effort, shared-field mistakes, fallback comprehension, preview space
   and fit with the current editor.
4. Then a focused grill-form round for presentation choices still requiring user
   judgment. Preserve accepted choices and explicit deferrals in the existing
   wiki. Stop before production implementation.

Keep spike results separate from current feature documentation. Store useful
visual evidence in supported wiki `attachments/` or `evidence/` paths and link it
from the result note. After wiki edits run:

```sh
node docs/wiki/_build.mjs
node docs/wiki/_build.mjs --check
```

Use proportional verification; a large test framework for disposable presentation
code is unnecessary. Production behavior changes are outside this handoff.

## Session logistics and project boundary

No grill form is pending. All three rounds were collected, saved and cleaned up.
Do not reopen their deleted temporary forms or restart waiters. For a new round,
create a new session and use its returned completion command once. The last
Browser Use check here rejected `file://` navigation with an HTTP/HTTPS-only
policy. Do not bypass an explicit tool denial or let form-opening troubleshooting
replace the spike task.

Kahf scope is thirteen logical pages before language variants: home, story, shop
listing, two products, blog listing, two articles, ingredient listing, one
ingredient detail, two concerns and search. It uses partial bilingual content,
excludes service-backed flows, simplifies decorative motion and requires local
build/editor verification only (DEC-208–DEC-215). Concrete source selection and
non-i18n engine additions are not prerequisites for this UI spike.

At handoff, only planning documentation has changed. Wiki generation and internal
link checks pass. No prototype, engine implementation, site import, deployment,
commit or live-provider verification was performed in this session.
