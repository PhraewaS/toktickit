# Lab 4 API Contract

All endpoints use the existing JSON envelope:

```json
{ "data": {} }
```

Errors use one stable shape and never expose SQL, stack traces, filesystem paths, credentials, or secrets:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request data is invalid.",
    "fields": { "description": "Description is required." }
  }
}
```

Protected routes require the session cookie, reject invalid sessions with `401`, and return safe error messages. State-changing requests remain subject to the existing allowed-Origin check.

## Actions Taken

### `GET /api/tickets/:ticketId/actions`

Authenticated Requester only, and only for an owned Ticket. Returns `200` with `{data:{items: ActionTaken[]}}` ordered by `actionDateTime ASC, id ASC`:

```json
{
  "data": {
    "items": [{
      "id": 21,
      "ticketId": 1001,
      "actionDateTime": "2026-09-22T09:30:00.000Z",
      "description": "Reviewed service logs.",
      "result": "The failure was reproduced.",
      "performedBy": { "id": 7, "name": "IT Staff" },
      "followUpRequired": true,
      "followUpNote": "Confirm the fix with the Requester.",
      "attachmentNotes": "See VPN log evidence.",
      "createdAt": "2026-09-22T09:31:00.000Z",
      "updatedAt": "2026-09-22T09:31:00.000Z"
    }]
  }
}
```

A foreign or missing Ticket returns `404 TICKET_NOT_FOUND`.

### `GET /api/staff/tickets/:ticketId/actions`

Authenticated IT Staff or Administrator. Returns the same response shape and ordering for any existing Staff-accessible Ticket. A missing or out-of-scope Ticket returns `404 TICKET_NOT_FOUND`; Requesters cannot use this Staff route.

### `POST /api/staff/tickets/:ticketId/actions`

Authenticated IT Staff or Administrator. Body:

```json
{
  "actionDateTime": "2026-09-22T09:30:00.000Z",
  "description": "Reviewed service logs.",
  "result": "The failure was reproduced.",
  "followUpRequired": true,
  "followUpNote": "Confirm the fix with the Requester.",
  "attachmentNotes": "See VPN log evidence."
}
```

`performedBy` is derived from the session. The client must send an `Idempotency-Key` header containing a UUID that is stable for retries of the same draft. The server stores the key under a unique constraint with a SHA-256 fingerprint of the normalized request. Repeating the same request with the same key, performer, and Ticket returns the original Action Taken with `200`, including when the original response was lost; the server does not create a duplicate. Reusing the key for a different request, performer, or Ticket returns `409 IDEMPOTENCY_KEY_REUSED` so edits are never silently discarded. Invalid/missing keys or invalid/unknown body fields return `400 VALIDATION_ERROR`; missing Ticket returns `404 TICKET_NOT_FOUND`. Keys are retained with Action Taken records; requests with a different key create a distinct action.

### `PATCH /api/staff/tickets/:ticketId/actions/:actionId`

Authenticated IT Staff or Administrator. Accepts the editable fields above and requires `updatedAt` set to the timestamp from the latest Action Taken response. A missing or invalid timestamp returns `400 VALIDATION_ERROR`; a timestamp that no longer matches the current row returns `409 ACTION_UPDATE_CONFLICT` without changing the row. Every update uses a conditional write, so stale-write protection cannot be bypassed. The performer is immutable. If the Action Date/Time field is not changed in the UI, the exact stored timestamp (including seconds) is retained. Success returns `200` with `{data:{item: ActionTaken}}`.

## Dashboards

### `GET /api/dashboard/requester`

Requester only. The server calculates the metrics from the authenticated Requester’s owned Tickets using one UTC `now` and `recentCutoff = now - 30 days`. It returns `200`:

```json
{
  "data": {
    "metrics": { "openTickets": 0, "waitingForRequester": 0, "recentlyUpdated": 0, "recentlyResolved": 0 },
    "recentlyUpdated": [],
    "recentlyResolved": []
  }
}
```

`openTickets` counts `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, and `REOPENED`. `waitingForRequester` counts `WAITING_FOR_REQUESTER`. The `recentlyUpdated` metric is the total owned Ticket count with `updatedAt >= recentCutoff`; `recentlyResolved` is the total owned Ticket count in `RESOLVED` or `CLOSED` with that same cutoff. These metric counts are not capped by list size. The corresponding recent lists use the same filters, are ordered by `updatedAt DESC, id DESC`, and contain at most 10 concise items with `id`, `ticketNumber`, `summary`, `currentStatus`, and ISO-8601 `updatedAt`. Only the authenticated Requester’s Ticket IDs may be present. The open-count shortcut opens My Tickets with `activeOnly=true`; the Waiting for Requester shortcut uses `currentStatus=WAITING_FOR_REQUESTER`. Both list filters are enforced by the Requester ticket-list API, and the selected filter is shown in the Current Status control. Recent-list items open the existing Requester Ticket Detail by `id`.

### `GET /api/dashboard/staff`

IT Staff or Administrator. The server calculates the following from the visible Ticket set and the authenticated user ID, then returns `200`:

