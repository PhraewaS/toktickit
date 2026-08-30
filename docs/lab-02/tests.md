# Lab 2 — Test Plan and Evidence

แผน Test DD, TDD และ Acceptance-Criterion Traceability สำหรับ TokTickIT Lab 2

**สถานะ:** วางแผนก่อน Implementation แล้ว ส่วน Final Results ยังเป็น Pending

---

## 1. Test Strategy

Lab 2 ใช้ Test DD และ TDD โดย Acceptance Criterion ทุกข้อใน `specification.md` ต้อง Map ไปยัง Planned Test อย่างน้อยหนึ่งรายการ ในแต่ละ Issue ให้เขียน Test ที่เกี่ยวข้องก่อน ยืนยันว่า Test Fail เพราะ Behavior ยังไม่มี จากนั้น Implement Behavior ขั้นต่ำและ Refactor โดย Tests ยังผ่าน

Test Levels:

- **Unit:** Validation, Ticket Number, Query Parsing และ File Policy ที่เป็น Pure Logic
- **API/Integration:** Route Contract, Persistence Calls, Validation, Ownership, Failure และ Attachment Lifecycle
- **UI Component:** Screen States, User Interaction, Accessibility Semantics และ API Call Behavior
- **UI Style:** Required Classes/Tokens, Field States, Labels, Messages, Badges และ Button States
- **Responsive/Visual:** Playwright Viewport Assertions และ Screenshots
- **E2E:** Multi-requester Flow ตั้งแต่ Create, List, Detail จนถึง Attachment Lifecycle
- **Final Verification:** รัน Full Required Tests และ Client/Server Builds จาก Final `main` พร้อมเก็บ Command Output เป็น Evidence

ห้าม Skip, Disable, Comment out หรือยอมรับ Required Test ที่ Flaky Final Status ต้องบันทึกจาก Final `main` เท่านั้น

