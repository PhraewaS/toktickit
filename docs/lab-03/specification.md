# TokTickIT Lab 3 Sprint 3 Engineering Contract

สถานะ: implementation contract สำหรับ Lab 3 increment

## 1. เป้าหมายของ Sprint

แทนที่ development requester selector ของ Lab 2 ด้วย secure account authentication และ role-based access โดยรักษา requester ticketing และ attachments ไว้ เพิ่ม workflow แรกสำหรับ IT Staff และ minimalist Administrator user-management screen โดยใช้ Zen Green language เดิม

## 2. ความต้องการของผู้มีส่วนได้ส่วนเสีย

ผู้ใช้ sign in ด้วย email และ password โดย initial password จะบังคับให้เปลี่ยน password ก่อนเข้าใช้งาน Requester ยังคงสร้างและจัดการได้เฉพาะ ticket ของตนเอง IT Staff จัดการ shared queue และ ticket detail ส่วน Administrator จัดการบัญชีผู้ใช้โดยไม่มี deletion หรือ advanced identity-management features

## 3. ขอบเขต

รวม: cookie-backed sessions, logout, current-user retrieval, first-login password change, บัญชีสาม role แบบ single-role, การย้ายข้อมูล Lab 2 requester records, requester regression, ticket ownership และ IT priority, permitted status workflow, Public Comments, Internal Notes, IT Staff queue/detail และ minimalist Administrator user management

ไม่รวม: invitations, email หรือ social login, MFA/SSO, self-registration, password-reset email, Actions Taken, SLA/escalation/notifications, dashboards/KPIs, multi-tenancy, departments, multiple roles, user deletion/bulk/import/export, account history และ production deployment changes

## 4. Functional requirements

- FR-01: active user ที่มี credentials ถูกต้องสามารถ log in; inactive users และ invalid credentials ได้รับ safe failures
- FR-02: session ระบุ authenticated user ฝั่ง server; logout ทำให้ session ใช้ไม่ได้ และไม่สามารถใช้ normal routes ต่อได้
- FR-03: user ที่มี `mustChangePassword` ไม่สามารถเข้า normal application routes จนกว่าจะบันทึก password ใหม่ที่ถูกต้อง
- FR-04: shell แสดงชื่อและ role ของ authenticated user และแสดงเฉพาะ navigation ที่ได้รับอนุญาต
- FR-05: Requester ticket และ attachment APIs derive ownership จาก authenticated Requester ไม่ใช่ client requester ID
- FR-06: Requester สร้าง ticket, ดู list/detail ของ ticket ตนเอง, upload/download/remove attachments ที่อนุญาต, post Public Comments และระบุว่าปัญหาอาจได้รับการแก้ไขแล้วได้
- FR-07: IT Staff เรียกดู queue ที่ค้นหา/filter/sort/paginate ได้ และเปิด ticket detail ได้ Administrator เรียกดู ticket views เดียวกันเพื่อ oversight และแก้ IT Priority ได้ แต่ไม่สามารถทำ Staff operations อื่น ๆ
- FR-08: IT Staff assign/reassign ownership, ตั้ง IT Priority, ทำ permitted status transitions, post Public Comments และสร้าง Internal Notes ได้ Administrator อาจถูกเลือกเป็น Ticket Owner และแก้ IT Priority ได้ แต่ห้าม assign/reassign, เปลี่ยน status หรือเพิ่ม staff-side comments/notes
- FR-09: Requester retrieve/create Public Comments ได้เฉพาะ ticket ของตนเอง IT Staff และ Administrator retrieve Public Comments และ Internal Notes ของ ticket ที่มองเห็นได้ และมีเพียง IT Staff ที่ append staff-side comments/notes ได้
- FR-10: Administrator list/search/filter users, create users, edit name/email/role/activation และตั้ง initial password ใหม่ได้
- FR-11: User management ปฏิเสธ invalid roles และ duplicate emails, ป้องกัน self-deactivation และรักษา active Administrator อย่างน้อยหนึ่งคน เมื่อ deactivate user สำเร็จต้อง revoke sessions เดิมของ user คนนั้นทั้งหมด
- FR-12: protected operations ทุกตัวบังคับใช้ authorization ฝั่ง server และส่ง safe, distinguishable errors

## 5. Business rules

