---
title: Intr Studio recreation verification
updated: 2026-10-13
result: Passed for selected local scenarios
---
# Intr Studio recreation verification

Scope: DEC-153–DEC-155, followed by the user's `work-until-grill` implementation
instruction. See the [trial and findings](../../journal/2026-10-13-intr-rebuild-scope.md).

## Environment and evidence

macOS, Node 22.19.0, pnpm 10.34.1, the user's Chrome browser. The tested workspace
is based on `5a14f1a526e6c82efa0eb1c15a03ea3bf0a76801` with uncommitted Intr work
and the preceding scope records. The [source manifest](../../evidence/2026-10-13-intr-rebuild/source-manifest.json)
identifies source, build inputs, test files and example assets without private
environment files. Checks were performed by the implementing agent; no independent
agent review or fresh-agent benchmark is claimed.

The isolated runner stages normal temporary checkouts. Browser checks used the
owned development instance at `http://127.0.0.1:4324`; other occupied ports and
the root/Quine content were preserved. That development instance remains running
for review. The isolated production output was built and artifact-checked, not
served for a second complete browser pass.

## Results

| Scenario | Observed result | Evidence |
| --- | --- | --- |
| Repository checks | Type checking: 407 files, zero errors/warnings/hints. All 207 tests across 31 files pass. Root production build and artifact checks pass. | [Full log](../../evidence/2026-10-13-intr-rebuild/verify.log) |
| Final isolated example | Content publication checks pass. Builds `/`, `/projects`, `/projects/maison-doree` and `/admin/`. Artifact checks pass; each public page loads three JS modules, 84,389 gzip bytes with the layout's chosen `load` activation. | [Build log](../../evidence/2026-10-13-intr-rebuild/example-build.log) |
| Snapshot and media | Backup matches parsed records; all local media originals/variants exist at their recorded byte sizes; exactly three public paths; root content is unchanged. | `tests/intr.test.ts`, [final focused test log](../../evidence/2026-10-13-intr-rebuild/focused-tests.log) |
| Shared cards | Test title/location/URL edits affect home and listing. Optional links stay absent; unsafe URLs do not render. In the browser, a temporary project title appeared in both page previews, then was restored. | Intr tests and browser observations below |
| Desktop composition | Photo hero, offset introduction, uneven project grid, checkerboard features, dark services and footer inspected. | [Hero](../../evidence/2026-10-13-intr-rebuild/desktop-home.jpg), [project grid](../../evidence/2026-10-13-intr-rebuild/desktop-projects.jpg) |
| Phone layouts | At 390 × 844, home, listing and sample detail fit without horizontal overflow. Supporting text and static gallery captions remain readable. Final hero selects the full local image after a fresh load. | [Home](../../evidence/2026-10-13-intr-rebuild/mobile-home.jpg), [listing](../../evidence/2026-10-13-intr-rebuild/mobile-projects.jpg), [detail](../../evidence/2026-10-13-intr-rebuild/mobile-detail.jpg), [gallery](../../evidence/2026-10-13-intr-rebuild/mobile-gallery.jpg) |
| Navigation | Homepage anchor, See all works and Maison Dorée links navigate correctly. Phone menu opens; choosing Home navigates and closes the menu. | Browser observations |
| Editor | Dev pair unlocks. Hero text updates immediately, narrow preview uses the mobile layout, reference ordering updates the project order. Restoring edits returns Local preview and disables Save draft. | [Narrow preview](../../evidence/2026-10-13-intr-rebuild/editor-mobile.jpg) |
| New block | Pending Intr Services fields render in the page before Create. Changing its heading updates the pending section; Cancel leaves the original eight blocks and no test text. | [Pending preview](../../evidence/2026-10-13-intr-rebuild/editor-new-block.jpg) |
| Documentation | Wiki rebuilt and integrity checked; whitespace check clean. | `node docs/wiki/_build.mjs`, `--check`, `git diff --check` |

## Browser observations and corrections

The main desktop viewport was approximately 1798 × 941. The phone viewport
reported `innerWidth=390` and document width 375 (scrollbar space), with no broken
loaded images on the sample detail. Desktop console inspection reported no errors.
The browser-wide viewport helper did not reliably apply to existing tabs; a
temporary per-tab DevTools viewport through the same computer-use tool established
the measured phone size. Overrides were reset and the duplicate phone tab closed.

The first phone hero selected an undersized responsive source. Its sizes hint was
adjusted for the tall cover crop, then checked again after a fresh phone load.
Some automation clicks did not reach the expected editor controls; keyboard
activation provided stable access. Verification does not claim exhaustive pointer
or drag testing. Project reorder was exercised with Alt + Down/Up and restored.

The full repository run preceded the final image-size hint and replacement of an
adapted pull quote with the reference text. The final focused Intr tests and isolated
production build include both changes. The final phone checks include the image
fix; the sample's reference quote was observed in its DOM. These small changes did
not justify repeating the unchanged full suite.

## Limits

This is representative visual inspection, not pixel-diff or cross-browser coverage.
Reduced-motion CSS and native no-JavaScript fallbacks are implemented; no OS motion
setting or JavaScript-disabled browser pass was performed. Static SSR assertions
cover galleries but do not establish all failure modes. The separate static
detail page does not automatically inherit edits to a project card entry.

No live GitHub/GitLab save, publish, remote conflict, R2 upload, browser backup
export/import, hosting deployment or email delivery was tested. Contact links were
inspected as rendered URLs; business details/statistics are reference demo content.
Root content preservation is covered by tests and the final Git diff, not a claim
about external client drafts. Nothing was committed, pushed or deployed.
