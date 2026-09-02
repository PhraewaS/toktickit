# Lab 2 — ข้อกำหนด UI แบบ Zen Green

ข้อกำหนด UI สำหรับ TokTickIT Requester Ticketing MVP

**สถานะ:** UI Implementation เสร็จและถูกรวมใน `lab2-staging` แล้ว; รอ Release Integration และการตรวจยืนยันผลสุดท้ายบน `main`

---

## 1. หลักการออกแบบ

- UI ต้องดูสงบ เป็นมืออาชีพ และนำ Component กลับมาใช้ซ้ำได้
- State และความหมายต้องสื่อด้วยข้อความหรือ Icon ร่วมกับสี
- Editable และ Read-only Information ต้องแยกกันได้ทันที
- Loading, Empty, No-results, Validation, Busy, Success และ Failure เป็น State ที่ออกแบบไว้ล่วงหน้า
- Desktop Table ต้องเปลี่ยนเป็น Mobile Cards หรือ Responsive Representation ที่ไม่ทำให้ Page Overflow

---

## 2. Design Tokens

| Token | Value | การใช้งาน |
|---|---|---|
| Primary Green | `#006B3C` | Header, Primary Button และ Strong Emphasis |
| Secondary Green | `#0B7A46` | Active Navigation, Link, Hover และ Focus Accent |
| Pale Green | `#EAF6EF` | Selected, Success และ Subtle Section Emphasis |
| Page Background | `#F5F7F6` | Application Background |
| Surface | `#FFFFFF` | Card, Form Panel และ Table |
| Text | `#18372B` | Primary Charcoal-green Text |
| Muted Text | `#52665E` | Supporting Copy ที่ยังอ่านชัด |
| Neutral Border | `#C7D2CC` | Editable Controls และ Cards |
| Read-only | `#EEF2EF` | Read-only Fields |
| Error | `#8A1C1C` | Error Border/Text พร้อม Icon และ Message |
| Warning | `#9A6700` | Warning Callout/Badge เท่านั้น |
| Focus Ring | `#0B7A46` | Visible Keyboard Focus ขนาด 3px |

Typography ใช้ System/Bootstrap Sans-serif Stack เดิม Base Text อย่างน้อย 16px ใช้ Spacing Scale 4, 8, 12, 16, 24, 32 และ 48px Main Content จัดกึ่งกลางและมี Max Width 1200px

---

## 3. โครงสร้าง Application Shell

- Header แสดง TokTickIT, My Tickets, Create Ticket, Selected Requester และ Change Requester
- Current Route ต้องมี Visual Emphasis และ `aria-current="page"`
- Header ใช้งานด้วย Keyboard ได้ครบ
- Mobile Navigation ต้อง Wrap หรือ Stack โดยไม่ซ่อน Main Destinations
- แสดง Development Notice ว่า Current Identity ใช้ทดสอบ Lab 2 และไม่ใช่ Authentication

---

## 4. การเลือก Development Requester

Required Elements/States:

- TokTickIT Title และ Heading `Select Development Requester`
- คำอธิบายว่าใช้ทดสอบเท่านั้นและ Authentication จะทำใน Lab 3
- Required Requester Select โดย Label อยู่เหนือ Control
- Continue เป็น Primary Action และ Disabled จนกว่าจะเลือก Requester
- Loading State ใช้ `role="status"`
- Empty State อธิบายว่าไม่มี Active Requester
- Safe Failure State พร้อม Retry
- ทุก Control ใช้ Keyboard ได้

หลัง Continue ให้ Application Shell แสดงชื่อ Requester ที่เลือก Change Requester ต้อง Clear Requester-specific State และกลับ Selection Screen

---

## 5. สถานะของ Control ที่นำกลับมาใช้ซ้ำ

- Editable Control: White Background, Neutral Border และ Consistent Minimum Height
- Read-only Field: Gray-green Background, Text อ่านได้ และมี Read-only Semantics/Label เมื่อจำเป็น
- Required Field: มี Red Asterisk ข้าง Label แต่ Asterisk ห้ามใช้แทน Validation Message
- Invalid Control: Dark-red Border, `aria-invalid="true"` และ Message ใต้ Field ผ่าน `aria-describedby`
- Disabled Control: มองเห็นว่าใช้งานไม่ได้และ Activate ไม่ได้จริง
- Focused Control: มี Visible Focus Ring 3px
- Description: มีความสูงเพียงพอ Resize แนวตั้งได้เมื่อไม่ทำให้ Layout แตก

