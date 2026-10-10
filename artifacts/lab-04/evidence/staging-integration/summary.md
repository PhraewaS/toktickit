# Issue #54 Integration Verification

## Identity and scope

- Run date: 2026-10-08; completed 15:22:36 UTC (22:22:36 Asia/Bangkok).
- Exact tested source: [`4e532887835770b0f4ec851e34e1bb92fab7c685`](https://github.com/PhraewaS/toktickit/commit/4e532887835770b0f4ec851e34e1bb92fab7c685).
- Branch/PR: `feature/lab4-staging-integration-54` -> `lab4-staging`, [PR #61](https://github.com/PhraewaS/toktickit/pull/61), part of [Issue #54](https://github.com/PhraewaS/toktickit/issues/54).
- Starting staging: `2741c4b7cb957f0b6ffda8dce902a13eb05e490b`, after approved PRs #55-60.
- Windows, Node 24.19.0, Prisma 5.22.0, Chromium; PostgreSQL 15 on localhost **5433**. Local credentials were read without publishing values; disposable seed passwords were generated in memory.
- Dedicated databases: `toktickit_lab4_e2e` and `toktickit_lab3_e2e`. The configured normal application database was not seeded or modified by this runner.

All six per-phase JSON records contain the same source SHA, completion timestamp and zero command exit codes. Subsequent commits only attach documents/evidence to this verified implementation. These are integration-branch results, **not released-main results**. Approval, staging merge verification, release merge, final-main repeat and final PDF remain pending.

## Reproduction

Install the locked dependencies in server/client/e2e, generate Prisma through the prepare phase and install Playwright Chromium. Run from the repository root, sequentially, with your existing untracked local environment file:

```powershell
node scripts/verify-lab4.mjs prepare --env-file server/.env
node scripts/verify-lab4.mjs recovery --env-file server/.env
node scripts/verify-lab4.mjs server --env-file server/.env
node scripts/verify-lab4.mjs client --env-file server/.env
node scripts/verify-lab4.mjs lab4 --env-file server/.env
node scripts/verify-lab4.mjs lab3 --env-file server/.env
```

If the existing file is elsewhere, replace only the `--env-file` path. Do not paste credentials into a command/report. The runner uses dedicated names regardless of the normal database name in that file. Do not overlap prepare or E2E phases. On released main, use `--output-dir artifacts/lab-04/evidence/final-main` for every phase.

## Actual final integration results

| Gate | Result | Raw evidence |
| --- | --- | --- |
| Prisma generate/migration/seed | Passed; 5 migrations found, none pending; database/port verified | `prepare-results.json`, `prisma-generate.txt`, `migration-deploy.txt`, `seed.txt` |
| Database recovery | Passed with pg_dump/pg_restore 15.19; all 9 table counts and sorted-row fingerprints equal; temporary database/dump removed | `recovery-results.json`, `recovery-*.txt` (successful tools produced no stdout) |
| Full Server | 28 files, **164 passed**, 0 failed, 0 skipped; production build passed | `server-results.json`, `server-tests.txt`, `server-build.txt`, `server-seed.txt` |
| Full Client | 20 files, **89 passed**, 0 failed, 0 skipped; production build passed | `client-results.json`, `client-tests.txt`, `client-build.txt` |
| Lab 4 E2E | 21 cases: **11 passed, 10 intentional skips**, 0 failed, 0 flaky; 6 responsive checks passed | `lab4-results.json`, `lab4-e2e.txt`, `../playwright-report/index.html` |
| Legacy Lab 3 E2E | 42 cases: **26 passed, 16 intentional skips**, 0 failed, 0 flaky | `lab3-results.json`, `lab3-e2e.txt`, `lab3-playwright-report/index.html` |
| Performance-smoke | 40 requests, 0 failures; maximum Staff Dashboard 388 ms, Requester Dashboard 9 ms, Staff Actions 9 ms, Requester Actions 8 ms; each <1,000 ms | PERF-04 line in `server-tests.txt` |
| Metrics DB/API/UI | All eight selected metrics equal independently across query/API/UI | DASHBOARD-METRICS lines in `lab4-e2e.txt`; named JSON attachments in HTML report |
| Keyboard/focus/console | Both Dashboard drill-downs and Action Add/Follow-Up/Note/Save passed at all three widths; each responsive flow: 0 unexpected HTTP errors and 0 uncaught page errors | BROWSER-SCAN lines, responsive tests/report, `docs/lab-04/responsive-accessibility-checklist.md` |
| Production audits | Server and Client: **0 vulnerabilities** with `--omit=dev` | `server-production-audit.json`, `client-production-audit.json` |
| Diff/hygiene | `git diff --check` passed; environment files, runtime dependencies, attachment bytes and transient results excluded | PR file list and repository `.gitignore` |

Viewport skips are deliberate: destructive/credential-changing flows run once on desktop, with independent responsive suites on tablet/mobile. They are not counted as passing executions. The legacy server/client suites cover earlier lab behavior; the authenticated Lab 3 E2E replaces the obsolete development-requester selector flow.

### Selected Dashboard metrics

| Role | Metric | DB | API | UI |
| --- | --- | --- | --- | --- |
| Requester | openTickets | 2 | 2 | 2 |
| Requester | waitingForRequester | 0 | 0 | 0 |
| Requester | recentlyUpdated | 2 | 2 | 2 |
| Requester | recentlyResolved | 0 | 0 | 0 |
| Staff | unassignedActive | 2 | 2 | 2 |
| Staff | myActive | 1 | 1 | 1 |
| Staff | myActionsTaken | 2 | 2 | 2 |
| Staff | urgentTickets | 2 | 2 | 2 |

Prisma comparison and the API server receive the same guarded Lab 4 database URL. The checks verify actual rendered values, not only metric labels. The HTML archive contains both named metric attachments and logs; report validation rejects missing metrics, zero tests, unexpected outcomes or setup errors.

### Responsive screenshots and lifecycle

Twelve regenerated screenshots are under `artifacts/lab-04/screenshots/staff-dashboard/`, `requester-dashboard/` and `actions-taken/`. Staff editor captures include Follow-Up Required, visible Follow-Up Note, Save and Discard at desktop/tablet/mobile. Browser assertions verify viewport fit before form capture. Representative desktop Dashboard, tablet Dashboard/editor and mobile editor images were visually inspected. This is targeted keyboard/visual evidence, not a complete WCAG audit.

Nine fresh legacy Staff Queue/Staff Detail/Admin captures are preserved separately under `legacy-screenshots/` (three screen groups, three widths) from this regression run. Historical committed Lab 3 screenshots/reports are left unchanged.

E2E-07 now proves: NEW -> OPEN -> IN_PROGRESS; RESOLVED rejection without an Action; persisted Action; RESOLVED -> CLOSED; and CANCELLED on a separate OPEN Ticket. Existing role, assignment, inactive-assignee, stale/concurrent update, safe retry, chronological ordering and legacy communication/attachment/Admin checks remain in the full suites. The scenario-to-file map is in `docs/lab-04/integration.md`.

## Recovery and security limitations

Recovery table counts: users 10, categories 4, related systems 6, Tickets 6, attachments 0, sessions 0, Public Comments 6, Internal Notes 6, Actions Taken 3. Detailed fingerprints are in `recovery-results.json`. Zero-row tables verify empty recovery only. A database dump does not include physical attachment bytes; application recovery also needs the attachment storage directory. No pre-change user database rollback was performed.

Playwright normally embeds filled password values in its step details. The runner redacts disposable password inputs/configured secrets, reopens the ZIP and confirms unchanged actual outcome totals. Both final reports passed this check and retain metrics. No database credentials or disposable seed passwords are deliberately published in this evidence.

Production audit results are clean after compatible lockfile patches. Full audit still flags development tooling: Server 6 advisories (3 moderate, 1 high, 2 critical), Client 7 (3 moderate, 2 high, 2 critical). Reviewers must acknowledge the limitation or request a separate tested major upgrade. Do not publish development/test servers.

GitHub reports no configured CI checks for PR #61, and this branch has no `.github` workflow directory. These are reproducible **local** results; no CI success is claimed.

## Failures found and corrected before this final run

- Dashboard component tests waited for a static heading rather than loaded metrics/controls; changed them to await actual data.
- A new invocation generated a seed password without preparing it for Server login checks; Server now reseeds within its phase and serializes files that reset shared fixture credentials.
- Seed repeatability exceeded the default 5-second test timeout under load; its explicit 30-second bound covers two real seed passes without relaxing the 1-second performance requirement.
- Running Client tests in parallel with browser work caused jsdom/user-event timing failures; final Client verification serializes files and all phases run sequentially.
- Prisma regeneration failed while an E2E server held its Windows engine DLL; final prepare runs before browser servers.
- PostgreSQL-17 backup tools produced incompatible restore SQL against version 15; runner now detects and requires matching major tools.
- Generated HTML step details exposed disposable seed values; report hygiene now redacts them and verifies unchanged counts/metric evidence.

Only the latest complete passing run at the SHA above is published as current evidence. Earlier diagnostic failures are not represented as passes. Follow the pending release/final-main/Parts 1-9 checklist in `docs/lab-04/integration.md` and Issue #54.
