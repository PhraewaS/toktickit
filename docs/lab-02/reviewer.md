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
| [Engineering Contract and Test Plan](https://github.com/PhraewaS/toktickit/issues/10) | `feature/lab2-spec-contract` | [#11](https://github.com/PhraewaS/toktickit/pull/11) | [@guluJa](https://github.com/guluJa) | Approved | `c80c9dd` |
| [Database, Seed and Development Requester Context](https://github.com/PhraewaS/toktickit/issues/12) | `feature/lab2-data-requester-context` | [#13](https://github.com/PhraewaS/toktickit/pull/13) | [@guluJa](https://github.com/guluJa) | Approved | `6532a90` |
| [Ticket Creation API and UI](https://github.com/PhraewaS/toktickit/issues/14) | `feature/lab2-ticket-creation` | [#15](https://github.com/PhraewaS/toktickit/pull/15) | [@guluJa](https://github.com/guluJa) | Approved | `184785a` |
| [My Tickets API และ UI](https://github.com/PhraewaS/toktickit/issues/16) | `feature/lab2-my-tickets` | [#17](https://github.com/PhraewaS/toktickit/pull/17) | [@guluJa](https://github.com/guluJa) | Approved | `c78128b` |
| [Requester Ticket Detail and Attachment Lifecycle](https://github.com/PhraewaS/toktickit/issues/18) | `feature/lab2-ticket-detail-attachments` | [#19](https://github.com/PhraewaS/toktickit/pull/19) | [@guluJa](https://github.com/guluJa) | Approved | `127b66f` |
| [Responsive, E2E and Visual Evidence](https://github.com/PhraewaS/toktickit/issues/20) | `feature/lab2-responsive-e2e-visual` | [#21](https://github.com/PhraewaS/toktickit/pull/21) | [@guluJa](https://github.com/guluJa) | Approved | `6b42926` |
| Release Integration | `lab2-staging` → `main` | Pending | Pending | Pending | Pending |

---

## Reviewer Comments I Received

### PR / Issue: Engineering Contract and Test Plan (#11)

**Reviewer comment:**

> Reviewer `@guluJa` requested more explicit data-model details, Empty/No-results response metadata, AC-26/AC-27 test traceability, and a decision for the Reset/Cancel behavior.

**How I responded:**

> Updated the Lab 2 contract documents in commit [`dfb0f22`](https://github.com/PhraewaS/toktickit/commit/dfb0f22e4f6aaabe2fbbfec00c735fc353c2118a) and recorded the response in [PR #11](https://github.com/PhraewaS/toktickit/pull/11).

**Final reviewer response:**

> Reviewer `@guluJa` approved PR #11 before merge.

### PR / Issue: My Tickets API และ UI (#17)

**Reviewer comment:**

> เสนอให้แก้ `clearFilters()` ให้ค่า Sort บน UI ตรงกับ Query, เพิ่ม Test สำหรับ Requester A → B, ขยาย UI-06 ให้ครอบคลุม Controls/States และเพิ่ม API Test สำหรับ Unexpected Database Failure

**How I responded:**

> แก้ไขใน commit [`3539fba`](https://github.com/PhraewaS/toktickit/commit/3539fba846e4bad3a41548bd4156a35ad25bea30) และ [`eae80d4`](https://github.com/PhraewaS/toktickit/commit/eae80d43f946673dd1ba2540705f3fa6bba955e6) พร้อมแนบผลการตรวจสอบใน [PR #17](https://github.com/PhraewaS/toktickit/pull/17#issuecomment-5464671067)

**Final reviewer response:**

> Reviewer `@guluJa` approved the follow-up changes before PR #17 was merged into `lab2-staging`.

### PR / Issue: Ticket Detail and Attachment Lifecycle (#19)

**Reviewer comment:**

> Reviewer `@guluJa` requested mixed valid/invalid upload coverage, controlled-download metadata checks, replacement upload after soft-remove, safe `500 INTERNAL_ERROR` for unexpected download failure, and cross-owner attachment-list coverage.

**How I responded:**

> Added the requested behavior and tests in commit [`27e0e61`](https://github.com/PhraewaS/toktickit/commit/27e0e61735519525ef17a39ed5af2e94b6f72bbb) and recorded the response in [PR #19](https://github.com/PhraewaS/toktickit/pull/19#issuecomment-5467825919).

**Final reviewer response:**

> Reviewer `@guluJa` confirmed all five points were fixed and approved PR #19 before merge.

### PR / Issue: Responsive, E2E and Visual Evidence (#21)

**Reviewer comment:**

> Reviewer `@guluJa` requested data-ready screenshot timing, Tablet Cards, Selection/Create overflow checks, expanded A11Y evidence, and the Labsheet screenshot directory layout.

**How I responded:**

> Implemented the fixes and added the evidence in commit [`f2f50a2`](https://github.com/PhraewaS/toktickit/commit/f2f50a2ebf192b2d1e31f1e0753e61d5d28549ef), then documented the response in [PR #21](https://github.com/PhraewaS/toktickit/pull/21#issuecomment-5468514508).

**Final reviewer response:**

> Reviewer `@guluJa` confirmed all five points were fixed, found no further issues, and approved PR #21 before merge.

### PR / Issue: Ticket Creation API and UI (#15)

**Reviewer comment:**

> Reviewer `@guluJa` confirmed the implementation matched the Acceptance Criteria and requested no further changes. See [PR #15](https://github.com/PhraewaS/toktickit/pull/15).

**How I responded:**

> Author response and final review are recorded in [PR #15](https://github.com/PhraewaS/toktickit/pull/15).

**Final reviewer response:**

> Approved by `@guluJa` before merge.

เพิ่ม Section รูปแบบเดียวกันสำหรับทุก PR ที่มี Comment สำคัญ โดยเฉพาะข้อเสนอเรื่อง Specification, Ownership, Validation, Migration, Attachment Safety, Tests และ Responsive UI

---

## Pull Requests I reviewed for my partner

### Partner PR: ไม่พบข้อมูลใน Repository

**My comment:**

> ยังไม่มี PR ของ Partner ที่ระบุให้ตรวจใน GitHub จากข้อมูลที่เข้าถึงได้ในขณะนี้

**Partner's response:**

> ต้องมีลิงก์ PR/Issue ของ Partner หากต้องบันทึกส่วนนี้ใน Final PDF

---

## Review Completion Checklist

- [x] ทุก Feature PR Target ไป `lab2-staging`
- [x] ทุก Feature PR มี Human Peer Review
- [x] Reviewer ตรวจเฉพาะ Diff เทียบ Base Branch และ Acceptance Criteria ของ Issue
- [x] Requested Changes และ Author Responses ปรากฏใน PR จริง
- [x] Approval เกิดก่อน Merge
- [ ] `reviewer.md` มี Reviewer Identity, PR Links, Comments, Responses และ Approvals ครบ
- [ ] Integration/Test Results แนบใน Release PR
- [ ] Release PR Target `main` จาก `lab2-staging`
- [ ] Final PDF ใช้หลักฐานจริงและ Link เปิดได้
