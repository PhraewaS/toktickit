# Lab 2 — ข้อกำหนด REST API

เอกสาร API Contract สำหรับ Requester Ticketing MVP

**สถานะ:** API Implementation เสร็จและถูกรวมใน `lab2-staging` แล้ว; รอ Release Integration และการตรวจยืนยันผลสุดท้ายบน `main`

---

## 1. ข้อตกลงทั่วไป

- Base Path คือ `/api`
- Request/Response ใช้ JSON ยกเว้น Multipart Attachment Upload และ Binary Download
- Date/Time ใช้ ISO 8601 UTC
- Requester-specific Endpoint ต้องส่ง Header `X-Development-Requester-Id: <positive integer>`
- Header นี้เป็น Testing Context ของ Lab 2 ไม่ใช่ Authentication โดย Backend ต้องตรวจว่า Requester มีอยู่และ Active
- Owned Resource Query ต้องใช้ Resource ID ร่วมกับ Selected Requester ID
- Resource ที่ไม่มีอยู่และ Resource ของ Requester คนอื่นต้องตอบ Safe `404` แบบเดียวกัน
- Successful JSON ใช้ `{ "data": ... }` และ List อาจมี `pagination`
- Error ใช้ `{ "error": { "code": string, "message": string, "fields"?: object } }`
- Unexpected Error ห้ามเปิดเผย Stack Trace, SQL, Stored Filename, Filesystem Path หรือ Secret

---

## 2. รหัสสถานะ HTTP

| Status | ใช้เมื่อ |
|---|---|
| `200` | Retrieve สำเร็จ, Idempotent Replay, Soft Removal สำเร็จ |
| `201` | สร้าง Ticket หรือ Attachment สำเร็จ |
| `400` | Header, Body, Path, Query หรือ Removal Reason ไม่ถูกต้อง |
| `404` | Ticket/Attachment ไม่มีอยู่หรือไม่ได้เป็นเจ้าของ |
| `409` | Active Attachment Limit หรือ State Conflict |
| `413` | File ใหญ่เกิน 5 MiB |
| `415` | Attachment Extension/MIME Type ไม่รองรับ |
| `500` | Safe Unexpected Server Error |
| `503` | Database/Reference-data Service ใช้งานไม่ได้ในกรณีที่ Endpoint แยกสถานะนี้ |

---

## 3. Development Requester และข้อมูลอ้างอิง

### GET `/api/development-requesters`

คืน Active Development Requesters เรียง Name Ascending

