# Lab 4 Reviewer Record

## Scope and current workflow

Peer reviewer: **guluJa** (GitHub collaborator). Author: **PhraewaS**. The author does not approve their own PR. Feature PRs target `lab4-staging`; release and final-main evidence require separate approvals. PR #55's documentation-only contract predates implementation and did not claim executed tests.

| Issue / PR | Head branch -> target | Verified state |
| --- | --- | --- |
| [#48](https://github.com/PhraewaS/toktickit/issues/48) / [#55](https://github.com/PhraewaS/toktickit/pull/55) | `feature/lab4-spec-contract` -> `lab4-staging` | guluJa approved; merged 2026-09-29; Issue closed |
| [#49](https://github.com/PhraewaS/toktickit/issues/49) / [#56](https://github.com/PhraewaS/toktickit/pull/56) | `feature/lab4-actions-backend` -> `lab4-staging` | guluJa approved; merged 2026-10-01; Issue closed |
| [#50](https://github.com/PhraewaS/toktickit/issues/50) / [#57](https://github.com/PhraewaS/toktickit/pull/57) | `feature/lab4-ticket-workflow` -> `lab4-staging` | guluJa approved; merged 2026-10-02; Issue closed |
| [#51](https://github.com/PhraewaS/toktickit/issues/51) / [#58](https://github.com/PhraewaS/toktickit/pull/58) | `feature/lab4-dashboards` -> `lab4-staging` | guluJa approved; merged 2026-10-03; Issue closed |
| [#52](https://github.com/PhraewaS/toktickit/issues/52) / [#59](https://github.com/PhraewaS/toktickit/pull/59) | `feature/lab4-actions-ui-52` -> `lab4-staging` | guluJa approved; merged 2026-10-04; Issue closed |
| [#53](https://github.com/PhraewaS/toktickit/issues/53) / [#60](https://github.com/PhraewaS/toktickit/pull/60) | `feature/lab4-verification-evidence-53` -> `lab4-staging` | guluJa approved; merged 2026-10-05; Issue closed |
| [#54](https://github.com/PhraewaS/toktickit/issues/54) / [#61](https://github.com/PhraewaS/toktickit/pull/61) integration preparation | `feature/lab4-staging-integration-54` -> `lab4-staging` | Integration verification recorded; peer approval pending |
| #54 release | `lab4-staging` -> `main` | Pending integration approval/merge and a separate reviewed release PR |
| #54 final-main evidence | New branch from released `main` -> `main` | Pending actual final-main tests and final PDF review |

Dates are UTC merge dates. Issues #48-53 are Done on the Project. #54 stays open: Started during preparation, PR Review once ready, Fixing for requested changes, and Done only after final-main evidence/submission. Keep the Issue card, not a duplicate PR card.

## Peer feedback, author responses and approvals

All links below are actual GitHub records. Approval is a human review, not a test result. Complete conversations and subsequent revisions remain on each PR.

| PR | Feedback and correction | Author response | Final approval by guluJa |
| --- | --- | --- | --- |
| #55 | [Review](https://github.com/PhraewaS/toktickit/pull/55#pullrequestreview-5330909297): status matrix, formulas/API shapes, paths/performance, feedback states and Planned/Pending evidence | [Response](https://github.com/PhraewaS/toktickit/pull/55#issuecomment-5890879984) | [Approval](https://github.com/PhraewaS/toktickit/pull/55#pullrequestreview-5353383942) |
| #56 | [Review](https://github.com/PhraewaS/toktickit/pull/56#pullrequestreview-5364520356): performer shape, route/role coverage, database suite and required update token | [Response](https://github.com/PhraewaS/toktickit/pull/56#issuecomment-5915584385) | [Approval](https://github.com/PhraewaS/toktickit/pull/56#pullrequestreview-5376979695) |
| #57 | [Review](https://github.com/PhraewaS/toktickit/pull/57#pullrequestreview-5380944006): atomic status update, loaded-status precondition and stale-page test | [Response](https://github.com/PhraewaS/toktickit/pull/57#issuecomment-5956322865) | [Approval](https://github.com/PhraewaS/toktickit/pull/57#pullrequestreview-5394091080) |
| #58 | [Review](https://github.com/PhraewaS/toktickit/pull/58#pullrequestreview-5395944922): matching filters, legacy E2E navigation, response/order and consistent example counts/owners | [Response](https://github.com/PhraewaS/toktickit/pull/58#issuecomment-5970915235) | [Approval](https://github.com/PhraewaS/toktickit/pull/58#pullrequestreview-5401602058) |
| #59 | [Review](https://github.com/PhraewaS/toktickit/pull/59#pullrequestreview-5401954695): draft retention, safe uncertain-result retry and unchanged seconds | [Response](https://github.com/PhraewaS/toktickit/pull/59#issuecomment-5980061216) | [Approval](https://github.com/PhraewaS/toktickit/pull/59#pullrequestreview-5406206920) |
| #60 | [Review](https://github.com/PhraewaS/toktickit/pull/60#pullrequestreview-5407138143): DB/API/UI metrics, full editor, keyboard/focus, passing report and guarded Prisma URL | [Response](https://github.com/PhraewaS/toktickit/pull/60#issuecomment-5992419165) | [Approval](https://github.com/PhraewaS/toktickit/pull/60#pullrequestreview-5413091909) |

No integration, release or final-evidence approval is claimed yet.

## Integration reviewer checklist

- [ ] Review compatible production dependency patches and the remaining development-tool audit limitation.
- [ ] Verify guarded port-5433 migration/seed and backup/restore fingerprints/cleanup.
- [ ] Check exact tested revisions, full suites/builds and intentional E2E skips.
- [ ] Inspect close/cancel lifecycle tests, metric attachments and screenshots in required directories.
- [ ] Review Parts 1-9 mapping and pending final-main/PDF gates before approving integration.

See [integration.md](integration.md). Historical #53 evidence remains in `artifacts/lab-04/evidence/verification-output.md`; fresh integration evidence is separate in `artifacts/lab-04/evidence/staging-integration/`.
