---
title: Site Layout library and whitelist
updated: 2026-10-06
status: Initial library discussion; subsequently resolved
---
# Site Layout library and whitelist

After submitting the first-round answers, the user clarifies that this repository will become a layout library, accumulating layouts as more client sites are developed. A hidden layout-whitelist environment variable will hide all layouts except a selected subset. DEC-102–DEC-103 record these requirements.

The [first-round choices](2026-10-06-site-layouts-round-one.md) remain accepted. The new requirement reopens only layout availability behavior: Q74 asks what happens when the variable is absent; Q75 asks what happens when the whitelist excludes the stored active layout. These choices affect deployment configuration, not the existing rule that block participation in layout styling is optional and unclassified.

The [consolidated design](../discussions/site-layouts.md) proposes a build-time `SITE_LAYOUT_WHITELIST` containing stable IDs, with configuration outside the admin. The exact variable name/format, strict typo handling and import generation are engineering proposals. No per-client fork architecture or hosted multi-tenant service is implied by the library requirement.

This remains discussion and planning. No application implementation or deployment occurred.

## Subsequent second-round outcome

[Round two](2026-10-06-site-layouts-round-two.md) resolves Q74–Q75 as DEC-104–DEC-105: absent configuration offers all installed layouts; an excluded active layout keeps working with its settings, while future picker choices are restricted. The build-blocking recommendation was not selected. The scoped product interview is complete.
