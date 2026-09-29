# Lab 4 Test DD and Traceability

| Test ID | Type | Requirement | Planned/actual coverage | Automated file | Final |
| --- | --- | --- | --- | --- | --- |
| UNIT-04 | unit/API | BR-04-07 | Action validation, conditional follow-up, deterministic ordering, transition gate | `server/tests/lab-04/actions-taken.api.test.ts` | Planned; execute on feature branch |
| API-04 | API/security | AC-01-04 | create/list/update, performer derivation, Requester ownership, role boundary, stale conflict | `server/tests/lab-04/actions-taken.api.test.ts` | Planned; execute on feature branch |
| API-05 | API | AC-05 | Requester/Staff dashboard envelopes, calculations, role access, authoritative query inputs | `server/tests/lab-04/requester-dashboard.api.test.ts`, `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned; execute on feature branch |
| API-06 | API/regression | AC-04/07 | complete status matrix, resolution gate, and advisory Requester indication | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned; execute on feature branch |
| PERF-04 | performance-smoke | AC-05/07 | fixed-seed dashboard queries and Action Taken list stay within the documented smoke threshold without unbounded Ticket loading | `server/tests/lab-04/performance-smoke.test.ts` | Planned; execute on feature branch |
| UI-04 | component | AC-01/02/06 | Action list, create/edit modes, follow-up field, read-only Requester mode | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned; execute on feature branch |
| UI-05 | component | AC-05/06 | dashboard loading, success, empty, failure, forbidden, retry, drill-down, role navigation states | `client/tests/lab-04/RequesterDashboard.test.tsx`, `client/tests/lab-04/StaffDashboard.test.tsx` | Planned; execute on feature branch |
| UI-06 | component | AC-04/07 | resolution prerequisite and permitted transition feedback | `client/tests/lab-04/TicketWorkflow.test.tsx` | Planned; execute on feature branch |
| E2E-04 | E2E | AC-01-06 | Staff/Admin action lifecycle, Requester read-only visibility, dashboard drill-down | `e2e/lab-04/actions-taken-flow.spec.ts`, `e2e/lab-04/dashboards.spec.ts`, `e2e/lab-04/ticket-resolution.spec.ts` | Planned/Pending; run on the integrated Feature/Final Integration branch |
| RESP-04 | responsive/accessibility | AC-06 | desktop/tablet/mobile dashboard and Actions Taken layout, focus, labels, no page overflow | `e2e/lab-04/responsive.spec.ts` | Planned |
| REG-04 | regression | AC-07 | all Lab 1-3 server/client suites, migration/seed, build, existing E2E | existing Lab 1-3 files and final verification record | Planned/Pending; run and record evidence in Feature/Final Integration |

Required final evidence includes passing output from unit/API/integration/UI/E2E/responsive/performance-smoke/regression checks, rendered Spec DD documents, migration and seed output, screenshots at desktop/tablet/mobile widths, and a console/diff scan showing no unfinished controls or unsafe error leakage.

## Performance-smoke definition

`PERF-04` is a repeatable smoke guard, not a production benchmark. Against the deterministic local seed, issue 10 sequential requests for each dashboard endpoint and the relevant Action Taken list endpoint. The test must verify that queries return concise bounded lists, do not load an entire Ticket collection into the response, and complete each request within 1 second in the configured local environment. Record request count, maximum duration, and failure count. A slower shared or CI environment is reported as evidence rather than silently changing the threshold.

## Labsheet-required paths

The following paths intentionally match the Lab 4 handout and must be created or renamed on the later feature branches:

- Server: `actions-taken.api.test.ts`, `ticket-workflow.api.test.ts`, `requester-dashboard.api.test.ts`, and `staff-dashboard.api.test.ts`.
- Client: `StaffDashboard.test.tsx`, `RequesterDashboard.test.tsx`, `ActionsTaken.test.tsx`, and `TicketWorkflow.test.tsx`.
- E2E: `actions-taken-flow.spec.ts`, `ticket-resolution.spec.ts`, `dashboards.spec.ts`, and the responsive evidence suite.
