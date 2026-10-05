# lean-sitebuilder

The product interview is complete; agreed scope is in `docs/wiki/discussions/agreed-design.md`. The technical interview is also complete; read `docs/wiki/discussions/technical-contracts.md` for interfaces, engineering recommendations, and validation targets. The user authorized implementation on 2026-10-05. Application source, fixtures, and tests are now present; see `docs/wiki/features/index.md` and `docs/wiki/verification/setup.md`. Use jstack from `/Users/rengwu/Desktop/Projects/jstack`.

On resume, read `docs/wiki/index.md`, the decision register, open questions, and latest journals. Keep accepted decisions distinct from proposals. Update the existing records after substantive discussion; Markdown is authoritative. Rebuild and check with:

```sh
node docs/wiki/_build.mjs
node docs/wiki/_build.mjs --check
```

Use grill-form to present interview rounds. Do not treat unanswered recommendations as decisions. Run `pnpm verify` for implementation changes, preserve retained block versions, and keep live-provider checks distinct from mocked tests.

The user authorized implementation of the agreed generic-page/schema-only-entry redesign on 2026-10-06. Read `docs/wiki/journal/2026-10-05-generic-pages-discussion.md` and its round-two outcome; DEC-058–DEC-073 define its accepted behavior.
