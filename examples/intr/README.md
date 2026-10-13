# Intr Studio

This theme and its blocks are available in the **main dashboard**: run `pnpm dev`,
then use **Site Layout → Change layout** and **Pages → Add block → All themes**.
The commands below are optional developer sandboxes for this sample content,
not separate theme modes.

A static recreation of [Intr Studio](https://intrstudio.framer.website/) using
QuineCMS's ordinary layouts, blocks, collections, references and media.
It contains a homepage, project listing and one sample detail page, Maison Dorée.
The active demo and Quine example remain intact.

## Run

From the repository root, with dependencies installed:

```sh
pnpm example:intr
pnpm example:intr build       # validate, build and check artifacts separately
pnpm example:intr prepare     # only stage a temporary checkout
```

Use **the URL printed by Astro**. Port 4322 is preferred; an occupied port causes
Astro to choose another. The homepage title contains **intr ®**. Open `/admin/`
at the same origin with `admin@example.com` / `asdf1234`.

Each run copies current source and these records to a fresh temporary directory,
shares installed dependencies, and preserves root `content/`. Source edits do not
automatically reach an already staged copy. Run again after source changes; stop
an old instance from its printed directory with `pnpm exec astro dev stop`.

The isolated production build uses public fixtures `intr@example.test` /
`intr-preview`. The runner does not copy the repository's `.env` or configure
remote Git. Do not deploy with those fixtures. For a real site, use a dedicated
clone, copy this content to root `content/`, and configure private production
credentials and the chosen provider/host as described in the root README.

## Client editing map

| Change | Editor location |
| --- | --- |
| Navigation, contact details, footer, content width | Site Layout |
| Homepage copy and images | Pages → Home → the named Intr block |
| Shared project title, location, cover image and optional link | Content → Projects → project |
| Homepage project selection/order | Pages → Home → Intr · Selected projects → Projects and display order |
| Listing selection/order | Pages → Selected Works → Intr · Project listing → Projects and display order |
| Sample detail text, facts, images and gallery order | Pages → Maison Dorée → the named block |
| Section order | Pages → page → block rows; drag or Alt + Up/Down |
| Available images and alternative text | Media, or the image selector in a field |

Project rows currently read **Item 1**, **Item 2**, etc. Open a row to see its
selected project. The row selects a shared entry; edit its actual title/image in
**Content → Projects**. Collection and field mapping controls wire the block to
that schema and normally need no client changes. This example's project selector
targets `collection_intr_projects`; these are site-specific blocks.

Projects are **data only**: no generic page is assigned, so adding an entry does
not generate a detail page. Only Maison Dorée has a detail URL. Other cards show
their content without a broken or misleading link. Add a static detail page and
its URL when expanding the site, or deliberately change to generic pages if every
project should share a template. A new entry appears in the footer automatically;
select it in a page's project list to show it there.

The sample detail page owns its editorial story and hero metadata. Its title and
location do not automatically bind to the Projects entry. Keep these consistent
when renaming that project. Existing data-only entry forms have no live website
preview; open a page to see changes in context.

Browser edits change the browser draft, not source files. Use **Settings →
Backups → Export backup** to keep experiments. `backup.json` is an importable copy
of this example's initial snapshot, including content metadata but not image
binaries. Import replaces the current browser draft. Keep this backup in sync
when editing source records, and use the isolated origin to preserve other drafts.

## Design and assets

The layout retains the reference's full-height photo hero, uneven project grid,
offset image pairs, checkerboard sections, dark services area, glass navigation
and photographic contact panel. Inter Display and all 27 images are served locally
from `public/intr/v1/`, with responsive variants, alternative text and source URLs
in `sources.json`. The font license is included. New client uploads use the normal
media workflow; removing metadata does not delete a file from `public/`.

The rebuild uses still images, ordinary scrolling, immediate content visibility,
always-visible service descriptions and static galleries. There is no intro gate,
parallax, video or custom scrolling. Section blocks render without client hydration;
the shared layout hydrates its small navigation behavior using the existing React
layout contract. The native menu can open and links can navigate without JavaScript.

Branding, imagery, section labels, hero copy and the sample pull quote come from
the reference. Supporting copy is adapted for clarity. Inconsistent project size
and location claims were removed/corrected, unrelated footer copy was replaced,
and placeholder logos became editable partner categories. Contact details and
statistics remain reference demo content, not verified business claims. Geometry,
font setup, image crops and the brand mark remain source-maintained.

See the [trial findings](../../docs/wiki/journal/2026-10-13-intr-rebuild-scope.md)
and [verification](../../docs/wiki/verification/runs/2026-10-13-intr-rebuild.md).
