# Lab 2 — Sprint Engineering Specification

เอกสารข้อกำหนดทางวิศวกรรมสำหรับพัฒนา **TokTickIT Requester Ticketing MVP with UI Foundation**

**สถานะ:** รอผู้จัดทำและ Peer Reviewer ตรวจสอบและอนุมัติก่อนเริ่ม Implementation

---

## 1. Sprint Goal

พัฒนา TokTickIT ฝั่ง Requester ให้สามารถเลือก Development Requester สำหรับจำลองผู้ใช้ สร้าง Ticket และรับ Ticket Number ที่สร้างจาก Backend ค้นหาและเปิดดูเฉพาะ Ticket ของตนเอง รวมถึงเพิ่ม ดาวน์โหลด และ Soft-remove Attachment ที่อนุญาตได้ พร้อมวางพื้นฐาน Zen Green UI ที่นำกลับมาใช้ซ้ำได้ มี Automated Tests ที่ Trace กลับไปยัง Acceptance Criteria และมี GitHub Workflow ที่ตรวจสอบย้อนหลังได้

---

## 2. Stakeholder Request Interpretation

Lab 2 จะเปลี่ยนระบบจากหน้า Connectivity Demonstration ของ Lab 1 ให้เป็น Requester Ticketing MVP แบบ Full Stack เนื่องจาก Authentication จริงจะทำใน Lab 3 ระบบจึงใช้ Development Requester ที่ Seed ไว้เป็น Testing Context โดยผู้ใช้ต้องเลือก Requester ก่อนเข้า Application จากนั้น Requester ที่เลือกจะถูกใช้กับ Create Ticket, My Tickets, Ticket Detail และ Attachment ทุกครั้ง

แม้ Development Requester จะไม่ใช่ Authentication แต่ Backend ยังต้องตรวจ Ownership ทุกครั้ง เพื่อไม่ให้ Requester คนหนึ่งอ่านหรือจัดการ Ticket และ Attachment ของอีกคนได้ ระบบต้องรองรับ Validation, Loading, Empty, No-results, Success, Failure, Boundary และ Responsive States ตามเอกสารนี้

---

## 3. Scope

### Included

- Development Requester Selection โดยโหลดเฉพาะ Active Requesters จาก PostgreSQL
- แสดง Current Requester, เก็บ Selection เฉพาะ Browser Tab Session และมี Change Requester
- โหลด Active Categories และ Active Related Systems จาก Backend
- Create Ticket พร้อม Backend-generated Ticket Number และ Initial Status `NEW`
- เพิ่ม Attachment หลังสร้าง Ticket และเพิ่มจาก Ticket Detail
- My Tickets ที่แสดงเฉพาะ Ticket ของ Requester ปัจจุบัน
- Search, Filter, Sort และ Pagination
- Requester Ticket Detail แบบ Read-only
- แสดง Attachment Metadata ทั้ง Active และ Removed
- Download Active Attachment ผ่าน Ownership-checking API
- Soft-remove Attachment พร้อม Confirmation และ Removal Reason
- Backend Ownership Check สำหรับ Ticket และ Attachment
- Zen Green Application Shell และ Reusable UI Components
- Desktop, Tablet และ Mobile Responsive Layout
- Keyboard Accessibility, Accessible Labels และ Non-color-only Feedback
- Unit, API/Integration, UI Component, UI Style, Responsive, Visual และ E2E Tests
- GitHub Issues, Feature Branches, Peer-reviewed PRs, `lab2-staging` และ Release PR ไป `main`

### Excluded

- Login/Logout จริง, Password, Password Hashing, Session, Token, Authenticated Identity และ Role-based Authorization จริง
- IT Staff Dashboard/Queue, Claim Ticket, Reassign Ticket และการเปลี่ยน IT Priority
- Public Comments, Internal Notes และ Actions Taken
- Status Change หลังสร้าง Ticket เช่น Resolve, Close, Reopen และ Cancel
- Resolution Confirmation
- Administrator จัดการ Users, Requesters, Roles, Categories หรือ Related Systems
- การแก้ไข Ticket Fields หลัง Submit
- Inline File Preview โดย Lab 2 จะให้ Download เฉพาะ Active Attachment เท่านั้น

