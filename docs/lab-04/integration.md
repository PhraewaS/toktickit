# Lab 4 Staging Integration and Final Submission

## Current release documentation checkpoint - 2026-10-14

This is the documentation/evidence maintenance branch **`codex/lab4-release-documentation-54`**, created from approved staging merge **5ab13bbf53371b1e42bacbfe22c00296b9f68d0c**. It changes no product code, schema, seed, dependencies or test runner. It resolves the documentation follow-ups before [release PR #63](https://github.com/PhraewaS/toktickit/pull/63), not by committing directly to staging/main. Peer approval of this maintenance remains a separate pending gate.

| PR / gate | Actual status at this checkpoint | Evidence |
| --- | --- | --- |
| #55-#60 contract/features/verification | Each human-approved and merged into staging | Individual approval/merge links in [reviewer.md](reviewer.md) |
| #61 integration preparation | Approved / merged as b618547 | [approval](https://github.com/PhraewaS/toktickit/pull/61#pullrequestreview-5478535660) |
| #62 recovery repair | Approved / merged as c239461; no longer awaiting merge | [approval](https://github.com/PhraewaS/toktickit/pull/62#pullrequestreview-5489697574) |
| #64 bidirectional reviewer record | Approved d4479bb before merge as 5ab13bb, 2026-10-14 | [approval](https://github.com/PhraewaS/toktickit/pull/64#pullrequestreview-5517046805), [merge](https://github.com/PhraewaS/toktickit/commit/5ab13bbf53371b1e42bacbfe22c00296b9f68d0c) |
| Staging verification after #64 | All six phases passed at **5ab13bb**, not this later evidence-only commit | [commands, phase JSON and complete sanitized logs](https://github.com/PhraewaS/toktickit/pull/63#issuecomment-6168420145) |
| Documentation maintenance | Prepared on separate branch for peer review | This document, specification/API/UI/test/checklist updates and review addendum |
| #63 release | OPEN; earlier COMMENTED review at c239461 is not formal approval of the latest head | [review](https://github.com/PhraewaS/toktickit/pull/63#pullrequestreview-5492867653) |
| Final main / final evidence / PDF / #54 Done | Pending release and actual final-source verification | Unchecked gates below; staging does not substitute for main |

The 5ab13bb run (2026-10-14, 19:23-19:31 Asia/Bangkok) recorded Server 164/164, Client 89/89, both builds, Lab 4 E2E 11 passed/10 intentional skips, Lab 3 E2E 26 passed/16 intentional skips and 0 failed/flaky. Recovery safety 6/6, migration/seed/isolated recovery, eight selected DB/API/UI counts and six responsive/keyboard checks passed. PERF-04: 40 requests, 0 failures, maxima 311/7/7/7 ms, all <1,000 ms. These are **local staging results**, not CI; no GitHub check run was reported for that head. [Review screenshots](../../artifacts/lab-04/evidence/documentation-review/summary.md) are unchanged copies from that run, not screenshots generated on this documentation revision or final main.

### Current branch flow and next gates

Approved #55-#60 -> staging -> approved #61 -> approved #62 -> approved #64 -> **separate documentation-maintenance PR -> staging** -> actual new staging-head verification -> current-head peer approval/merge of **#63 -> main** -> separate final-evidence branch/PR -> main -> final submission and #54 Done.

- [x] Check required six documents, actual schema/API/UI behavior, exact test paths and all eight AC mappings against the handout.
- [x] Document full Data Changes, metric counts versus bounded arrays, current review/merge receipts, explicit expected results and visual/keyboard checklist methods.
- [x] Preserve dated old evidence and the original 17-PR/89-event review snapshot; append later review events separately.
- [ ] Peer approves/merges this documentation-maintenance PR into staging.
- [ ] Repeat six phases on the resulting actual staging merge SHA and update #63's evidence; do not reuse 5ab13bb as if it were the new source.
- [ ] Peer approves the latest release head and merges #63 into main.
- [ ] Execute final-main, reviewed evidence/PDF and submission gates below; only then close #54/Done.

## Required document completeness map

| Required file | Required contents / inspection result | Final dependency |
| --- | --- | --- |
| [specification.md](specification.md) | Goal, request interpretation, included/excluded scope, FR/BR IDs, roles/status matrix, calculations, UI summary, schema/migration/seed, at least two justified DB decisions, ACs and DoD | Peer approval of maintenance; final-main DoD outcome |
| [tests.md](tests.md) | Plan, explicit expected results, AC-01-08 traceability, real file paths, unit/API/integration/UI/style/roles/workflow/migration/recovery/responsive/performance/E2E/regression evidence | Pending final-main status for every AC/test |
| [api-spec.md](api-spec.md) | Methods/paths, full draft fields, response shapes, first-create/replay statuses, ID/body errors, Origin/session/role/ownership, conflicts, formulas/time bounds, drill-down and empty behavior | Same contract; no new endpoints/permissions |
| [ui-spec.md](ui-spec.md) | Screen modes/controls/role behavior, all feedback states, exact field semantics, Zen Green layout/tokens, responsive/keyboard rules | Final major-screen/full-page/error-state visual evidence |
| [reviewer.md](reviewer.md) | Identities/student IDs, both repositories, Issue/branch/PR links, original feedback/responses/approvals, actual merge commits; later #63/#64 receipts appended | Future documentation/release/final-evidence reviews and Part 1 rendering |
| [ai-use.md](ai-use.md) | LLM identity, ten selected key prompts and My Reflection on specification/coding agent work; retained, not an invented new personal reflection | Render in final Part 4 |

Additional JSON snapshots, this integration guide and the visual checklist support the six mandatory files; they do not replace them. The handout's assignment/complete/cancel examples are explicitly interpreted as the **parent Ticket lifecycle** under the approved contract, not unapproved Action fields. Final PDF map covers every Answer Part 1-9 below.

### Non-closing release references

GitHub's Development / Linked pull requests association is a closing reference, not merely a neutral link: a linked PR merged into the default branch automatically closes its Issue. Even a negated phrase containing a supported closing keyword immediately before an Issue number can create that association. The previously detected #63 -> #54 closing association was removed while both remain open. Release #63 and documentation maintenance #65 use explicit **Part of Issue #54** hyperlinks/body references instead; no automatic-closing association was added to #65. The Project still has only the #54 Issue card, and its body lists the related PRs even when a non-closing reference is not a Development badge.

Before release, inspect `closingIssuesReferences` as well as the description/commit messages; don't assume prose saying the Issue must stay open disables GitHub automation. Keep #54 open until the later final-main/evidence/PDF/submission gates actually pass. [GitHub's documented linking and automatic-closing behavior](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).

