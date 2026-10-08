# Lab 4 Staging Integration and Final Submission

## Scope and review gates

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

Recovery detects PostgreSQL major version (15 here), chooses matching `pg_dump`/`pg_restore`, backs up the dedicated Lab 4 seed and restores it into a uniquely created temporary database. It compares counts and sorted-row MD5 fingerprints for every Prisma table, then removes only that temporary database and dump. This is tested **backup/restore recovery**, not destructive rollback on user data. An initial PostgreSQL-17 client failed against version 15; automatic matching fixes that tooling mismatch.

Nine-table comparison covers users, categories, related systems, Tickets, attachments, sessions, Public Comments, Internal Notes and Actions Taken. Zero-row tables verify schema/empty-data recovery only; the seeded attachment table is empty. Physical attachment bytes are outside the database dump: back up `server/storage/attachments` together with the database for application recovery. Legacy E2E separately verifies attachment upload/download/soft-removal; it does not prove populated attachment-byte restore.

## Acceptance scenario map

Fresh outputs, command exits and tested SHAs: [`../../artifacts/lab-04/evidence/staging-integration/`](../../artifacts/lab-04/evidence/staging-integration/). Historical #53 evidence does not replace integration or final-main results.

The runner reopens the embedded Playwright report ZIP, rejects zero-test/failed reports, checks Dashboard metric evidence, redacts disposable credentials from password-input step titles, and verifies that result totals are unchanged. Lab 3's fresh sanitized regression report is copied into staging-integration rather than replacing its historical committed report. Credential redaction is evidence hygiene, not alteration of outcomes; actual passes/skips/errors remain intact.

| Scenario | Automated coverage |
| --- | --- |
| Staff/Admin Action list/create/edit, exact performer, invalid IDs/missing resources, role/ownership denial | `server/tests/lab-04/actions-taken.api.test.ts`, `actions.api.test.ts`; `client/tests/lab-04/ActionsTaken.test.tsx` |
| Assignment, inactive-assignee rejection, IT Priority, role restrictions | `server/tests/lab-03/staff-operations.integration.api.test.ts`, `users-admin.api.test.ts`; `e2e/lab-03/staff-ticket-flow.spec.ts` |
| Completion and cancellation | `e2e/lab-04/ticket-resolution.spec.ts`: NEW -> OPEN -> IN_PROGRESS; reject resolution without Action; create Action; RESOLVED -> CLOSED; cancel a separate OPEN Ticket |
| Complete matrix and stale-page/concurrent save | `server/tests/lab-04/ticket-workflow.api.test.ts`; `client/tests/lab-04/TicketWorkflow.test.tsx` |
| Safe failures, draft retention, safe retry, exact unchanged time | Actions Taken API/component tests and `e2e/lab-04/actions-taken-flow.spec.ts` |
| Stable ordering and append-only comment/note history | Actions Taken API ordering tests; Staff integration API and Lab 3 browser flows |
| Requester/Staff metrics and matching drill-down | Dashboard API/component tests, `e2e/lab-04/dashboards.spec.ts`; independent DB/API/UI metric logs and JSON attachments |
| Responsive editor fields, keyboard/focus, safe console | `e2e/lab-04/responsive.spec.ts`, Lab 3 responsive suite, `responsive-accessibility-checklist.md` |
| Authentication, password change, My Tickets, Detail, Attachments, Comments, Internal Notes and Admin | Full Server/Client suites and complete Lab 3 E2E |
| Migration/seed, recovery and bounded performance | prepare/recovery logs, migration regression, `e2e/lab-04/migration-seed.spec.ts`, `server/tests/lab-04/performance-smoke.test.ts` |

Assignment and complete/cancel apply to the **parent Ticket** under the approved contract. Actions Taken have no additional assignee/status fields. Comments and Internal Notes are append-only; Actions Taken remain editable with a required version token and have no unsupported delete route.

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
