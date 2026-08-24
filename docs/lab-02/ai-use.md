# Lab 2 — AI Use and Reflection

แบบบันทึกการใช้งาน AI / Agent ในการพัฒนาโปรเจกต์ **TokTickIT** (Lab 2)

---

## AI Model and Agent Environment

- **LLM / Model:** GPT-5-based model
- **AI Agent:** OpenAI Codex
- **Agent role:** ช่วยอ่าน Requirement, วาง Engineering Contract, วาง Test Traceability, ตรวจ Repository, วาง Implementation Order, ช่วยเขียน Code/Tests, ตรวจ Failure Cases และช่วยจัด Documentation
- **Human responsibility:** ผู้จัดทำเป็นผู้ตรวจและอนุมัติ Specification, Business Rules, API/UI Decisions, Code, Migration, Dependencies, Commands, Tests, Pull Requests และ Evidence ขั้นสุดท้าย

---

## Selected Key Prompts (6–10)

| # | Actual Prompt Text | What I did with the result |
|---|---|---|
| 1 | ช่วยอ่าน Lab 2 ทั้งหมดและอธิบายสิ่งที่ต้องทำตั้งแต่ Specification, Implementation, Tests, GitHub Workflow จนถึง Final PDF โดยห้ามลงมือทำ | ใช้แยก Scope, Required Screens, API, Database, Tests, Branch Flow, คะแนน และสิ่งที่อยู่นอก Scope ก่อนเริ่มงาน |
| 2 | ช่วยแบ่งงานเป็นขั้นตอนอย่างละเอียดว่าควรเริ่มเขียน Code จากตรงไหน | ใช้เรียง Dependency ให้เริ่มจาก Engineering Contract, Database/Seed, Development Requester Context แล้วจึงทำ Ticket Features |
| 3 | ช่วยบอก Code ที่ต้องใช้ในแต่ละขั้นตอนโดยดูจาก Technology Stack ของ Repository จริง | ใช้เป็น Technical Blueprint แต่ยังตรวจ Schema, API Contract และ Existing Code ด้วยตนเองก่อนนำไปใช้ |
| 4 | Read the Lab 2 requirement file and the TokTickIT repository, then follow the instructions correctly. | ใช้ตรวจว่า Repository เป็น React/Vite/Bootstrap, Express, Prisma, PostgreSQL และ Vitest และตรวจ Required Files จาก Labsheet |
| 5 | You can now implement as required, make sure to follow requirement strictly like branching. | ใช้เริ่ม Workflow `main` → `lab2-staging` → Feature Branch และจัดทำ Contract ก่อน Implementation |
| 6 | ตรวจ Repository Path และห้ามแก้ผิด Project Folder | ใช้ตรวจพบว่า Local Repository Ref เก่า จากนั้น Fetch Remote แบบ Read-only เก็บ Existing Untracked Work ใน Safety Stash และสร้าง `lab2-staging` จาก Completed Lab 1 `origin/main` |
| 7 | Rewrite Lab 2 documents in Thai using the writing style from Lab 1 while keeping all comprehensive requirements. | ใช้ปรับเอกสารทั้ง 6 ไฟล์เป็นภาษาไทยผสม Technical Terms ตามรูปแบบ Lab 1 โดยคง FR/BR/AC และ Traceability |
| 8 | Audit the approved contract against every AC and planned test; report missing evidence and do not claim completion early. | จะใช้ตรวจ Final Integration, Missing Tests, Skipped Tests, Ownership Gaps และ UI-spec Deviations ก่อน Release PR |

---

## Reflection

การระบุ Repository Path, Base Branch, Issue Scope, Acceptance Criteria และสิ่งที่ห้าม AI ทำ ช่วยลดความผิดพลาดและทำให้ Git Workflow ตรงกับ Labsheet มากขึ้น ในช่วงแรก AI เลือก Project Folder ผิด แม้ Requirement Analysis จะถูกต้อง แต่การแก้ไฟล์ผิด Repository เป็นข้อผิดพลาดสำคัญ หลังจากนั้นจึงตรวจ Absolute Path, Git Remote, Branch และ `git status` ก่อนแก้ไฟล์ทุกครั้ง พร้อมเก็บ Existing Work ไว้ใน Safety Stash แทนการลบหรือเขียนทับ

ฉันเรียนรู้ว่าต้องตรวจคำตอบของ AI เทียบกับ Lab Sheet, Specification และ `Files changed` ทุกครั้ง โดยเฉพาะ Business Rules ที่ Labsheet เปิดให้นักศึกษาตัดสินใจ เช่น Validation Limits, Ownership Error, Duplicate Submission และ Attachment Compensation Strategy ฉันเป็นผู้ตรวจสอบและตัดสินใจขั้นสุดท้าย และจะไม่ใช้ข้อความ Approved, Test Passed หรือ Evidence ใดหากยังไม่ได้เกิดขึ้นจริง