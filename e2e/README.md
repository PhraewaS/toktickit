# Lab 3 and Lab 4 E2E verification

มาตรฐานการเชื่อมต่อ PostgreSQL สำหรับ workflow ของ TokTik ทุก Lab คือ `127.0.0.1:5433` ให้คงพอร์ตนี้ไว้ใน `.env`/environment ของการทดสอบทุกชุด และใช้ฐานข้อมูลแยกตาม Lab ตามตัวอย่างด้านล่าง ห้ามเปลี่ยนไปใช้ฐานข้อมูล production หรือฐานข้อมูลที่มีข้อมูลผู้ใช้จริง

การรัน E2E ของ Lab 3 ต้องใช้ฐานข้อมูล PostgreSQL สำหรับ E2E โดยเฉพาะเท่านั้น ห้ามใช้ฐานข้อมูล production หรือฐานข้อมูลที่มีข้อมูลผู้ใช้จริง

ตัวอย่างการตั้งค่าใน PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://toktickit:toktickit@127.0.0.1:5433/toktickit_lab3_e2e?schema=public"
$env:LAB3_SEED_PASSWORD = "<local-only-password>"
$env:LAB3_E2E_DATABASE = "true"
$env:LAB3_E2E_RESET_PASSWORDS = "true"
npm exec --prefix e2e playwright test -- --config e2e/playwright.lab3.config.ts
```

The Lab 3 Playwright configuration starts a fresh API and client process for the current revision (`reuseExistingServer=false`). It passes the guarded E2E `DATABASE_URL` to that API process; an already-running development backend is never reused. `E2E_DATABASE_URL` may be used instead of `DATABASE_URL` when the dedicated URL should be supplied separately.

`LAB3_E2E_DATABASE=true` และ `LAB3_E2E_RESET_PASSWORDS=true` จะทำงานได้เฉพาะเมื่อ `DATABASE_URL` ชี้ไปที่ `localhost` หรือ `127.0.0.1` และชื่อฐานข้อมูลเป็น `toktickit_lab3_e2e` หรือ `toktickit_e2e` เท่านั้น หากไม่ตรงเงื่อนไข seed จะหยุดทันทีเพื่อป้องกันการล้างข้อมูลผิดฐานข้อมูล

Fixture reset จะล้าง sessions, tickets, attachments, comments, notes และผู้ใช้ที่ไม่ได้อยู่ใน deterministic seed ก่อน seed ใหม่ จึงทำให้ทุก test เริ่มจากข้อมูลชุดเดิมและไม่สะสม Ticket ข้ามรอบ

Credential ต้องส่งผ่าน environment ภายในเครื่องเท่านั้น ห้ามใส่ค่า password จริงใน source, commit, report หรือ screenshot

## Lab 4 E2E and responsive evidence

Lab 4 uses a separate local PostgreSQL database. Do not point this workflow at production, shared, or personal-data databases. The guard accepts only `localhost`/`127.0.0.1` and the exact database name `toktickit_lab4_e2e`; Lab 3's `toktickit_lab3_e2e` and `toktickit_e2e` names are rejected by the Lab 4 setup.

Example PowerShell setup (use local-only credentials; do not save or commit them):

```powershell
$env:E2E_DATABASE_URL = "postgresql://toktickit:toktickit@127.0.0.1:5433/toktickit_lab4_e2e?schema=public"
$env:LAB4_SEED_PASSWORD = "<local-only-password>"
$env:LAB4_E2E_DATABASE = "true"
npm run test:lab4 --prefix e2e
```

The Lab 4 configuration starts fresh API and Client processes (`reuseExistingServer=false`), deploys all migrations, and runs the deterministic seed before tests. Every fixture reset rechecks the dedicated Lab 4 database name before deleting test rows. Tests run serially to avoid racing fixture resets. Desktop-only data-mutation flows run once; the responsive suite runs at desktop (1440 px), tablet (834 px), and mobile (390 px) viewports.

`E2E-00` compares the seeded Staff Dashboard and Action Taken data across two seed resets. `E2E-04` covers Staff create/edit and Requester read-only visibility; `E2E-05/06` cover Requester/Staff Dashboard drill-downs; `E2E-07` covers the resolution gate and successful resolution after evidence is recorded. `RESP-04` writes viewport screenshots to `artifacts/lab-04/screenshots/` and checks page/control horizontal overflow. The performance smoke suite is run separately with `LAB4_E2E_DATABASE=true`, the same dedicated URL, and `LAB4_SEED_PASSWORD`. Before running it, reset the deterministic fixture using the guarded Lab 4 seed (the E2E flows deliberately change first-login passwords). In PowerShell, keep the E2E variables from the example above set and run from the repository root:

```powershell
$env:DATABASE_URL = $env:E2E_DATABASE_URL
$env:LAB3_SEED_PASSWORD = $env:LAB4_SEED_PASSWORD
$env:LAB4_E2E_RESET_PASSWORDS = "true"
Push-Location server
npm run prisma:seed
npm test -- tests/lab-04/performance-smoke.test.ts
Pop-Location
```

The suite records 10 sequential requests per dashboard/action-list endpoint, max duration, and failures. Never describe a planned or skipped database-backed run as passing evidence.
