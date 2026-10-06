# chartr v1 provenance

Adapted on 2026-10-06 from the user's adjacent `chartr-site-v2/site/` source and https://chartr.dev/. The source repository was read only. Its live page supplied the v0.3.0 release copy, package destinations and current section text when local source differed.

- `styles.css`: reference `assets/chartr.css`, website themes and native preview styles, scoped under `.chartr-scope`; width media queries become named container queries for editor parity.
- Demo primitives/icons/map/motion/state, pane timeline/icons and native themes: retained source implementations, with page-global initialization replaced by per-instance mount/update/destroy.
- `workspace-demo.js` and `pane-demo.js`: independent observers, listeners and frame cleanup; scope-local palette updates preserve view/session/pane state. Reduced motion shows the final pane arrangement.
- `theme-picker.ts`: fifteen source palettes, shared only within the current layout surface, without document-global initialization or persistent demo preference.
- `download.ts`: instance-scoped native dialog and layout action delegation; absent dialogs leave ordinary release URLs usable.
- Nine `src/blocks/chartr-*/v1/markup.ts` templates: live section markup adapted to editable fields by `blocks.ts`, with escaped values, safe destinations and unique internal IDs. Set distinct section anchors when duplicating anchor-targeted blocks.
- `public/chartr/v1/`: only the required IBM Plex Mono/Geist fonts, icons and branding, with font licenses and source demo notices retained. Research screenshots and recordings are not rendering assets.

The layout lives in `src/site-layouts/chartr/v1`; its wrapper, settings, policy and public Head are separate from these independently reusable blocks. The native windows are read-only HTML/CSS/text/SVG demonstrations, not live terminal sessions. Release defaults are a dated v0.3.0 fixture and remain editable; they are not an automatic latest-release lookup.

Each block owns its centered `.page-layout` container; the chartr layout does not add a second content container. Blocks and layout chrome consume `--site-content-max-width` and `--site-page-gutter`, with 1512px/40px fallbacks. Responsive gutters cap at 28px, 20px and 16px, retaining smaller settings including zero. Inner content containers determine responsive breakpoints; the full-width block root retains the section background. The example backup explicitly stores the reference 1512px/40px geometry.
