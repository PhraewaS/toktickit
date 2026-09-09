# UI Specification ของ TokTickIT Lab 3

Lab 3 client ขยาย Zen Green tokens, field groups, cards, badges, state panels, focus treatment และ responsive rules จาก Lab 2 ส่วน shell header แสดง TokTickIT, ชื่อและ role badge ของผู้ใช้ที่ authenticated, role-specific navigation และ Logout production client จะไม่มี Development Requester selector หรือ Change requester action

## หน้าจอและโหมดการทำงาน

| หน้าจอ | โหมด | controls และ feedback หลัก |
|---|---|---|
| Login | view, submitting, validation, failure | Email/password, safe error, inactive-safe error และ busy state |
| Change Password | mandatory form, submitting, success/failure | New/confirm password, password rules และ success continuation |
| Create Ticket | create, loading, validation, success/failure | fields และ attachments เดิมของ Lab 2 โดย authenticated requester เป็น read-only |
| My Tickets | loading, populated, empty, no-results, failure | search/filter/sort/pagination เดิม และแสดงเฉพาะผลลัพธ์ของเจ้าของ |
| Requester Ticket Detail | loading, view, comment, resolved, failure | ข้อมูล ticket แบบ read-only, attachments, Public Comments และ resolved indication |
| Staff Ticket Queue | loading, populated, empty/no-results, forbidden/failure | IT Staff: queue สำหรับปฏิบัติงาน; Administrator: queue สำหรับ oversight พร้อมแก้ IT Priority ได้; search, status/priority/owner filters, sortable table, page controls และเปิด detail ได้ |
| Staff Ticket Detail | view/edit/read-only, saving, success/validation/conflict/failure | IT Staff: owner assignment, IT Priority, status, public comment และ Internal Note composers; Administrator: owner field เป็น read-only และอาจแสดง Administrator ที่ IT Staff assign ไว้ แก้ IT Priority ได้ แต่ไม่มี controls สำหรับ assignment, status, comment และ note mutation |
| User Management | loading, list, create, edit, reset-password, validation/forbidden/conflict/failure | รายการ name/email/role/status, search, optional role filter และ small modal/form; deactivation มี confirmation และแจ้งว่า sessions ของ user ถูก revoke แล้ว |

## กฎด้าน Responsive และ Accessibility

Desktop ใช้ queue table ที่อ่านง่าย โดยมี Ticket Number, Summary, Category, Requested Priority, IT Priority, Status, Owner และ Last Updated ส่วน tablet จัด table ไว้ภายใน card ที่เลื่อนดูได้อย่างปลอดภัย; mobile เปลี่ยนแต่ละแถวเป็น stacked card ที่มี label และยังเข้าถึง actions ได้ ฟอร์ม user และ ticket จะยุบเป็นหนึ่งคอลัมน์เมื่อความกว้างต่ำกว่า 760px และห้ามมี page-level horizontal overflow ทุก input ต้องมี label, error ต้องอยู่ติดกับ input และเชื่อมผ่าน `aria-describedby`, focus ต้องมองเห็นได้, status ห้ามสื่อสารด้วยสีเพียงอย่างเดียว และ loading/saving states ต้องใช้ `aria-live` หรือ `role=alert/status`

Internal Notes ใช้ tinted panel ที่มี label ชัดเจน และแสดงคำเตือน “private to IT Staff and Administrators” เหนือรายการโดยตรง เฉพาะ IT Staff เท่านั้นที่เห็น composer; Administrator เห็น notes แบบ read-only และไม่เห็น Add Internal Note control Public Comments ใช้ neutral panel แยกต่างหาก Requester เห็นรายการและ composer เฉพาะ ticket ของตน; IT Staff เห็น staff-side composer; Administrator เห็น comments แบบ read-only IT Priority แก้ไขได้โดย IT Staff และ Administrator ส่วน owner assignment และ status controls ใช้ได้เฉพาะ IT Staff controls ที่แก้ไขได้ต้องแตกต่างจาก read-only fields อย่างชัดเจน การ deactivation ที่เป็น destructive action ต้องมี confirmation และ conflict messages

## Visual checklist

- [ ] Green brand tokens และ button/badge conventions ตรงกับ Lab 2
- [ ] แสดงชื่อ/role ของ authenticated user และเฉพาะ navigation ที่ได้รับอนุญาต
- [ ] Status, requested priority, IT priority และ role badges มี text labels
- [ ] Validation, forbidden, empty/no-results, saving และ failure feedback อ่านได้ชัดเจน
- [ ] Read-only fields และ editable fields แตกต่างกันอย่างเห็นได้ชัด
- [ ] Screenshots ของ desktop/tablet/mobile ไม่เกิด clipping, overlap, unreadable text หรือ horizontal overflow
- [ ] Keyboard focus, labels, table/card semantics และ state cues ที่ไม่พึ่งสีเพียงอย่างเดียวผ่าน accessibility review