---

## 4. Functional Requirements

- FR-01: ระบบต้องบังคับให้เลือก Active Development Requester ก่อนใช้หน้าที่มี Requester-specific Data
- FR-02: Development Requester Selector ต้องโหลดข้อมูลจาก PostgreSQL และไม่แสดง Inactive Requester
- FR-03: ระบบต้องเก็บ Requester ที่เลือกไว้เฉพาะ Browser Tab Session และแสดง Requester ใน Application Shell
- FR-04: ระบบต้องมี Change Requester และ Reload Requester-specific Data เมื่อเปลี่ยนผู้ใช้
- FR-05: ระบบต้องโหลด Active Categories และ Active Related Systems จาก Backend
- FR-06: Requester ต้องสร้าง Ticket ได้โดยระบุ Category, Related System, Summary, Requested Priority และ Description
- FR-07: Backend ต้องสร้าง Official Ticket Number ที่ไม่ซ้ำและส่งกลับหลังบันทึกสำเร็จ
- FR-08: Create Ticket UI ต้องแยก Editable Fields กับ System-generated/Read-only Fields ให้ชัดเจน
- FR-09: Requester ต้องเพิ่ม Permitted Attachments ได้หลังสร้าง Ticket และจาก Ticket Detail
- FR-10: My Tickets ต้องคืนเฉพาะ Ticket ที่เป็นของ Requester ปัจจุบัน
- FR-11: My Tickets ต้องรองรับ Search, Filter, Sort และ Pagination ตาม Contract
- FR-12: Requester ต้องเปิด Ticket Detail แบบ Read-only ได้เฉพาะ Ticket ที่ตนเองเป็นเจ้าของ
- FR-13: Ticket Detail ต้องแสดง Active และ Removed Attachment Metadata ด้วย State ที่แยกกันชัดเจน
- FR-14: Requester ต้อง Download Active Attachment ของ Ticket ตนเองได้
- FR-15: Requester ต้อง Soft-remove Active Attachment ของ Ticket ตนเองได้หลังยืนยันและระบุเหตุผล
- FR-16: Removed Attachment ต้องไม่สามารถ Download หรือ Preview ได้
- FR-17: ทุกหน้าต้องมี Loading, Empty, No-results, Validation, Success และ Safe Failure States ตามที่กำหนด
- FR-18: UI ต้องเป็น Zen Green และ Responsive บน Desktop, Tablet และ Mobile
- FR-19: ระบบต้องมี Visible Keyboard Focus, Programmatic Labels, Accessible Status/Error Announcements และไม่ใช้สีอย่างเดียวในการสื่อความหมาย
- FR-20: Final `main` ต้องผ่าน Test และ Build Commands ที่บันทึกไว้ทั้งหมด

---

## 5. Business Rules

