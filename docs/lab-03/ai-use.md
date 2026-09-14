# การใช้ AI และ Reflection ของ Lab 3

LLM ที่ใช้: OpenAI Codex ใน Codex desktop workspace

ส่วนนี้บันทึก prompt สำคัญที่ใช้จริงระหว่างการวิเคราะห์ ตรวจ implementation และเตรียมหลักฐาน ไม่รวม credential หรือข้อมูลลับ

## Selected key prompts และ Reflection

1. **Prompt ที่ใช้จริง:** “อ่าน Lab 3 sheet แล้วแยกข้อกำหนดของเอกสารออกจากคำขอของผู้ใช้ พร้อมทำ checklist ของ scope, acceptance criteria, repository structure, tests และ GitHub workflow”
   **Reflection:** ฉันใช้ checklist นี้เป็นขอบเขตหลัก และตัดสินใจแยก implementation PR, contract/traceability และ final evidence ออกจากกัน เพื่อไม่ให้หลักฐานของงานที่ยังไม่ merge ถูกอ้างว่าเป็น final release

2. **Prompt ที่ใช้จริง:** “ตรวจว่า migration จาก Lab 2 ต้องรักษา requester IDs, Ticket IDs, Attachment IDs และ foreign keys เดิมอย่างไร และเสนอวิธีทดสอบบน PostgreSQL จริง”
   **Reflection:** ฉันตรวจ schema, migration และ isolated verification เอง และกำหนดว่าการสร้างข้อมูลใหม่แทนข้อมูลเดิมไม่ถือว่าผ่าน migration regression เพราะไม่พิสูจน์การรักษา identity เดิม

3. **Prompt ที่ใช้จริง:** “ตรวจ API contract ของ authentication, session, first-login gate, role authorization และ ownership แล้ว map แต่ละ rule ไปยัง production route และ test file”
   **Reflection:** ฉันยืนยันเองว่า security control ต้องอยู่ backend ไม่ใช่ซ่อนปุ่มใน UI และตรวจแยก `401`, `403`, `404`, `409` ตามความหมายของ contract รวมถึง logout/session revocation และ inactive user

4. **Prompt ที่ใช้จริง:** “ตรวจ Staff Queue และ Staff Ticket Detail เทียบกับ Lab 3 ว่า response envelope, filter, sort, pagination, assignment, priority, status, comments, notes และ attachment authorization ตรงกันหรือไม่”
   **Reflection:** ฉันตรวจ response shape จาก backend เทียบกับ client type และ test mock โดยเฉพาะ `{ data: { items, pagination } }` และตัดสินใจเพิ่ม tie-breaker/field assertion เพื่อให้ test ตรวจ behavior จริง ไม่ใช่เพียง helper

5. **Prompt ที่ใช้จริง:** “ตรวจ Administrator permissions และ safety rules ให้แยกสิ่งที่ Administrator ทำได้จากสิ่งที่ทำไม่ได้ รวมถึง last-active-Administrator และ session revocation หลัง deactivate/reset password”
   **Reflection:** ฉันตรวจทั้ง success และ denial cases เอง และไม่ถือเพียงการเรียก `session.deleteMany()` เป็นหลักฐาน จึงกำหนดให้มี request ถัดไปด้วย session เดิมและตรวจ `401 SESSION_INVALID`

6. **Prompt ที่ใช้จริง:** “ตรวจ Client role landing, loading/error/empty/forbidden states, responsive layout และ Staff Queue response integration จาก API จริง”
   **Reflection:** ฉันเลือกตรวจ heading ของหน้าที่เปิดจริง ไม่ใช่ตรวจแค่ navigation link และแยก failure ออกจาก forbidden/empty/no-results เพราะแต่ละ state มีความหมายและการแก้ไขคนละแบบ

7. **Prompt ที่ใช้จริง:** “ตรวจ Playwright configuration ว่าใช้ server และ dedicated E2E PostgreSQL ของ revision ปัจจุบัน ไม่ reuse development backend และมี guard ป้องกันการ reset ผิดฐานข้อมูล”
   **Reflection:** ฉันตรวจ environment propagation, `DATABASE_URL`, `LAB3_E2E_DATABASE`, seed reset และ `reuseExistingServer` เอง แล้วกำหนดให้ config ปฏิเสธ URL ที่ไม่ใช่ localhost และไม่ใช่ชื่อฐานข้อมูล E2E ที่อนุญาต

8. **Prompt ที่ใช้จริง:** “ตรวจ E2E-08 ที่ยัง Planned ว่าควรรัน legacy Lab 2 flow หรือแทนด้วย authenticated Requester regression ตาม Lab 3 contract พร้อมอัปเดต traceability”
   **Reflection:** ฉันตรวจว่า legacy Lab 2 flow ต้องใช้ Development Requester selector ซึ่ง Lab 3 ยกเลิกแล้ว จึงเพิ่ม E2E-08 ใน authenticated session flow ของ Lab 3 และบันทึกเหตุผลการแทนที่อย่างชัดเจนแทนการปล่อย Required regression เป็น Planned

9. **Prompt ที่ใช้จริง:** “จัดทำ final evidence โดยแยกผลทดสอบที่รันจริง, screenshot/report, review/approval, merge commit และ final-main verification พร้อมไม่ปิด Issue #38 ก่อน final release”
   **Reflection:** ฉันตัดสินใจให้ PR #45 ใช้ `Relates to #38` ไม่ใช่ `Closes #38` และให้ Issue #38 เป็นตัวรวบรวมหลักฐานหลัง merge เท่านั้น เพื่อให้ workflow สะท้อนสถานะจริง

## สรุปการใช้ AI

AI ช่วยสกัดข้อกำหนด เสนอแนวทาง และลดงานซ้ำ เช่น serialization, validation และ test scaffolding แต่การตัดสินใจเรื่อง migration identity, authorization boundary, database safety, test traceability และสถานะ final evidence ฉันตรวจเทียบกับ Lab 3 contract และผลรันจริงด้วยตนเองเสมอ Generated code หรือคำตอบจาก AI ไม่ถือเป็นหลักฐานจนกว่าจะตรวจจาก source, production route, test output และ Git history แล้ว
