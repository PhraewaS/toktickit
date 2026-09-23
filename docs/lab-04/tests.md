# Lab 4 Test DD and Traceability

| Test ID | Type | Requirement | Planned/actual coverage | Automated file | Final |
| --- | --- | --- | --- | --- | --- |
| UNIT-04 | unit/API | BR-04-07 | Action validation, conditional follow-up, deterministic ordering, transition gate | `server/tests/lab-04/actions.api.test.ts` | Passing focused suite |
| API-04 | API/security | AC-01-04 | create/list/update, performer derivation, Requester ownership, role boundary, stale conflict | `server/tests/lab-04/actions-taken.api.test.ts` | Passing focused suite |
| API-05 | API | AC-05 | Requester/Staff dashboard envelopes, role access, authoritative query inputs | `server/tests/lab-04/requester-dashboard.api.test.ts`, `staff-dashboard.api.test.ts` | Passing focused suite |
| API-06 | API/regression | AC-04/07 | resolution gate and old requester resolved indication | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passing focused suite |
| UI-04 | component | AC-01/02/06 | Action list, create/edit modes, follow-up field, read-only Requester mode | `client/tests/lab-04/ActionsTaken.test.tsx` | Passing focused suite |
| UI-05 | component | AC-05/06 | dashboard metric, empty, failure, drill-down, role navigation states | `client/tests/lab-04/RequesterDashboard.test.tsx`, `StaffDashboard.test.tsx` | Passing focused suite |
| UI-06 | component | AC-04/07 | resolution prerequisite traceability | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passing focused suite |
| E2E-04 | E2E | AC-01-06 | Staff/Admin action lifecycle, Requester read-only visibility, dashboard drill-down | `e2e/lab-04/actions-taken-flow.spec.ts`, `dashboards.spec.ts`, `ticket-resolution.spec.ts` | Requires seeded PostgreSQL run |
| RESP-04 | responsive/accessibility | AC-06 | desktop/tablet/mobile dashboard and Actions Taken layout, focus, labels, no page overflow | `e2e/lab-04/responsive.spec.ts` | Planned |
| REG-04 | regression | AC-07 | all Lab 1-3 server/client suites, migration/seed, build, existing E2E | existing Lab 1-3 files and final verification record | Affected Lab 2/3 suites passing; full DB suite requires local PostgreSQL |

Required final evidence includes passing output from unit/API/integration/UI/E2E/responsive/regression checks, rendered Spec DD documents, migration and seed output, screenshots at desktop/tablet/mobile widths, and a console/diff scan showing no unfinished controls or unsafe error leakage.