- BR-01: Official Ticket Number ต้องสร้างโดย Backend และต้องไม่ซ้ำ
- BR-02: Ticket ใหม่ต้องเริ่มด้วย Current Status `NEW`
- BR-03: Lab 2 ใช้ Development Requester Selector แทน Login โดยเป็น Testing Mechanism ไม่ใช่ Authentication
- BR-04: เลือกหรือใช้เป็น Current Requester ได้เฉพาะ Active Development Requester
- BR-05: เก็บ Selected Requester ใน `sessionStorage` การปิด Browser Tab ถือว่าสิ้นสุด Selection และถ้า Requester กลายเป็น Inactive ต้อง Clear Selection
- BR-06: Requester-specific Request ต้องส่ง `X-Development-Requester-Id` และ Backend ต้องตรวจว่าเป็น Active Requester ก่อนทำงาน
- BR-07: Backend Database Query ต้องตรวจ Ticket/Attachment Ownership ทุกครั้ง การซ่อนข้อมูลใน Frontend ไม่ถือเป็น Ownership Control
- BR-08: การขอ Ticket หรือ Attachment ของ Requester คนอื่นต้องตอบ Safe `404` แบบเดียวกับ Resource ที่ไม่มีอยู่
- BR-09: Ticket Number ใช้รูปแบบ `TKT-YYYYMMDD-XXXXXXXX` วันที่เป็น UTC และแปดตัวท้ายเป็น Uppercase Hexadecimal ที่ Backend สร้าง โดย Database Unique Constraint เป็นตัวตัดสินสุดท้าย
- BR-10: Ticket Date คือ Backend Creation Timestamp ใน UTC และเป็น Read-only
- BR-11: Requester, Ticket Number, Ticket Date และ Current Status เป็น Read-only ใน Requester Screens
- BR-12: Category, Related System, Summary, Requested Priority และ Description เป็น Required Fields
- BR-13: Summary ต้อง Trim และยาว 5-150 ตัวอักษร
- BR-14: Description ต้อง Trim และยาว 10-5000 ตัวอักษร
- BR-15: Requested Priority รับได้เฉพาะ `LOW`, `MEDIUM` และ `HIGH`
- BR-16: Category และ Related System ต้องมีอยู่และยัง Active ตอน Submit
- BR-17: Frontend Validation ใช้ช่วย Feedback แต่ Backend Validation เป็น Authoritative และต้องใช้ Limit เดียวกัน
- BR-18: ระหว่าง Create Request ปุ่ม Submit ต้อง Disabled และแสดง Busy State
- BR-19: ทุก Create Attempt ต้องมี Client-generated UUID `submissionKey` และ Backend มี Unique Constraint ต่อ Requester หากส่ง Key เดิมซ้ำให้คืน Ticket เดิมด้วย `200` และ `replayed: true` โดยไม่สร้าง Duplicate
- BR-20: ถ้า Create Request ล้มเหลว Form Values และ Valid File Selections ที่ Browser ยังรักษาได้ต้องไม่หาย
- BR-21: My Tickets Search แบบ Case-insensitive ใน Ticket Number และ Summary
- BR-22: My Tickets Filter ได้ด้วย Category, Related System, Requested Priority และ Current Status
- BR-23: Sort ได้ด้วย Ticket Number, Summary, Created Date และ Last Updated ค่า Default คือ Created Date Descending และใช้ Ticket ID Descending เป็น Stable Secondary Sort
- BR-24: Page เริ่มที่ 1 รองรับ Page Size 10, 20 และ 50 โดย Default คือ 10
- BR-25: Invalid Query Parameter ต้องตอบ `400` พร้อม Safe Field Details และห้าม Silent Fallback
- BR-26: Empty State หมายถึง Requester ไม่มี Ticket ส่วน No-results หมายถึงมี Ticket แต่ Search/Filter ปัจจุบันไม่พบ
- BR-27: Attachment รองรับ JPG/JPEG, PNG, WEBP และ PDF โดย Filename Extension และ MIME Type ต้องตรงกับรายการที่อนุญาต
- BR-28: Attachment แต่ละไฟล์มีขนาดสูงสุด 5 MiB หรือ `5 * 1024 * 1024` Bytes
- BR-29: Ticket หนึ่งใบมี Active Attachments ได้สูงสุด 5 ไฟล์ โดย Removed Attachment ไม่นับรวม
- BR-30: เก็บ Original Filename เป็น Metadata หลังทำ Basename Sanitization และใช้ Backend-generated UUID เป็น Stored Filename ห้ามใช้ User Path
- BR-31: Attachment Upload เป็นขั้นที่สองหลัง Ticket Creation ถ้า Ticket สร้างสำเร็จแต่ Upload บางไฟล์ล้มเหลว Ticket ต้องคงอยู่ แสดง Ticket Number ระบุไฟล์ที่ล้มเหลว และ Retry ได้จาก Ticket Detail
- BR-32: ถ้าเขียนไฟล์ลง Storage สำเร็จแต่บันทึก Attachment Metadata ล้มเหลว Backend ต้องลบไฟล์ที่เพิ่งเขียนเป็น Compensation
- BR-33: Attachment Removal ต้องมี Confirmation และ Trimmed Reason ความยาว 3-500 ตัวอักษร
- BR-34: Soft Removal ต้องตั้ง `removedAt` และ `removalReason` โดยไม่ลบ Attachment Metadata Row
- BR-35: Removed Attachment Metadata ต้องยังแสดง Removed Label, Timestamp และ Reason แต่ไม่มี Preview, Download หรือ Remove Action
- BR-36: Download ต้องผ่าน Ownership-checking API เท่านั้น และห้าม Serve Upload Directory แบบ Static
- BR-37: Reference Data และ Requester List เรียง Name Ascending แบบ Deterministic
- BR-38: Unexpected Error ต้องคืน Stable Error Code และข้อความที่ปลอดภัย ห้ามเปิดเผย Stack Trace, SQL, Filesystem Path หรือ Secret
- BR-39: Change Requester ต้อง Clear Ticket Results, Filters, Page State, Cached Ticket Detail และ Pending Create State ก่อน Reload ข้อมูลใหม่
- BR-40: Lab 3 จะเปลี่ยน Development Header/Context เป็น Server-derived Authenticated Identity โดยไม่เปลี่ยน Ticket Ownership Relationships

