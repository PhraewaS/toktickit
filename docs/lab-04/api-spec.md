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

`performedBy` is derived from the session. Returns `201` with `{data:{item: ActionTaken}}`. Invalid or unknown fields return `400 VALIDATION_ERROR`; missing Ticket returns `404 TICKET_NOT_FOUND`.

### `PATCH /api/staff/tickets/:ticketId/actions/:actionId`

Authenticated IT Staff or Administrator. Accepts the editable fields above and requires `updatedAt` set to the timestamp from the latest Action Taken response. A missing or invalid timestamp returns `400 VALIDATION_ERROR`; a timestamp that no longer matches the current row returns `409 ACTION_UPDATE_CONFLICT` without changing the row. Every update uses a conditional write, so stale-write protection cannot be bypassed. The performer is immutable. Success returns `200` with `{data:{item: ActionTaken}}`.

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

`openTickets` counts `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, and `REOPENED`. `waitingForRequester` counts `WAITING_FOR_REQUESTER`. The two recent lists use `updatedAt >= recentCutoff`, are ordered by `updatedAt DESC, id DESC`, and contain at most 10 concise items with `id`, `ticketNumber`, `summary`, `currentStatus`, and `updatedAt`. Only the authenticated Requester’s Ticket IDs may be present.

### `GET /api/dashboard/staff`

IT Staff or Administrator. The server calculates the following from the visible Ticket set and the authenticated user ID, then returns `200`:

```json
{
  "data": {
    "metrics": {
      "unassignedActive": 0,
      "myActive": 0,
      "myActionsTaken": 0,
      "urgentTickets": 0
    },
    "byStatus": {},
    "byPriority": {},
    "recentlyUpdated": [],
    "urgentTickets": [],
    "recentActions": []
  }
}
```

`active` means `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, or `REOPENED`. `unassignedActive` counts active Tickets with no owner; `myActive` counts active Tickets owned by the current user; `myActionsTaken` counts persisted Actions Taken performed by the current user; `urgentTickets` lists active visible Tickets with `itPriority=HIGH`; and `recentActions` lists the current user’s Actions Taken within the same 30-day UTC window. Grouped counts use the visible Ticket set. Lists are ordered deterministically, limited to 10, and contain concise summaries with drill-down IDs rather than full Ticket records.

## Workflow contract

The existing `PATCH /api/staff/tickets/:ticketId/status` matrix remains authoritative: `NEW→OPEN`; `OPEN→IN_PROGRESS|WAITING_FOR_REQUESTER|CANCELLED`; `IN_PROGRESS→WAITING_FOR_REQUESTER|RESOLVED|CANCELLED`; `WAITING_FOR_REQUESTER→IN_PROGRESS|RESOLVED|CANCELLED`; `RESOLVED→CLOSED|REOPENED`; `CLOSED→REOPENED`; and no transitions from `REOPENED` or `CANCELLED`. Only IT Staff may perform these formal transitions. A permitted move to `RESOLVED` additionally requires at least one Action Taken and otherwise returns `409 RESOLUTION_ACTION_REQUIRED`. Requester `POST /api/tickets/:ticketId/resolved` remains idempotent and advisory.

## Safe failures and authorization

Missing/invalid sessions return `401 AUTHENTICATION_REQUIRED` or `SESSION_INVALID`; first-login-gated sessions return `403 PASSWORD_CHANGE_REQUIRED`; role violations return `403 ROLE_FORBIDDEN`; invalid IDs or bodies return `400 VALIDATION_ERROR`; missing resources return `404 TICKET_NOT_FOUND` or `404 ACTION_NOT_FOUND`; disallowed transitions return `409 STATUS_TRANSITION_NOT_ALLOWED`; resolution without an action returns `409 RESOLUTION_ACTION_REQUIRED`; stale Action Taken edits return `409 ACTION_UPDATE_CONFLICT`; and unexpected failures return `500 INTERNAL_ERROR` without SQL, paths, credentials, or stack traces. Every error uses `{error:{code,message,fields?}}`.