---

## 6. ลำดับความสำคัญของปุ่ม

- Primary: Solid Primary Green สำหรับ Submit, Continue, Create Ticket และ Confirm Add Attachment
- Secondary: Bordered Green สำหรับ Back, Retry หรือ Secondary Navigation
- Tertiary: Text/Link Style สำหรับ Clear Filters และ Low-emphasis Action
- Destructive: Red Text/Border สำหรับ Remove Attachment พร้อม Confirmation Dialog
- Disabled: มองเห็นว่า Unavailable และ Programmatically Disabled
- Busy: Disabled, Width ไม่เปลี่ยน และแสดง Spinner กับ Text เช่น `Submitting...` หรือ `Uploading...`
- Icon ใช้เสริม Visible Text หากเป็น Icon-only ต้องมี Accessible Name และ Tooltip

---

## 7. หน้าสร้าง Ticket

### กลุ่ม Field

1. Read-only Context: Ticket Number (`Generated after submission`), Ticket Date (`Assigned on submission`), Requester และ Current Status (`New`) โดย Ticket Date อ่านจาก API `ticketDate` ซึ่งเป็น Alias ของ Database `Ticket.createdAt` และไม่มี Field `ticketDate` แยก
2. Classification: Category, Related System และ Requested Priority
3. Content: Summary และ Description โดยให้พื้นที่เพียงพอ
4. Attachments: Selected Files, Per-file Validation และ Active-count Guidance
5. Actions: Submit Ticket เป็น Primary Action; Reset และ Cancel ไม่อยู่ใน Scope ของ Lab 2

### สถานะที่ต้องรองรับ

- Initial: Editable Fields ว่างและ Requester ถูก Populate
- Loading: Reference Controls Disabled พร้อม Status Feedback
- Validation: Message อยู่ใต้ Field/File และเมื่อ Submit ให้ Focus ไป Invalid Field แรก
- Submitting: Submit Disabled/Busy และป้องกัน Duplicate
- Success: แสดง Official Ticket Number, Saved Values, Successful/Failed Files, View Ticket และ My Tickets
- Failure: แสดง Safe Callout และ Entered Values ไม่หาย
- Invalid Attachment: แสดง Type/Size/Count Error ต่อไฟล์ โดย Valid Selection ยังอยู่

---

## 8. หน้า My Tickets

### Controls

- Search ด้วย Ticket Number หรือ Summary
- Filters: Category, Related System, Requested Priority และ Current Status
- Sort Field และ Direction
- Clear Filters เป็น Tertiary Action
- Create Ticket เป็น Primary Action
- Pagination แสดง Current Page, Total Pages/Items, Previous/Next และ Page Size

### Field ของตาราง Desktop

- Ticket Number
- Created Date
- Summary
- Category
- Related System
- Requested Priority
- Current Status
- Last Updated
- View Detail Action ที่ชัดเจน

### Cards บน Mobile

แสดง Ticket Number, Summary, Category, Requested Priority, Current Status และ Last Updated พร้อม Full-width View Details โดย Search/Filter/Sort Controls Stack แนวตั้ง

### สถานะที่ต้องรองรับ

- Loading: Skeleton หรือ Status
- Empty: Response มี `totalOwnedItems = 0`; แสดงว่า Requester ยังไม่มี Ticket พร้อม Create Ticket Action
- No-results: Response มี `totalOwnedItems > 0`, `totalItems = 0` และมี Search/Filter; แสดงว่าไม่พบผลลัพธ์พร้อม Clear Filters โดยไม่ยิง Unfiltered Request เพิ่ม
- Failure: Safe Message และ Retry

---

## 9. รายละเอียด Ticket ของ Requester

- มี Breadcrumb หรือ Back to My Tickets
- Ticket Number เป็น Heading และแสดง Status/Priority Badges
- Ticket Information ทั้งหมดเป็น Read-only
- แบ่ง Group เป็น Identity/Dates, Requester/Classification และ Summary/Description
- Attachment Section แยกจากข้อมูล Ticket ชัดเจน มี Active Count และ Add Attachment
- ห้ามมี Edit Ticket, Status Change, Public Comments, Internal Notes, Actions Taken หรือ IT Staff Controls

