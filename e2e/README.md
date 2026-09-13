# Lab 3 E2E verification

การรัน E2E ของ Lab 3 ต้องใช้ฐานข้อมูล PostgreSQL สำหรับ E2E โดยเฉพาะเท่านั้น ห้ามใช้ฐานข้อมูล production หรือฐานข้อมูลที่มีข้อมูลผู้ใช้จริง

ตัวอย่างการตั้งค่าใน PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://toktickit:toktickit@127.0.0.1:5433/toktickit_lab3_e2e?schema=public"
$env:LAB3_SEED_PASSWORD = "<local-only-password>"
$env:LAB3_E2E_DATABASE = "true"
$env:LAB3_E2E_RESET_PASSWORDS = "true"
npm exec --prefix e2e playwright test -- --config e2e/playwright.lab3.config.ts
```

`LAB3_E2E_DATABASE=true` และ `LAB3_E2E_RESET_PASSWORDS=true` จะทำงานได้เฉพาะเมื่อ `DATABASE_URL` ชี้ไปที่ `localhost` หรือ `127.0.0.1` และชื่อฐานข้อมูลเป็น `toktickit_lab3_e2e` หรือ `toktickit_e2e` เท่านั้น หากไม่ตรงเงื่อนไข seed จะหยุดทันทีเพื่อป้องกันการล้างข้อมูลผิดฐานข้อมูล

Fixture reset จะล้าง sessions, tickets, attachments, comments, notes และผู้ใช้ที่ไม่ได้อยู่ใน deterministic seed ก่อน seed ใหม่ จึงทำให้ทุก test เริ่มจากข้อมูลชุดเดิมและไม่สะสม Ticket ข้ามรอบ

Credential ต้องส่งผ่าน environment ภายในเครื่องเท่านั้น ห้ามใส่ค่า password จริงใน source, commit, report หรือ screenshot
