# lean-sitebuilder

Sidebar navigation (DEC-132, 2026-10-08): non-leaf items expand/collapse their subitems and have no route. Schemas is a disclosure group containing Collections and Objects. Both leaf lists open directly without Back; nested schema editors retain Back to their list. Use the same hierarchy in the compact navigation menu.

Form-action layout (DEC-131, 2026-10-08): align terminal confirmation/cancellation actions to the right edge of their form or dialog sitewide, including nested editors and compact insert forms. Use the shared full-width `dialogActions` row, with Cancel/Close before the confirmation action, and allow wrapping at narrow widths. Do not align the group to the left by letting its container shrink to its contents.

Layout spacing (DEC-130, 2026-10-08): Content spacing belongs in Site Layout. Each layout owns default content max-width/page gutter and editable overrides in its settings; switching layouts uses the selected layout’s defaults. This supersedes DEC-097’s shared spacing outside layouts. Starter defaults to 1200px/24px; chartr to 1512px/40px. See `docs/wiki/features/site-layouts.md`.

Creation UX (DEC-129, 2026-10-08): sitewide Add actions open uncommitted New-item forms. Only Create adds the item to its parent/site draft; Cancel discards it. Creation screens use Create and Cancel, without Back or Delete/Remove for the item being created. Nested creation commits only into its uncommitted parent until that parent is created. Treat adding an empty record immediately on opening its editor, then requiring Back/Delete to finish or abandon, as a negative UX pattern. Existing-item editing retains its navigation/deletion behavior. This supersedes earlier direct-add catalog instructions.

Current direction (2026-10-07, DEC-109): this prototype is not in production or in use. The user permits breaking existing behavior/contracts or completely redesigning the system; compatibility with current content and retained implementations is not a constraint on this redesign. This supersedes preservation requirements below where they would prevent the redesign. The collections/objects/relations product scope is settled through DEC-128, which selects a lean Sanity-style content model: independent entries, owned objects, typed arrays and references. The agreed three owned object/list levels and rejection of direct/indirect recursive definitions remain; ordinary nested reuse is supported. Read `docs/wiki/discussions/content-model-plan.md`, the linked topic pages and latest journals, including `2026-10-07-lean-sanity-model.md`. No grill-form round is active. Accepted product choices and proposed engineering details are separate; implementation of this increment was authorized on 2026-10-08. The user explicitly excludes backward compatibility and migrations. This increment is implemented; read `docs/wiki/features/content-model.md`, `docs/wiki/journal/2026-10-08-content-model-implementation.md` and `docs/wiki/verification/runs/2026-10-08-content-model.md` for current engineering contracts and verification limits.

The product interview is complete; agreed scope is in `docs/wiki/discussions/agreed-design.md`. The technical interview is also complete; read `docs/wiki/discussions/technical-contracts.md` for interfaces, engineering recommendations, and validation targets. The user authorized implementation on 2026-10-05. Application source, fixtures, and tests are now present; see `docs/wiki/features/index.md` and `docs/wiki/verification/setup.md`. Use jstack from `/Users/rengwu/Desktop/Projects/jstack`.

On resume, read `docs/wiki/index.md`, the decision register, open questions, and latest journals. Keep accepted decisions distinct from proposals. Update the existing records after substantive discussion; Markdown is authoritative. Rebuild and check with:

```sh
node docs/wiki/_build.mjs
node docs/wiki/_build.mjs --check
```

Use grill-form to present interview rounds. Do not treat unanswered recommendations as decisions. Run `pnpm verify` for implementation changes, preserve retained block versions, and keep live-provider checks distinct from mocked tests.

The user authorized implementation of the agreed generic-page/schema-only-entry redesign on 2026-10-06. Read `docs/wiki/journal/2026-10-05-generic-pages-discussion.md` and its round-two outcome; DEC-058–DEC-073 define its accepted behavior.

The user authorized the Site Layout foundation and chartr recreation on 2026-10-06. Read `docs/wiki/discussions/site-layouts.md` and `docs/wiki/discussions/chartr-recreation.md`; DEC-092–DEC-107 define the accepted scope. DEC-108 requires dedicated navigation levels sitewide: never render nested item editing inline among parent/sibling controls. Preserve retained layout implementations as well as blocks.
