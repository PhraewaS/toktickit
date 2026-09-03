# Lab 2 — บันทึกการตรวจงานโดยเพื่อน

เอกสารนี้บันทึก Pull Request ของ Lab 2 ที่ผู้จัดทำส่งให้เพื่อนตรวจ รวมถึงข้อเสนอแนะ การตอบกลับ และผลการอนุมัติที่เกิดขึ้นจริงใน GitHub โดยข้อความในส่วน “ข้อความจาก GitHub” คัดลอกตามต้นฉบับ ไม่ได้แปลหรือสรุปใหม่

**ผู้จัดทำ:** นางสาวแพรวา สภานนท์ — 67070507213 — GitHub: [@PhraewaS](https://github.com/PhraewaS)

**ผู้ตรวจจาก Lab 1:**
- นางสาวณัฐวดี ภูเขม่า — 67070507201 — GitHub: [@guluJa](https://github.com/guluJa)

---

## Pull Request ที่ผู้จัดทำเป็นผู้ส่ง

ชื่อ Issue และชื่อ Pull Request ในตารางคงตามที่ปรากฏบน GitHub เพื่อให้ตรวจสอบลิงก์และหลักฐานได้ตรงกัน

| Issue / ขอบเขตงาน | สาขา | Pull Request | ผู้ตรวจ | ผลการตรวจ | Commit ที่ Merge |
|---|---|---|---|---|---|
| [Engineering Contract and Test Plan](https://github.com/PhraewaS/toktickit/issues/10) | `feature/lab2-spec-contract` | [#11](https://github.com/PhraewaS/toktickit/pull/11) | [@guluJa](https://github.com/guluJa) | อนุมัติ (`Approved`) | `c80c9dd` |
| [Database, Seed and Development Requester Context](https://github.com/PhraewaS/toktickit/issues/12) | `feature/lab2-data-requester-context` | [#13](https://github.com/PhraewaS/toktickit/pull/13) | [@guluJa](https://github.com/guluJa) | อนุมัติ (`Approved`) | `6532a90` |
| [Ticket Creation API and UI](https://github.com/PhraewaS/toktickit/issues/14) | `feature/lab2-ticket-creation` | [#15](https://github.com/PhraewaS/toktickit/pull/15) | [@guluJa](https://github.com/guluJa) | อนุมัติ (`Approved`) | `184785a` |
| [My Tickets API และ UI](https://github.com/PhraewaS/toktickit/issues/16) | `feature/lab2-my-tickets` | [#17](https://github.com/PhraewaS/toktickit/pull/17) | [@guluJa](https://github.com/guluJa) | อนุมัติ (`Approved`) | `c78128b` |
| [Requester Ticket Detail and Attachment Lifecycle](https://github.com/PhraewaS/toktickit/issues/18) | `feature/lab2-ticket-detail-attachments` | [#19](https://github.com/PhraewaS/toktickit/pull/19) | [@guluJa](https://github.com/guluJa) | อนุมัติ (`Approved`) | `127b66f` |
| [Responsive, E2E and Visual Evidence](https://github.com/PhraewaS/toktickit/issues/20) | `feature/lab2-responsive-e2e-visual` | [#21](https://github.com/PhraewaS/toktickit/pull/21) | [@guluJa](https://github.com/guluJa) | อนุมัติ (`Approved`) | `6b42926` |
| [Final staging verification and peer-review records](https://github.com/PhraewaS/toktickit/issues/23) | `feature/lab2-final-verification` | [#24](https://github.com/PhraewaS/toktickit/pull/24) | [@guluJa](https://github.com/guluJa) | อนุมัติ (`Approved`) | [`8d9cca0`](https://github.com/PhraewaS/toktickit/commit/8d9cca04bf4f51015eee63c51c01f2689800fab9) |
| [Move release verification fixes through reviewed branch](https://github.com/PhraewaS/toktickit/issues/27) | `feature/lab2-release-verification-fixes` | [#26](https://github.com/PhraewaS/toktickit/pull/26) | [@guluJa](https://github.com/guluJa) | อนุมัติและ Merge (`Approved/Merged`) | [`68de92b`](https://github.com/PhraewaS/toktickit/commit/68de92bbad045c0565af6c2c8fea673f11cb9de8) |
| [Record PR #26 approval and merge evidence](https://github.com/PhraewaS/toktickit/pull/28) | `feature/lab2-record-pr26-merge` | [#28](https://github.com/PhraewaS/toktickit/pull/28) | [@guluJa](https://github.com/guluJa) | อนุมัติและ Merge (`Approved/Merged`) | [`f264f40`](https://github.com/PhraewaS/toktickit/commit/f264f40ca2e51801f263b371d38850de537ac325) |
| การแก้ไขตามข้อเสนอแนะของ Release PR | `feature/lab2-release-review-fixes` | [#30](https://github.com/PhraewaS/toktickit/pull/30) | [@guluJa](https://github.com/guluJa) | ตรวจแล้ว ไม่พบประเด็นเพิ่มเติม (`COMMENTED`) | รอ Merge |
| การรวม Release | `lab2-staging` → `main` | [#25](https://github.com/PhraewaS/toktickit/pull/25) | [@guluJa](https://github.com/guluJa) | รอตรวจ | รอดำเนินการ |

หมายเหตุ: Release PR #25 จาก `lab2-staging` ไป `main` เปิดอยู่และอยู่ระหว่างรอ Peer Review จึงยังไม่บันทึกผลการตรวจหรือ Merge Commit ในส่วนดังกล่าว

หมายเหตุ Workflow: PR #21, PR #24 และ PR #26 ถูก Merge เข้า `lab2-staging` แล้ว โดยงาน Final staging verification ใช้ PR #24 จาก Branch แยก `feature/lab2-final-verification` เพื่อไม่ให้ปะปนกับ Branch ของ PR #21 ส่วน PR #22 ถูกปิดเป็นรายการที่ถูกแทนที่ เนื่องจาก GitHub ไม่อนุญาตให้เปลี่ยน Head Branch ของ Pull Request ที่เปิดอยู่ ภายหลังพบ Verification fixes สอง Commit ที่ถูกเขียนตรงบน `lab2-staging` จึงย้ายออกจากปลาย Branch และจัดทำ PR #26 จาก `feature/lab2-release-verification-fixes` ผ่าน Peer Review ก่อน Merge กลับเข้า `lab2-staging` ด้วย Merge Commit [`68de92b`](https://github.com/PhraewaS/toktickit/commit/68de92bbad045c0565af6c2c8fea673f11cb9de8) แล้ว ขั้นตอนถัดไปคืออัปเดต PR #25 ตาม Staging ล่าสุด

หมายเหตุ Final Evidence: หลัง PR #25 ผ่าน Peer Review และถูก Merge เข้า `main` แล้ว ให้สร้าง Branch แยก เช่น `feature/lab2-final-verification-evidence` จาก Final `main` เพื่อบันทึกผล `VERIFY-01`/`VERIFY-02`, Final Commit SHA และ Merge Evidence ใน `tests.md`/`reviewer.md` แล้วเปิด Peer-reviewed PR กลับเข้า `main` ห้ามแก้ `main` โดยตรง

---

## ข้อเสนอแนะและการตอบกลับที่เกิดขึ้นจริงใน GitHub

ข้อความในกรอบด้านล่างเป็นข้อความที่คัดลอกตรงจาก GitHub ส่วนคำอธิบายก่อนกรอบใช้ภาษาไทยเพื่อบอกบริบทเท่านั้น

### PR #11 — Engineering Contract and Test Plan for Sprint 2

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจ PR #11 แล้วค่ะ โครงสร้าง Branch และ Target ถูกต้อง โดย PR แก้เฉพาะเอกสาร Lab 2 ครบทั้ง 6 ไฟล์ และ Scope, Ownership, Attachment, UI รวมถึง Test Levels โดยรวมวางไว้ดีแล้ว
>
> แต่มีประเด็นที่ฉันมองว่าควรแก้ไขดังนี้ค่ะ:
>
> 1. ใน `specification.md` หัวข้อ Data Changes ยังขาดรายละเอียด Models/Fields/Data Types/PK/FK/Nullability/Unique Constraints/Enums/Timestamps/Indexes และ Migration Decisions โดยเฉพาะ `RequesterUser`, `Category`, `RelatedSystem`, `Ticket`, `Attachment`, `submissionKey` และ Soft-removal fields รบกวนเพิ่มให้เพียงพอสำหรับนำไปสร้าง Prisma Schema/Migration
>
> 2. Empty State กับ No-results State ยังแยกจาก `GET /api/tickets` Response ไม่ชัดเจน รบกวนกำหนด Contract ให้แน่นอน เช่นเพิ่ม `totalOwnedItems` หรือกำหนด Unfiltered Request Strategy และปรับ Specification/API/Test ให้ตรงกัน
>
> 3. ใน `tests.md` Traceability ของ `AC-26` และ `AC-27` ยังใช้คำรวมแทน Exact Test ID โดยเฉพาะ `AC-27` รบกวนเพิ่ม Planned Test/Verification ID สำหรับ Full Tests และ Builds บน Final `main` พร้อม Expected Result และ Evidence
>
> 4. ใน `ui-spec.md` ข้อความ `Reset/Cancel ใช้ได้เมื่อ Behavior ถูกระบุใน Contract` ยังเป็น Decision ที่ค้างอยู่ แนะนำให้นำออกจาก Scope หรือกำหนด Behavior ให้ครบ และรบกวนระบุให้ชัดว่า `ticketDate` กับ `createdAt` ใช้ค่า/Database Field เดียวกันหรือเป็น Response Alias เพื่อไม่ให้ Implementation ซ้ำซ้อน
>
> หากแก้ไขแล้วหรือต้องการให้ตรวจอีกครั้ง แจ้งได้เลยนะคะ

แหล่งที่มา: [รีวิว PR #11 บน GitHub](https://github.com/PhraewaS/toktickit/pull/11#pullrequestreview-5014897894)

**การตอบกลับของผู้จัดทำ (คัดลอกตรงจาก GitHub):**

> แก้ไขตามที่บอกเรียบร้อยแล้วตามที่บอกมาแล้วนะคะ รบกวนช่วยตรวจดูให้อีกรอบด้วยนะคะ

แหล่งที่มา: [ความคิดเห็นใน PR #11](https://github.com/PhraewaS/toktickit/pull/11#issuecomment-5409295098)

**ผลตรวจครั้งสุดท้ายของ `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบการแก้ไขแล้วค่ะ ได้รับการแก้ไขครบถ้วน จึงไม่มีประเด็นที่ต้องแก้ไขเพิ่มเติมค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #11](https://github.com/PhraewaS/toktickit/pull/11#issuecomment-5409746386) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/11#pullrequestreview-5018573392)

### PR #13 — Database Seed และบริบท Requester สำหรับพัฒนา

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบ PR #13 เทียบกับ Issue #12 และ Engineering Contract แล้วค่ะ
> ส่วน Implementation ผ่านตามขอบเขตของ Issue แต่อยากขอให้ตรวจดูเพิ่มเติมเล็กน้อยค่ะ โดยในส่วนของ Issue #12 ยังควรเป็น Open และอยู่สถานะ PR Review จนกว่า PR #13 จะ Merge เข้า lab2-staging แล้วจึง Close/Done

แหล่งที่มา: [รีวิว PR #13 บน GitHub](https://github.com/PhraewaS/toktickit/pull/13#pullrequestreview-5021967145)

**การตอบกลับของผู้จัดทำและผลตรวจซ้ำ (คัดลอกตรงจาก GitHub):**

> ขอบคุณสำหรับการรีวิวและคำแนะนำค่ะ ตอนนี้ตรวจสอบและแก้ไขเรียบร้อยแล้วค่ะ โดย Issue #12 เป็น Open และอยู่ในสถานะ PR Review พร้อมเชื่อมกับ PR #13 แล้วค่ะ จะคงสถานะนี้ไว้จนกว่า PR #13 จะ Merge เข้า lab2-staging จากนั้นจึงเปลี่ยนเป็น Done และ Close Issue ค่ะ
>
> จากการตรวจสอบอีกครั้ง ตอนนี้ไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมภายในขอบเขตของ PR นี้แล้วค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #13](https://github.com/PhraewaS/toktickit/pull/13#issuecomment-5421458441) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/13#pullrequestreview-5027366379)

### PR #15 — Ticket Creation API and UI

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบแล้ว Implementation หลักของ Issue #14 สอดคล้องกับ Acceptance Criteria ค่ะ
>
> - Backend ครอบคลุม Validation, Active Reference Data และ Requester Ownership
> - Ticket Number และสถานะ `NEW` ถูกกำหนดจาก Backend
> - รองรับ Idempotent Replay ด้วย Requester และ `submissionKey`
> - UI ครอบคลุม Loading, Field-level Validation, Submitting, Success และ Safe Failure
> - Tests ครอบคลุม UNIT-01, UNIT-02, API-03 ถึง API-06 และ UI-02 ถึง UI-04
>
> ดังนั้นไม่พบประเด็นที่ต้องแก้ไขภายในขอบเขต Issue #14  ค่ะ

แหล่งที่มา: [รีวิว PR #15 บน GitHub](https://github.com/PhraewaS/toktickit/pull/15#pullrequestreview-5033203168)

**การตอบกลับของผู้จัดทำ (คัดลอกตรงจาก GitHub):**

> ขอบคุณค่ะสำหรับการตรวจสอบ

แหล่งที่มา: [ความคิดเห็นใน PR #15](https://github.com/PhraewaS/toktickit/pull/15#issuecomment-5433633783) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/15#pullrequestreview-5036755638)

### PR #17 — My Tickets API and UI

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบแล้ว Implementation หลักของ My Tickets สอดคล้องกับ Issue #16 ค่ะ แต่จากการตรวจสอบแล้วแนะนำให้แก้ไขและเพิ่ม Test ในประเด็นต่อไปนี้
>
> 1. `clearFilters()` ตั้ง `appliedQuery` กลับเป็น `createdAt/desc` แต่ Sort controls บน UI ยังคงค่าเดิม ทำให้ค่าที่แสดงไม่ตรงกับ Query จริง แนะนำให้ Clear เฉพาะ Search/Filters และคง `sortBy`/`sortOrder` ปัจจุบัน หรือ Reset ทั้ง UI State และ Query ให้ตรงกัน พร้อมเพิ่ม Test
>
> 2. PR ระบุว่าเพิ่ม `UI-07` แล้ว แต่ยังไม่มี Test ที่ตรวจ Requester A → B ว่าข้อมูล A ถูก Clear, API เรียกด้วย Requester B และข้อมูลเดิมไม่กลับมาแสดง
>
> 3. `UI-06` ควรเพิ่มหลักฐานสำหรับ Category/Related System/Priority/Status filters, Sort, Page Size, Previous/Next, Loading และการกด Retry ปัจจุบัน Test ตรวจ Search และข้อความ Failure เป็นหลัก
>
> 4. เพิ่ม API Test สำหรับ Unexpected Database Failure ให้ตรวจ HTTP 500, `INTERNAL_ERROR` และยืนยันว่า Response ไม่เปิดเผย Internal Error
>
> ส่วน `docs/lab-02/tests.md` สามารถคง Final Result เป็น Pending จนกว่าจะตรวจบน Final `main` ได้ค่ะ หลังแก้ไขแล้วแจ้งให้ตรวจอีกครั้งได้เลยนะคะ

แหล่งที่มา: [รีวิว PR #17 บน GitHub](https://github.com/PhraewaS/toktickit/pull/17#pullrequestreview-5058880420)

**การตอบกลับของผู้จัดทำ (คัดลอกตรงจาก GitHub):**

> ขอบคุณสำหรับข้อเสนอแนะค่ะ
> ได้ดำเนินการแก้ไขครบทั้ง 4 ประเด็นใน PR #17 แล้ว ทั้ง clearFilters(), UI-07 Requester
> A → B, การขยาย UI-06 Test และ API Test สำหรับ Unexpected Database Failure
> ผลตรวจสอบ: Server Tests 31 ผ่าน, Client Tests 21 ผ่าน และ Build ทั้งสองฝั่งผ่านค่ะ
> ส่วน docs/lab-02/tests.md ยังคง Final Result เป็น Pending จนกว่าจะตรวจสอบบน Final main ค่ะ รบกวนช่วยตรวจสอบให้อีกรอบหน่อยนะคะ

แหล่งที่มา: [ความคิดเห็นใน PR #17](https://github.com/PhraewaS/toktickit/pull/17#issuecomment-5464893433)

**ผลตรวจซ้ำของ `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบการแก้ไขอีกครั้งแล้วค่ะ มีแก้ไขครบทั้ง 4 ประเด็นและทำงานถูกต้องเรียบร้อยแล้วค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #17](https://github.com/PhraewaS/toktickit/pull/17#issuecomment-5466818247) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/17#pullrequestreview-5060060658)

### PR #19 — Ticket Detail and Attachment Lifecycle

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบแล้ว Implementation หลักของ Ticket Detail และ Attachment Lifecycle สอดคล้องกับขอบเขตของ Issue #18 ค่ะ แต่มีบางส่วนแนะนำให้แก้ไขเพิ่มเติมดังนี้ค่ะ
>
> 1. กรณีเลือกไฟล์ Valid และ Invalid พร้อมกัน ปัจจุบัน UI ล้างไฟล์ทั้งหมด ทำให้ยังไม่ตรง AC-10/UI-05 ที่ต้องแจ้ง Invalid File และยัง Upload เฉพาะไฟล์ที่อนุญาตได้ กรุณาเพิ่ม Test ที่เลือกทั้งสองไฟล์พร้อมกันด้วยค่ะ
> 2. เพิ่ม Happy-path Test ของ Controlled Download ให้ตรวจ File Bytes, Original Filename, Content-Type และ Content-Disposition รวมถึง UI Test ที่กด Download และตรวจ Requester/Attachment ID
> 3. เพิ่ม Test สำหรับ AC-23 ว่าหลังมี Active Attachments ครบ 5 แล้ว Soft-remove หนึ่งไฟล์ สามารถ Upload ใหม่ได้หนึ่งไฟล์
> 4. Unexpected Database Failure ใน downloadAttachment ปัจจุบันตอบ 404 เหมือน Missing Resource แต่ API Contract กำหนดให้ Unexpected Failure ตอบ Safe 500 INTERNAL_ERROR กรุณาแยกกรณีและเพิ่ม Test ว่าไม่เปิดเผย Internal Detail
> 5. เพิ่ม Cross-owner Test สำหรับ GET /api/tickets/:ticketId/attachments เพื่อยืนยันว่า Requester คนอื่นได้รับ Safe 404
>
> หลังแก้ไขแล้วแจ้งให้ตรวจอีกครั้งได้เลยนะคะ

แหล่งที่มา: [รีวิว PR #19 บน GitHub](https://github.com/PhraewaS/toktickit/pull/19#pullrequestreview-5060379487)

**การตอบกลับของผู้จัดทำและผลตรวจซ้ำ (คัดลอกตรงจาก GitHub):**

> ขอบคุณสำหรับคำแนะนำค่ะ แก้ไขครบทั้ง 5 ประเด็น
> เพิ่ม Test และแก้ไข Download Error แล้ว
> Server Tests 46 ผ่าน, Client Tests 27 ผ่าน และ Build ผ่านทั้งสองส่วน
> รบกวนช่วยตรวจ PR #19 อีกครั้งค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #19](https://github.com/PhraewaS/toktickit/pull/19#issuecomment-5467825919)

> ตรวจสอบการแก้ไขอีกครั้งแล้วค่ะ แก้ไขครบทั้ง 5 ประเด็นและทำงานถูกต้องเรียบร้อยแล้วค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #19](https://github.com/PhraewaS/toktickit/pull/19#issuecomment-5467906071) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/19#pullrequestreview-5060511887)

### PR #21 — Responsive, E2E and Visual Evidence

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบ PR #21 แล้วค่ะ ส่วนใหญ่มีความถูกต้อง แต่มีบางประเด็นที่อยากแนะนำให้ปรับแก้ไข
> เพื่อให้ดียิ่งขึ้น
>
> 1. `mobile/my-tickets.png` ถูกบันทึกระหว่างแสดง `Loading My Tickets...` จึงยังไม่เป็นหลักฐานของ Mobile Ticket Cards และ Actions แนะนำให้ Responsive Test รอ Ticket Summary, Ticket Number หรือปุ่ม `View details` แสดงก่อนถ่าย Screenshot
> 2. ภาพ Tablet My Tickets ที่ 834px แสดง Table ด้านขวาไม่ครบ ทำให้ Created Date, Last Updated และ Actions ถูกซ่อน ซึ่งยังไม่ผ่านข้อกำหนดที่ทุกขนาดต้องไม่มี Clipping หรือ Hidden Actions แนะนำให้ใช้ Responsive Cards ที่ `< 992px` หรือปรับ Representation ให้ข้อมูลและ Actions มองเห็นและใช้งานได้ครบ
> 3. RESP-01 ควรเพิ่มการตรวจ Development Requester Selection และตรวจ `documentElement.scrollWidth <= window.innerWidth` สำหรับหน้า Create Ticket ด้วย ปัจจุบันตรวจ Overflow เฉพาะ My Tickets และ Ticket Detail
> 4. A11Y-01 Test ปัจจุบันตรวจเพียง Requester Select Accessible Name และ `aria-live` ขอให้เพิ่มหลักฐาน Keyboard Focus, Error Association ผ่าน `aria-describedby`, Active Navigation ผ่าน `aria-current="page"` และ State/Badge ที่ไม่สื่อด้วยสีอย่างเดียว
> 5. กรุณาปรับ Screenshot Path ให้ตรงกับ `ui-spec.md` และโครงสร้างใน Labsheet เช่น
>    `artifacts/lab-02/screenshots/create-ticket/{desktop,tablet,mobile}.png`
>    และรูปแบบเดียวกันสำหรับ My Tickets กับ Ticket Detail
> หากมีการนำไปปรับแก้ไขแล้ว สามารถแจ้งให้ตรวจอีกครั้งได้เลยนะคะ

แหล่งที่มา: [รีวิว PR #21 บน GitHub](https://github.com/PhraewaS/toktickit/pull/21#pullrequestreview-5060679045)

**ผลตรวจซ้ำจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบการแก้ไขล่าสุดแล้วค่ะ แก้ไขครบตามข้อเสนอแนะทั้ง 5 ประเด็นแล้ว
> ไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมค่ะ

แหล่งที่มา: [ความคิดเห็นติดตามผล](https://github.com/PhraewaS/toktickit/pull/21#issuecomment-5468532070)

**ความคิดเห็นเพิ่มเติมจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ไม่มีค่ะ ดีแล้วตอนนี้

แหล่งที่มา: [ความคิดเห็นเพิ่มเติม](https://github.com/PhraewaS/toktickit/pull/21#issuecomment-5468666447)

**การตอบกลับของผู้จัดทำและผลตรวจซ้ำ (คัดลอกตรงจาก GitHub):**

> แก้ไขตามข้อเสนอแนะครบแล้วค่ะ ทั้ง Responsive Cards, Overflow Check, A11Y Test และ Screenshot Path ตาม ui-spec.md
> ผลตรวจสอบ Server 46, Client 31 และ E2E 15 tests ผ่านทั้งหมด พร้อมอัปเดต PR และ Push commit ล่าสุดแล้วค่ะ รบกวนตรวจสอบอีกครั้งนะคะ

แหล่งที่มา: [ความคิดเห็นใน PR #21](https://github.com/PhraewaS/toktickit/pull/21#issuecomment-5468514508) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/21#pullrequestreview-5060807684)

**ความคิดเห็นเพิ่มเติมของผู้จัดทำ (คัดลอกตรงจาก GitHub):**

> ขอบคุณครับหวังว่าจะไม่ได้มีแก้อีกแล้วนะคะ

แหล่งที่มา: [ความคิดเห็นเพิ่มเติม](https://github.com/PhraewaS/toktickit/pull/21#issuecomment-5468651811)

### PR #24 — Final staging verification and peer-review records

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจแล้วภาพรวมของ Removal Reason 3–500 ตัวอักษร, Boundary Tests และ State Screenshots สอดคล้องกันดีค่ะ แต่ขอให้แก้อีก 2 จุดนะคะ
> - Removal Reason เป็น Required Field แต่ Label ยังไม่มีเครื่องหมาย * และ textarea ยังไม่มี required หรือ aria-required รบกวนเพิ่มพร้อม Test ตรวจ Required semantics ให้ตรงกับกติกา UI ใน Labsheet
> - Checklist ท้าย docs/lab-02/ui-spec.md ยังเป็น [ ] ทั้งหมด ทั้งที่ PR ระบุว่าตรวจ Visual/Responsive แล้ว รบกวนเปลี่ยนรายการที่ตรวจผ่านจริงเป็น [x] เพื่อให้หลักฐาน Answer Part 9 สอดคล้องกับผล Verification
> แก้สองจุดนี้แล้วส่งมาให้ตรวจอีกครั้งได้เลยนะคะ

แหล่งที่มา: [รีวิว PR #24 บน GitHub](https://github.com/PhraewaS/toktickit/pull/24#pullrequestreview-5090129896)

**การตอบกลับของผู้จัดทำ (คัดลอกตรงจาก GitHub):**

> อัปเดตตามข้อเสนอแนะเรียบร้อยแล้วค่ะ
>
> - เพิ่มเครื่องหมาย `*`, HTML `required` และ `aria-required="true"` ให้ Removal Reason พร้อมเพิ่ม Test ตรวจ Required semantics และ Boundary `3–500`
> - เปลี่ยน Responsive/Visual Checklist ท้าย `docs/lab-02/ui-spec.md` รายการที่ตรวจผ่านจริงเป็น `[x]`
> - Client Tests `32/32` ผ่าน และ Client Build ผ่าน
> - Commit ล่าสุด: `f164483`
>
> รบกวนตรวจสอบ PR #24 อีกครั้งได้เลยค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #24](https://github.com/PhraewaS/toktickit/pull/24#issuecomment-5510416165)

**ผลตรวจซ้ำจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจการแก้ไขล่าสุดแล้วค่ะ เพิ่ม Required semantics พร้อม Test และอัปเดต Visual Checklist ครบทั้งสองจุดแล้ว ไม่พบประเด็นที่ต้องแก้เพิ่มเติมค่ะ

แหล่งที่มา: [ความคิดเห็นติดตามผล](https://github.com/PhraewaS/toktickit/pull/24#issuecomment-5510519949) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/24#pullrequestreview-5090468739)

**สถานะการ Merge:**

PR #24 ถูก Merge เข้า `lab2-staging` แล้วเมื่อวันที่ 2 กันยายน 2026 ด้วย Merge Commit [`8d9cca0`](https://github.com/PhraewaS/toktickit/commit/8d9cca04bf4f51015eee63c51c01f2689800fab9)

### PR #26 — Move release verification fixes through reviewed branch

**ข้อความรีวิวจาก `@guluJa`:** ไม่มีข้อความแนบใน Review บน GitHub

**สถานะรีวิว:** `APPROVED`

แหล่งที่มา: [Approval Review ของ PR #26](https://github.com/PhraewaS/toktickit/pull/26#pullrequestreview-5100209117)

**สถานะการ Merge:**

PR #26 ถูก Merge เข้า `lab2-staging` เมื่อวันที่ 3 กันยายน 2026 ด้วย Merge Commit [`68de92b`](https://github.com/PhraewaS/toktickit/commit/68de92bbad045c0565af6c2c8fea673f11cb9de8)



## Pull Request ที่ผู้จัดทำ `@PhraewaS` เป็นผู้ตรวจให้เพื่อน

### PR #14 — เอกสารสัญญาวิศวกรรมและแผนการทดสอบ Lab 2

**ข้อความรีวิวจาก `@PhraewaS` (คัดลอกตรงจาก GitHub):**

>เมื่อเทียบกับข้อกำหนดใน Lab 2 แล้ว โดยรวมเอกสาร Engineering Contract จัดทำได้ค่อนข้างละเอียด มี Functional Requirements, Business Rules, Acceptance Criteria รวมถึง Data, API, UI Specification และ Definition of Done ครบถ้วนในระดับหนึ่งอย่างไรก็ตาม ก่อน Merge
>ขอเสนอให้แก้ไขเพิ่มเติมดังนี้:

>1. หน้า My Tickets ยังขาด UI/E2E Test สำหรับ Search, Filter, Sort และ Pagination ปัจจุบันพฤติกรรมเหล่านี้ถูกตรวจเฉพาะในระดับ API จึงควรเพิ่ม Component Test และ E2E Test เพื่อยืนยันว่าผู้ใช้สามารถใช้งาน Controls บนหน้า UI ได้จริง

>2. หน้า Create Ticket ยังขาด Acceptance Criteria และ Test สำหรับการโหลด Reference Data เช่น Category และ Related System ควรเพิ่มกรณี Loading, Ready, Failure, การปิดปุ่ม Submit เมื่อโหลดไม่สำเร็จ และ Retry

>3. Response shape ของ POST /api/tickets ยังไม่ชัดเจนว่า replayed จะอยู่ภายใน Ticket object หรือใช้รูปแบบ Response เช่น:
>
>```json
>{
>  "ticket": {},
>  "replayed": false
>}
>```
>
>ควรกำหนดรูปแบบ Response ของ HTTP 201 และ HTTP 200 ให้ชัดเจน พร้อมระบุใน API และ UI tests เพื่อป้องกันความเข้าใจไม่ตรงกันระหว่าง Frontend กับ Backend

แหล่งที่มา: [รีวิว PR #14 บน GitHub](https://github.com/guluJa/toktickit/pull/14#pullrequestreview-5018117061)

**การตอบกลับของเพื่อนผู้จัดทำ `@guluJa` (คัดลอกตรงจาก GitHub):**

> ขอบคุณสำหรับความคิดเห็นค่ะ ตรวจสอบแล้วเห็นด้วยกับทั้งสามประเด็นที่ควรแก้ หากแก้ไขและตรวจความสอดคล้องระหว่าง Specification, API Specification, UI Specification และ Test Plan แล้วจะแจ้งให้ทราบอีกครั้งค่ะ
>ขอบคุณสำหรับความคิดเห็นค่ะ แก้ไขตามข้อเสนอแนะเรียบร้อยแล้ว รบกวนช่วยตรวจสอบดูให้อีกครั้งทีนะคะ

แหล่งที่มา: [ความคิดเห็นแรกใน PR #14](https://github.com/guluJa/toktickit/pull/14#issuecomment-5409814212), [ความคิดเห็นถัดมา](https://github.com/guluJa/toktickit/pull/14#issuecomment-5409973958)

**ผลตรวจซ้ำ `@PhraewaS`(คัดลอกตรงจาก GitHub):**
> ตรวจสอบการแก้ไขรอบใหม่แล้ว จากการ Review ในครั้งก่อนหน้าได้รับการแก้ไขครบถ้วน ได้แก่ การเพิ่ม UI/E2E Test สำหรับ My Tickets controls, การเพิ่ม Acceptance Criteria และ Test สำหรับ Reference Data states และการกำหนด Create Ticket Response contract เป็น { ticket, replayed } อย่างชัดเจน เอกสาร Specification, API, UI และ Test Traceability สอดคล้องกันแล้ว จึงไม่มีสิ่งที่ต้องแก้ไขเพิ่มเติมแล้วค่ะ

แหล่งที่มา: [รีวิวติดตามผล PR #14](https://github.com/guluJa/toktickit/pull/14#pullrequestreview-5018625420)

**การตอบกลับของเพื่อนผู้จัดทำ `@guluJa` (คัดลอกตรงจาก GitHub):**
>ขอบคุณสำหรับคำแนะนำค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #14](https://github.com/guluJa/toktickit/pull/14#issuecomment-5410107481) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/guluJa/toktickit/pull/14#pullrequestreview-5018654555)


### PR #16 — Implement the Lab 2 data foundation and seed data

**ข้อความรีวิวจาก `@PhraewaS` (คัดลอกตรงจาก GitHub):**

>ตรวจสอบ Schema, Migration, Seed Data และผล Verification แล้ว พบว่าครบตามข้อกำหนดของ Lab 2 Data Foundation and Seed สามารถรันซ้ำได้โดยไม่สร้างข้อมูลซ้ำ จำนวน Categories, Related Systems และ Active/Inactive Development Requesters ถูกต้อง รวมถึง Prisma validation, migration status, server tests และ server build ผ่านครบถ้วนไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมภายในขอบเขตของ PR นี้แล้วค่ะ

แหล่งที่มา: [รีวิว PR #16 บน GitHub](https://github.com/guluJa/toktickit/pull/16#pullrequestreview-5022642437)

**การตอบกลับของเพื่อนผู้จัดทำ `@guluJa` (คัดลอกตรงจาก GitHub):**

> ขอบคุณค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #16](https://github.com/guluJa/toktickit/pull/16#issuecomment-5421435939) และสถานะรีวิว `APPROVED`


### PR #18 — Implement the Development Requester context

**ข้อความรีวิวจาก `@PhraewaS` (คัดลอกตรงจาก GitHub):**

>ตรวจสอบ Development Requester Selection, API endpoints, Requester context middleware, localStorage restore และ Change Requester แล้ว การทำงานหลักสอดคล้องกับขอบเขตของ PR นี้ก่อน Approve รบกวนเพิ่ม Test อีก 2 กรณี:
>Unknown positive requester ID ใน X-Development-Requester-Id ต้องคืน Safe 403
>ระหว่างกด Continue และกำลัง validate requester ให้ตรวจว่า Select/Continue ถูก disable และไม่สามารถเรียก API ซ้ำได้หลังจากตรวจสอบและแก้ไขแล้ว สามารถบอกให้เค้ามาช่วยดูให้อีกรอบได้นะคะ

>ได้ตรวจสอบการแก้ไขแล้ว พอว่าครบถ้วนตามประเด็นที่แจ้งเอาไว้
>เพิ่ม Test สำหรับ unknown requester context ให้คืน Safe 403
>เพิ่ม UI Test สำหรับสถานะ Continuing... เพื่อป้องกันการเรียก API ซ้ำ
>ไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมในขอบเขตของ PR นี้แล้วค่ะ

แหล่งที่มา: [รีวิว PR #18 ครั้งแรก](https://github.com/guluJa/toktickit/pull/18#pullrequestreview-5036581771), [รีวิวติดตามผล](https://github.com/guluJa/toktickit/pull/18#pullrequestreview-5041725927)

**การตอบกลับของเพื่อนผู้จัดทำ `@guluJa` (คัดลอกตรงจาก GitHub):**

> ขอบคุณสำหรับคำแนะนำค่ะ เพิ่ม Test ตามข้อเสนอแนะเรียบร้อยแล้ว:
>เพิ่มกรณี Unknown positive requester ID ใน X-Development-Requester-Id และตรวจสอบ Safe HTTP 403
>เพิ่มกรณี Continuing state โดยตรวจว่า Requester Select และ Continue ถูก Disable พร้อมยืนยันว่าเรียก Validation API เพียงครั้งเดียว
>Push การแก้ไขเข้า PR เดิมแล้ว รบกวนช่วยตรวจสอบให้อีกครั้งหน่อยนะคะ

>ขอบคุณสำหรับการตรวจสอบค่ะ

แหล่งที่มา: [ความคิดเห็นแรกใน PR #18](https://github.com/guluJa/toktickit/pull/18#issuecomment-5440219143), [ความคิดเห็นติดตามผล](https://github.com/guluJa/toktickit/pull/18#issuecomment-5440340843) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/guluJa/toktickit/pull/18#pullrequestreview-5041770150)


### PR #20 — Implement Lab 2 ticket creation

**ข้อความรีวิวจาก `@PhraewaS` (คัดลอกตรงจาก GitHub):**

>ตรวจสอบ Ticket Creation PR แล้ว การสร้าง Ticket, validation, reference-data loading และ test หลักทำได้ดี ก่อน Merge รบกวนแก้ไขเพิ่มเติมดังนี้:
>เพิ่ม System Information แบบ read-only/Pending ได้แก่ Ticket Number, Ticket Date, Requester และ Current Status รวมถึงแสดง Saved Values และปุ่ม View Ticket / My Tickets หลังสร้างสำเร็จ
>จัดการกรณี Ticket Number ซ้ำและ concurrent request ที่ใช้ submissionKey เดียวกัน เพื่อไม่ให้เกิด HTTP 500; ควร retry หรือ replay ตาม API Contract พร้อมเพิ่ม tests
>แสดง Backend error.fields เป็น Field-level errors ใน UI
>เพิ่ม required marker (*) หรือ aria-required สำหรับ required fields
>หาก Attachment จะทำใน PR ถัดไป กรุณาระบุ dependency ใน PR Description ให้ชัดเจน
>กรุณาแก้ไขแล้วส่งมาให้ตรวจอีกครั้งครับ/ค่ะ

>ตรวจสอบการแก้ไขแล้ว ประเด็นจาก Review ก่อนหน้าได้รับการแก้ไขครบถ้วน ทั้ง System Information, Saved Values, required fields, Backend field errors และการจัดการ Ticket Number collision/concurrent submission
>ไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมในขอบเขตของ PR นี้แล้วค่ะ

แหล่งที่มา: [รีวิว PR #20 ครั้งแรก](https://github.com/guluJa/toktickit/pull/20#pullrequestreview-5061423156), [รีวิวติดตามผล](https://github.com/guluJa/toktickit/pull/20#pullrequestreview-5062650506)

**การตอบกลับของเพื่อนผู้จัดทำ `@guluJa` (คัดลอกตรงจาก GitHub):**

> แก้ไขตาม Review ครบทุกประเด็นเรียบร้อยแล้วค่ะ พร้อมอัปเดต PR Description ให้ระบุ Deferred Dependencies ชัดเจน ตรวจสอบแล้ว Server Tests ผ่าน 36 รายการ, Client Tests ผ่าน 16 รายการ และ Build ทั้ง Server/Client ผ่านค่ะ รบกวนตรวจสอบอีกครั้งได้เลยนะคะ

>ขอบคุณสำหรับการตรวจสอบอีกครั้งนะคะ

แหล่งที่มา: [ความคิดเห็นแรกใน PR #20](https://github.com/guluJa/toktickit/pull/20#issuecomment-5470309189), [ความคิดเห็นติดตามผล](https://github.com/guluJa/toktickit/pull/20#issuecomment-5472961251) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/guluJa/toktickit/pull/20#pullrequestreview-5062692623)


### PR #22 — Implement requester-owned My Tickets

**ข้อความรีวิวจาก `@PhraewaS` (คัดลอกตรงจาก GitHub):**

>ตรวจสอบ My Tickets PR แล้ว ส่วนการแสดงรายการ Ticket, search/filter/sort, pagination, การจำกัดข้อมูลตาม requester และ test หลักทำได้ครบถ้วนดีค่ะ ก่อน Merge รบกวนดำเนินการเพิ่มเติมดังนี้:
>ปัจจุบันปุ่ม View ยัง disabled อยู่ เนื่องจากยังไม่ได้เชื่อมไปยัง Ticket Detail หากจะดำเนินการใน PR ถัดไป กรุณาระบุ dependency พร้อมลิงก์ PR/Issue ใน PR Description ให้ชัดเจน
>เพิ่ม API test สำหรับกรณีไม่มีหรือใช้ requester context ที่ไม่ถูกต้อง โดย API ควรตอบ 403 Forbidden แก้ไขหรือระบุ scope ให้ชัดเจนแล้ว รบกวนส่งมาให้ตรวจอีกครั้งนะคะ

>ตรวจสอบการแก้ไขแล้วครับ/ค่ะ มีการเพิ่ม test สำหรับ requester context ครบถ้วน โดยกรณี header หายหรือไม่ถูกต้องตอบ 400 และกรณี requester ไม่พบตอบ 403 ส่วน Ticket Detail ได้ระบุเป็นงานใน PR ถัดไปอย่างชัดเจนแล้ว ไม่พบสิ่งที่ต้องแก้ไขเพิ่มเติมแล้วนะคะ

แหล่งที่มา: [รีวิว PR #22 ครั้งแรก](https://github.com/guluJa/toktickit/pull/22#pullrequestreview-5064173303), [รีวิวติดตามผล](https://github.com/guluJa/toktickit/pull/22#pullrequestreview-5064677205)

**การตอบกลับของเพื่อนผู้จัดทำ `@guluJa` (คัดลอกตรงจาก GitHub):**

> แก้ไขตาม Review เรียบร้อยแล้วค่ะ
>เพิ่ม API Tests สำหรับ Missing/Malformed Requester Context ซึ่งคืน HTTP 400 และ Unknown Requester Context ซึ่งคืน Safe HTTP 403 ตาม API Contract
>เพิ่ม Dependency และลิงก์ Issue Implement requester-owned Ticket Detail #23 สำหรับ Ticket Detail ใน PR Description แล้ว
>ตรวจซ้ำ Server Tests ผ่าน 52 รายการ, Client Tests ผ่าน 22 รายการ และ Build ทั้ง Server/Client ผ่านค่ะ
>รบกวนตรวจ commit ล่าสุดอีกครั้งได้เลยนะคะ

>ขอบคุณสำหรับการตรวจสอบรวมถึงคำแนะนำต่าง ๆ ค่ะ

แหล่งที่มา: [ความคิดเห็นแรกใน PR #22](https://github.com/guluJa/toktickit/pull/22#issuecomment-5475707803), [ความคิดเห็นติดตามผล](https://github.com/guluJa/toktickit/pull/22#issuecomment-5476077652) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/guluJa/toktickit/pull/22#pullrequestreview-5064709231)


### PR #24 — Ticket Detail ของ Requester

**ข้อความรีวิวจาก `@PhraewaS` (คัดลอกตรงจาก GitHub):**

>ตรวจสอบการแก้ไขแล้ว ปุ่ม View เชื่อมไปยัง Ticket Detail ได้ถูกต้อง พร้อมการตรวจสอบ ownership, การจัดการสถานะ loading / not found / error และ tests ที่ครอบคลุมดีค่ะ
>อย่างไรก็ตาม PR นี้ยังแสดง Attachment ได้เฉพาะข้อมูล metadata เท่านั้น ยังไม่มีการเพิ่มไฟล์ ดาวน์โหลดไฟล์ หรือ soft-remove Attachment ซึ่งเป็นส่วนที่ต้องมีใน Lab 2
>หากส่วน Attachment จะดำเนินการใน PR ถัดไป กรุณาระบุไว้ใน PR Description ว่าเป็นงานต่อเนื่อง พร้อมแนบลิงก์ PR หรือ Issue ที่เกี่ยวข้องให้ชัดเจน
>ถ้าแก้ไขเรียบร้อยแล้วสามารถส่งมาให้ตรวจอีกครั้งได้นะคะ

>ตรวจสอบแล้วค่ะ ได้ระบุขอบเขตของ PR และ dependency สำหรับ Attachment lifecycle พร้อมแนบ Issue #25 ไว้อย่างชัดเจนแล้ว PR นี้จึงครอบคลุมส่วน requester-owned read-only Ticket Detail และ Attachment metadata ตามขอบเขตที่ระบุไว้ นอกเหนือจากนี้ไม่มีอะไรต้องแก้ไขแล้วค่ะ

แหล่งที่มา: [รีวิว PR #24 ครั้งแรก](https://github.com/guluJa/toktickit/pull/24#pullrequestreview-5066700516), [รีวิวติดตามผล](https://github.com/guluJa/toktickit/pull/24#pullrequestreview-5067071338)

**การตอบกลับของเพื่อนผู้จัดทำ `@guluJa` (คัดลอกตรงจาก GitHub):**

> เพิ่ม Issue #25 สำหรับ Attachment lifecycle และแนบลิงก์ไว้ใน PR Description เรียบร้อยแล้วค่ะ โดย PR นี้คงขอบเขตเป็น requester-owned read-only Ticket Detail และ Attachment metadata ส่วน upload, download และ soft removalจะดำเนินการใน Issue #25 รบกวนตรวจสอบอีกครั้งได้เลยนะคะ

>ตรวจสอบทุกอย่างเรียบร้อยแล้ว ขอบคุณมากค่ะ

แหล่งที่มา: [ความคิดเห็นแรกใน PR #24](https://github.com/guluJa/toktickit/pull/24#issuecomment-5478921254), [ความคิดเห็นติดตามผล](https://github.com/guluJa/toktickit/pull/24#issuecomment-5479142508) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/guluJa/toktickit/pull/24#pullrequestreview-5067104285)


### PR #26 — Move release verification fixes through reviewed branch

**การตอบกลับของผู้จัดทำ `@PhraewaS` ต่อ Review ก่อนหน้า (คัดลอกตรงจาก GitHub):**

> แก้ตาม Review แล้วค่ะ
>
> - ปรับ `tests.md` ให้ระบุชัดว่าผลจาก Commit `17416e7` เป็น Pre-release Verification ของ Feature Branch `feature/lab2-release-verification-fixes`
> - ไม่เรียกผลดังกล่าวว่าเป็นผลบน `lab2-staging` ก่อน PR #26 Merge
> - ระบุว่าเมื่อ PR #26 ผ่าน Peer Review และ Merge แล้ว จึงรัน/อ้างผลจาก `lab2-staging` ล่าสุดสำหรับ PR #25
> - Commit ล่าสุดของ PR นี้คือ `51fd8b3`
>
> รบกวนตรวจสอบ PR #26 อีกครั้งได้เลยนะคะ

แหล่งที่มา: [การตอบกลับของผู้จัดทำใน PR #26](https://github.com/PhraewaS/toktickit/pull/26#issuecomment-5513664620)

**ความคิดเห็นของผู้รีวิว `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบการแก้ไขล่าสุดแล้วค่ะ การย้าย Verification fixes มาอยู่ใน Feature Branch และนำกลับเข้า lab2-staging ผ่าน Peer Review เป็นไปตาม Required Branch Flow แล้ว เอกสารแยกผล Feature Branch, lab2-staging และ Final main ชัดเจน รวมถึง E2E selector จำกัดการเลือก View details อยู่ใน Ticket row ที่ตรงกับ Summary แล้ว
> ไม่พบประเด็นที่ต้องแก้เพิ่มเติมค่ะ

แหล่งที่มา: [ความคิดเห็นตรวจซ้ำใน PR #26](https://github.com/PhraewaS/toktickit/pull/26#issuecomment-5523574403)

**การตอบกลับของผู้จัดทำ `@PhraewaS` (คัดลอกตรงจาก GitHub):**

> > ตรวจสอบการแก้ไขล่าสุดแล้วค่ะ การย้าย Verification fixes มาอยู่ใน Feature Branch และนำกลับเข้า lab2-staging ผ่าน Peer Review เป็นไปตาม Required Branch Flow แล้ว เอกสารแยกผล Feature Branch, lab2-staging และ Final main ชัดเจน รวมถึง E2E selector จำกัดการเลือก View details อยู่ใน Ticket row ที่ตรงกับ Summary แล้ว ไม่พบประเด็นที่ต้องแก้เพิ่มเติมค่ะ
>
> ขอบคุณสำหรับการตรวจและการแนะนำต่างๆนะคะ

แหล่งที่มา: [การตอบกลับของผู้จัดทำใน PR #26](https://github.com/PhraewaS/toktickit/pull/26#issuecomment-5523617454)

**ผล Peer Review และการ Merge:**

- Formal Review จาก `@guluJa`: `APPROVED` (ไม่มีข้อความใน Review body)
- [สถานะ Review `APPROVED`](https://github.com/PhraewaS/toktickit/pull/26#pullrequestreview-5100209117)
- Merge Commit: [`68de92b`](https://github.com/PhraewaS/toktickit/commit/68de92bbad045c0565af6c2c8fea673f11cb9de8)


### PR #28 — Record PR #26 approval and merge evidence

**ข้อความรีวิวของผู้รีวิว `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบแล้วค่ะ ข้อมูล Approval และ Merge Commit 68de92b ของ PR #26 ตรงกับ GitHub จริง รวมถึงสถานะ Issue #27 ปิดแล้ว และการบันทึกใน reviewer.md สอดคล้องกับ Required Branch Flow ค่ะ ไม่พบประเด็นที่ต้องแก้เพิ่มเติม

แหล่งที่มา: [Review ของผู้รีวิวใน PR #28](https://github.com/PhraewaS/toktickit/pull/28#pullrequestreview-5100444120) จาก Commit [`db97699`](https://github.com/PhraewaS/toktickit/commit/db97699f2ecfeba63f296740e66d063523a24d38)

**การตอบกลับของผู้จัดทำ `@PhraewaS` (คัดลอกตรงจาก GitHub):**

> > ตรวจสอบแล้วค่ะ ข้อมูล Approval และ Merge Commit [68de92b](https://github.com/PhraewaS/toktickit/commit/68de92bbad045c0565af6c2c8fea673f11cb9de8) ของ PR #26 ตรงกับ GitHub จริง รวมถึงสถานะ Issue #27 ปิดแล้ว และการบันทึกใน reviewer.md สอดคล้องกับ Required Branch Flow ค่ะ ไม่พบประเด็นที่ต้องแก้เพิ่มเติม
> >
> > ขอบคุณมากๆเลยนะคะ ที่ค่อยมาตรวจให้เยอะแยะไปหมด

แหล่งที่มา: [การตอบกลับของผู้จัดทำใน PR #28](https://github.com/PhraewaS/toktickit/pull/28#issuecomment-5524039678)

**การตอบกลับของผู้รีวิว `@guluJa` (คัดลอกตรงจาก GitHub):**

> > ตรวจสอบแล้วค่ะ ข้อมูล Approval และ Merge Commit [68de92b](https://github.com/PhraewaS/toktickit/commit/68de92bbad045c0565af6c2c8fea673f11cb9de8) ของ PR #26 ตรงกับ GitHub จริง รวมถึงสถานะ Issue #27 ปิดแล้ว และการบันทึกใน reviewer.md สอดคล้องกับ Required Branch Flow ค่ะ ไม่พบประเด็นที่ต้องแก้เพิ่มเติม
> >
> > ขอบคุณมากๆเลยนะคะ ที่ค่อยมาตรวจให้เยอะแยะไปหมด
>
> ไม่เป็นไรเลยค่ะ

แหล่งที่มา: [การตอบกลับของผู้รีวิวใน PR #28](https://github.com/PhraewaS/toktickit/pull/28#issuecomment-5524062756)

**หลักฐานสถานะรีวิวและการ Merge (ไม่ใช่บทสนทนา):**

- ผู้รีวิว `@guluJa` ส่ง Review สถานะ `COMMENTED` ที่ [Review #5100444120](https://github.com/PhraewaS/toktickit/pull/28#pullrequestreview-5100444120)
- ผู้รีวิว `@guluJa` ส่ง Review สถานะ `APPROVED` ที่ [Review #5100563953](https://github.com/PhraewaS/toktickit/pull/28#pullrequestreview-5100563953) โดยไม่มีข้อความใน Review body
- PR #28 ถูก Merge เข้า `lab2-staging` ด้วย Commit [`f264f40`](https://github.com/PhraewaS/toktickit/commit/f264f40ca2e51801f263b371d38850de537ac325)


### PR #30 — Address release review feedback

**ข้อความรีวิวจากผู้รีวิว `@guluJa` (คัดลอกตรงจาก GitHub):**

> ได้ทำการตรวจสอบแล้ว PR #30 ถูกต้องและแก้ครบตาม 3 ประเด็นที่ระบุไว้ค่ะ
> - Success หลังสร้าง Ticket แสดง Saved Values จาก Backend และปุ่ม View Ticket / My Tickets ใช้งานได้จริง
> - error.fields ถูกส่งผ่าน ApiError และแสดงใต้ฟิลด์ที่เกี่ยวข้อง พร้อม test
> - Concurrent Attachment Upload ใช้ Serializable Transaction, retry เมื่อชนกัน และมี test ยืนยันว่า Active attachments ไม่เกิน 5
> - เอกสาร API/spec/tests และ screenshot evidence ถูกอัปเดตให้ตรงกับการแก้ไข
> - Branch flow ถูกต้อง: feature branch → lab2-staging
> ดังนั้นไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมค่ะ

แหล่งที่มา: [รีวิว PR #30](https://github.com/PhraewaS/toktickit/pull/30#pullrequestreview-5101274831) สถานะ `COMMENTED` จาก Commit [`3dc5123`](https://github.com/PhraewaS/toktickit/commit/3dc5123923ac04af8e7fddbc6c391ae43088fc47)

## รายการตรวจสอบความครบถ้วน

- [x] ทุก Feature PR มี Target เป็น `lab2-staging`
- [x] ทุก Feature PR มี Human Peer Review
- [x] ผู้ตรวจพิจารณา Diff เทียบกับ Base Branch และ Acceptance Criteria ของ Issue
- [x] ข้อเสนอแนะและการตอบกลับปรากฏใน PR จริง
- [x] มีสถานะอนุมัติก่อน Merge
- [x] `reviewer.md` มีตัวตนผู้ตรวจ ลิงก์ PR ข้อความรีวิว การตอบกลับ และผลอนุมัติ
- [ ] มี Release PR ไป `main` พร้อมผล Integration/Test
- [ ] ตรวจยืนยันผลสุดท้ายบน `main` และสร้าง Final PDF
