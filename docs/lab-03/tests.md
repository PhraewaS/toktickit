# TokTickIT Lab 3 Test DD and Traceability

This plan was created with the Sprint 3 contract before the Lab 3 implementation. Tests are grouped by risk and map to the acceptance criteria.

| Test ID | Type | AC | What it tests | Automated test file | Status |
|---|---|---|---|---|---|
| API-01 | API | AC-01/02 | valid, invalid, inactive login and safe response | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-02 | API | AC-03/04 | first-login gate, password change, logout | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-03 | API/security | AC-05/06 | authenticated requester ownership and forbidden routes | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| API-03a | API/security | AC-09/15 | Administrator read-only ticket visibility; Administrator mutation denial; non-Administrator Admin-route denial; retired Development Requester route | `server/tests/lab-03/authorization.api.test.ts` | Required |
| API-04 | API | AC-07 | queue query filters, sort, pagination | `server/tests/lab-03/staff-queue.api.test.ts` | Pass |
| API-05 | API | AC-08/10 | assignment, priority, status matrix, resolved indication | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| API-05a | API/security | AC-08 | every allowed and denied status transition, including Administrator denial | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Required |
| API-06 | API/security | AC-09 | public versus internal visibility and append-only validation | `server/tests/lab-03/comments-notes.api.test.ts` | Pass |
| API-07 | API | AC-11 | admin list/search/filter/create/edit/reset/safety rules | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| API-08 | migration/regression | AC-05/12 | Lab 2 rows/tickets/attachments survive migration and seed reruns | `server/tests/lab-03/migration-regression.api.test.ts` | Pass |
| UNIT-01 | unit/security | AC-01/03 | password hashing, password rules, session parsing, transitions | `server/tests/lab-03/auth.unit.test.ts` | Pass |
| UI-01 | component | AC-01/02/13 | Login validation, busy, failure, inactive-safe state | `client/tests/lab-03/Login.test.tsx` | Pass |
| UI-02 | component | AC-03 | mandatory password change and continuation | `client/tests/lab-03/ChangePassword.test.tsx` | Pass |
| UI-03 | component | AC-07/13 | queue filters, empty/no-results, forbidden/failure | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Pass |
| UI-04 | component | AC-08/09/10/13 | staff detail operations, comments, notes, validation | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Pass |
| UI-05 | component | AC-11/13 | admin list/create/edit/reset/safety feedback | `client/tests/lab-03/UserManagement.test.tsx` | Pass |
| UI-06a | regression | AC-05/13 | requester create flow remains available after authenticated shell | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| UI-06b | regression | AC-05/13 | requester ticket list remains available after authenticated shell | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| UI-06c | regression | AC-05/13 | requester ticket detail and ownership-safe states remain available | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Pass |
| UI-06d | regression | AC-05/13 | requester attachment controls remain available | `client/tests/lab-02/AttachmentSection.test.tsx` | Pass |
| UI-06e | regression | AC-05/13/14 | requester accessibility regression | `client/tests/lab-02/Accessibility.test.tsx` | Pass |
| UI-06f | regression | AC-14 | requester visual token regression | `client/tests/lab-02/ZenGreenStyles.test.tsx` | Pass |
| API-09 | API/security | AC-01/04/12 | expired/invalid session is rejected on current-user and protected routes | `server/tests/lab-03/auth.api.test.ts` | Required |
| STYLE-01 | UI style | AC-14 | Zen Green tokens, badges, focus and read-only styling | `client/tests/lab-03/ZenGreenStyles.test.tsx` | Pass |
| RESP-01 | responsive | AC-14 | desktop/tablet/mobile no page overflow | `e2e/lab-03/responsive.spec.ts` | Planned |
| E2E-01 | E2E | AC-01-06 | login, first-login, logout, requester regression | `e2e/lab-03/authentication.spec.ts` | Planned |
| E2E-02 | E2E | AC-07-10 | staff queue/detail workflow | `e2e/lab-03/staff-ticket-flow.spec.ts` | Planned |
| E2E-03 | E2E | AC-11 | admin workflow and next-login password change | `e2e/lab-03/user-administration.spec.ts` | Planned |

Final evidence must record commands, test output, responsive screenshots, accessibility/style inspection, and final-main provenance. Required tests must not be skipped or disabled. Authorization cases must be explicit test cases, not only documentation rows: Requester and IT Staff calling Administrator routes must assert `403 ROLE_FORBIDDEN`; Administrator GET staff queue/detail/comments/notes must assert success; Administrator staff mutations must assert `403 ROLE_FORBIDDEN`; missing and invalid sessions must assert `401`; and the complete BR-10 transition table must assert both allowed and denied transitions. The final report must list the exact command and each file path actually executed; no wildcard path is acceptable as evidence.
