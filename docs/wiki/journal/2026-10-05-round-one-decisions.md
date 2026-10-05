---
title: Round one decisions
updated: 2026-10-05
status: Exploring
---
# Round one decisions

The [submitted answers](2026-10-04-grill-528c4b19-f488-4209-ab5c-b9c13f420f02.md) establish the initial [decision register](../decisions/index.md). The raw transcript's date follows the form session's UTC creation timestamp; this interpretation uses the user's local date.

The user's custom publishing answer supersedes the assistant's proposed Save-and-deploy behavior: Save writes an unpublished branch; Publish merges that branch into main and deploys. The user's custom authentication answer requests a configured editor credential and a separately supplied GitHub token, rather than accepting the proposed serverless helper. The security meaning of that editor credential still needs clarification.

The remaining choices accept nontechnical editors, collections alongside pages, a shared dependency contract, section-level layouts, and a completely fresh implementation. No existing blocks or sites must be migrated.

Next, clarify access/privacy, token ownership, deployment, collection authoring, and the block installation/preview contract through [round-two questions](../discussions/open-questions.md). Application implementation has not started.