- BR-01: เฉพาะ active user ที่มี credentials ถูกต้องเท่านั้นที่ authenticate ได้
- BR-02: initial-password users เรียกได้เฉพาะ `GET /auth/me`, `POST /auth/logout` และ `POST /auth/change-password` จนกว่าจะเปลี่ยน password protected route อื่นตอบ `403 PASSWORD_CHANGE_REQUIRED` หลัง session authentication และก่อน route-specific ownership หรือ role checks เมื่อเปลี่ยน password สำเร็จ `mustChangePassword` จะถูกล้าง; missing หรือ invalid sessions ยังคงตอบ `401`
- BR-03: password เก็บเป็น salted scrypt hashes เท่านั้น; plaintext passwords ไม่เข้า response หรือ database
- BR-04: sessions เป็น opaque, hashed-at-rest, HttpOnly, SameSite=Lax cookies ที่มี bounded expiry
- BR-05: authenticated Requester identity เป็นตัวกำหนด ticket ownership; supplied requester IDs จะถูกละเลยใน authenticated routes
- BR-06: Requester ticket และ attachment access ต้องตรวจ ownership; protected resource ของผู้อื่นใช้ safe 404 เดียวกับ resource ที่ไม่มีอยู่
- BR-07: Ticket มี primary owner ได้ศูนย์หรือหนึ่งคน และ owner ต้องเป็น active IT Staff หรือ Administrator เท่านั้น เฉพาะ IT Staff assign, reassign หรือ unassign owner ได้; Administrator อาจเป็น selected owner แต่ทำ assignment operations ไม่ได้
- BR-08: Requested Priority เป็น requester input ที่แก้ไม่ได้; IT Priority เริ่มต้นด้วยค่าดังกล่าว และ IT Staff หรือ Administrator เปลี่ยนผ่าน authorized priority operation ได้
- BR-09: Ticket statuses คือ `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED` และ `CANCELLED`
- BR-10: IT Staff transition ได้ดังนี้ `NEW -> OPEN`, `OPEN -> IN_PROGRESS|WAITING_FOR_REQUESTER|CANCELLED`, `IN_PROGRESS -> WAITING_FOR_REQUESTER|RESOLVED|CANCELLED`, `WAITING_FOR_REQUESTER -> IN_PROGRESS|RESOLVED|CANCELLED`, `RESOLVED -> CLOSED|REOPENED` และ `CLOSED -> REOPENED` ส่วน no-op และ transition อื่นให้เป็น conflict
- BR-11: Requester ระบุว่าปัญหาอาจได้รับการแก้ไขแล้วได้ แต่ไม่สามารถตั้ง formal Resolved หรือ Closed status
- BR-12: Comments และ notes เป็น append-only, backend-authored, trimmed, non-empty และจำกัด 5,000 ตัวอักษร Requester retrieve/create Public Comments ได้เฉพาะ ticket ของตนเอง Public Comments มองเห็นได้ตาม ticket visibility; Internal Notes มองเห็นแบบ read-only โดย IT Staff และ Administrator เฉพาะ IT Staff สร้าง staff-side Public Comments หรือ Internal Notes ได้ Administrator append, edit หรือ delete ไม่ได้
- BR-13: User email unique แบบ case-insensitive และ user แต่ละคนมี permitted role เพียงหนึ่ง role
- BR-14: New และ reset initial passwords ตั้ง `mustChangePassword=true`
- BR-15: Administrator ห้าม deactivate account ของตนเอง หรือ deactivate/remove active Administrator คนสุดท้าย Users ถูก deactivated แต่ไม่ถูก deleted เมื่อ account ถูก deactivate ระบบต้อง revoke sessions เดิมของ user ทั้งหมด และ request ถัดไปจาก session เดิมต้องตอบ `401 SESSION_INVALID`
- BR-16: Seed data deterministic และ idempotent มี active Requesters อย่างน้อยสี่คน, inactive Requester หนึ่งคน, active IT Staff สามคน, inactive IT Staff หนึ่งคน, active Administrator หนึ่งคน พร้อม tickets, comments และ notes ที่สมจริง
- BR-17: invalid input, unauthenticated access, forbidden access, missing resources, conflicts และ unexpected failures ใช้ safe distinct status/error codes legacy Development Requester route ไม่ใช่ production API และตอบ `410 DEVELOPMENT_REQUESTERS_RETIRED` ใน production ไม่ว่า environment flags จะเป็นอย่างไร จะเปิดได้เฉพาะ non-production regression หรือ migration tooling ที่มี explicit compatibility context

## 6. Authorization matrix