## Historical integration preparation and enduring review gates

Issue [#54](https://github.com/PhraewaS/toktickit/issues/54) integrates the approved contract/features/evidence; it is not a new product feature. PRs [#55](https://github.com/PhraewaS/toktickit/pull/55), [#56](https://github.com/PhraewaS/toktickit/pull/56), [#57](https://github.com/PhraewaS/toktickit/pull/57), [#58](https://github.com/PhraewaS/toktickit/pull/58), [#59](https://github.com/PhraewaS/toktickit/pull/59) and [#60](https://github.com/PhraewaS/toktickit/pull/60) each received guluJa's approval and merged to staging. Starting staging revision: `2741c4b7cb957f0b6ffda8dce902a13eb05e490b`. At preparation time `main` is still the Lab 3 release at `81cf800d02f5927bfdfd042943bf2f36539f317e`.

Final checks found operational-evidence gaps, stale review records, screenshot directory mismatches and compatible production dependency patches. These are addressed on **`feature/lab4-staging-integration-54`**, separately from completed features.

1. Verify this integration branch and request human review into `lab4-staging`. No self-approval or automatic merge.
2. After approval/merge, repeat verification on the actual staging merge SHA. Open a separate release PR `lab4-staging` -> `main`, linking #54 without closing it prematurely.
3. After peer approval/release merge, check out resulting **final `main`** and repeat all six verification phases with `--output-dir artifacts/lab-04/evidence/final-main`. Record that source SHA, not the former feature/staging SHA.
4. Create a separate evidence branch from released `main`; commit final-main results, approval links and concise Answer Parts 1-9 PDF. Open another reviewed PR into `main`. Evidence-only commits do not replace the tested product revision.
5. After evidence approval/merge, readable PDF/link checks and completed submission checklist, close #54 and move its Project card to Done. Record both tested release and final evidence commits.

Until then, **final-main verification, final PDF, release approval and #54 completion remain pending**. Keep only the Issue card on the Project, with PRs linked from the Issue and PR descriptions.

## Environment and tested recovery

Use the existing untracked environment file. The runner requires localhost port **5433**, binds `DATABASE_URL` and `E2E_DATABASE_URL` to the same dedicated guarded database and generates existing seed-password variables in memory. Do not type, commit or screenshot passwords; the normal application database is never seeded.

Run the README phases in order: `prepare`, `recovery`, `server`, `client`, `lab4`, `lab3`. Do not run `prepare` while either E2E server is using the Prisma engine DLL on Windows. E2E phases start their own port-3000/5173 servers and must not overlap. Server files are serialized because seed regression resets shared credentials; Client files are serialized to avoid CPU contention in jsdom/user-event checks. Each Server phase seeds with the same disposable password used by its login checks. Two-pass seed regression has a 30-second bound; performance requests retain the 1,000-ms limit.

Recovery detects PostgreSQL major version (15 here), chooses matching `pg_dump`/`psql`, backs up the dedicated Lab 4 seed as plain SQL and restores it atomically into a uniquely created temporary database from `template0`. `psql --no-psqlrc --set=ON_ERROR_STOP=1 --single-transaction` prevents startup-file overrides and continuing after restore errors. It compares counts and sorted-row MD5 fingerprints for every Prisma table and `_prisma_migrations`, then removes only that temporary database and dump. This is **backup/restore recovery**, not destructive rollback on user data. An initial PostgreSQL-17 client failed against version 15; matching the actual server major prevents that tooling mismatch.

On 2026-10-12 Windows Smart App Control blocked unsigned `createdb.exe` and `pg_restore.exe`; `pg_dump`/`psql` 15.19 executed normally. Approved repair #62 uses the supported plain SQL procedure, not a security-policy exemption; it merged as c239461. Recovery was subsequently repeated successfully at c239461 and 5ab13bb. Earlier custom-format successes and the blocked b618547 attempt stay historical. This documentation does not claim a fresh OS-policy audit or disable protection. Follow the separate maintenance/staging/main/final-evidence gates above; no manual seed password or port change is needed.

Nine-table comparison covers users, categories, related systems, Tickets, attachments, sessions, Public Comments, Internal Notes and Actions Taken. Zero-row tables verify schema/empty-data recovery only; the seeded attachment table is empty. Physical attachment bytes are outside the database dump: back up `server/storage/attachments` together with the database for application recovery. Legacy E2E separately verifies attachment upload/download/soft-removal; it does not prove populated attachment-byte restore.

## Acceptance scenario map

Historical integration outputs at source 4e532887: [`../../artifacts/lab-04/evidence/staging-integration/`](../../artifacts/lab-04/evidence/staging-integration/). Latest executed staging output at 5ab13bb is linked in the current checkpoint above. Neither historical #53/integration nor staging evidence replaces final-main results.

The runner reopens the embedded Playwright report ZIP, rejects zero-test/failed reports, checks Dashboard metric evidence, redacts disposable credentials from password-input step titles, and verifies that result totals are unchanged. Lab 3's fresh sanitized regression report is copied into staging-integration rather than replacing its historical committed report. Credential redaction is evidence hygiene, not alteration of outcomes; actual passes/skips/errors remain intact.

| Scenario | Automated coverage |
| --- | --- |
| Staff/Admin Action list/create/edit, exact performer, invalid IDs/missing resources, role/ownership denial | `server/tests/lab-04/actions-taken.api.test.ts`, `actions.api.test.ts`; `client/tests/lab-04/ActionsTaken.test.tsx` |
| Assignment, inactive-assignee rejection, IT Priority, role restrictions | `server/tests/lab-03/staff-operations.integration.api.test.ts`, `users-admin.api.test.ts`; `e2e/lab-03/staff-ticket-flow.spec.ts` |
| Completion and cancellation | `e2e/lab-04/ticket-resolution.spec.ts`: NEW -> OPEN -> IN_PROGRESS; reject resolution without Action; create Action; RESOLVED -> CLOSED; cancel a separate OPEN Ticket |
| Complete matrix and stale-page/concurrent save | `server/tests/lab-04/ticket-workflow.api.test.ts`; `client/tests/lab-04/TicketWorkflow.test.tsx` |
| Safe failures, draft retention, safe retry, exact unchanged time | Actions Taken API/component tests and `e2e/lab-04/actions-taken-flow.spec.ts` |
| Stable ordering and append-only comment/note history | Queue/Dashboard order assertions; Action query order source inspection in `server/src/actions.ts`; comment/note list/create API and browser flows plus route/source audit in `app.ts`, `comments.ts` and `staff.ts` |
| Requester/Staff metrics and matching drill-down | Dashboard API/component tests, `e2e/lab-04/dashboards.spec.ts`; independent DB/API/UI metric logs and JSON attachments |
| Responsive editor fields, keyboard/focus, safe console | `e2e/lab-04/responsive.spec.ts`, Lab 3 responsive suite, `responsive-accessibility-checklist.md` |
| Authentication, password change, My Tickets, Detail, Attachments, Comments, Internal Notes and Admin | Full Server/Client suites and complete Lab 3 E2E |
| Migration/seed, recovery and bounded performance | prepare/recovery logs, migration regression, `e2e/lab-04/migration-seed.spec.ts`, `server/tests/lab-04/performance-smoke.test.ts` |

Assignment and complete/cancel apply to the **parent Ticket** under the approved contract. Actions Taken have no additional assignee/status fields. Comments and Internal Notes are append-only; Actions Taken remain editable with a required version token and have no unsupported delete route.

## Itemized acceptance checklists for this review

Checked items below mean prepared/verified on the integration branch at source `4e532887835770b0f4ec851e34e1bb92fab7c685`, not accepted on final main. The exact results and files are in the scenario map and staging-integration summary. All final-main/submission boxes remain unchecked until release and actual execution. Peer approval remains a separate human action.

### Part 1 - workflow and repository evidence

- [x] Individually identify approved/merged PRs #55, #56, #57, #58, #59 and #60; verify the final approved feature commit and actual staging merge commit for each.
- [x] Record reviewer guluJa, corrective author responses, all accessible comments/reviews, formal approvals and PR links in [reviewer.md](reviewer.md), with original complete bodies in [review-history.json](review-history.json).
- [x] Verify Issues #48-#53 are closed/Done and #54 is the single Issue card in PR Review; no standalone #61 card.
- [x] Record the current branch/commit flow and integration PR #61 into staging, with staging/main baselines and exact tested integration SHA.
- [x] Verify [README](../../README.md) setup/test/evidence instructions and [.gitignore](../../.gitignore) exclusions for local environment, dependencies, build output, attachment bytes and transient test results.
- [x] Verify tracked repository structure: `server/` (source/tests/Prisma), `client/` (source/tests), `e2e/`, `docs/lab-04/`, `artifacts/lab-04/` and `scripts/`.
- [ ] Extend branch/commit/PR evidence through the approved release merge into main, then the approved final-evidence merge.
- [x] Include actual #61/#62 approvals and merge receipts in the snapshot; append #64 accepted review/response/approval/merge and #63's earlier COMMENTED review separately.
- [ ] Add this documentation PR, future release/final-evidence reviews, corrective responses, current-head approvals and actual merges when they happen; do not pre-fill them.
- [ ] Capture the final Project/Kanban with #48-#54 Done only after all release/submission gates complete.
- [ ] Render the reviewer record, README/ignore/repo structure and branch-flow evidence legibly into final PDF Part 1; links must work.

### Part 6 - operational Actions Taken and parent Ticket lifecycle

- [x] Staff/Admin list/create/edit Action Taken with the session-derived performer; Requester reads only own Tickets and cannot mutate Actions.
- [x] Validate required fields and conditional Follow-Up Note; test unchanged Action Date/Time seconds. Inspect the Action list query's stable `actionDateTime ASC, id ASC` chronology (source check, not a separately claimed chronology test).
- [x] Assign/edit the parent Ticket; reject inactive/invalid assignees; retain approved Staff/Admin role boundaries for assignment/status.
- [x] Require an Action before resolution; prove RESOLVED -> CLOSED completion and cancellation of a separate OPEN Ticket.
- [x] Exercise safe validation/missing-resource/auth/ownership failures, stale edits and concurrent protection.
- [x] Preserve the draft across failed refresh/retry, require deliberate discard and prevent duplicate creates after an uncertain save result.
- [x] Capture usable editor/follow-up controls and focus states at desktop/tablet/mobile.
- [ ] Repeat these checks and attach actual results/captures on the released final-main SHA, then include concise Part 6 evidence in the submission.

### Part 7 - Ticket workflow and communication history

- [x] Verify the complete permitted status matrix, resolution guard and unauthorized transition rejection.
- [x] Reject both stale-page preconditions and status changes between Server read/write without overwriting newer data.
- [x] Keep Requester resolved indication advisory/idempotent, not a formal status transition.
- [x] Verify Queue/Dashboard ordering assertions; inspect Action and comment/note query tie-breaks and the append-only Public Comments/Internal Notes routes (list/create only; no edit/delete operation). API/browser regression covers list/create; the append-only route check is source inspection, not a new dedicated automated test. Actions Taken remain explicitly editable with version checking.
- [x] Verify Requester ownership/read visibility and Staff/Admin communication permissions from the approved contract.
- [ ] Repeat and record Part 7 scenarios on final main; include transition/conflict/history/role evidence in the final PDF.

### Part 8 - Requester Dashboard and previous-feature regression

- [x] Compare selected Requester/Staff metric values independently between guarded DB queries, API and rendered UI; verify filter-matched drill-downs.
- [x] Preserve Authentication, login/logout, inactive/revoked access and required password-change behavior.
- [x] Preserve My Tickets filtering/sorting/pagination, Create Ticket and owned Ticket Detail.
- [x] Preserve Attachments upload/download/soft-removal and Public Comments/Internal Notes visibility/creation boundaries.
- [x] Preserve Staff queue/operations and Administrator list/create/edit/activation/reset-password management with role restrictions.
- [x] Record full Server/Client suites, builds and the complete authenticated legacy E2E regression; intentional viewport skips remain separately labelled.
- [ ] Rerun all tests/builds/regression on the exact released final-main SHA, record fresh evidence and include readable Part 8 results/captures.

### Mandatory final-main evidence record

- [ ] Record the release PR URL, actual release merge SHA and exact tested main product SHA before executing verification; do not substitute a staging/feature SHA.
- [ ] Run all six README phases with `--output-dir artifacts/lab-04/evidence/final-main` from that main revision and record commands, environment (no secrets), time, counts/skips, exits and results.
- [ ] Include full Server/Client suites, both builds, migration/seed/recovery, Lab 4 E2E, legacy regression, metrics, responsive/focus/console and performance-smoke.
- [ ] Distinguish the tested product SHA from the later evidence-only commit; rerun affected checks if product code changes during release/evidence review.
- [ ] Obtain peer approval/merge of final evidence and complete PDF/link/readability checks before closing #54.

## Final-main submission PDF map

Produce one concise PDF with exactly these headings in order. Render documents legibly, include readable screenshots and clickable final repository/PR/Issue links. Label historical evidence; final verification captures come from released main.

| Heading | Required content and evidence |
| --- | --- |
| Answer Part 1 | Branch/commit flow through main and evidence commit; Project Done after completion; README, `.gitignore`, repository tree; rendered `reviewer.md` with reviewer, PR #55-60 plus integration/release/evidence links, comments/responses and approvals |
| Answer Part 2 | Rendered `specification.md`: FRs/BRs, status matrix, formulas, acceptance criteria, migration/decisions and DoD; link #55 showing contract predates implementation |
| Answer Part 3 | Rendered `tests.md`, traceability, actual **final-main** suites/builds/regression/E2E, source SHA, intentional skips, metrics and performance |
| Answer Part 4 | Rendered `ai-use.md`: model, 6-10 key prompts and personal reflection |
| Answer Part 5 | Staff Dashboard desktop/tablet/mobile, role/feedback states, formulas, selected DB/API/UI comparison; `staff-dashboard/` screenshots |
| Answer Part 6 | Actions Taken list/create/edit/fields/Follow-Up Note; parent Ticket assignment/complete/cancel; inactive-assignee/role rejection, safe retry and responsive editor; `actions-taken/` screenshots |
| Answer Part 7 | Transitions/resolution, stale/concurrent conflicts, deterministic order, append-only communication and Requester advisory/visibility |
| Answer Part 8 | Requester Dashboard/ownership/drill-down plus Authentication/My Tickets/Detail/Attachments/Comments/Internal Notes/Staff/Admin regression; `requester-dashboard/` screenshots |
| Answer Part 9 | Rendered `ui-spec.md`, representative major-screen desktop/tablet/mobile captures and actual visual/responsive/accessibility checklist |

Acceptance: all nine headings once/in order; no Planned item represented as executed; no secrets; links point to accessible final commits/PRs/files; images/tables readable without clipping; render and inspect every PDF page. The existing #53 review PDF is not this final submission.

## Dependency audit limitation

Compatible lockfile patches update Express/body-parser/proxy-addr/qs and related packages, without forced major upgrades. Production-only `npm audit --omit=dev` reports **0 vulnerabilities** for Server and Client on 2026-10-08; JSON outputs are in staging-integration. Full audits still flag development tools in the older Vitest/Vite toolchain: Server 6 (3 moderate, 1 high, 2 critical), Client 7 (3 moderate, 2 high, 2 critical). Do not claim a clean full audit. Reviewers must acknowledge this remaining development-tool risk or request a separately tested upgrade; a forced major upgrade is not silently included. Keep development/test servers local, never published as production services.
