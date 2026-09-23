# Lab 4 API Contract

All endpoints use the existing JSON envelope. Protected routes require the session cookie, reject invalid sessions with `401`, and return safe error messages. State-changing requests remain subject to the existing allowed-Origin check.

## Actions Taken

### `GET /api/tickets/:ticketId/actions`

Authenticated Requester only, and only for an owned Ticket. Returns `200 {data:{items: ActionTaken[]}}` ordered by `actionDateTime ASC, id ASC`. A foreign or missing Ticket returns `404 TICKET_NOT_FOUND`.

### `GET /api/staff/tickets/:ticketId/actions`

Authenticated IT Staff or Administrator. Returns the same envelope and ordering for any existing Ticket.

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

`performedBy` is derived from the session. Returns `201` with one Action Taken. Invalid or unknown fields return `400 VALIDATION_ERROR`; missing Ticket returns `404 TICKET_NOT_FOUND`.

### `PATCH /api/staff/tickets/:ticketId/actions/:actionId`

Authenticated IT Staff or Administrator. Accepts the editable fields above and optional `updatedAt`. When supplied, the timestamp must match the current row; a stale timestamp returns `409 ACTION_UPDATE_CONFLICT`. The performer is immutable. Success returns `200` with the updated row.

## Dashboards

### `GET /api/dashboard/requester`

Requester only. Returns `200`:

```json
{
  "data": {
    "metrics": { "openTickets": 0, "waitingForRequester": 0, "recentlyUpdated": 0, "recentlyResolved": 0 },
    "recentlyUpdated": [],
    "recentlyResolved": []
  }
}
```

Only the authenticated Requester’s Ticket IDs may be present.

### `GET /api/dashboard/staff`

IT Staff or Administrator. Returns metrics for unassigned active Tickets, active Tickets owned by the current user, Actions Taken performed by the current user, recently updated Tickets, urgent Tickets, plus `byStatus`, `byPriority`, `recentlyUpdated`, `urgentTickets`, and `recentActions`. Dashboard lists contain drill-down `id` values and concise summaries, not full Ticket records.

## Workflow contract

The existing `PATCH /api/staff/tickets/:ticketId/status` matrix remains authoritative. A permitted move to `RESOLVED` additionally requires at least one Action Taken and otherwise returns `409 RESOLUTION_ACTION_REQUIRED`. Requester `POST /api/tickets/:ticketId/resolved` remains idempotent and advisory.

## Safe failures and authorization

Missing/invalid sessions return `401 AUTHENTICATION_REQUIRED` or `SESSION_INVALID`; first-login-gated sessions return `403 PASSWORD_CHANGE_REQUIRED`; role violations return `403 ROLE_FORBIDDEN`; invalid IDs return `400`; missing resources return safe `404`; stale Action Taken edits return `409 ACTION_UPDATE_CONFLICT`; unexpected failures return `500 INTERNAL_ERROR` without SQL, paths, credentials, or stack traces.
