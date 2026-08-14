# Lab 1 — Peer Review Record  (fill this in)

**Author:** <นางสาวแพรวา สภานนท์> — <67070507213> — GitHub: @<PhraewaS>
**Peer reviewer:** <นางสาวธนภรณ์ บุณฑริกมาศ> — <67070507204> — GitHub: @<thanapornboont-star>
**Peer reviewer:** <นางสาวณัฐวดี  ภูเขม่า> — <67070507201> — GitHub: @<guluJa>
**Peer reviewer:** <นายสิริกร ฝันนิมิตร> — <67070507215> — GitHub: @<chaproi>

## Pull Requests I authored (reviewed by my partner)

| PR | Branch | Reviewer verdict |
|---|---|---|
| [PR #5](https://github.com/PhraewaS/toktickit/pull/5) | `feature/1-project-foundation` | Approved |
| [PR #6](https://github.com/PhraewaS/toktickit/pull/6) | `feature/2-health-check` | Changes requested, then approved |
| [PR #7](https://github.com/PhraewaS/toktickit/pull/7) | `feature/3-category-seed` | Approved |
| [PR #8](https://github.com/PhraewaS/toktickit/pull/8) | `feature/4-category-list` | Changes requested, then approved |

Reviewer comment I received: <โดยรวม PR นี้ตรงกับ Issue 1 และ target branch เป็น lab1-staging ถูกต้อง README มีข้อมูล technology stack, วิธี setup และ testing ค่อนข้างครบ>

<ใน PR นี้พบว่ามี code เดิมที่เป็น TODO/stub ค้างอยู่ก่อน implementation จริง เช่น throw new Error("checkSystem not implemented yet") และ res.status(501)... แล้วตามด้วย implementation ใหม่ รบกวนลบ stub/unreachable code ที่ไม่จำเป็นออก ให้เหลือ implementation ของ Issue 2 ที่ชัดเจนเพียงชุดเดียว เพราะตอนนี้อาจทำให้ code อ่านยากและเกิดความสับสนว่า response ที่ต้องการจริงคืออะไร หลังแก้แล้วรบกวนรัน test ของ Issue 2 อีกครั้งและแจ้งผลไว้ใน PR นะคะ><Approve เรียบร้อยแล้วค่ะ>

<Implementation ของ Category model และ idempotent seed ถูกต้องตาม requirement แต่ใน server/prisma/seed.ts ยังมี console.log("TODO: implement the category seed.") ค้างอยู่ ทั้งที่ implementation จริงอยู่ด้านล่างแล้ว รบกวนลบ TODO log นี้ออกได้ไหมคะ หรือไม่ทราบว่าแก้ไขแล้วแต่ทางนี้ดูไม่ครบเอง><โอเคค่ะ เดี๋ยวApprove ให้นะคะ>

<ตรวจสอบแล้ว พบว่าการเรียก Categories API ผ่าน Prisma การเรียงข้อมูลตาม ID การแสดงผลข้อมูลจาก API รวมถึง Loading และ Error states ทำได้ถูกต้องค่ะ อย่างไรก็ตาม แนะนำว่า API ควรปรับให้ส่งกลับเฉพาะ id และ name เพิ่มการตรวจสอบ ID และรูปแบบ response ใน Supertest และเพิ่ม Account and Access ใน Vitest ให้ครบทั้ง 4 categories ค่ะ><ตรวจสอบการแก้ไขแล้วค่ะ การแก้ไขครบถ้วนตามคำแนะนำและตรงตาม Acceptance Criteria ของ Issue #4 แล้ว ไม่พบประเด็นที่ต้องแก้ไขเพิ่มเติมค่ะ>

How I responded: <ขอบคุณมากค่ะ>
<คือแพรลองเช็คดูแล้วนะคะ โค้ดถูกแล้วตรงที่แดงคือโค้ดที่ลบไป ช่วยเช็คดูให้อีกทีได้ไหมคะ สกรีนช็อต 2026-08-14 003031ตรงนี้คือที่ลองเทสค่ะ><ขอบคุณมากเลยนะคะ>
<แพรตรวจดูอีกรอบแล้วนะคะ TODO ออกหมดแล้วและก็โค้ดถูกแล้ว ยังมีตรงไหนที่สมควรแก้ไขอีกไหมคะ><เริ่ดไม่ไหว ขอบคุณนะคะ>
<ขอบคุณสำหรับคำแนะนำนะคะ แก้เรียบร้อยแล้วค่ะ ตอนนี้ API ส่งกลับเฉพาะ id กับ name เพิ่มการตรวจสอบ Response ใน Supertest และเพิ่ม Account and Access ใน Vitest ให้ครบทั้ง 4 Categories แล้วค่ะ ทดสอบทั้ง Frontend และ Backend ผ่านครบ รบกวนช่วยตรวจให้อีกครั้งนะค><ขอบคุณคร้าบบบ>

## Pull Requests I reviewed for my partner

My comment: <Issue 1 ตรวจสอบแล้ว PR นี้ตรงกับขอบเขตของ Issue 1 และ Target Branch เป็น lab1-staging ถูกต้องค่ะ README มีข้อมูลค่อนข้างครบ ทั้ง Technology Stack, วิธี Setup Frontend/Backend และวิธีรัน Tests โดยรวมผ่าน Acceptance Criteria ของ Issue 1 ค่ะ>
chaproi's response: <...>

My comment: <Issue 2 มีงานของ Issue 4 ปนอยู่ ควรให้ Issue 2 มีเฉพาะ Health Check, Test, การแสดง Backend Status และ Error เมื่อ Backend ใช้งานไม่ได้ ส่วน Category API และ Category UI ให้ย้ายไปทำบน feature 4-category-list หลัง Issue 3 Merge เข้า lab1-staging แล้ว ลองเช็คแก้ไขตรวจสอบดูอีกทีนะคะ>
<โอเคค่ะ ขอบคุณที่ชี้แจงนะคะ เรากลับไปดู Files changed อีกรอบแล้ว เห็นว่า PR นี้แก้เฉพาะส่วน Health Check ของ Issue 2 จริง ๆส่วนโค้ดที่เกี่ยวกับ Category และ TODO ของ Issue 4 มีอยู่ใน Starter Scaffold ตั้งแต่ก่อนสร้าง Branch นี้แล้ว ไม่ได้เป็นโค้ดที่เพิ่มเข้ามาใน PR นี้ขอโทษที่รอบแรกเข้าใจคลาดเคลื่อนนะคะ ไม่ต้องลบหรือย้าย Category code แล้วค่ะ เดี๋ยวเราจะ Review และ Approve ให้อีกครั้งนะคะ>

guluJa's response: <ตรวจสอบ Files changed เทียบกับ Base Branch lab1-staging อีกครั้งแล้ว พบว่า PR นี้มีเฉพาะงานของ Issue 2 ดังนี้:
เพิ่ม GET /api/health ให้ตอบ HTTP 200 และ JSON ตาม Acceptance Criteria
เพิ่ม checkHealth() สำหรับเรียก Health API จริง
หน้า React แสดง Loading, Backend Status: Online และข้อความ Offline เมื่อ Backend ใช้งานไม่ได้
Supertest ของ Health Endpoint ผ่านแล้ว
PR นี้ไม่ได้เพิ่ม GET /api/categories, ไม่ได้เรียก Category API และไม่ได้แสดง Category UI ค่ะ
ส่วน Category, SystemStatus, checkSystem() และ TODO ของ Issue 4 ที่ยังเห็นในไฟล์ เป็น Starter Scaffold ที่มีอยู่ใน Base Branch lab1-staging อยู่ก่อนแล้ว จึงไม่ปรากฏเป็นโค้ดที่เพิ่มใน Diff และเก็บไว้เพื่อ Implement ภายหลังบน feature/4-category-list หลัง Issue 3 Merge แล้วค่ะ ดังนั้นส่วนนี้จึงยังไม่มี Category code หากมีส่วนไหนไม่ถูกต้องหรือควรได้รับการแก้ไขปรับปรุง บอกได้เลยนะคะ>