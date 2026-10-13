---
title: First application implementation
updated: 2026-10-05
status: Implemented; live integration verification outstanding
---
# First application implementation

The user explicitly authorized implementation after the committed product and technical interviews. Work remains in the QuineCMS repository; jstack supplied the feature-map, verify-change, and wiki workflows.

The application now builds a static public website and `/admin/` portal with Astro 7.3.5, TypeScript 6.0.3, React 19.3, Svelte 5.57.1, Vue 3.5.43, Base UI, Lexical, Octokit, and the AWS S3 client. Exact versions and transitive resolution are pinned in the package/lockfile. TypeScript was aligned with the integrations' supported peer range during setup.

The first catalog has Hero v1/v2, Text, Media, Tabs, Svelte Counter, Vue Accordion, and a vanilla Quote. The editor covers pages, block ordering and manual versions, collection schemas/entries, navigation/theme, media metadata, and backup/recovery. JSON is the persisted content; Lexical state is not a second content source.

The Git adapter reads an immutable commit's tree, saves one content commit, uses non-forced branch updates, confirms uncertain save responses, and publishes only a validated saved snapshot. A build-source fingerprint prevents an outdated editor from publishing changed block/application code. Runtime R2 credentials drive direct uploads and browser variants. The portal does not claim hosting completion after a Git update.

Browser testing exposed an Astro/Vite interaction: CSS extracted for SSR was removed from the client output while lazy preview imports retained its URL. The build integration now retains the referenced assets; admin bootstraps a regular React root, and public routes are generated with only their used block imports. Subsequent intermediate-browser checks showed all four rendering styles working. Artifact checks confirm one copy of each framework runtime and no editor/provider modules in public route graphs.

The [verification run](../verification/runs/2026-10-05T0819Z-implementation.md) contains the final source fingerprint, automated results, actual browser observations, and limits. Live GitHub writes, R2 CORS/uploads, and hosting deployment were not exercised. The native browser tool later returned `cgWindowNotFound`, leaving final browser follow-up and test-tab cleanup unverified. No deployment, push, or implementation commit was performed.

Use the [feature map](../features/index.md), [setup](../verification/setup.md), and root README for the next work. The original interview records remain authoritative for product choices.

Follow-up: the user reported a blank admin page. The manual React bootstrap omitted Astro's development Fast Refresh preamble. The [startup repair](../verification/runs/2026-10-05T0910Z-admin-startup.md) replaces it with a client-only React island; development editing and production startup/interactions now pass real-browser checks. The CSS retention integration remains in place and asset checks pass.

Follow-up: the user replaced the original Base UI choice with Cloudflare Kumo for admin UI (DEC-048). Controls, dialogs, selects, custom field controls, and notifications now use Kumo. The live preview stays interactive; block rows use pointer sorting with keyboard access. Recovery is silent, status banners are removed, and submission validation uses toasts. Scoped Kumo styles preserve the public/block designs. See the [refinement run](../verification/runs/2026-10-05T1005Z-kumo-admin.md).

Follow-up: block details now replace the parent sidebar navigation (DEC-051). All blocks restores the selected document controls. The [bounded hierarchy check](../verification/runs/2026-10-05T1014Z-block-sidebar.md) records browser and automated results.
