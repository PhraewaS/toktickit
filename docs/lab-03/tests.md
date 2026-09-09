# Test DD และ Traceability ของ TokTickIT Lab 3

แผนนี้จัดทำขึ้นพร้อมกับ Sprint 3 contract ก่อนเริ่ม Lab 3 implementation โดยจัดกลุ่ม tests ตามความเสี่ยงและเชื่อมโยงกับ acceptance criteria

| Test ID | Type | AC | สิ่งที่ทดสอบ | Automated test file | สถานะ |
|---|---|---|---|---|---|
| API-01 | API | AC-01/02 | valid, invalid และ inactive login รวมถึง safe response | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-02 | API | AC-03/04 | first-login gate, `PASSWORD_CHANGE_REQUIRED` บน protected routes, password change และ logout | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-03 | API/security | AC-05/06 | authenticated requester ownership และ forbidden routes | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-03a | API/security | AC-09/15 | Administrator owner/priority permissions; Administrator mutation denial; non-Administrator Admin-route denial; retired Development Requester route | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-04 | API | AC-07 | queue query filters, sort และ pagination | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| API-05 | API | AC-08 | assignment, priority และ status matrix | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-05a | API/security | AC-08 | Administrator เป็น owner และ update IT Priority ได้; บังคับใช้ assignment/status/comment/note permissions; ทดสอบทุก allowed และ denied status transition | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-05b | API | AC-10 | Requester resolved endpoint: success, idempotency, formal status ไม่เปลี่ยน, validation, ownership, role, session, first-login gate และ persistence errors | `server/tests/lab-03/requester-ticket.api.test.ts` | Planned |
| API-06 | API/security | AC-09 | Requester own-ticket Public Comments, staff comments/notes, visibility และ append-only validation | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| API-07 | API | AC-11 | admin list/search/filter/create/edit/deactivate/reset และ safety rules | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-07a | API/security | AC-11 | deactivate revokes target sessions; next request with the old session returns `401 SESSION_INVALID`; malformed fields return `400 VALIDATION_ERROR`; valid state conflicts return `409 DUPLICATE_EMAIL` or `409 USER_UPDATE_CONFLICT` | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-08 | migration/regression | AC-05/12 | Lab 2 rows/tickets/attachments อยู่รอดหลัง migration และ seed reruns | `server/tests/lab-03/migration-regression.api.test.ts` | Planned |
| UNIT-01 | unit/security | AC-01/03 | password hashing, password rules, session parsing และ transitions | `server/tests/lab-03/auth.unit.test.ts` | Planned |
| UI-01 | component | AC-01/02/13 | Login validation, busy, failure และ inactive-safe state | `client/tests/lab-03/Login.test.tsx` | Planned |
| UI-02 | component | AC-03 | mandatory password change และ continuation | `client/tests/lab-03/ChangePassword.test.tsx` | Planned |
| UI-03 | component | AC-07/13 | queue filters, empty/no-results, forbidden และ failure | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Planned |
| UI-04 | component | AC-08/09/10/13 | staff detail operations, comments, notes และ validation | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Planned |
| UI-05 | component | AC-11/13 | admin list/create/edit/reset และ safety feedback | `client/tests/lab-03/UserManagement.test.tsx` | Planned |
| UI-06a | regression | AC-05/13 | requester create flow ยังใช้ได้หลัง authenticated shell | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-06b | regression | AC-05/13 | requester ticket list ยังใช้ได้หลัง authenticated shell | `client/tests/lab-02/MyTickets.test.tsx` | Planned |
| UI-06c | regression | AC-05/13 | requester ticket detail และ ownership-safe states ยังใช้ได้ | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Planned |
| UI-06d | regression | AC-05/13 | requester attachment controls ยังใช้ได้ | `client/tests/lab-02/AttachmentSection.test.tsx` | Planned |
| UI-06e | regression | AC-05/13/14 | requester accessibility regression | `client/tests/lab-02/accessibility.test.tsx` | Planned |
| UI-06f | regression | AC-14 | requester visual token regression | `client/tests/lab-02/ZenGreenStyle.test.tsx` | Planned |
| UI-06g | regression | AC-05/15 | authenticated Lab 3 client ไม่ render หรือเรียก Development Requester selector | `client/tests/lab-03/NoDevelopmentRequesterSelector.test.tsx` | Planned |
| API-09 | API/security | AC-01/04/12 | expired/invalid session ถูกปฏิเสธบน current-user และ protected routes | `server/tests/lab-03/auth.api.test.ts` | Planned |
| STYLE-01 | UI style | AC-14 | Zen Green tokens, badges, focus และ read-only styling | `client/tests/lab-03/ZenGreenStyle.test.tsx` | Planned |
| RESP-01 | responsive | AC-14 | desktop/tablet/mobile ไม่มี page overflow | `e2e/lab-03/responsive.spec.ts` | Planned |
| E2E-01 | E2E | AC-01-06 | login, first-login, logout และ requester regression | `e2e/lab-03/authentication.spec.ts` | Planned |
| E2E-02 | E2E | AC-07-10 | staff queue/detail workflow | `e2e/lab-03/staff-ticket-flow.spec.ts` | Planned |
| E2E-03 | E2E | AC-11 | admin workflow และ next-login password change | `e2e/lab-03/user-administration.spec.ts` | Planned |
| E2E-04 | E2E regression | AC-05/10/15 | existing requester ticket flow, resolved indication และไม่มี development requester selector | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |

