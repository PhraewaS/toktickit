# Lab 2 — Peer Review Record

แบบบันทึก Peer Review สำหรับ Feature Pull Requests และ Release Pull Request ของ Lab 2

**Author:** นางสาวแพรวา สภานนท์ — 67070507213 — GitHub: [@PhraewaS](https://github.com/PhraewaS)

**Peer reviewers จาก Lab 1:**

- นางสาวธนภรณ์ บุณฑริกมาศ — 67070507204 — GitHub: [@thanapornboont-star](https://github.com/thanapornboont-star)
- นางสาวณัฐวดี ภูเขม่า — 67070507201 — GitHub: [@guluJa](https://github.com/guluJa)
- นายสิริกร ฝันนิมิตร — 67070507215 — GitHub: [@chaproi](https://github.com/chaproi)

> หมายเหตุ: ต้องยืนยัน Reviewer ของ Lab 2 อีกครั้งก่อนใส่ใน Final PDF ตารางด้านล่างต้องบันทึกข้อมูลที่เกิดขึ้นจริงเท่านั้น ห้ามใส่ Approved ก่อน Reviewer อนุมัติ PR จริง

---

## Pull Requests I authored (reviewed by my partner)

| Issue / Scope | Branch | Pull Request | Reviewer | Reviewer Verdict | Merge Commit |
|---|---|---|---|---|---|
| [Engineering Contract and Test Plan](https://github.com/PhraewaS/toktickit/issues/10) | `feature/lab2-spec-contract` | [#11](https://github.com/PhraewaS/toktickit/pull/11) | Pending | Pending | `c80c9dd` |
| [Database, Seed and Development Requester Context](https://github.com/PhraewaS/toktickit/issues/12) | `feature/lab2-data-requester-context` | [#13](https://github.com/PhraewaS/toktickit/pull/13) | [@guluJa](https://github.com/guluJa) | Approved | `6532a90` |
| [Ticket Creation API and UI](https://github.com/PhraewaS/toktickit/issues/14) | `feature/lab2-ticket-creation` | [#15](https://github.com/PhraewaS/toktickit/pull/15) | Pending | Pending | Pending |
| [My Tickets API และ UI](https://github.com/PhraewaS/toktickit/issues/16) | `feature/lab2-my-tickets` | [#17](https://github.com/PhraewaS/toktickit/pull/17) | Pending | Pending | Pending |
| [Requester Ticket Detail and Attachment Lifecycle](https://github.com/PhraewaS/toktickit/issues/18) | feature/lab2-ticket-detail-attachments | Pending | Pending | Pending | Pending |
| [Responsive, E2E and Visual Evidence](https://github.com/PhraewaS/toktickit/issues/20) | `feature/lab2-responsive-e2e-visual` | Pending | Pending | Pending | Pending |
| Release Integration | `lab2-staging` → `main` | Pending | Pending | Pending | Pending |

---

## Reviewer Comments I Received

### PR / Issue: My Tickets API และ UI (#17)

**Reviewer comment:**

> เสนอให้แก้ `clearFilters()` ให้ค่า Sort บน UI ตรงกับ Query, เพิ่ม Test สำหรับ Requester A → B, ขยาย UI-06 ให้ครอบคลุม Controls/States และเพิ่ม API Test สำหรับ Unexpected Database Failure

**How I responded:**

> แก้ไขใน commit [`3539fba`](https://github.com/PhraewaS/toktickit/commit/3539fba846e4bad3a41548bd4156a35ad25bea30) และ [`eae80d4`](https://github.com/PhraewaS/toktickit/commit/eae80d43f946673dd1ba2540705f3fa6bba955e6) พร้อมแนบผลการตรวจสอบใน [PR #17](https://github.com/PhraewaS/toktickit/pull/17#issuecomment-5464671067)

**Final reviewer response:**

> Pending — รอการตรวจซ้ำและ Approval บน PR #17

### PR / Issue: Pending

**Reviewer comment:**

> Pending — วางข้อความ Review ที่ได้รับจริง พร้อม Link ไปยัง Comment

**How I responded:**

> Pending — อธิบายว่าตรวจสอบหรือแก้ไขอะไร พร้อม Link ไปยัง Commit/Response

**Final reviewer response:**

> Pending — Approved หรือ Changes requested ตามที่เกิดขึ้นจริง

เพิ่ม Section รูปแบบเดียวกันสำหรับทุก PR ที่มี Comment สำคัญ โดยเฉพาะข้อเสนอเรื่อง Specification, Ownership, Validation, Migration, Attachment Safety, Tests และ Responsive UI

---

## Pull Requests I reviewed for my partner

### Partner PR: Pending

**My comment:**

> Pending — บันทึก Comment ที่ตรวจ Acceptance Criteria, Files changed, Tests และ Branch Target จริง

**Partner's response:**

> Pending — บันทึก Response หรือ Commit ที่ Partner แก้ไข

---

## Review Completion Checklist

- [ ] ทุก Feature PR Target ไป `lab2-staging`
- [ ] ทุก Feature PR มี Human Peer Review
- [ ] Reviewer ตรวจเฉพาะ Diff เทียบ Base Branch และ Acceptance Criteria ของ Issue
- [ ] Requested Changes และ Author Responses ปรากฏใน PR จริง
- [ ] Approval เกิดก่อน Merge
- [ ] `reviewer.md` มี Reviewer Identity, PR Links, Comments, Responses และ Approvals ครบ
- [ ] Integration/Test Results แนบใน Release PR
- [ ] Release PR Target `main` จาก `lab2-staging`
- [ ] Final PDF ใช้หลักฐานจริงและ Link เปิดได้
