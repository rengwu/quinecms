---
title: Multiple site layouts
updated: 2026-10-13
status: Implemented locally
---
# Multiple site layouts

The user requests multiple saved layouts in one site, managed through a table
like Pages. The scoped grill-form interview is complete, with the behavior below
settled as DEC-165–DEC-171. The user subsequently authorized implementation with
work-until-grill. The [current contract](../features/site-layouts.md) and
[verification record](../verification/runs/2026-10-13-multiple-site-layouts.md)
describe the delivered behavior. The interview below preserves its decision basis.

## Settled by direct instruction

- **DEC-165:** Site Layouts becomes a table of saved layout configurations.
  Multiple configurations can use the same installed design with different
  settings, such as two independently configured Starter layouts.
- **DEC-166:** Each row has an on/off switch. A layout can be turned off only when
  no pages use it. At least one layout must remain active at all times. Deletion
  also requires no pages using the layout and must preserve the active-layout
  invariant.

These requirements and the interview outcomes below revise the single-selection
direction in DEC-092–DEC-105. The existing
[Site Layouts contract](../features/site-layouts.md) now describes multiple
configurations. The separate [site/engine repository proposal](site-engine-separation.md)
remains deferred and pending its own grilling.

## Source findings before implementation

Before this work, `site.layout` stored one implementation ID, version and settings object. Pages
had no layout reference. The editor and public build used that one selection for
the wrapper, settings, spacing, styling context, title and optional head assets.
Changing designs initialized new defaults.

Multiple saved layouts therefore need page assignments and consistent resolution
across the public build and editor preview. Validation, reference usage, Git
serialization, backups, recovery and factory reset also need to account for
multiple configurations. These are implementation implications, not delivered
changes or a settled storage format.

## First grill round outcomes

The [submitted answers](../journal/2026-10-13-grill-c8cb3798-7a1e-4893-82b4-af46d9db9496.md)
settle all four questions:

| Question | Decision | Accepted behavior |
| --- | --- | --- |
| Q1 | DEC-167 | Select the sole active layout automatically for a new page. If several are active, require an explicit choice before Create. No separate default setting or ongoing inheritance. Changing an assignment preserves page blocks. |
| Q2 | DEC-168 | Collection entries use their generic page's layout, with no per-entry override. The generic page counts as usage even when it has no entries. |
| Q3 | DEC-169 | A new named layout starts on after Create. Existing pages keep their assignments. Turning a layout off retains its settings and removes it from page choices. |
| Q4 | DEC-170 | Allow changing a saved layout's design, with a warning before resetting to the new design's defaults. The change affects every page using that saved layout. |

Q4 explicitly selects the alternative to the initial fixed-design recommendation.
The saved configuration remains the page assignment target; changing its design
does not require recreating or reassigning its pages. A confirmation describing
the reset and affected pages is the proposed implementation of the warning.
Existing retained-version selection remains the baseline; apply the same reset
warning where it replaces settings. These UI details are engineering proposals,
not additional submitted decisions.

## Publication requirements

**DEC-171:** Only layouts used by pages must have complete required settings
before publishing. The [Q5 answer](../journal/2026-10-13-grill-5b84ef63-3687-481f-9b0a-04a86e991a33.md)
selects this over validating completeness for all active or all saved layouts.
An unused layout can remain a work in progress whether it is on or off, without
blocking publication of the existing pages.

Basic structural checks still apply to every saved layout. Pages must reference
existing active layouts, at least one layout must remain active, and a generic
page counts as usage even when it has no entries. Incomplete required settings
are distinct from a malformed record or broken page-to-layout assignment.

## Implementation outcome

The authorized implementation stores independent configurations in `site.layouts`
and explicit page references in `layoutId`. Shared helpers enforce lifecycle rules
and resolve page rendering. Table, creation, settings, reset confirmation, usage
links, recovery, factory reset and public generation follow the accepted scope.
Legacy content is read into one named configuration without editing local records.
No further product interview was needed. See the [verification record](../verification/runs/2026-10-13-multiple-site-layouts.md).
The separate site/engine repository proposal remains deferred.

## Review before implementation

The source review found no additional product blocker. The main engineering
concerns are:

- Give each saved configuration its own stable identity, separate from the design
  ID/version. Two Starter configurations must not overwrite each other's settings
  or share a page assignment accidentally.
- Resolve the page's layout consistently for the wrapper, block styling context,
  spacing, title and head assets. `scripts/generate-layouts.mjs`,
  `src/layouts/Public.astro` and `contextFor` currently assume a single selection.
  Public generation should load the layout implementation needed by each route;
  preview switching must not leak another layout's settings or styles.
- Enforce assignment, deactivation, deletion and last-active guards through shared
  structural validation, including Git saves and imported data. Disabled UI
  controls alone are insufficient. Apply DEC-171 equally in editor publication
  and `loadContent`/build validation so unused incomplete settings do not still
  break the build.
- Treat design changes as edits to shared settings. The reset warning should name
  the affected configuration and show how many pages use it; cancellation must
  leave settings and assignments intact.
- Carry the existing site's content and settings into the new representation
  deliberately. Saving, backups, recovery, examples and factory reset all need
  the new records. This does not authorize discarding client content or promise
  a general historical-backup migration framework.

These concerns call for focused implementation and verification, not another
product interview. The source review did not execute the future behavior or
establish live Git/hosting compatibility.