---

## 6. UI Specification Summary

รายละเอียดอยู่ใน `docs/lab-02/ui-spec.md` ระบบใช้ Zen Green Palette, Responsive Application Shell, Reusable Form/Feedback Components, Desktop Table และ Mobile Cards มี Field-level Validation แยก Read-only Fields ชัดเจน มี Button Hierarchy และ Priority/Status Badges ที่ไม่ใช้สีอย่างเดียว หน้าหลักประกอบด้วย Development Requester Selection, Create Ticket, My Tickets และ Requester Ticket Detail พร้อม Attachment Lifecycle

---

## 7. Data Changes

Prisma Schema จะเพิ่ม `RequesterUser`, `RelatedSystem`, `Ticket` และ `Attachment` เพิ่ม Active/Updated Metadata ให้ `Category` และเพิ่ม Enums `RequestedPriority` กับ `TicketStatus`

### Relationships

- RequesterUser หนึ่งคนมี Ticket ได้หลายใบ และ Ticket หนึ่งใบเป็นของ RequesterUser คนเดียว
- Category หนึ่งรายการและ RelatedSystem หนึ่งรายการถูกใช้กับ Ticket ได้หลายใบ
- Ticket หนึ่งใบมี Attachment ได้หลายรายการ และ Attachment หนึ่งรายการเป็นของ Ticket เดียว

### Database Decisions

- ใช้ Integer Surrogate Primary Keys สำหรับ Prisma Relations และใช้ `ticketNumber` เป็น Unique Display Identity
- สร้าง Index ที่ `Ticket(requesterId, createdAt, id)` เพราะ My Tickets จะ Filter ตาม Owner และ Sort ใหม่สุดก่อนบ่อยที่สุด
- `submissionKey` ใช้ Compound Unique Constraint ร่วมกับ `requesterId` เพื่อป้องกัน Duplicate โดยไม่ให้ Requester หนึ่ง Replay Key ของอีกคน
- Soft Removal ใช้ Nullable `removedAt` และ `removalReason` โดย Active Query ใช้ `removedAt: null`
- Ownership เก็บด้วย Ticket Foreign Key ถาวร ทำให้ Lab 3 เปลี่ยนเฉพาะ Identity Source ได้

Seed ต้อง Idempotent และประกอบด้วย Categories ที่กำหนด 4 รายการ, Related Systems อย่างน้อย 6 รายการ, Active Requesters อย่างน้อย 4 คน และ Inactive Requester อย่างน้อย 1 คน

---

## 8. API Contract

รายละเอียดอยู่ใน `docs/lab-02/api-spec.md` ครอบคลุม Development Requester Header, Active Reference Data, Ticket Create/List/Detail, Attachment Upload/Metadata/Download/Removal, Request/Response Shapes, Validation, Pagination, Ownership และ Safe Errors

---

## 9. Acceptance Criteria

