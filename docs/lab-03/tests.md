# TokTickIT Lab 3 Test DD and Traceability

This plan was created with the Sprint 3 contract before the Lab 3 implementation. Tests are grouped by risk and map to the acceptance criteria.

| Test ID | Type | AC | What it tests | Automated test file | Status |
|---|---|---|---|---|---|
| API-01 | API | AC-01/02 | valid, invalid, inactive login and safe response | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-02 | API | AC-03/04 | first-login gate, `PASSWORD_CHANGE_REQUIRED` on protected routes, password change, logout | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-03 | API/security | AC-05/06 | authenticated requester ownership and forbidden routes | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-03a | API/security | AC-09/15 | Administrator owner/priority permissions; Administrator mutation denial; non-Administrator Admin-route denial; retired Development Requester route | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-04 | API | AC-07 | queue query filters, sort, pagination | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| API-05 | API | AC-08 | assignment, priority, and status matrix | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-05a | API/security | AC-08 | Administrator may be owner and update IT Priority; assignment/status/comment/note permissions are enforced; every allowed and denied status transition | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-05b | API | AC-10 | Requester resolved endpoint success, idempotency, unchanged formal status, validation, ownership, role, session, first-login gate, and persistence errors | `server/tests/lab-03/requester-ticket.api.test.ts` | Planned |
| API-06 | API/security | AC-09 | Requester own-ticket Public Comments, staff comments/notes, visibility, and append-only validation | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| API-07 | API | AC-11 | admin list/search/filter/create/edit/reset/safety rules | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-08 | migration/regression | AC-05/12 | Lab 2 rows/tickets/attachments survive migration and seed reruns | `server/tests/lab-03/migration-regression.api.test.ts` | Planned |
| UNIT-01 | unit/security | AC-01/03 | password hashing, password rules, session parsing, transitions | `server/tests/lab-03/auth.unit.test.ts` | Planned |
| UI-01 | component | AC-01/02/13 | Login validation, busy, failure, inactive-safe state | `client/tests/lab-03/Login.test.tsx` | Planned |
| UI-02 | component | AC-03 | mandatory password change and continuation | `client/tests/lab-03/ChangePassword.test.tsx` | Planned |
| UI-03 | component | AC-07/13 | queue filters, empty/no-results, forbidden/failure | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Planned |
| UI-04 | component | AC-08/09/10/13 | staff detail operations, comments, notes, validation | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Planned |
| UI-05 | component | AC-11/13 | admin list/create/edit/reset/safety feedback | `client/tests/lab-03/UserManagement.test.tsx` | Planned |
| UI-06a | regression | AC-05/13 | requester create flow remains available after authenticated shell | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-06b | regression | AC-05/13 | requester ticket list remains available after authenticated shell | `client/tests/lab-02/MyTickets.test.tsx` | Planned |
| UI-06c | regression | AC-05/13 | requester ticket detail and ownership-safe states remain available | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Planned |
| UI-06d | regression | AC-05/13 | requester attachment controls remain available | `client/tests/lab-02/AttachmentSection.test.tsx` | Planned |
| UI-06e | regression | AC-05/13/14 | requester accessibility regression | `client/tests/lab-02/Accessibility.test.tsx` | Planned |
| UI-06f | regression | AC-14 | requester visual token regression | `client/tests/lab-02/ZenGreenStyles.test.tsx` | Planned |
| UI-06g | regression | AC-05/15 | legacy requester selector is not rendered or used by the authenticated Lab 3 client | `client/tests/lab-02/RequesterSelection.test.tsx` | Planned |
| API-09 | API/security | AC-01/04/12 | expired/invalid session is rejected on current-user and protected routes | `server/tests/lab-03/auth.api.test.ts` | Planned |
| STYLE-01 | UI style | AC-14 | Zen Green tokens, badges, focus and read-only styling | `client/tests/lab-03/ZenGreenStyles.test.tsx` | Planned |
| RESP-01 | responsive | AC-14 | desktop/tablet/mobile no page overflow | `e2e/lab-03/responsive.spec.ts` | Planned |
| E2E-01 | E2E | AC-01-06 | login, first-login, logout, requester regression | `e2e/lab-03/authentication.spec.ts` | Planned |
| E2E-02 | E2E | AC-07-10 | staff queue/detail workflow | `e2e/lab-03/staff-ticket-flow.spec.ts` | Planned |
| E2E-03 | E2E | AC-11 | admin workflow and next-login password change | `e2e/lab-03/user-administration.spec.ts` | Planned |
| E2E-04 | E2E regression | AC-05/10/15 | existing requester ticket flow, resolved indication, and absence of the development requester selector | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |

Final evidence must record commands, test output, responsive screenshots, accessibility/style inspection, and final-main provenance. Required tests must not be skipped or disabled. Authorization cases must be explicit test cases, not only documentation rows: Requester Public Comment GET/POST must succeed only for the Requester's own ticket; Requester access to another user's comment must assert safe `404`; Requester resolved must assert the `200` response shape, idempotency, unchanged formal status, and all listed `400/401/403/404/500` cases; a first-login-gated session must assert `403 PASSWORD_CHANGE_REQUIRED` on representative protected requester, staff, and admin routes while the three auth exceptions remain available; Administrator owner eligibility and IT Priority update must assert success; Administrator assignment/status/comment/note mutations must assert `403 ROLE_FORBIDDEN`; non-Administrator Admin routes must assert `403 ROLE_FORBIDDEN`; missing and invalid sessions must assert `401`; and the complete BR-10 transition table must assert both allowed and denied transitions. The final report must list the exact command and each file path actually executed; no wildcard path is acceptable as evidence. Existing Lab 2 regression paths are the concrete files listed in UI-06a through UI-06g and E2E-04. A row may be marked `Pass` only after the referenced file exists and the final command output is recorded; otherwise use `Planned` or `Required`.
