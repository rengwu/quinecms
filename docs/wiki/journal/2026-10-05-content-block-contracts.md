---
title: Content and block contracts
updated: 2026-10-05
status: Exploring
---
# Content and block contracts

The [submitted answers](2026-10-05-grill-534ae93e-c689-4899-b4a0-b2c01b8f8134.md) establish DEC-035 through DEC-041 in the [decision register](../decisions/index.md): generated self-hosted vendor modules, permanent document IDs, Markdown strings inside JSON blocks, framework preview adapters, author-declared activation, and stable internal references.

The user rejects the proposed automated migration approach. Old block implementations remain installed and are marked deprecated. A version selector changes the selected implementation; compatible values carry over, while unrecognized, renamed, or incompatible fields start empty for the user to fill. No inferred rename conversion or developer migration-function framework is required. The [technical contracts](../discussions/technical-contracts.md) now reflect this model.

Retained block versions still fall under the previously accepted compatible shared-dependency rule. Keeping an old block implementation does not implicitly authorize multiple React runtimes or incompatible library versions. Any integration conflict must be explained and fixed in block code/dependency requirements rather than silently bypassing that rule.

The remaining round covers editor components/styles, save scope, unsaved recovery, Markdown authoring, and incomplete draft validation. Those choices affect observable behavior and dependency selection. Application implementation has not started.