- AC-01: Given ยังไม่ได้เลือก Development Requester, when เปิด Requester-specific Route, then ระบบแสดง Selection Screen แทน
- AC-02: Given Seed มี Active และ Inactive Requesters, when Selection Screen โหลด, then แสดงเฉพาะ Active Requesters ตามลำดับที่กำหนด
- AC-03: Given เลือก Requester A, when Application Shell โหลด, then แสดงชื่อ A, Change Requester และข้อความว่า Selection นี้ไม่ใช่ Authentication
- AC-04: Given A เป็น Current Requester, when เปลี่ยนเป็น B, then Cached Data ของ A ถูก Clear และโหลดข้อมูลของ B
- AC-05: Given Ticket Data ถูกต้อง, when Submit, then บันทึก Ticket เพียงหนึ่งรายการด้วย `requesterId` ที่ตรงกัน, Status `NEW`, Backend Ticket Date และ Unique Ticket Number พร้อมแสดง Number ใน Success State
- AC-06: Given `submissionKey` เดิมถูกใช้แล้วโดย Requester เดิม, when Create ซ้ำ, then คืน Ticket เดิมและไม่สร้าง Duplicate
- AC-07: Given Ticket Input ไม่ถูกต้องหรือมีแต่ Whitespace, when Submit, then แสดง Field-level Messages, ไม่เรียก API สำหรับ Client-detectable Error และ Backend ปฏิเสธ Input ที่ไม่ถูกต้องด้วย
- AC-08: Given Create API ล้มเหลว, when ได้ Failure Response, then แสดง Safe Error และ Form Values ยังอยู่
- AC-09: Given มี Active Reference Data, when Create Ticket โหลด, then Categories/Related Systems มาจาก Backend/Database และ System Fields แสดงเป็น Read-only
- AC-10: Given เลือกไฟล์ Valid หนึ่งไฟล์และ Invalid หนึ่งไฟล์, when Validate, then Invalid File แสดง Specific Error และ Upload ได้เฉพาะ Permitted File
- AC-11: Given Permitted File ไม่เกิน 5 MiB และ Active Count น้อยกว่า 5, when Owner Upload, then บันทึก Safe Metadata และแสดง State Active
- AC-12: Given Ticket Creation สำเร็จแต่ Attachment Upload ล้มเหลว, when แสดงผล, then Ticket ยังคงอยู่ แสดง Ticket Number ระบุ Failed File และ Retry ได้จาก Ticket Detail
- AC-13: Given Requester A มี Tickets, when My Tickets โหลดเป็น A, then คืนเฉพาะ Tickets ของ A และ Pagination Metadata ถูกต้อง
- AC-14: Given มี Ticket Data ของ A, when Search, Filter, Sort หรือเปลี่ยน Page, then ใช้ Query Behavior และ Stable Ordering ตาม Contract
- AC-15: Given A ไม่มี Ticket, when My Tickets โหลดโดยไม่มี Search/Filter, then แสดง Empty State และ Create Ticket Action
- AC-16: Given A มี Ticket แต่ไม่ตรง Search/Filter, when Response ว่าง, then แสดง No-results และ Clear Filters
- AC-17: Given เลือก Requester B, when ขอ Ticket ของ A โดยตรง, then ไม่คืน Ticket Data และตอบ Safe `404`
- AC-18: Given A เป็นเจ้าของ Ticket, when เปิด Detail, then Ticket Information เป็น Read-only และ Attachment Actions แยกจากข้อมูล Ticket
- AC-19: Given A เป็นเจ้าของ Active Attachment, when Download, then คืน Original Filename และ File Bytes ผ่าน Controlled API
- AC-20: Given B ขอ Attachment ของ A โดยตรง, when ขอ Metadata, Download หรือ Removal, then ไม่คืนข้อมูลหรือไฟล์และตอบ Safe `404`
- AC-21: Given A ยืนยัน Removal พร้อม Valid Reason, when Remove Active Attachment, then บันทึก `removedAt` และ Reason โดย Metadata ยังแสดงอยู่
- AC-22: Given Attachment ถูก Remove แล้ว, when ขอ Preview หรือ Download, then ถูก Block และ UI ไม่มี Active-file Action
- AC-23: Given Ticket มี 5 Active Attachments, when Upload เพิ่ม, then ตอบ Safe Conflict และหลัง Remove หนึ่งไฟล์จึง Upload ใหม่ได้หนึ่งไฟล์
- AC-24: Given Requester/Reference Data กำลังโหลด, ว่าง หรือล้มเหลว, when Screen แสดง, then แสดง Accessible State ที่ตรงกันและมี Retry เมื่อเหมาะสม
- AC-25: Given Desktop, Tablet และ Mobile Viewports, when ตรวจ Required Screens, then ใช้งานได้โดยไม่มี Clipping, Overlap, Hidden Actions, Unreadable Filenames หรือ Horizontal Page Overflow
- AC-26: Given ใช้ Keyboard-only หรือไม่รับรู้สี, when ใช้งาน Required Screens, then Focus มองเห็น, Controls มี Accessible Names, Errors เชื่อมกับ Fields และ State ไม่สื่อด้วยสีอย่างเดียว
- AC-27: Given Final Integrated Code อยู่ใน `main`, when รัน Test/Build Commands ที่บันทึกไว้, then Required Tests ผ่านทั้งหมด ไม่มี Skip และ Client/Server Build สำเร็จ

