# การใช้ AI และ Reflection ของ Lab 3

LLM ที่ใช้: OpenAI Codex ใน Codex desktop workspace

Prompt ที่เลือกใช้:

1. แยกคำสั่งใน Lab 3 sheet ที่แนบมาออกจากคำขอของผู้ใช้ และทำงานต่อจาก Lab 2
2. สกัด engineering contract ของ Lab 3, database increment ที่จำเป็น, API contract, หน้าจอ UI, tests และข้อกำหนดการส่ง Answer Part 1-9
3. ออกแบบ additive Prisma migration ที่รักษา requester IDs, tickets และ attachments ของ Lab 2 ไว้
4. กำหนดแนวทาง cookie-session authentication ที่ปลอดภัย พร้อม first-login password change และ role/ownership middleware
5. Implement การบังคับใช้สิทธิ์ฝั่ง backend สำหรับ Requester, IT Staff และ Administrator พร้อม safe errors
6. ขยาย Zen Green client ด้วย Login, Staff Queue, Staff Detail และ User Management โดยรักษา requester regression ไว้
7. ตรวจ implementation เทียบกับ acceptance criteria ทุกข้อ และระบุ tests หรือ evidence ที่ยังขาด
8. ตรวจ builds, tests, migrations, seed idempotency และ responsive evidence ก่อน release

## Reflection ของฉัน

ช่วง specification-agent ช่วยบังคับให้ตัดสินใจเรื่อง session storage, ownership, role separation, status transitions และ migration compatibility ก่อนเริ่ม implementation ส่วน coding-agent มีประโยชน์มากกับงานซ้ำ ๆ เช่น API serialization, validation และการจัดการ UI state แต่ authorization rule และ migration decision ทุกข้อยังต้องตรวจด้วยตนเองเทียบกับเอกสาร Lab 3 อยู่เสมอ Tests และ final-main evidence เป็น acceptance gate; generated code ไม่ถือเป็นหลักฐานด้วยตัวมันเอง