| Operation | Requester | IT Staff | Administrator |
|---|---:|---:|---:|
| Login/logout/current user/password change | ได้ | ได้ | ได้ |
| Create/list/detail own tickets and attachments | เฉพาะของตนเอง | ไม่ได้ | ไม่ได้ |
| Requester resolved indication | เฉพาะของตนเอง | ไม่ได้ | ไม่ได้ |
| Staff queue/detail | ไม่ได้ | ได้ | ได้, read-only ยกเว้น IT Priority update |
| Staff assignment/reassignment | ไม่ได้ | ได้ | ไม่ได้ |
| IT Priority update | ไม่ได้ | ได้ | ได้ |
| Staff status transition | ไม่ได้ | ได้ | ไม่ได้ |
| Public Comments retrieve/create | เฉพาะ ticket ของตนเอง | Ticket ที่มองเห็นได้ | Retrieve เท่านั้น |
| Internal Notes retrieve/create | ไม่ได้ | ได้ | Retrieve เท่านั้น |
| Ticket Owner eligibility | ไม่ได้ | ได้ | ได้ |
| User list/create/edit/reset password | ไม่ได้ | ไม่ได้ | ได้ |

Backend เป็นผู้มีอำนาจตัดสินใจสุดท้าย; การซ่อน UI เป็นเพียง usability feedback

## 7. Data และ migration decisions

ปรับ `requester_users` table ของ Lab 2 ให้เป็น account table โดยคง existing IDs และ Ticket foreign keys ไว้ เพิ่ม `passwordHash`, `role`, `mustChangePassword` และ login timestamps ให้ Existing Requester rows รับ deterministic local-only initial passwords และคง active/inactive state เดิม Tickets เพิ่ม nullable `ownerId`, `itPriority` และ `requesterResolvedAt`; ค่า IT Priority เดิม backfill จาก Requested Priority ส่วน Comment และ Internal Note tables เป็น additive Session rows เก็บเฉพาะ hash ของ opaque cookie token และ indexes ครอบคลุม active role/name, ticket queue status/priority/owner/updated time และ comment/note ticket ordering

## 8. API summary

Base path คือ `/api`; JSON ใช้ `{data}` และ errors ใช้ `{error:{code,message,fields?}}` Authentication ใช้ HttpOnly `toktickit_session` cookie Sessions หมดอายุหลังแปดชั่วโมง และ logout ลบ server session พร้อมล้าง cookie