---

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Test File / Evidence Path | Final |
|---|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-09, AC-05 | Ticket Number Format และ Uniqueness Inputs | ได้ UTC Format ตาม Spec และค่าต่างกัน | `server/tests/lab-02/ticket-number.unit.test.ts` | Pending |
| UNIT-02 | Unit | BR-13-17, AC-07 | Create Validation, Trimming และ Boundaries | Valid ผ่าน Invalid ได้ Field Details | `server/tests/lab-02/ticket-validation.unit.test.ts` | Pending |
| UNIT-03 | Unit | BR-21-25, AC-14 | List Query Defaults, Allowed/Invalid Values | Parse ได้ Stable Query หรือ Safe Error | `server/tests/lab-02/ticket-query.unit.test.ts` | Pending |
| UNIT-04 | Unit | BR-27-30, AC-10, AC-23 | Extension, MIME, Size และ Count Policy | Permitted File ผ่าน Boundary ที่ผิดถูก Reject | `server/tests/lab-02/attachment-policy.unit.test.ts` | Pending |
| API-01 | API | FR-01-04, AC-01-04, AC-24 | Active Requester API/Context และ Inactive Exclusion | Active Ordered List; Missing/Inactive Context ถูก Reject | `server/tests/lab-02/requester-context.api.test.ts` | Pending |
| API-02 | API | FR-05, AC-09, AC-24 | Active Category/Related System และ Failure | Ordered Active Data; Safe Failure | `server/tests/lab-02/reference-data.api.test.ts` | Pending |
| API-03 | API | FR-06-08, AC-05 | Valid Ticket Creation | `201`; บันทึก Owned `NEW` Ticket หนึ่งใบและคืน Official Number | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |
| API-04 | API | BR-19, AC-06 | Repeated Submission Key | `200`, Replay Flag และไม่มี Duplicate | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |
| API-05 | API | BR-12-17, AC-07 | Invalid Create Values/Reference Data | `400`, Safe Field Errors และไม่สร้าง Ticket | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |
| API-06 | API | BR-38, AC-08 | Unexpected Create Persistence Failure | Safe `500` ไม่มี Internal Detail | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |
| API-07 | API | FR-10-11, BR-26, AC-13-16 | Owned List, Search, Filter, Sort, Page, Empty และ No-results Metadata | มีเฉพาะ Owner Data; `totalOwnedItems` ไม่ใช้ Search/Filter; `totalItems` ใช้ Search/Filter; Metadata/Order ถูกต้อง | `server/tests/lab-02/my-tickets.api.test.ts` | Pending |
| API-08 | API | BR-25, AC-14 | Invalid List Parameters และ Out-of-range Page | `400 INVALID_QUERY` หรือ `400 PAGE_OUT_OF_RANGE` พร้อม Safe Field Detail | `server/tests/lab-02/my-tickets.api.test.ts` | Pending |
| API-09 | API | FR-12-13, AC-17-18 | Owned Detail และ Cross-owner Access | Owner ได้ Detail คนอื่นได้ Safe `404` | `server/tests/lab-02/ticket-detail.api.test.ts` | Pending |
| API-10 | API | FR-09, BR-27-32, AC-10-12 | Valid/Mixed/Invalid Upload และ Compensation | Allowed Metadata ถูกเก็บ Invalid/Failed File รายงานอย่างปลอดภัย | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| API-11 | API | BR-28-29, AC-23 | 5 MiB และ Five-active Boundaries | Boundary ผ่าน Excess ถูก Reject Removed File คืน Slot | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| API-12 | API | FR-14, AC-19-20 | Controlled Download และ Ownership | Owner ได้ Bytes/Name คนอื่น Safe `404` | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| API-13 | API | FR-15-16, AC-21-22 | Soft Removal, Reason, Metadata และ Blocked Download | Metadata อยู่ File ใช้ไม่ได้ | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| UI-01 | UI | FR-01-04, AC-01-04, AC-24 | Selection Loading/Ready/Empty/Failure/Change | แสดง Accessible State และ Session Context ถูกต้อง | `client/tests/lab-02/RequesterSelection.test.tsx` | Pending |
| UI-02 | UI | FR-05-08, AC-05, AC-09 | Create Initial/Reference/Read-only/Success | DB Data และ Official Number แสดงถูกต้อง | `client/tests/lab-02/CreateTicket.test.tsx` | Pending |
| UI-03 | UI | AC-07 | Create Field-level Validation | Message อยู่ใต้ Field และไม่เรียก API | `client/tests/lab-02/CreateTicket.test.tsx` | Pending |
| UI-04 | UI | BR-18-20, AC-06, AC-08 | Busy, Duplicate Blocking และ Failure Retention | ส่งหนึ่ง Request, Values อยู่, Error ปลอดภัย | `client/tests/lab-02/CreateTicket.test.tsx` | Pending |
| UI-05 | UI | AC-10-12 | Valid/Invalid Files และ Partial Upload Result | แสดง Per-file State และ Ticket Success ยังคงอยู่ | `client/tests/lab-02/AttachmentSection.test.tsx` | Pending |
| UI-06 | UI | FR-10-11, BR-26, AC-13-16 | My Tickets Controls/List/Empty/No-results/Failure | แยก Empty/No-results จาก `totalOwnedItems` และ `totalItems` ของ Response เดียว; State/Actions ถูกต้อง | `client/tests/lab-02/MyTickets.test.tsx` | Pending |
| UI-07 | UI | AC-04, AC-13 | Requester Switch Clear Stale List | ข้อมูล A หายก่อนโหลด B | `client/tests/lab-02/MyTickets.test.tsx` | Pending |
| UI-08 | UI | FR-12-13, AC-17-18 | Read-only Detail และ Error State | Owned Data แสดง Unavailable State ปลอดภัย | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Pending |
| UI-09 | UI | FR-14-16, AC-19-23 | Download, Removal Confirmation/Reason และ Removed State | Active/Removed Actions ถูกต้อง | `client/tests/lab-02/AttachmentSection.test.tsx` | Pending |
| STYLE-01 | UI Style | AC-25-26 | Tokens, Labels, Read-only/Invalid/Focus/Button/Badge | Required Semantics/Styles ครบ | `client/tests/lab-02/ZenGreenStyles.test.tsx` | Pending |
| A11Y-01 | Accessibility | FR-19, AC-26 | Required Screens ใช้ Keyboard-only, Accessible Names, Error Associations, Status Announcements และ Non-color-only States | Focus มองเห็นและไปตามลำดับ; Controls/Errors/Status มี Accessible Semantics; State ไม่สื่อด้วยสีอย่างเดียว | `client/tests/lab-02/Accessibility.test.tsx` | Pending |
| RESP-01 | Responsive | AC-25 | Required Screens บน Desktop/Tablet/Mobile | ไม่มี Page Overflow/Clipping และ Controls ใช้ได้ | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pending |
| E2E-01 | E2E | AC-02-05, AC-09, AC-13, AC-18 | Select A, Create, Find และ Open Ticket | Official Number ถูก Persist และแสดงใน Owned Flow | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pending |
| E2E-02 | E2E | AC-10-12, AC-19, AC-21-23 | Upload, Download, Soft-remove และ Block Removed Download | Attachment Lifecycle ผ่านครบ | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pending |
| E2E-03 | E2E | AC-04, AC-17, AC-20 | Switch A เป็น B และ Direct Cross-owner Access | Data A หายและ Direct Access ถูก Reject | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pending |
| E2E-04 | E2E | AC-07-08, AC-15-16, AC-24 | Validation, API Failure, Empty และ No-results | Empty ใช้ `totalOwnedItems = 0`; No-results ใช้ `totalOwnedItems > 0` และ `totalItems = 0`; Required Feedback ถูกต้องโดยไม่มี Unfiltered Request เพิ่ม | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pending |
| VERIFY-01 | Final Test Verification | FR-20, AC-27 | รัน Server, Client และ Playwright Required Test Commands บน Final `main` | ทุก Command Exit `0`; Required Tests ผ่านทั้งหมดและไม่มี Skip/Disable/Comment-out | `artifacts/lab-02/test-results/final-tests.txt` | Pending |
| VERIFY-02 | Final Build Verification | FR-20, AC-27 | รัน Server และ Client Build Commands บน Final `main` | ทั้งสอง Build Exit `0` และไม่มี Compile/Bundle Error | `artifacts/lab-02/test-results/final-builds.txt` | Pending |

