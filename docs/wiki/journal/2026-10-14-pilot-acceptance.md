---
title: Independent pilot — maintainer confirms the full publishing flow
updated: 2026-10-14
status: Complete
---
# Independent pilot — maintainer confirms the full publishing flow

The maintainer reported successful end-to-end use of the
[deployed Archline pilot](https://glowing-dodol-a3ed49.netlify.app/):

> it works. i tested connecting to github repo, making changes and saving as draft, publishing it and watching it deploy and apply to the live site

This is **maintainer-reported verification**, recorded on 2026-10-14. It confirms
the hosted GitHub connection, content editing, draft save, publication, triggered
deployment and the resulting content change on the live site. The assistant did
not independently repeat this signed-in flow or inspect its commit/build logs.

Together with the [implementation checks](../verification/runs/2026-10-14-engine-separation.md)
and [independent public-site smoke check](../verification/runs/2026-10-14-netlify-pilot.md),
this completes the selected pilot's delivery acceptance. No consequential product
or delivery question remains in the engine-separation scope (DEC-172–DEC-184).

The engine remains provider agnostic; Netlify is the chosen pilot host. This does
not extend verification to GitLab, R2, other hosts or every upgrade scenario.
Earlier reports retain their original results and limits. The engine change
remains in [PR #1](https://github.com/rengwu/quinecms/pull/1); acceptance does not
record a merge. No runtime or pilot-content changes were made for this update.