```json
{
  "data": {
    "metrics": {
      "unassignedActive": 0,
      "myActive": 1,
      "myActionsTaken": 1,
      "urgentTickets": 1
    },
    "byStatus": {
      "NEW": 0, "OPEN": 1, "IN_PROGRESS": 0, "WAITING_FOR_REQUESTER": 0,
      "RESOLVED": 0, "CLOSED": 0, "REOPENED": 0, "CANCELLED": 0
    },
    "byPriority": { "LOW": 0, "MEDIUM": 0, "HIGH": 1 },
    "recentlyUpdated": [
      {
        "id": 42,
        "ticketNumber": "TKT-20261003-00000042",
        "summary": "VPN access is unavailable",
        "currentStatus": "OPEN",
        "updatedAt": "2026-10-03T08:00:00.000Z",
        "itPriority": "HIGH",
        "requester": { "id": 8, "name": "Jennifer Requester" },
        "owner": { "id": 7, "name": "Mali Staff" }
      }
    ],
    "urgentTickets": [
      {
        "id": 42,
        "ticketNumber": "TKT-20261003-00000042",
        "summary": "VPN access is unavailable",
        "currentStatus": "OPEN",
        "updatedAt": "2026-10-03T08:00:00.000Z",
        "itPriority": "HIGH",
        "requester": { "id": 8, "name": "Jennifer Requester" },
        "owner": { "id": 7, "name": "Mali Staff" }
      }
    ],
    "recentActions": [
      {
        "id": 9,
        "ticketId": 42,
        "ticketNumber": "TKT-20261003-00000042",
        "summary": "VPN access is unavailable",
        "actionDateTime": "2026-10-03T07:30:00.000Z",
        "description": "Reviewed VPN logs",
        "result": "Authentication failure confirmed"
      }
    ]
  }
}
```

`active` means `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, or `REOPENED`. `unassignedActive` counts active Tickets with no owner; `myActive` counts active Tickets owned by the current user; `myActionsTaken` counts all persisted Actions Taken performed by the current user; and the `urgentTickets` metric counts active visible Tickets with `itPriority=HIGH`. The `byStatus` and `byPriority` breakdowns count the complete visible Ticket set, including resolved, closed, and cancelled Tickets, and include zero-valued enum entries.

Staff Ticket summary objects contain exactly the fields shown in the `recentlyUpdated`/`urgentTickets` example: `id`, `ticketNumber`, `summary`, `currentStatus`, ISO-8601 `updatedAt`, `itPriority`, `requester: {id,name}`, and nullable `owner: {id,name}`. `recentlyUpdated` contains at most 10 visible Tickets with `updatedAt >= recentCutoff`, ordered by `updatedAt DESC, id DESC`. `urgentTickets` contains at most 10 active high-priority Tickets with the same deterministic order. Each summary opens Staff Ticket Detail using `id`.

Each Recent Action item contains exactly `id`, `ticketId`, `ticketNumber`, `summary`, ISO-8601 `actionDateTime`, `description`, and `result`. `recentActions` contains at most 10 Actions Taken by the current user with `actionDateTime >= recentCutoff`, ordered by `actionDateTime DESC, id DESC`; its ticket button opens Staff Ticket Detail using `ticketId`. The `myActionsTaken` metric is the all-time count and is intentionally distinct from the bounded 30-day `recentActions` list.

Queue drill-downs preserve the calculation scope: Unassigned Active uses `ownerId=unassigned&activeOnly=true`; My Active uses `ownerId=<authenticatedUserId>&activeOnly=true`; High Priority uses `itPriority=HIGH&activeOnly=true`; each status breakdown entry uses `status=<TicketStatus>`; and each priority breakdown entry uses `itPriority=<RequestedPriority>` without `activeOnly`, because the breakdowns include every visible Ticket status. The queue API validates `activeOnly` as a boolean query value and applies the five active statuses defined above. Filters are applied before loading the queue and are visible in its controls.

## Workflow contract

The existing `PATCH /api/staff/tickets/:ticketId/status` matrix remains authoritative: `NEW→OPEN`; `OPEN→IN_PROGRESS|WAITING_FOR_REQUESTER|CANCELLED`; `IN_PROGRESS→WAITING_FOR_REQUESTER|RESOLVED|CANCELLED`; `WAITING_FOR_REQUESTER→IN_PROGRESS|RESOLVED|CANCELLED`; `RESOLVED→CLOSED|REOPENED`; `CLOSED→REOPENED`; and no transitions from `REOPENED` or `CANCELLED`. Only IT Staff may perform these formal transitions. The request body must include both the requested `status` and `expectedCurrentStatus` observed by the Client when the Ticket was loaded; a missing/invalid expected status returns `400 VALIDATION_ERROR`. If the persisted status no longer matches `expectedCurrentStatus`, return `409 STATUS_UPDATE_CONFLICT` before evaluating or applying the transition. A permitted move to `RESOLVED` additionally requires at least one Action Taken and otherwise returns `409 RESOLUTION_ACTION_REQUIRED`. The database write also atomically compares against that expected status, so a change after the server read but before its write returns the same conflict without overwriting newer data. Staff must refresh before retrying. Requester `POST /api/tickets/:ticketId/resolved` remains idempotent and advisory.

## Safe failures and authorization

Missing/invalid sessions return `401 AUTHENTICATION_REQUIRED` or `SESSION_INVALID`; first-login-gated sessions return `403 PASSWORD_CHANGE_REQUIRED`; role violations return `403 ROLE_FORBIDDEN`; invalid IDs or bodies return `400 VALIDATION_ERROR`; missing resources return `404 TICKET_NOT_FOUND` or `404 ACTION_NOT_FOUND`; disallowed transitions return `409 STATUS_TRANSITION_NOT_ALLOWED`; a concurrent status change returns `409 STATUS_UPDATE_CONFLICT`; resolution without an action returns `409 RESOLUTION_ACTION_REQUIRED`; stale Action Taken edits return `409 ACTION_UPDATE_CONFLICT`; and unexpected failures return `500 INTERNAL_ERROR` without SQL, paths, credentials, or stack traces. Every error uses `{error:{code,message,fields?}}`.
