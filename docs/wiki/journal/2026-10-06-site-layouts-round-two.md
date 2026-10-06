---
title: Site Layout decisions, round two
updated: 2026-10-06
status: Accepted; product interview complete
---
# Site Layout decisions, round two

Interprets the [submitted Q74–Q75 answers](2026-10-06-grill-955ea450-7b57-4225-91b5-95d6a5b3986c.md), resolving the [library and whitelist discussion](2026-10-06-site-layouts-library-discussion.md). The form was collected once, its transcript saved and its temporary session/download cleaned up through the prepared scripts.

- Q74 / DEC-104: when the whitelist environment variable is absent, show all installed layouts.
- Q75 / DEC-105: retain the active layout and its current settings even if the whitelist excludes it. The whitelist limits future picker choices. Once the user switches away, the excluded layout cannot be chosen again unless the whitelist changes. This explicitly rejects the assistant's recommendation to require the active layout in the whitelist and block the build/configuration otherwise.

Keeping the active layout working includes public rendering, current-layout preview and its settings interface under the normal Save/Publish workflow. Exclusion alone is not a content-validation error and cannot trigger a reset. The implementation must distinguish the installed renderer/settings registry from the filtered picker catalog; picker visibility cannot be used as the sole source of current-layout implementations.

The [consolidated Site Layout design](../discussions/site-layouts.md) now contains DEC-092–DEC-105 and both rounds. The product interview is complete. Exact environment syntax, empty/invalid configuration handling, authoring interfaces, initial example layouts and first-time conversion of Site Options remain clearly labeled engineering proposals. No additional questionnaire is needed to choose routine implementation details.

Only discussion records changed. No application implementation was requested by submitting this questionnaire, and wiki structural checks do not verify the proposed feature.
