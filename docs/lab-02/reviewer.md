# Lab 2 — บันทึกการตรวจงานโดยเพื่อน

เอกสารนี้บันทึก Pull Request ของ Lab 2 ที่ผู้จัดทำส่งให้เพื่อนตรวจ รวมถึงข้อเสนอแนะ การตอบกลับ และผลการอนุมัติที่เกิดขึ้นจริงใน GitHub โดยข้อความในส่วน “ข้อความจาก GitHub” คัดลอกตามต้นฉบับ ไม่ได้แปลหรือสรุปใหม่

**ผู้จัดทำ:** นางสาวแพรวา สภานนท์ — 67070507213 — GitHub: [@PhraewaS](https://github.com/PhraewaS)

**ผู้ตรวจจาก Lab 1:**

- นางสาวธนภรณ์ บุณฑริกมาศ — 67070507204 — GitHub: [@thanapornboont-star](https://github.com/thanapornboont-star)
- นางสาวณัฐวดี ภูเขม่า — 67070507201 — GitHub: [@guluJa](https://github.com/guluJa)
- นายสิริกร ฝันนิมิตร — 67070507215 — GitHub: [@chaproi](https://github.com/chaproi)

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
| การรวม Release | `lab2-staging` → `main` | ยังไม่มี PR | ยังไม่มี | รอดำเนินการ | ยังไม่มี |

หมายเหตุ: ขณะจัดทำเอกสารนี้ยังไม่มี Release PR จาก `lab2-staging` ไป `main` จึงยังไม่บันทึกผลการตรวจหรือการอนุมัติในส่วนดังกล่าว

---

## ข้อเสนอแนะและการตอบกลับที่เกิดขึ้นจริงใน GitHub

ข้อความในกรอบด้านล่างเป็นข้อความที่คัดลอกตรงจาก GitHub ส่วนคำอธิบายก่อนกรอบใช้ภาษาไทยเพื่อบอกบริบทเท่านั้น

### PR #11 — สัญญาวิศวกรรมและแผนการทดสอบ

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

### PR #13 — ฐานข้อมูล Seed และบริบท Requester สำหรับพัฒนา

**ข้อความรีวิวจาก `@guluJa` (คัดลอกตรงจาก GitHub):**

> ตรวจสอบ PR #13 เทียบกับ Issue #12 และ Engineering Contract แล้วค่ะ
> ส่วน Implementation ผ่านตามขอบเขตของ Issue แต่อยากขอให้ตรวจดูเพิ่มเติมเล็กน้อยค่ะ โดยในส่วนของ Issue #12 ยังควรเป็น Open และอยู่สถานะ PR Review จนกว่า PR #13 จะ Merge เข้า lab2-staging แล้วจึง Close/Done

แหล่งที่มา: [รีวิว PR #13 บน GitHub](https://github.com/PhraewaS/toktickit/pull/13#pullrequestreview-5021967145)

**การตอบกลับของผู้จัดทำและผลตรวจซ้ำ (คัดลอกตรงจาก GitHub):**

> ขอบคุณสำหรับการรีวิวและคำแนะนำค่ะ ตอนนี้ตรวจสอบและแก้ไขเรียบร้อยแล้วค่ะ โดย Issue #12 เป็น Open และอยู่ในสถานะ PR Review พร้อมเชื่อมกับ PR #13 แล้วค่ะ จะคงสถานะนี้ไว้จนกว่า PR #13 จะ Merge เข้า lab2-staging จากนั้นจึงเปลี่ยนเป็น Done และ Close Issue ค่ะ
>
> จากการตรวจสอบอีกครั้ง ตอนนี้ไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมภายในขอบเขตของ PR นี้แล้วค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #13](https://github.com/PhraewaS/toktickit/pull/13#issuecomment-5421458441) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/13#pullrequestreview-5027366379)

### PR #15 — API และ UI สำหรับสร้าง Ticket

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

### PR #17 — My Tickets API และ UI

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

### PR #19 — รายละเอียด Ticket และวงจรชีวิต Attachment

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

### PR #21 — Responsive, E2E และหลักฐานภาพ

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
>
> หากมีการนำไปปรับแก้ไขแล้ว สามารถแจ้งให้ตรวจอีกครั้งได้เลยนะคะ

แหล่งที่มา: [รีวิว PR #21 บน GitHub](https://github.com/PhraewaS/toktickit/pull/21#pullrequestreview-5060679045)

**การตอบกลับของผู้จัดทำและผลตรวจซ้ำ (คัดลอกตรงจาก GitHub):**

> แก้ไขตามข้อเสนอแนะครบแล้วค่ะ ทั้ง Responsive Cards, Overflow Check, A11Y Test และ Screenshot Path ตาม ui-spec.md
> ผลตรวจสอบ Server 46, Client 31 และ E2E 15 tests ผ่านทั้งหมด พร้อมอัปเดต PR และ Push commit ล่าสุดแล้วค่ะ รบกวนตรวจสอบอีกครั้งนะคะ

แหล่งที่มา: [ความคิดเห็นใน PR #21](https://github.com/PhraewaS/toktickit/pull/21#issuecomment-5468514508)

> ตรวจสอบการแก้ไขล่าสุดแล้วค่ะ แก้ไขครบตามข้อเสนอแนะทั้ง 5 ประเด็นแล้ว
> ไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมค่ะ

แหล่งที่มา: [ความคิดเห็นใน PR #21](https://github.com/PhraewaS/toktickit/pull/21#issuecomment-5468532070) และสถานะรีวิว `APPROVED` [บน GitHub](https://github.com/PhraewaS/toktickit/pull/21#pullrequestreview-5060807684)

## Pull Request ที่ผู้จัดทำเป็นผู้ตรวจให้เพื่อน

จากข้อมูลใน Repository และ GitHub ที่เข้าถึงได้ขณะจัดทำเอกสารนี้ ยังไม่พบลิงก์ PR/Issue ของเพื่อนที่ผู้จัดทำเป็นผู้ตรวจ จึงยังไม่มีข้อความรีวิวหรือการตอบกลับส่วนนี้ให้บันทึก หากมีลิงก์ภายหลังให้เพิ่มข้อมูลตามข้อความจริงจาก GitHub โดยไม่สรุปหรือแปลข้อความรีวิว

## รายการตรวจสอบความครบถ้วน

- [x] ทุก Feature PR มี Target เป็น `lab2-staging`
- [x] ทุก Feature PR มี Human Peer Review
- [x] ผู้ตรวจพิจารณา Diff เทียบกับ Base Branch และ Acceptance Criteria ของ Issue
- [x] ข้อเสนอแนะและการตอบกลับปรากฏใน PR จริง
- [x] มีสถานะอนุมัติก่อน Merge
- [x] `reviewer.md` มีตัวตนผู้ตรวจ ลิงก์ PR ข้อความรีวิว การตอบกลับ และผลอนุมัติ
- [ ] มี Release PR ไป `main` พร้อมผล Integration/Test
- [ ] ตรวจยืนยันผลสุดท้ายบน `main` และสร้าง Final PDF
