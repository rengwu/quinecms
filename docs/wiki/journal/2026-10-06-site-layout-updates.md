---
title: Site Layout implementation readiness
updated: 2026-10-06
status: Initial readiness review; subsequently resolved
---
# Site Layout implementation readiness

The user asks whether anything remains to discuss after settling the Site Layout behavior and adding the chartr recreation. Most remaining work is implementation detail. One consequential choice is how changes to a layout implementation affect existing client sites when updated code is deployed.

Q76 compares retained, explicitly selected layout code versions with one implementation per layout ID updated through ordinary source deployments. The assistant recommends retained versions, following the block precedent, because new layout code can change appearance or saved-settings compatibility. Keeping older implementations adds maintenance; one implementation per ID is simpler and relies on the developer's release process.

At the end of this initial review, Q76 was unanswered. The recommendation alone did not extend the block version contract to layouts. Active-layout-only settings persistence stayed accepted; retained source implementations would not introduce saved settings caches for inactive layouts. The question's recommendation did not independently select settings-transition mechanics.

See the [design](../discussions/site-layouts.md) and [open question](../discussions/open-questions.md). Only discussion records and the prepared form change in this review.

## Subsequent answer

The user selects retained versions and explicit upgrades. [Round three](2026-10-06-site-layouts-round-three.md) records this as DEC-107 and completes the review. No application implementation took place during answer collection.
