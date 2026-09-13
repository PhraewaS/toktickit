# หลักฐานการตรวจสอบ Lab 3

Revision ที่ตรวจสอบผลชุดนี้: [`f2a1312`](https://github.com/PhraewaS/toktickit/commit/f2a1312)

คำสั่งด้านล่างรันในเครื่องด้วย PostgreSQL ที่ `127.0.0.1:5433` และฐานข้อมูลเฉพาะ `toktickit_lab3_e2e` โดยใช้ `LAB3_E2E_DATABASE=true` และ `LAB3_E2E_RESET_PASSWORDS=true` เท่านั้น รหัสผ่าน seed ส่งผ่าน environment ภายในเครื่องและไม่ได้บันทึกหรือ commit ลง repository

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
ผลลัพธ์: ผ่าน 22 test files และ 104 tests

คำสั่ง: npm run build (จาก server/)
ผลลัพธ์: ผ่าน
```

## การตรวจสอบ Client

```text
คำสั่ง: npm test -- --run (จาก client/)
ผลลัพธ์: ผ่าน 16 test files และ 65 tests

คำสั่ง: npm run build (จาก client/)
ผลลัพธ์: ผ่าน
```

## การตรวจสอบ Playwright

```text
คำสั่ง: npm exec --prefix e2e playwright test -- --config e2e/playwright.lab3.config.ts
ผลลัพธ์: exit code 0
รวม: 39 tests
ผ่าน: 25
ข้าม: 14
ไม่ผ่าน: 0
```

การข้าม 14 รายการเป็นไปตามการออกแบบของ test เพราะ flow ที่แก้ไขข้อมูล first-login และข้อมูลผู้ใช้ของ Authentication, Requester, Staff และ Administrator กำหนดให้รันเฉพาะ desktop เพื่อป้องกัน fixture ชนกัน ส่วน responsive และ evidence tests รันครบทั้ง desktop, tablet และ mobile

การตรวจ `git diff --check` ผ่าน และมี safety guard ใน fixture/seed ให้ reset ได้เฉพาะ dedicated local/E2E database ที่กำหนดเท่านั้น เพื่อให้ข้อมูลทดสอบ reproducible และไม่สะสม Ticket จากฐานข้อมูลอื่น

## ไฟล์หลักฐานที่เปิดดูได้จาก GitHub

- [Playwright report](../playwright-report/index.html)
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
