---
title: Round three decisions
updated: 2026-10-05
status: Exploring
---
# Round three decisions

The [submitted answers](2026-10-05-grill-c9c27420-78c7-4c08-ac09-edd5289ddf59.md) establish DEC-016 through DEC-020 in the [decision register](../decisions/index.md).

GitHub tokens persist for the tab session, including reloads. Collection schemas can originate in developer code/configuration or be created and edited through the portal; block code and its registration still belong to developers. Shared drafts and stale-save protection are accepted, with a strong preference for understandable recovery that avoids exposing Git concepts to editors.

Media moves to R2, with references in Git. This explicitly changes the earlier proposed in-repository media storage. The requested environment credentials create an unresolved architectural issue: a build-only secret cannot authorize later arbitrary browser uploads unless authorization reaches the browser or a service acts on its behalf. Embedding a secret in publicly delivered JavaScript would expose it; the convenience login does not prevent this.

Cloudflare documents bucket-scoped S3 access credentials, temporary signed upload URLs, and browser CORS configuration. These support two candidate approaches: editors supply credentials at runtime, or an authenticated on-demand helper keeps credentials server-side and grants uploads. Neither alternative has been accepted. Sources: [R2 authentication](https://developers.cloudflare.com/r2/api/tokens/), [presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [CORS](https://developers.cloudflare.com/r2/buckets/cors/).

Global settings such as light/dark mode are optional signals that blocks may follow; independent styling remains primary. The [remaining questions](../discussions/open-questions.md) concern R2 authorization and the initial collection/schema behavior. No implementation has started.
