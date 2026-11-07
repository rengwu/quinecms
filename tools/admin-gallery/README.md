# Admin gallery

One page showing every admin component, input and screen in its states, for
design-system work. It renders the real editor modules on test-owned fixtures
and is not part of the engine package.

```sh
pnpm gallery
```

Open <http://localhost:5318/>. Editor CSS changes apply in place; component
changes reload the page. **Dark** and **Light** set the admin theme for the
gallery and its screen frames.

Each card shows its source file and pickers for the states that component has.
**Interaction** forces `:hover`, `:focus*` or `:active` styles: `force-states.ts`
copies those rules so they also match inside `[data-gallery-force]`.

## Files

| File                          | Role                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `Gallery.tsx`, `Specimen.tsx` | Page, theme, providers and the card with its pickers.                               |
| `specimens/*.tsx`             | One section each. A specimen returns the real component for the chosen state.       |
| `content.ts`                  | Fixture site: every field type, a second language, long text and images.            |
| `frame.tsx`, `screens.ts`     | The real `App` and login screen at real viewport sizes, reached by scripted clicks. |
| `git.ts`                      | Replaces the repository connection in frames; `?git=` selects its outcome.          |
| `registry/definitions.ts`     | Test registry blocks, limited to the React ones its single view can render.         |

Add a component by adding a specimen to the matching section. States that need
an interaction use `<Then run={(stage) => click(stage, 'Label')} />`. A missing
control shows **State unavailable** in the card; a failed screen step shows
**Screen unavailable** in its frame.

`tests/admin-gallery.test.ts` fails when the editor imports an admin UI component or
Phosphor icon the gallery does not show, or when any in-page state throws.

## Limits

- Block thumbnails and previews use the test registry's single unstyled view.
- Forced states cover CSS pseudo-classes, not script-driven states such as
  highlighted menu options.
- Frames never reach Git or R2. Uploads report the real configuration error
  for the empty R2 settings.