---

## 3. Acceptance-Criterion Traceability

| AC | Planned Tests |
|---|---|
| AC-01 | API-01, UI-01 |
| AC-02 | API-01, UI-01, E2E-01 |
| AC-03 | UI-01, E2E-01 |
| AC-04 | UI-01, UI-07, E2E-03 |
| AC-05 | UNIT-01, API-03, UI-02, E2E-01 |
| AC-06 | API-04, UI-04 |
| AC-07 | UNIT-02, API-05, UI-03, E2E-04 |
| AC-08 | API-06, UI-04, E2E-04 |
| AC-09 | API-02, UI-02, E2E-01 |
| AC-10 | UNIT-04, API-10, UI-05, E2E-02 |
| AC-11 | API-10, E2E-02 |
| AC-12 | API-10, UI-05, E2E-02 |
| AC-13 | API-07, UI-06, UI-07, E2E-01 |
| AC-14 | UNIT-03, API-07, API-08, UI-06 |
| AC-15 | API-07, UI-06, E2E-04 |
| AC-16 | API-07, UI-06, E2E-04 |
| AC-17 | API-09, UI-08, E2E-03 |
| AC-18 | API-09, UI-08, E2E-01 |
| AC-19 | API-12, UI-09, E2E-02 |
| AC-20 | API-12, API-13, E2E-03 |
| AC-21 | API-13, UI-09, E2E-02 |
| AC-22 | API-13, UI-09, E2E-02 |
| AC-23 | UNIT-04, API-11, UI-09, E2E-02 |
| AC-24 | API-01, API-02, UI-01, E2E-04 |
| AC-25 | STYLE-01, RESP-01 |
| AC-26 | A11Y-01, STYLE-01, RESP-01 |
| AC-27 | VERIFY-01, VERIFY-02 |

---

## 4. Responsive and Visual Checklist

ตรวจ Selection, Create Ticket, My Tickets และ Ticket Detail ที่ Desktop (`>=992px`), Tablet (`768-991px`) และ Mobile (`<768px`)

- [ ] Zen Green Tokens และ Button Hierarchy ตรง `ui-spec.md`
- [ ] Editable, Read-only, Invalid, Disabled, Busy และ Focused Controls แยกชัดเจน
- [ ] Required Marker และ Validation Message อยู่ตำแหน่งถูกต้อง
- [ ] ไม่มี Clipped Labels, Overlap, Hidden Action, Unreadable Filename หรือ Horizontal Page Overflow
- [ ] Desktop Table/Mobile Cards, Filters, Sort, Pagination และ Attachment Controls ใช้งานได้
- [ ] Loading, Empty, No-results, Success, Removed และ Failure States เข้าใจได้โดยไม่ใช้สีอย่างเดียว
- [ ] Screenshot Paths ชี้ไป `artifacts/lab-02/screenshots/{create-ticket,my-tickets,ticket-detail}/{desktop,tablet,mobile}.png` และภาพอ่านได้

---

## 5. Test Commands

รันจาก Repository Root โดย Project แยก Client และ Server Packages:

### VERIFY-01 — Full Required Tests on Final `main`

```text
npm --prefix server test
npm --prefix client test
npm --prefix e2e exec playwright test -- --config e2e/playwright.config.ts
```

Expected Result: ทุก Command Exit `0`, Required Tests ผ่านทั้งหมด และไม่มี Test ที่ Skip, Disable หรือ Comment out

Evidence: เก็บ Complete Console Output พร้อม Final Commit SHA และเวลาที่รันไว้ที่ `artifacts/lab-02/test-results/final-tests.txt` และอ้าง Link ใน Release PR/Final PDF

### VERIFY-02 — Client and Server Builds on Final `main`

```text
npm --prefix server run build
npm --prefix client run build
```

Expected Result: ทั้งสอง Command Exit `0` โดยไม่มี TypeScript Compile Error หรือ Vite Bundle Error

Evidence: เก็บ Complete Console Output พร้อม Final Commit SHA และเวลาที่รันไว้ที่ `artifacts/lab-02/test-results/final-builds.txt` และอ้าง Link ใน Release PR/Final PDF

Database Integration/E2E Setup และ Teardown Commands ต้องเพิ่มใน README ก่อนประกาศว่า Implementation เสร็จ

---

## 6. Final Results

**Pending Implementation**

เมื่อเสร็จแล้วต้องสรุปผล `VERIFY-01` และ `VERIFY-02` จาก Final `main` ในส่วนนี้ พร้อม Link ไป Evidence Files, Final Commit SHA, วันที่/เวลา, Playwright Viewports และ Screenshot Paths ตามรูปแบบเดียวกับ `docs/lab-01/tests.md`

---

## 7. Known Limitations or Deferred Tests

- ตอนวางแผนยังไม่มี Approved Limitation หรือ Deferred Required Test
- Authentication จริง, IT Staff Workflow, Comments/Notes/Actions Taken, Status Changes และ Administration เป็น Excluded Lab 2 Scope ไม่ใช่ Deferred Required Test
