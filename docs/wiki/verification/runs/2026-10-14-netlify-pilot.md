---
title: Archline pilot — live Netlify smoke check
updated: 2026-10-14
result: Passed
---
# Archline pilot — live Netlify smoke check

The maintainer deployed the independent pilot and supplied
[its public URL](https://glowing-dodol-a3ed49.netlify.app/). This run verifies public
delivery and the admin login entry point under DEC-184 and
[FEAT-site-engine](../../features/site-engine.md), following the
[engine/library implementation run](2026-10-14-engine-separation.md).

**Passed for the selected public-site and login-page checks.** Successful admin
unlock and Git Save/Publish on this hosted origin were not selected or exercised:
production credentials were not available to the verifier. Earlier local encrypted
admin and live GitHub adapter checks retain their separate coverage.

## Instance and identity

- HTTPS origin: `https://glowing-dodol-a3ed49.netlify.app`.
- Browser checks began at 04:53 UTC on 2026-10-14; HTTP sampling was recorded at
  `2026-10-14T04:55:17.729876+00:00`. Chrome on macOS.
- Desktop viewport 1225 × 742; mobile viewport 390 × 844, restored afterward.
- The verifier used a fresh tab, changed no site content, entered no credentials
  and performed no deployment or provider writes.
- [HTTP evidence](../../evidence/2026-10-14-netlify-pilot/http.json) records response
  hashes, sizes, status codes and ETags for four pages and their 30 distinct
  same-origin script, stylesheet and image references. These fingerprints identify
  the observed deployed output. Netlify build logs and the deployed Git commit
  were not inspected, so the live source revision is not independently established.

## Results

| Scenario | Expected and observed outcome | Result | Evidence |
| --- | --- | --- | --- |
| Homepage over HTTPS | Home title, hero image, heading, styles and navigation render; HTTP 200 | Passed | [Desktop](../../evidence/2026-10-14-netlify-pilot/homepage-desktop.png), HTTP evidence |
| Project detail navigation | Clicking View Atelier 19 Residence opens its generated page with project details and gallery; HTTP 200 | Passed | [Project](../../evidence/2026-10-14-netlify-pilot/project-detail.png) |
| Project listing | Back to all projects opens the six-project index; HTTP 200 | Passed | [Browser observations](../../evidence/2026-10-14-netlify-pilot/browser-observations.json) |
| Mobile layout and menu | At 390px, heading and CTA fit; no horizontal document overflow. MENU opens navigation and its projects link opens the index | Passed | [Mobile](../../evidence/2026-10-14-netlify-pilot/homepage-mobile.png), [menu](../../evidence/2026-10-14-netlify-pilot/mobile-menu.png) |
| Referenced static assets | All 30 sampled same-origin image/script/stylesheet references return HTTP 200 | Passed | HTTP evidence |
| Admin entry point | `/admin/` returns HTTP 200 and shows QuineCMS, Email, Password and enabled Unlock editor | Passed | [Login](../../evidence/2026-10-14-netlify-pilot/admin-login.png) |
| Browser diagnostics | No warning/error entries reported during the sampled journey | Passed | Browser observations |

## Limits and follow-up

This is a deployment smoke check, not an exhaustive theme or security audit. The
production credential pair, decrypted editor mounting, hosted Git connection,
Save/Publish-to-Netlify rebuild loop, deploy previews, Netlify account configuration,
R2 and GitLab remain unverified in this run. The maintainer can check `/admin/`
using their configured credentials without sharing them in chat.

The web extraction tool could not access the new origin. Chrome worked normally.
Python's bundled certificate lookup also failed locally; system curl succeeded
with normal certificate validation. No certificate bypass was used.

No runtime changes or test writes were needed. Screenshots and response fingerprints
were saved before browser cleanup. Wiki build/link checks validate these records,
not the hosted product itself.

The wiki build and link check pass for 186 pages. The report metadata checker
accepts this run; its repository-wide result still flags the same seven historical
reports with nonstandard result labels noted in the earlier implementation run.

## Subsequent maintainer verification — 2026-10-14

The maintainer subsequently confirmed connecting GitHub, editing content, saving
the draft, publishing, watching deployment and seeing the changes on the live
site. See the [verbatim report and pilot acceptance](../../journal/2026-10-14-pilot-acceptance.md).
This closes the signed-in delivery follow-up through user-reported evidence;
the assistant's independently exercised scope above remains unchanged.