Authentication: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password` ระหว่าง first-login gate อนุญาตเฉพาะ `GET /auth/me`, `POST /auth/logout` และ `POST /auth/change-password`; protected route อื่นทั้งหมดตอบ `403 PASSWORD_CHANGE_REQUIRED` โดยไม่ทำ operation ปกติ

Requester-compatible routes ยังคงอยู่ที่ `/tickets`, `/tickets/:id`, attachment routes และเพิ่ม `POST/GET /tickets/:id/comments` กับ `POST /tickets/:id/resolved`

Requester comment routes: `GET/POST /tickets/:id/comments` ใช้ได้กับ authenticated Requester เฉพาะเมื่อ ticket เป็นของ Requester คนนั้น; GET ตอบ `200`, POST ตอบ `201`, invalid content ตอบ `400`, missing/invalid session ตอบ `401` และ ticket ของผู้อื่น/ไม่มีอยู่ตอบ safe `404`

`POST /tickets/:id/resolved` รับ empty JSON object `{}` และเป็น idempotent สำหรับ authenticated Requester ที่เป็นเจ้าของ ticket ตอบ `200 {data:{ticketId,requesterResolvedAt,currentStatus}}`, ตั้ง resolved indication และไม่เปลี่ยน `currentStatus` invalid ticket IDs หรือ malformed/unexpected request fields ตอบ `400`; missing/invalid sessions ตอบ `401`; ticket ของผู้อื่น/ไม่มีอยู่ตอบ safe `404`; non-Requester roles ตอบ `403 ROLE_FORBIDDEN`; first-login-gated session ตอบ `403 PASSWORD_CHANGE_REQUIRED` ก่อน route-specific validation, ownership หรือ role checks; unexpected failures ตอบ `500 INTERNAL_ERROR`

Staff routes: `GET /staff/tickets`, `GET /staff/tickets/:id`, `GET /staff/tickets/:id/comments` และ `GET /staff/tickets/:id/notes` ใช้ได้กับ IT Staff และ Administrator ในฐานะ read operations `PATCH /staff/tickets/:id/priority` ใช้ได้กับ IT Staff และ Administrator ส่วน `POST /staff/tickets/:id/assignment`, `PATCH /staff/tickets/:id/status`, `POST /staff/tickets/:id/comments` และ `POST /staff/tickets/:id/notes` เป็น IT Staff-only operations Assignment รับ active IT Staff หรือ Administrator เป็น owner ได้ แต่ผู้ทำ assignment ต้องเป็น IT Staff

Administrator routes: `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id` และ `POST /admin/users/:id/initial-password`

Authentication failures เป็น `401`; forbidden role/ownership เป็น `403` หรือ safe `404` ตามที่ระบุ; invalid input เป็น `400`; duplicate/state conflicts เป็น `409`; retired compatibility access เป็น `410`; unexpected failures เป็น `500` โดยไม่มี SQL, stack, path, hash หรือ secret detail `LAB2_COMPATIBILITY_MODE=true` ใช้ได้เฉพาะ non-production migration/regression process และต้องถูก reject หรือ ignore เมื่อ `NODE_ENV=production`

## 9. Acceptance criteria

- AC-01: valid active credentials สร้าง session และคืน safe user identity กับ role
- AC-02: invalid credentials และ inactive users ได้รับ safe failures และไม่มี session
- AC-03: initial-password login block normal routes จนกว่าจะเปลี่ยน password สำเร็จ
- AC-04: logout invalidate access และการเรียก normal-route โดยตรงหลังจากนั้นล้มเหลว
- AC-05: Requester create/list/detail/attachment behavior ยังคงทำงานด้วย authenticated identity เท่านั้น
- AC-06: Requester เข้า ticket, attachment, Internal Note หรือ staff/admin routes ของผู้อื่นไม่ได้
- AC-07: IT Staff queue รองรับ search, filters, sorting, pagination, ownership, status และ priority data
- AC-08: IT Staff assign/reassign ให้ active IT Staff หรือ Administrator, update IT Priority, ทำ permitted status transitions และ append comments/notes ได้ Administrator update IT Priority และถูก assign เป็น owner ได้ แต่ assignment/status/comment/note mutations ของ Administrator ต้องตอบ `403 ROLE_FORBIDDEN`
- AC-09: Requester อ่าน/สร้าง Public Comments ได้เฉพาะ ticket ของตนเอง IT Staff และ Administrator อ่าน staff-visible Public Comments และ Internal Notes ตาม matrix ได้ Administrator เป็น read-only ในส่วนอื่น และ Internal Notes ไม่ปรากฏใน Requester responses
- AC-10: Requester resolved indication ใช้ได้โดยไม่เปลี่ยน formal status
- AC-11: Administrator list/search/filter/create/edit/deactivate/reset users ตาม safety rules ได้ การ deactivate ต้อง revoke sessions เดิมของ target และ request ถัดไปด้วย session เดิมต้องตอบ `401 SESSION_INVALID`
- AC-12: Seed และ migration รักษา Lab 2 tickets/attachments และ rerun ได้อย่างปลอดภัย
- AC-13: หน้าจอที่จำเป็นมี loading, saving, validation, success, empty/no-results, forbidden, not-found, conflict และ safe failure feedback ตามความเหมาะสม
- AC-14: หน้าจอหลักพอดีกับ desktop, tablet และ mobile พร้อม keyboard-visible focus และไม่มี horizontal page overflow
- AC-15: production client ไม่เรียกหรือแสดง Development Requester selector `GET /development-requesters` ตอบ `410 DEVELOPMENT_REQUESTERS_RETIRED` ใน production แม้ `LAB2_COMPATIBILITY_MODE=true`; เปิดได้เฉพาะ explicit non-production regression/migration tooling

## 10. Product Definition of Done

- [ ] contract, API spec, UI spec และ test plan มีอยู่ก่อน final implementation integration
- [ ] schema migration เป็น additive/backfills existing data; seed เป็น idempotent และ credentials ระบุว่าเป็น local-only
- [ ] protected endpoint ทุกตัวมี backend auth, role และ ownership checks พร้อม safe errors
- [ ] acceptance criteria map ไปยัง unit/API/UI/E2E และ responsive/accessibility evidence ที่ผ่าน
- [ ] Existing Lab 2 requester และ attachment regression tests ผ่าน หรือถูกปรับเป็น authenticated equivalents
- [ ] client/server builds ผ่าน; ไม่มี secrets, plaintext passwords, stored filenames หรือ storage paths ถูกเปิดเผย
- [ ] Evidence มี reviewer record, AI-use reflection, final-main test/build output และ Answer Part 1-9 PDF ที่กระชับหนึ่งชุด

## 11. Assumptions และ decisions

เลือก session cookies เพราะ browser application เดิมเป็น same-site และ server สามารถ invalidate sessions ได้ทันที SameSite=Lax, JSON state-changing endpoints และ Origin check สำหรับ browser mutations เป็น CSRF baseline ของ Lab 3 Seed credentials เป็น local development fixtures เท่านั้นและต้องเปลี่ยนเมื่อ login ครั้งแรก Administrator อาจเป็น Ticket Owner และแก้ IT Priority ได้ แต่เฉพาะ IT Staff assign/reassign, เปลี่ยน status หรือเพิ่ม staff-side comments/notes ได้ legacy Development Requester endpoint ถูกปิดใน production และเปิดได้เฉพาะ explicit non-production regression/migration tooling context
