---
title: Factory reset and repository settings
updated: 2026-10-08
status: Implemented
---
# Factory reset and repository settings

The user requests a Settings factory-reset button with confirmation that clears pages, content, schema configurations and media, and restores Starter. They explicitly select media-library removal only, keeping uploaded R2 objects. Follow-up instructions move Connection from the header into Settings and set Starter defaults from two screenshots. DEC-136–DEC-138 record these requests.

## Implementation

`factoryReset()` constructs a fresh canonical content snapshot with the original site ID, empty pages/entries/collections/objects/media arrays and a deep copy of installed Starter v1 defaults. It drops all old site globals, layout settings, navigation, header and footer. It works even if Starter is already selected, and is independent of the picker whitelist. If Starter v1 is not installed, the operation reports an error before changing the draft.

The Settings section describes the scope and opens the existing Kumo confirmation dialog. Cancel is focused initially; the red Reset site action applies the reset as local unsaved content and clears stale editor selections. Tab recovery, saved baseline, repository connection, admin theme and session credentials follow the existing workflow. Save draft persists the deletion of old record files; Publish still requires a home page. Discard edits can restore the last loaded/saved snapshot until a new save. R2 objects are untouched. The existing corrupt-recovery protection remains: explicit Discard edits is required before unreadable retained data can be overwritten.

Connection is now under Settings → Repository and opens the same provider dialog. It is disabled along with the settings fieldset during active operations. Save draft and Publish remain in the header.

Starter defaults match the screenshots: Welcome, light, Arial body/headings, 16px, 1.5 line height, 1200px width, zero gutter; Your Brand with no logo, Home/Journal/Blocks and Contact Us → `https://google.com`. Navigation paths are inferred as `/`, `/journal`, `/blocks` from the existing site. These are plain URL links, with no dependency on removed page IDs. No pages or footer are provisioned, and saved settings are not migrated.

## Verification

- `pnpm verify`: type checks, regression tests, production build and artifact checks. All 178 tests pass, including screenshot-default assertions; the type check reports zero errors and warnings.
- Reset tests cover legacy, already-active Starter and chartr input, removal of referenced records/schemas/media, deep-copy isolation, serialization and draft/publication validation.
- Editor tests exercise confirm/cancel, empty lists, Starter settings, tab reload recovery, discard, retained storage/theme and a whitelist that excludes Starter. Connection tests use its new Settings location.
- Mocked GitHub and GitLab transactions reload the saved reset with only `content/site.json`, while leaving main unchanged.
- Safari at `http://127.0.0.1:4322/admin/`: observed Connection in Settings and absent from the header; opened and closed its provider dialog. Visually inspected the reset dialog, its focused Cancel button, scope/R2 wording and right-aligned red action. Cancel left Save draft disabled. Then confirmed a reset in the fresh local test tab and inspected every screenshot-specified field in Site Layout. Pages showed “No pages yet” after reload. Discard edits restored the original clean draft, with Save draft disabled again. No remote save or publish was performed.

Live GitHub/GitLab, R2 and hosting were not exercised. Mobile browser behavior was not separately checked. The site's local `content/` records were not changed.
