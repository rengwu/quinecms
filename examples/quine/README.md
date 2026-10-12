# Quine Systems

A recreation of [quinesystems.com](https://quinesystems.com/) using the normal
lean-sitebuilder layout, block, media and editor contracts. Original assets are
reused; components and effects are independently implemented. Root demo content
is preserved.

## Run

From the repository root, with dependencies installed:

```sh
pnpm example:quine
```

This stages the current source and this example's content in a new temporary
directory, shares installed dependencies, and starts Astro. **Use the Local URL
printed by Astro**: the preferred port is 4322, but an occupied port causes Astro
to select another. The page title is **Home · Quine Systems**. Open `/admin/` at
the same origin with `admin@example.com` / `asdf1234`.

The isolated production build uses `quine@example.test` / `quine-preview`.
These public demo credentials are local-only; the runner never copies the
repository's `.env` or configures a remote repository. Do not deploy with them.
Astro runs the dev server in the background. From the printed temporary directory,
run `pnpm exec astro dev stop` when finished. Each invocation stages a fresh copy;
restart after changing the example source. Root `content/` is never swapped.

```sh
pnpm example:quine build     # validate, build and check artifacts in isolation
pnpm example:quine prepare   # only stage a checkout and print its location
```

The build command prints its `dist/` location. For a real client deployment, use
a dedicated clone, copy these records to its `content/`, configure private admin
credentials and the chosen provider/host, then follow the root README.

## Client editing map

| Change | Editor location |
| --- | --- |
| Navigation, header action, site description | Site Layout |
| Intro copy, wordmark and actions | Pages → Home → Quine · Introduction |
| Statement and background | Pages → Home → Quine · What we do |
| Service copy and row order | Pages → Home → Quine · Working with us → Service rows |
| Project title, year, image, URL and order | Pages → Home → Quine · Works → Projects |
| Contact text, link and background | Pages → Home → Quine · Contact |
| Section order | Pages → Home → block drag handles |
| Available images | Media; choose them in declared media fields |

Projects are intentionally block-owned rows. No collections or project detail
routes are needed. The brand icon, fonts, geometry and effects remain source code.
Catalog manifests use Quine labels, descriptions and tags; blank media/gallery
states remain editable. Layout settings live in `content/site.json`, blocks in
`content/pages/page_quine.json`, and media records in `content/media/`.

Browser edits change the tab's draft, not this example or the staged files.
Export through **Settings → Backups → Export backup** to keep experiments.
`backup.json` is an importable copy of the initial snapshot. Importing replaces
that browser draft; use the isolated editor to preserve the demo's draft. Update
the backup after changing source records and validate both.

## Assets and fidelity

`public/quine/v1/` contains copied Quine assets, original project images and local
fonts with licenses. `sources.json` records provenance. Media records use safe
root-relative URLs, so the initial site and image pickers need no R2 account or
external image host. New client uploads retain the normal R2 workflow. Removing
a media record never removes its file from `public/`.

The Canvas 2D halftone approximates the reference shader and redraws only on
load/resize; an image fallback remains without canvas or hydration. It is not an
identical shader port. Motion respects reduced-motion preferences. Gallery
selection supports pointer, arrow keys, Home and End. Text and images render on
the server before interaction scripts activate.

See the [trial journal](../../docs/wiki/journal/2026-10-11-quine-rebuild.md) for
decisions, discoverability findings and verification.
