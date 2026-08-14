# Lab 1 — AI Use and Reflection 

แบบบันทึกการใช้งาน AI / Agent ในการพัฒนาโปรเจกต์ **TokTickIT** (Lab 1)

---

## AI Model and Agent Environment
- **LLM / Model:** GPT-5-based model
- **AI Agent:** OpenAI Codex
- **Agent role:** Assisted with requirement analysis, implementation planning, troubleshooting, code review, testing guidance, and documentation.

---

## Selected key prompts (6–10)
| # | Actual Prompt Text | What I did with the result |
|---|---------------------|----------------------------|
| 1 | ช่วยอ่าน Lab 1 ทั้งหมด อธิบายสิ่งที่ต้องทำอย่างละเอียด และวางแผนขั้นตอนโดยห้ามลงมือทำ | ใช้สรุปขอบเขตงาน Issues ทั้ง 4, Branch workflow, Tests และหลักฐานที่ต้องส่ง ก่อนเริ่มพัฒนา |
| 2 | ช่วยอธิบายขั้นตอนการสร้าง main, lab1-staging และ feature branches แบบไม่ข้ามขั้น | ใช้เตรียม Git workflow และตรวจสอบว่าแต่ละ Feature PR ส่งเข้า `lab1-staging` ไม่ใช่ `main` |
| 3 | ช่วยตรวจ Project Foundation ของ Issue 1 ว่าต้องติดตั้งและทดสอบ Frontend, Backend, PostgreSQL และ Prisma อย่างไร | ทำตามคำแนะนำทีละขั้น แล้วตรวจสอบ Frontend, Backend, `.gitignore`, `.env.example` และ README ด้วยตนเอง |
| 4 | Implement `GET /api/health` ให้คืน HTTP 200 และ JSON `{ "status": "ok", "service": "TokTickIT API" }` โดยทำเฉพาะ Issue 2 และไม่เพิ่ม Category feature | ใช้เป็นแนวทางทำ Health endpoint และ Supertest จากนั้นตรวจ Diff เพื่อยืนยันว่าไม่มีงานของ Issue 4 ปนอยู่ |
| 5 | สร้าง Prisma Category model และ seed ข้อมูล Account and Access, Hardware, Software และ Network โดย seed ต้องรันซ้ำแล้วไม่เกิดข้อมูลซ้ำ | ใช้ทำ Issue 3 และตรวจด้วยตนเองว่า Model มี `id`, unique `name`, `createdAt` และ Seed ใช้แนวทาง `upsert` |
| 6 | Implement `GET /api/categories` ให้ดึงข้อมูลจาก PostgreSQL ผ่าน Prisma เรียงตาม ID และส่งกลับเฉพาะ `id` กับ `name` | ใช้ทำ Category API และตรวจ Response ด้วย Supertest โดยไม่ส่ง `createdAt` ออกทาง API |
| 7 | สร้าง React UI สำหรับปุ่ม Check System ที่มี Loading, Online, Offline และแสดง Category ทั้ง 4 จาก API โดยห้าม hard-code Category ใน Component | ใช้ทำ Issue 4 และเพิ่ม Vitest สำหรับ Loading, Success และ Error states |
| 8 | ช่วยตรวจ Pull Request เทียบกับ Acceptance Criteria และช่วยเรียบเรียงข้อความ Review แบบสุภาพและเข้าใจง่าย | ใช้ช่วยตรวจ PR และปรับข้อความ Review แต่ตรวจ `Files changed` อีกครั้งด้วยตนเองก่อน Approve หรือ Request changes |

---

## Reflection
การระบุ Issue, Branch, Acceptance Criteria และขอบเขตที่ไม่ต้องการให้ AI ทำ ช่วยให้คำตอบตรงกับ Git workflow มากขึ้น ฉันเรียนรู้ว่าต้องตรวจคำแนะนำของ AI เทียบกับ Lab Sheet และ `Files changed` ทุกครั้ง เพราะในบางครั้ง AI เข้าใจว่าโค้ดจาก Starter Scaffold เป็นโค้ดที่เพิ่งเพิ่มใน Pull Request หลังจากนั้นฉันจึงปรับ Prompt ให้ระบุ Base Branch และขอให้ตรวจเฉพาะ Diff ก่อนนำคำแนะนำไปใช้ โดยฉันเป็นผู้ตรวจสอบและตัดสินใจขั้นสุดท้ายทุกครั้ง