**Success `200`**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer@example.test"
    }
  ]
}
```

ถ้าไม่มี Active Requester ให้คืน `200` กับ `data: []` หากเกิด Unexpected Failure ให้คืน Safe `503`

### GET `/api/categories`

คืน Active Categories เรียง Name Ascending

```json
{
  "data": [
    { "id": 1, "name": "Hardware" }
  ]
}
```

### GET `/api/related-systems`

คืน Active Related Systems เรียง Name Ascending โดยใช้ Response Shape เดียวกับ Categories

---

## 4. ข้อผิดพลาดของบริบท Development Requester

Protected Endpoint ต้องตอบ:

- `400 REQUESTER_REQUIRED` เมื่อไม่มี Header หรือรูปแบบไม่ถูกต้อง
- `400 REQUESTER_UNAVAILABLE` เมื่อ ID ไม่มีอยู่หรือ Requester ไม่ Active

```json
{
  "error": {
    "code": "REQUESTER_REQUIRED",
    "message": "Select a Development Requester before continuing."
  }
}
```

---

## 5. API สำหรับ Ticket

### POST `/api/tickets`

สร้าง Ticket หนึ่งใบให้ Selected Development Requester โดย Backend เป็นผู้กำหนด `requesterId`, Ticket Number, Ticket Date และ Current Status Client ห้ามส่งค่าเหล่านี้เป็น Editable Values

**Request**

```json
{
  "submissionKey": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "categoryId": 2,
  "relatedSystemId": 7,
  "summary": "Laptop battery drains quickly",
  "requestedPriority": "MEDIUM",
  "description": "The battery falls from full charge to 20 percent within one hour."
}
```

**First Success `201`**

```json
{
  "data": {
    "id": 42,
    "ticketNumber": "TKT-20260824-A1B2C3D4",
    "ticketDate": "2026-08-24T08:30:00.000Z",
    "requester": { "id": 1, "name": "Jennifer Anderson" },
    "category": { "id": 2, "name": "Hardware" },
    "relatedSystem": { "id": 7, "name": "Corporate Laptop" },
    "summary": "Laptop battery drains quickly",
    "requestedPriority": "MEDIUM",
    "description": "The battery falls from full charge to 20 percent within one hour.",
    "currentStatus": "NEW",
    "createdAt": "2026-08-24T08:30:00.000Z",
    "updatedAt": "2026-08-24T08:30:00.000Z"
  },
  "replayed": false
}
```

ถ้า Requester เดิมส่ง `submissionKey` เดิมซ้ำ ให้คืน `200`, Ticket เดิม และ `replayed: true` โดยไม่สร้าง Duplicate

`ticketDate` เป็น Public Response Alias ของ `Ticket.createdAt` ไม่ใช่ Database Field แยก หาก Response มีทั้ง `ticketDate` และ `createdAt` ค่าทั้งสองต้องเป็น Timestamp เดียวกันเสมอ

Error Cases:

- `400 VALIDATION_ERROR` สำหรับ Field ที่ไม่ถูกต้อง
- `400 REFERENCE_DATA_UNAVAILABLE` สำหรับ Category/Related System ที่ไม่มีหรือ Inactive
- `500 INTERNAL_ERROR` สำหรับ Unexpected Failure โดยไม่มี Internal Detail

### GET `/api/tickets`

คืนเฉพาะ Ticket ของ Selected Requester

| Query Parameter | Values / Default |
|---|---|
| `search` | Optional, Trim, สูงสุด 100 ตัวอักษร, ค้น Ticket Number/Summary แบบ Case-insensitive |
| `categoryId` | Optional Positive Integer |
| `relatedSystemId` | Optional Positive Integer |
| `requestedPriority` | `LOW`, `MEDIUM`, `HIGH` |
| `currentStatus` | Lab 2 รองรับ `NEW` |
| `sortBy` | `ticketNumber`, `summary`, `createdAt`, `updatedAt`; Default `createdAt` |
| `sortOrder` | `asc`, `desc`; Default `desc` |
| `page` | Positive Integer; Default 1 |
| `pageSize` | 10, 20 หรือ 50; Default 10 |

Stable Secondary Sort คือ Ticket ID Descending

**Success `200`**

```json
{
  "data": [
    {
      "id": 42,
      "ticketNumber": "TKT-20260824-A1B2C3D4",
      "summary": "Laptop battery drains quickly",
      "category": { "id": 2, "name": "Hardware" },
      "relatedSystem": { "id": 7, "name": "Corporate Laptop" },
      "requestedPriority": "MEDIUM",
      "currentStatus": "NEW",
      "createdAt": "2026-08-24T08:30:00.000Z",
      "updatedAt": "2026-08-24T08:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 1,
    "totalOwnedItems": 1,
    "totalPages": 1
  }
}
```

Pagination Metadata Contract:

- `totalOwnedItems` นับ Ticket ทั้งหมดของ Selected Requester โดยไม่ใช้ `search`, Category, Related System, Priority หรือ Status Filters
- `totalItems` นับ Ticket ของ Requester ที่ Match Search/Filter ปัจจุบันก่อน Pagination
- `totalPages` คำนวณจาก `totalItems` และเป็น `0` เมื่อ `totalItems = 0`
- Empty State: `data: []`, `totalOwnedItems: 0`, `totalItems: 0`; UI แสดง Create Ticket Action
- No-results State: มี Search/Filter อย่างน้อยหนึ่งค่า, `data: []`, `totalOwnedItems > 0`, `totalItems: 0`; UI แสดง Clear Filters
- UI ต้องใช้ Metadata จาก Response เดียวนี้และห้ามส่ง Unfiltered Request เพิ่มเพื่อแยก Empty กับ No-results
- Request ที่ `page` เกิน `totalPages` ขณะที่ `totalItems > 0` ตอบ `400 PAGE_OUT_OF_RANGE` พร้อม Safe Field Detail เพื่อไม่ให้ Empty Page ถูกตีความเป็น Empty/No-results

Invalid Query อื่นตอบ `400 INVALID_QUERY` ส่วน Empty และ No-results ตอบ `200` ตาม Contract ข้างต้น

### GET `/api/tickets/:ticketId`

คืน Owned Ticket หนึ่งใบพร้อม Attachment Metadata ทั้งหมด

Attachment Shape:

```json
{
  "attachments": [
    {
      "id": 8,
      "originalFilename": "battery-report.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 104857,
      "uploadedAt": "2026-08-24T08:31:00.000Z",
      "removedAt": null,
      "removalReason": null,
      "state": "ACTIVE"
    }
  ]
}
```

- Invalid ID ตอบ `400 INVALID_TICKET_ID`
- Ticket ไม่มีหรือเป็นของ Requester คนอื่นตอบ `404 TICKET_NOT_FOUND`

---

## 6. API สำหรับ Attachment

### POST `/api/tickets/:ticketId/attachments`

ใช้ `multipart/form-data` และ Field Name `files` ส่งอย่างน้อย 1 และสูงสุด 5 ไฟล์ แต่ Active Attachment รวมของ Ticket ต้องไม่เกิน 5

| Extension | MIME Type |
|---|---|
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.png` | `image/png` |
| `.webp` | `image/webp` |
| `.pdf` | `application/pdf` |

แต่ละไฟล์สูงสุด 5 MiB เก็บ Original Basename เป็น Metadata ใช้ Backend UUID เป็น Stored Filename และไม่เปิด Upload Directory เป็น Public

Responses:

- `201` คืน Created Metadata ใน `{ "data": [...] }`
- `400` เมื่อ Ticket ID ไม่ถูกต้อง
- `404` เมื่อ Ticket ไม่มีหรือเป็นของคนอื่น
- `409 ATTACHMENT_LIMIT` เมื่อเกิน 5 Active Files
- `413 ATTACHMENT_TOO_LARGE` เมื่อเกิน 5 MiB
- `415 UNSUPPORTED_ATTACHMENT_TYPE` เมื่อ Type ไม่รองรับ

ถ้า File Storage สำเร็จแต่ Metadata Persistence ล้มเหลว ต้องลบไฟล์ใหม่ก่อนคืน Safe `500`

### GET `/api/tickets/:ticketId/attachments`

คืน Active และ Removed Metadata ของ Owned Ticket เรียง Uploaded Time Ascending ห้ามส่ง Stored Filename หรือ Internal Path

### GET `/api/attachments/:attachmentId/download`

คืน File Bytes ของ Active Owned Attachment พร้อม Safe `Content-Type` และ `Content-Disposition: attachment` โดยใช้ Original Basename

Missing, Removed หรือ Other-owner Attachment ตอบ `404 ATTACHMENT_NOT_FOUND`

### DELETE `/api/attachments/:attachmentId`

Soft-remove Active Owned Attachment

**Request**

```json
{
  "reason": "Uploaded the wrong diagnostic report"
}
```

Reason ต้อง Trim และยาว 3-500 ตัวอักษร

- Success `200` คืน Public Metadata พร้อม State `REMOVED`
- Invalid Reason ตอบ `400 INVALID_REMOVAL_REASON`
- Missing, Already Removed หรือ Other-owner Attachment ตอบ `404 ATTACHMENT_NOT_FOUND`

---

## 7. การจัดการ Unexpected Error อย่างปลอดภัย

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "TokTickIT could not complete the request. Please try again."
  }
}
```

Server บันทึก Internal Detail ใน Log ที่เหมาะสม แต่ Response ห้ามมี Stack Trace, SQL, Database Detail, Stored Filename, Filesystem Path หรือ Secret และต้องมี Automated Test ตรวจเงื่อนไขนี้
