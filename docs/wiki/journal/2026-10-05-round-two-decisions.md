---
title: Round two decisions
updated: 2026-10-05
status: Exploring
---
# Round two decisions

The [submitted answers](2026-10-05-grill-1a1e4868-048d-45f3-a291-5f8b6c42aae2.md) settle Q8–Q14 as DEC-009 through DEC-015 in the [decision register](../decisions/index.md).

The editor login is explicitly a convenience gate. Editors each provide their own GitHub token, and both public and private repositories are supported. Repository authorization remains distinct from hosting: private draft reads require authorization; public repository branches remain publicly readable.

The user's existing Git-connected hosting workflow already owns deployment after main changes. The builder only needs its GitHub SDK save/merge workflow and portable static output. This replaces the unaccepted recommendation for a particular CI and hosting service. No hosting configuration was inspected or changed here. The [current deployment contract](../features/admin-encryption.md#build-and-deployment) supports local, CI and host-managed builds.

Pages and collection entries share block authoring. Every block supplies immediate browser preview, and new block types are developer-installed with a rebuild. These decisions remove the build-only preview and portal installer branches.

The user's phrase “content and schema changes” needs clarification: changing collection definitions visually is a larger scope than editing values using developer-defined schemas. The next round also covers token retention, simultaneous editing, media scope, and how global styling interacts with independent blocks. These are [open questions](../discussions/open-questions.md), not inferred defaults. Application implementation has not started.