Final evidence ต้องบันทึก commands, test output, responsive screenshots, accessibility/style inspection และ final-main provenance ห้าม skip หรือ disable tests ที่จำเป็น Authorization cases ต้องเป็น explicit test cases ไม่ใช่มีเพียง documentation rows โดยต้องครอบคลุม: Requester Public Comment GET/POST ต้องสำเร็จเฉพาะ ticket ของ Requester เอง; การเข้าถึง comment ของผู้อื่นต้อง assert safe `404`; Requester resolved ต้อง assert `200` response shape, idempotency, formal status ที่ไม่เปลี่ยน และกรณี `400/401/403/404/500` ทั้งหมด; first-login-gated session ต้อง assert `403 PASSWORD_CHANGE_REQUIRED` บน representative protected requester, staff และ admin routes ขณะที่ auth exceptions ทั้งสามยังใช้ได้; Administrator owner eligibility และ IT Priority update ต้อง assert success; Administrator assignment/status/comment/note mutations ต้อง assert `403 ROLE_FORBIDDEN`; Administrator deactivation ต้อง assert target sessions ถูก revoke และ old-session request ถัดไปตอบ `401 SESSION_INVALID`; malformed admin update fields ต้อง assert `400 VALIDATION_ERROR`; valid duplicate/state conflicts ต้อง assert `409 DUPLICATE_EMAIL`/`409 USER_UPDATE_CONFLICT`; non-Administrator Admin routes ต้อง assert `403 ROLE_FORBIDDEN`; missing และ invalid sessions ต้อง assert `401`; และ complete BR-10 transition table ต้อง assert ทั้ง allowed และ denied transitions

Final report ต้องระบุ command ที่ใช้จริงและ file path ของทุกไฟล์ที่ execute ห้ามใช้ wildcard path เป็น evidence Regression entries ใช้ explicit paths ตาม UI-06a ถึง UI-06g และ E2E-04 ส่วน renamed Lab 2 files และไฟล์ใหม่สำหรับ Lab 3 selector-retirement ยังคงเป็น `Planned` จนกว่าไฟล์ชื่อดังกล่าวจะมีอยู่จริงและถูก execute จึงจะเปลี่ยนเป็น `Pass` ได้ หากยังไม่มีไฟล์หรือไม่มีผลรันจริง ให้ใช้ `Planned` หรือ `Required`
