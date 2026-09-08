# TokTickIT Lab 3 Test DD and Traceability

This plan was created with the Sprint 3 contract before the Lab 3 implementation. Tests are grouped by risk and map to the acceptance criteria.

| Test ID | Type | AC | What it tests | Automated test file | Status |
|---|---|---|---|---|---|
| API-01 | API | AC-01/02 | valid, invalid, inactive login and safe response | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-02 | API | AC-03/04 | first-login gate, password change, logout | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-03 | API/security | AC-05/06 | authenticated requester ownership and forbidden routes | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| API-04 | API | AC-07 | queue query filters, sort, pagination | `server/tests/lab-03/staff-queue.api.test.ts` | Pass |
| API-05 | API | AC-08/10 | assignment, priority, status matrix, resolved indication | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| API-06 | API/security | AC-09 | public versus internal visibility and append-only validation | `server/tests/lab-03/comments-notes.api.test.ts` | Pass |
| API-07 | API | AC-11 | admin list/search/filter/create/edit/reset/safety rules | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| API-08 | migration/regression | AC-05/12 | Lab 2 rows/tickets/attachments survive migration and seed reruns | `server/tests/lab-03/migration-regression.api.test.ts` | Pass |
| UNIT-01 | unit/security | AC-01/03 | password hashing, password rules, session parsing, transitions | `server/tests/lab-03/auth.unit.test.ts` | Pass |
| UI-01 | component | AC-01/02/13 | Login validation, busy, failure, inactive-safe state | `client/tests/lab-03/Login.test.tsx` | Pass |
| UI-02 | component | AC-03 | mandatory password change and continuation | `client/tests/lab-03/ChangePassword.test.tsx` | Pass |
| UI-03 | component | AC-07/13 | queue filters, empty/no-results, forbidden/failure | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Pass |
| UI-04 | component | AC-08/09/10/13 | staff detail operations, comments, notes, validation | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Pass |
| UI-05 | component | AC-11/13 | admin list/create/edit/reset/safety feedback | `client/tests/lab-03/UserManagement.test.tsx` | Pass |
| UI-06 | regression | AC-05/13 | authenticated requester screens keep Lab 2 behavior | `client/tests/lab-02/*.test.tsx` | Pass |
| STYLE-01 | UI style | AC-14 | Zen Green tokens, badges, focus and read-only styling | `client/tests/lab-03/ZenGreenStyles.test.tsx` | Pass |
| RESP-01 | responsive | AC-14 | desktop/tablet/mobile no page overflow | `e2e/lab-03/responsive.spec.ts` | Planned |
| E2E-01 | E2E | AC-01-06 | login, first-login, logout, requester regression | `e2e/lab-03/authentication.spec.ts` | Planned |
| E2E-02 | E2E | AC-07-10 | staff queue/detail workflow | `e2e/lab-03/staff-ticket-flow.spec.ts` | Planned |
| E2E-03 | E2E | AC-11 | admin workflow and next-login password change | `e2e/lab-03/user-administration.spec.ts` | Planned |

Final evidence must record commands, test output, responsive screenshots, accessibility/style inspection, and final-main provenance. Required tests must not be skipped or disabled.