### สถานะของ Attachment

- Active: Filename, Type, Human-readable Size, Uploaded Date, Download และ Remove
- Uploading: Filename, Progress/Busy Label และ Actions Disabled
- Invalid: Filename กับ Specific Error
- Removed: Removed Badge, Removal Date/Reason และ Metadata เท่านั้น ไม่มี Download/Preview/Remove
- Unavailable/Failure: Safe Message และ Retry เมื่อเหมาะสม

Removal Confirmation ต้องระบุชื่อไฟล์ เตือนว่าไฟล์จะใช้งานไม่ได้ บังคับ Reason 3–500 ตัวอักษร และใช้ Destructive Confirmation Button พร้อม Busy State

---

## 10. Badge

- Requested Priority แสดง Text Low/Medium/High พร้อม Accessible Styling ที่ต่างกัน
- Current Status แสดง Text `New` ด้วย Pale-green Styling ที่สม่ำเสมอ
- Removed Attachment แสดง Text `Removed` ด้วย Neutral/Warning Treatment
- ห้ามใช้สีอย่างเดียวในการอธิบาย Badge

---

## 11. กฎ Responsive

| Viewport | Required Behavior |
|---|---|
| Desktop `>= 992px` | Centered Max-width Content, Multi-column Forms และ Full Table |
| Tablet `768-991px` | สอง Columns เมื่อเหมาะสม Summary/Description ใช้ Full Width |
| Mobile `< 768px` | Fields/Actions Stack, Ticket Cards แทน Table, Touch Target อย่างน้อย 44px และไม่มี Page-level Horizontal Scroll |

ทุกขนาดต้องไม่มี Clipped Labels, Overlapping Validation, Hidden Actions, Unreadable Attachment Names หรือ Unintended Horizontal Overflow

---

## 12. Accessibility

- Semantic Headings มีลำดับถูกต้อง
- ทุก Control มี Visible Label และ Icon-only มี Accessible Name/Tooltip
- Keyboard Focus มองเห็นและเรียงลำดับเป็นธรรมชาติ
- Error ใช้ `aria-invalid`, `aria-describedby` และ Error Summary/Focus Strategy โดยไม่ใช้ Top-level Message อย่างเดียว
- Loading/Success ใช้ Polite Status Announcement และ Immediate Failure ใช้ Alert เมื่อเหมาะสม
- Dialog ต้องจัด Focus Trap และคืน Focus หลังปิด
- Text และ Interactive Components ต้องผ่าน WCAG AA Contrast Target

---

## 13. การตรวจภาพและหลักฐาน Screenshot

เก็บ Playwright Screenshots ที่:

- `artifacts/lab-02/screenshots/create-ticket/`
- `artifacts/lab-02/screenshots/my-tickets/`
- `artifacts/lab-02/screenshots/ticket-detail/`
- `artifacts/lab-02/screenshots/states/{state}/{desktop,tablet,mobile}.png`

ตรวจ Desktop, Tablet และ Mobile ดังนี้:

- [x] Zen Green Tokens และ Button Hierarchy ถูกต้อง
- [x] Editable, Read-only, Invalid, Disabled, Busy และ Focused States แยกชัดเจน
- [x] Required Marker และ Field-level Message อยู่ตำแหน่งถูกต้อง
- [x] ไม่มี Clipping, Overlap, Hidden Controls หรือ Horizontal Page Overflow
- [x] Desktop Table/Mobile Cards ใช้งานได้
- [x] Search, Filters, Sort, Clear Filters, Pagination และ Attachment Controls ใช้งานได้ทุกขนาด
- [x] Priority, Status และ Removed Badges สม่ำเสมอและเข้าใจได้โดยไม่พึ่งสี
- [x] Initial, Loading, Submitting/Uploading, Success, Empty, No-results และ Failure States ตรงกับ Specification

สำหรับ State Evidence ให้เก็บภาพอย่างน้อย `create-ticket-validation`, `create-ticket-submitting`,
`create-ticket-success`, `create-ticket-api-failure`, `attachment-invalid`, `attachment-removed`,
`my-tickets-empty`, `my-tickets-no-results` และ `requester-switch` ในโครงสร้าง `states/{state}/`
