# Archline

This theme and its blocks are available in the **main dashboard**: run `pnpm dev`,
then use **Site Layout → Change layout** and **Pages → Add block → All themes**.
The commands below are optional developer sandboxes for this sample content,
not separate theme modes.

A close visual recreation of [Archline](https://archline.framer.website/), built
with an installed site layout, 18 editable blocks and shared project records.
The isolated example contains a complete homepage, project index and six project
detail routes. Root content and the existing themes remain unchanged.

## Run

From the repository root, with dependencies installed:

```sh
pnpm example:archline
pnpm example:archline build    # validate, build and check artifacts
pnpm example:archline prepare  # stage a temporary checkout only
```

Use the URL printed by Astro (preferred port 4322, or the next available port).
The title contains **Archline®**. Open `/admin/` at that origin and sign in with
`admin@example.com` / `asdf1234` for development.

Each command stages a fresh temporary checkout, shares installed dependencies and
preserves root `content/`. Source changes do not update an already staged copy.
Stop an owned instance from its printed directory with `pnpm exec astro dev stop`.
The runner excludes private repository environment files and remote Git settings.
Its production editor uses public fixtures `archline@example.test` /
`archline-preview`; configure private credentials before deploying a real site.

For a client site, use a dedicated clone, copy this example's records to root
`content/`, and follow the root README for provider and hosting setup. The layout
is also installed in the regular editor's Site Layout catalog; its section blocks
appear in the block catalog. Selecting a layout does not populate example content.

## Client editing map

| Change | Editor location |
| --- | --- |
| Brand, navigation, expanded menu image, contact and footer | Site Layout → Archline |
| Home copy, photos, statistics and calls to action | Pages → Home → named Archline block |
| Service cells, process steps, partners, testimonials, articles and FAQ | The corresponding block → named list row |
| Shared title, year and cover image | Content → Archline Projects → project |
| Header facts, summary, facts, story chapters and gallery | The same project entry; open a row to edit nested fields |
| Home project selection and order | Pages → Home → Selected projects → Projects and display order |
| Index project selection and order | Pages → Projects → Project index → Projects and display order |
| Shared detail layout and field bindings | Pages → Project detail → generic blocks |
| Page section order | Drag block rows, or focus one and press Alt + Up/Down |
| Gallery/story order | Drag list rows, or focus one and press Alt + Up/Down |
| Images and alternative text | Media or the image selector in a field |

The Projects collection is routed through the generic Project detail page. Adding
a valid entry creates `/projects/<slug>` at build time. Both grids and the detail
hero use the same title and cover image. Detail narrative, facts and gallery are
entry-owned, so editing the template does not duplicate project content.

The sample grids explicitly select all six entries. Select a new project in each
grid to feature it; clear a grid's selection to show all entries in its configured
collection. Reference rows may display **Item 1**, etc.; open them to see the
selected project. The curated selector targets `collection_archline_projects`.
Collection and field mapping controls normally need no client changes. A different
schema requires adjusting those mappings and the reference selector definition.
Entry editing uses the standard content form; inspect a page preview to see it in
context. Generic blocks inherit values through field bindings.

Browser edits change the browser draft, not local JSON. **Settings → Backups →
Export backup** preserves experiments. `backup.json` is the importable initial
snapshot (metadata, not image binaries). Import replaces the browser draft; use
an isolated origin. Keep the backup in sync with source records.

## Blocks and implementation

Static blocks: photo hero, introduction, numbers, full-width image, selected
projects, project index, services, process/image pair, partners, testimonials,
editorial cards, marquee, FAQ and enquiry. Generic blocks: project hero, project
story, project gallery and enquiry. The two enquiry definitions share a renderer.

Definitions and small view entry points live in `src/blocks/archline-*/v1/`;
shared renderers and scoped CSS live in `src/themes/archline/v1/`. The layout,
settings, metadata and spacing policy live in `src/site-layouts/archline/v1/`.
Registration uses the normal block/layout manifests. No core editor behavior or
new dependency was introduced.

The design keeps the reference's photographic hero, fine grid lines, warm paper,
asymmetric cards, dark checkerboard services, photographic testimonials and
postcard enquiry. Typography uses local Inter Display. Container queries adapt
both the public site and narrow editor preview. Geometry and font choices remain
source-maintained; text, links, images and repeated items are editable.

The menu supports keyboard navigation, Escape and closing after selection; FAQ
uses native disclosures. Testimonials have manual previous/next/dot controls.
Content reveals, image hovers and a slow marquee supply subtle motion. Reduced
motion disables animation and reveals all content. Scrolling remains native.
The layout and testimonial block hydrate; other section blocks render statically.
Without JavaScript, the menu and FAQ still open and the first testimonial remains
visible.

## Reference content and assets

There are 29 locally optimized images with responsive variants in
`public/archline/v1/`, alongside fonts, their OFL license and `sources.json`.
Provenance identifies the reference and original asset URLs; it is not a license
grant for the imagery. New uploads use the builder's ordinary media workflow.

Branding, photography, hero wording, sample contact details and statistics come
from the reference. Supporting copy was adapted into coherent architecture demo
content; project narratives are illustrative concept studies. Testimonials are
explicitly illustrative. Partner names use editable typographic symbols instead
of copied logo artwork. These records do not establish real business claims.

Standalone studio/services/contact/article templates are outside this example.
Navigation targets implemented home sections. Editorial cards link to the
reference articles; enquiry is an editable email link, with no submission backend.
There is no distortion effect, custom scrolling or animated counter.

See the [accepted scope](../../docs/wiki/journal/2026-10-13-archline-theme-scope.md)
and [verification](../../docs/wiki/verification/runs/2026-10-13-archline-theme.md).
