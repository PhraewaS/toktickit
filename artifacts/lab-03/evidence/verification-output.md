# หลักฐานการตรวจสอบ Lab 3

ผลการรันจริงชุดนี้เกิดขึ้นบน revision ปัจจุบันของ PR #45 หลังแก้ E2E database guard, Staff Queue assertions และ E2E-08 แล้ว คำสั่งทั้งหมดรันในเครื่องด้วย PostgreSQL ที่ `127.0.0.1:5433` และฐานข้อมูลเฉพาะ `toktickit_lab3_e2e` โดยใช้ `LAB3_E2E_DATABASE=true` และ `LAB3_E2E_RESET_PASSWORDS=true` เท่านั้น รหัสผ่าน seed ส่งผ่าน environment ภายในเครื่อง ไม่ได้บันทึกหรือ commit ลง repository

ไฟล์ด้านล่างเป็น complete console output ที่เก็บจากการรันจริง ไม่ใช่เพียงสรุปจำนวน test

## Migration และ Seed

```text
คำสั่ง: npm run prisma:deploy (จาก server/)
ผลลัพธ์: ผ่าน; พบ 3 migrations และไม่มี migration ค้างอยู่

คำสั่ง: npm run prisma:seed (จาก server/)
ผลลัพธ์: ผ่าน
ข้อมูล seed: 4 categories, 6 related systems, 5 requesters,
3 active IT Staff และ 1 Administrator
```

## การตรวจสอบ Server

```text
คำสั่ง: npm test -- --run (จาก server/)
คำสั่งที่ใช้จริง: npm test -- --run --pool=threads --poolOptions.threads.singleThread
ผลลัพธ์: ผ่าน 22 test files และ 104 tests; exit code 0

คำสั่ง: npm run build (จาก server/)
ผลลัพธ์: ผ่าน
```

## การตรวจสอบ Client

```text
คำสั่ง: npm test -- --run (จาก client/)
ผลลัพธ์: ผ่าน 16 test files และ 65 tests; exit code 0

คำสั่ง: npm run build (จาก client/)
ผลลัพธ์: ผ่าน
```

## การตรวจสอบ Playwright

```text
คำสั่ง: npm exec --prefix e2e playwright test -- --config e2e/playwright.lab3.config.ts
ผลลัพธ์: exit code 0
รวม: 42 tests
ผ่าน: 26
ข้าม: 16
ไม่ผ่าน: 0
```

การข้าม 16 รายการเป็นไปตามการออกแบบของ test เพราะ flow ที่แก้ไขข้อมูล first-login และข้อมูลผู้ใช้ของ Authentication, Requester, Staff และ Administrator กำหนดให้รันเฉพาะ desktop เพื่อป้องกัน fixture ชนกัน ส่วน responsive และ evidence tests รันครบทั้ง desktop, tablet และ mobile โดย E2E-06 และ E2E-08 ผ่านจริงใน desktop

`EVIDENCE-01 Staff Queue screenshot` ผ่านครบ 3/3 viewport หลังปรับ responsive cell layout โดย Ticket Number และข้อความในแต่ละ field แสดงเป็นบรรทัดที่อ่านได้ ไม่ถูกบีบเป็นแนวตั้ง และไม่มี clipping

การตรวจ `git diff --check` ผ่าน และมี safety guard ใน fixture/seed ให้ reset ได้เฉพาะ dedicated local/E2E database ที่กำหนดเท่านั้น เพื่อให้ข้อมูลทดสอบ reproducible และไม่สะสม Ticket จากฐานข้อมูลอื่น

## Complete console output

- [Server: migration, seed, full test suite และ build](./server-console-output.txt)
- [Client: test suite และ build](./client-console-output.txt)
- [Playwright: full console output ของ 42 tests](./playwright-console-output.txt)

## ไฟล์หลักฐานที่เปิดดูได้จาก GitHub

- [Playwright report — latest 39-test run](./playwright-report/index.html)
- [Login - desktop](../screenshots/authentication/login-desktop.png)
- [Login - tablet](../screenshots/authentication/login-tablet.png)
- [Login - mobile](../screenshots/authentication/login-mobile.png)
- [Change Password - desktop](../screenshots/authentication/change-password-desktop.png)
- [Change Password - tablet](../screenshots/authentication/change-password-tablet.png)
- [Change Password - mobile](../screenshots/authentication/change-password-mobile.png)
- [Staff Queue - desktop](../screenshots/staff-queue/staff-queue-desktop.png)
- [Staff Queue - tablet](../screenshots/staff-queue/staff-queue-tablet.png)
- [Staff Queue - mobile](../screenshots/staff-queue/staff-queue-mobile.png)
- [Staff Ticket Detail - desktop](../screenshots/staff-ticket-detail/staff-ticket-detail-desktop.png)
- [Staff Ticket Detail - tablet](../screenshots/staff-ticket-detail/staff-ticket-detail-tablet.png)
- [Staff Ticket Detail - mobile](../screenshots/staff-ticket-detail/staff-ticket-detail-mobile.png)
- [Administrator User Management - desktop](../screenshots/user-management/user-management-desktop.png)
- [Administrator User Management - tablet](../screenshots/user-management/user-management-tablet.png)
- [Administrator User Management - mobile](../screenshots/user-management/user-management-mobile.png)

หมายเหตุด้าน traceability: E2E-02 และ E2E-03 ตรวจ role landing, navigation และการเปิดหน้าจอจริงใน browser ส่วน mutation และ authorization ที่เปลี่ยนข้อมูลตรวจผ่าน production API integration/E2E API flows ตามที่ระบุใน `docs/lab-03/tests.md` ไม่ได้อ้างว่าเป็น UI workflow ครบทุก mutation จาก screenshot เพียงอย่างเดียว การข้าม 16 รายการของ Playwright เป็นไปตามการออกแบบให้ flow ที่แก้ไข first-login หรือข้อมูลผู้ใช้รันเฉพาะ desktop ส่วน responsive/evidence assertions รันครบ desktop, tablet และ mobile