---

## 10. Definition of Done

### Product Completion

- [ ] Implement FR, BR และ AC ที่อนุมัติครบโดยไม่เพิ่ม Excluded Scope
- [ ] Prisma Schema, Migration, Seed, API, UI และ Tests ตรงกับ Contract
- [ ] AC ทุกข้อ Map ไปยัง Planned/Actual Test ใน `tests.md`
- [ ] Unit, API/Integration, UI Component, UI Style, Responsive, Visual และ E2E Tests ผ่านใน Final `main`
- [ ] ไม่มี Required Test ที่ Skip, Disable, Comment out, Flaky หรือไม่เกี่ยวกับ AC
- [ ] Backend Ownership Tests ครบ Ticket และ Attachment Metadata/Download/Removal
- [ ] Success, Validation, Boundary, Loading, Empty, No-results, Unavailable และ Unexpected Failure States ครบ
- [ ] Zen Green และ Responsive Visual Checks ผ่าน Desktop, Tablet และ Mobile
- [ ] README มี Setup, Migration, Seed, Run, Test, Build และ Upload Storage Instructions ที่เป็นปัจจุบัน
- [ ] ตรวจ Changed Files, Migration SQL, Dependencies, Commands และ Test Evidence ครบ

### Course Delivery

- [ ] ใช้ GitHub Issues และสถานะ Backlog, Specified, Started, PR Review, Fixing และ Done
- [ ] สร้าง `lab2-staging` จาก Lab 1 `main` ที่เสร็จแล้ว
- [ ] แต่ละ Issue อยู่บน Feature Branch ของตนเองและเข้า `lab2-staging` ผ่าน Peer-reviewed PR
- [ ] ตอบ Review Comments และแก้ Required Changes ก่อน Approval
- [ ] Integration Tests ผ่านบน `lab2-staging`
- [ ] มี Release PR หนึ่งรายการจาก `lab2-staging` ไป `main`
- [ ] Required Documents และ Screenshot Directories ครบ
- [ ] ส่ง PDF หนึ่งไฟล์ เรียง `Answer Part 1` ถึง `Answer Part 9` พร้อม Working Links และ Readable Evidence

---

## 11. Assumptions and Decisions

- ใช้ Stack เดิมจาก Lab 1 ได้แก่ React/Vite/Bootstrap, Express, Prisma, PostgreSQL และ Vitest
- อนุญาตให้เพิ่ม React Router และ Playwright สำหรับ Multi-route, Responsive และ E2E Evidence
- อนุญาตให้เพิ่ม Zod สำหรับ Server Validation และ Multer สำหรับ Multipart Upload
- Selected Requester เก็บใน `sessionStorage` และส่งด้วย Development Header ที่ระบุชัดว่าไม่ใช่ Secure Identity
- Lab 2 ใช้ Local Filesystem Storage โดย Ignore Storage Directory จาก Git และเข้าถึงผ่าน Controlled APIs เท่านั้น
- ไม่ทำ Inline Preview โดย Active File Download ได้และ Removed File Download/Preview ไม่ได้
- ผู้จัดทำต้องตรวจและอนุมัติเอกสารนี้ก่อนเปลี่ยนสถานะจาก Draft และก่อนเริ่ม Implementation Branches
