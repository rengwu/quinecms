---
title: Feature map scope
updated: 2026-11-09
status: Applied; documentation checks recorded
---
# Feature map scope

The feature map should describe capabilities included in QuineCMS. Recreations
such as Kahf, chartr and Quine are trials that exercise those capabilities; they
are not CMS features. The maintainer requested this distinction and a grill-form
review of the existing map.

The [submitted answers](../journal/2026-11-09-grill-cbd5005e63f65a81e0129a6bc195227c.md)
accept all five recommendations without qualifications. DEC-252–DEC-257 in
[Decisions](../decisions/index.md) record the boundary and cleanup scope.

## Accepted direction

- Include editor, public-site and developer-facing CMS capabilities. Extension
  loading, site assembly, validation and build commands qualify; advice about
  working with agents or conducting recreations belongs in authoring guidance.
- Group related capabilities and name their concrete subfeatures in the map.
  Link to behavior contracts without requiring a separate page for every control.
- Give trials a separate area linked from the wiki home. Each trial should link
  the capabilities it exercises and its existing verification records.
- Feature pages describe current behavior, entry points and limits. Check recipes
  and dated results live separately, linked from the relevant feature.
- Audit and reorganize all current feature documentation, including obsolete
  bundled-design claims. This is a documentation scope, with historical evidence
  retained and no CMS behavior change implied.

## Initial review findings

These are the initial findings presented before the interview; the completed
source review is recorded in the cleanup journal below. They are retained here
as the basis for the selected scope.

| Existing material | Issue and intended treatment |
| --- | --- |
| [Kahf](../trials/kahf.md), [chartr](../trials/chartr.md), and the [Quine journal](../journal/2026-10-11-quine-rebuild.md) | Trials currently appear alongside CMS capabilities. Make them discoverable through Trials; preserve their original scope and evidence. |
| [Tessera work](tessera-collection-context.md) and the [Archline pilot acceptance](../journal/2026-10-14-pilot-acceptance.md) | Related examples and pilot evidence already exist elsewhere. Link them from Trials without presenting their site-specific behavior as engine features. |
| [Engine, libraries and sites](../features/site-engine.md) | Contains genuine developer capabilities alongside setup and upgrade procedures. Keep the capability contract distinct from walkthroughs. |
| [Local authoring](../guides/local-authoring.md) | Mixes guidance with CLI, validation, record and renderer contracts. Extract the real capabilities into the map and keep useful guidance accessible. |
| [Block library](../features/block-library.md) | Still describes 45 bundled base variants, 27 generic variants, Starter-specific chrome and Kumo beneath a transition note. The engine now ships no designs; the current admin uses Base UI. Audit the remaining claims against current source. |
| Other current feature pages | Audit behavior and entry points against source and accepted decisions; separate recipes and historical results. Their presence in the current map does not establish that every sentence is current. |

## Applied cleanup

1. Inventory current engine capabilities and compare every existing feature page
   with source and accepted decisions. Distinguish reusable engine behavior from
   library designs, site content and the process used to prove them.
2. Rewrite the map as grouped capabilities with concrete subfeatures. Keep the
   actual behavior contracts authoritative and remove trials and authoring
   workflows from the feature inventory.
3. Establish Trials navigation and connect the existing recreation/pilot records
   to the capabilities and verification runs they exercise. Preserve dated
   evidence and historical identifiers; do not reuse a trial's feature ID for an
   unrelated engine capability.
4. Separate authoring guidance, current contracts, check recipes and dated results.
   Update affected links when moving material and avoid duplicate current contracts.
5. Build and check the wiki. Report documentation checks separately from product
   verification; historical test results remain specific to their recorded builds.

The maintainer subsequently directed “apply it” on 2026-11-09. The
[documentation audit](../journal/2026-11-09-feature-map-cleanup.md) records the
completed reorganization, source review, corrections and checks. The feature map
now contains twelve capability contracts. Guides, Trials and Verification are
separate wiki destinations. No CMS behavior changed, and no new live provider
check is claimed. No consequential interview question remains.
