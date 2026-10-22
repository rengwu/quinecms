# QuineCMS i18n UI spike

Disposable, isolated prototype comparing internationalization **presentation**
methods (DEC-207, DEC-216). It is not production i18n, not a storage format and
not part of the engine package. Results and screenshots are recorded in
[the spike result](../../docs/wiki/discussions/internationalization-ui-spike-result.md).

## Launch and reopen

From the repository root, after `pnpm install --frozen-lockfile`:

```sh
pnpm exec vite --config spikes/i18n-ui/vite.config.ts
```

Open <http://localhost:5317/>. It starts in the selected design (DEC-217–DEC-225):
presentation A with the top-bar language selector. Content lives in memory:
reload resets it. Save draft and Publish are simulated; no Git, R2, credentials
or site files are used.

Deep links select a presentation, language scope and scenario:

| Parameter | Values |
| --- | --- |
| `p` | `a` one language at a time (default, selected); `b` main language beside the translation (680px drawer from 1280px wide, stacked below that); `c` main language above each translated field in the standard drawer |
| `scope` | `portal` one top-bar selector kept across navigation (default, selected); `item` tabs per item, reset on opening another item |
| `s` | `complete`, `missing`, `incomplete`, `complete-required`, `edit-main`, `nested`, `settings`, `schema` |
| `quiet` | omit the scenario hint toast (for screenshots) |

Example: <http://localhost:5317/?p=b&scope=item&s=incomplete>. The
**Prototype** button in the top bar (in **Menu** below 600px) switches
presentation/scope and opens any scenario with fresh fixtures.

## Files

| File | Role |
| --- | --- |
| `fixtures.ts` | Invented demonstration content and the review scenarios. Not Kahf content. |
| `model.ts` | Minimal shared/localized reads, automatic eligibility, whole-item fallback, publish report. |
| `ItemEditor.tsx` | Language tabs, copy status, both presentations, nested rows/blocks, copy creation/removal. |
| `Preview.tsx` | Mock site; Draft versus Visitor resolution and fallback provenance markers. |
| `Spike.tsx` | Portal shell, tables, Settings, schema localization control, simulated Save/Publish, prototype controls. |

Existing editor modules are imported read-only: `FormScreen`, `PanelSection`,
`PanelNavigation`/`PanelLevel`, `Navigation`, `BlockList` and
`editor.module.css`, plus Kumo controls. Nothing under `src/` was changed.

## Prototype assumptions (not engine requirements)

- A language copy stores localized values only; shared values come from the main
  item. List rows and blocks keep stable IDs; their structure and order are shared.
- Blank localized values stay blank (no per-field fallback). Other referenced
  items, the layout and the product template resolve independently, as a visitor
  would receive them; only the edited item follows Draft/Visitor.
- New language copies start blank in an explicit Create/Cancel form.
- Removing or disabling a language keeps stored copies (proposed default only).
- Media alt text is per language whenever languages are on; the field setting
  applies to the image (DEC-222).
- Only secondary-language copies show a status line (DEC-225).
- Strict policy requires an eligible copy for every item, including data-only entries.

## Limits

Mock UI only: no engine persistence, routing, metadata output, recovery, real
design rendering or publishing was exercised. Adding blocks or entries, block
reveal scrolling and drag-sorting fidelity were not part of this spike.

Type check (optional, from the repository root):

```sh
pnpm exec tsc --ignoreConfig --noEmit --jsx react-jsx --strict --module esnext \
  --moduleResolution bundler --target es2022 --lib es2023,dom,dom.iterable \
  --skipLibCheck --verbatimModuleSyntax --types node,vite/client \
  spikes/i18n-ui/*.ts spikes/i18n-ui/*.tsx src/env.d.ts
```
