# Lab 4 UI Specification

## Shell and navigation

Every authenticated role sees an active `Dashboard` navigation item. Requesters retain My Tickets/Create Ticket. IT Staff and Administrators retain Ticket Queue; Administrators retain User Management. Active-page indication remains visible and the brand returns to the role dashboard.

## Requester Dashboard

Metric cards: Open Tickets, Waiting for Requester, Recently Updated, Recently Resolved. Recent list items show ticket number, summary, status, and updated time; each ticket number opens the existing read-only Ticket Detail. Empty lists state that no recent records match. A Create Ticket quick action remains available.

## IT Staff / Administrator Dashboard

Metric cards: Unassigned Tickets, My Active Tickets, My Actions Taken, and Urgent Tickets. Breakdown cards show status and IT Priority counts. Lists show urgent and recently updated Tickets plus the current user’s recent Actions Taken. Every actionable ticket opens Staff Ticket Detail or Queue. Administrator retains the Lab 3 administrative navigation and may create/update Actions Taken.

## Dashboard feedback states

Requester and IT Staff/Administrator dashboards must specify these states independently for metric cards and each list:

- **Loading:** show skeleton/placeholder content with an accessible `aria-busy` or live status; do not present stale values as current.
- **Success with data:** show the calculated metric/list, timestamp where relevant, and the documented Ticket Detail, Queue, or Staff Ticket Detail drill-down.
- **Success with no records:** show zero for the metric and a clear “No matching records” empty state for the affected list. Empty is not an API failure.
- **Failure:** show a safe, non-technical message for `500 INTERNAL_ERROR` or network failure, preserve the dashboard shell, and provide a visible `Retry` action.
- **Forbidden:** show a role-appropriate access message for `403 ROLE_FORBIDDEN` without rendering protected metrics or list data; provide a link back to an allowed dashboard or screen.
- **Retry/refresh:** disable or label the retry control while the request is pending, then return to Loading, Success, Empty, or Failure based on the new response without duplicating requests.

These states must remain distinguishable without color alone and must work at desktop, tablet, and mobile widths.

## Actions Taken area

Ticket Detail shows an ordered list with Action Date/Time, Description, Result, Performed By, Follow-Up Required, Follow-Up Note, and Attachment Notes. Staff/Admin see Add Action Taken and Edit controls. The form labels every field, marks required fields, reveals Follow-Up Note only when required, and shows saving/validation/conflict feedback. On a stale-edit conflict, Refresh preserves the draft through loading and failed retries; the user must explicitly choose whether to keep or discard it. If a create response is uncertain, show that the result may be unknown, lock the submitted fields, and allow retry with the same idempotency key; do not create another key unless the user explicitly discards that draft. After such a discard, reconcile the Action list before allowing another create. An unchanged Action Date/Time retains the precise stored timestamp, including seconds. Requesters see entries read-only and never see mutation controls.

IT Staff status controls show only transitions allowed by the status matrix. If a resolution attempt returns `409 RESOLUTION_ACTION_REQUIRED`, keep the formal status unchanged, reset the selector to its neutral prompt, and show a safe message explaining that an Action Taken must be recorded first. If a concurrent Staff status change returns `409 STATUS_UPDATE_CONFLICT`, keep the stale detail unchanged, show the safe conflict message, and provide a `Refresh Ticket` action before the Staff member retries.

## Accessibility and responsive behavior

All controls have semantic labels, visible focus, keyboard operation, live loading/status/error messages, and non-color status cues. Dashboard cards become one column on mobile. Ticket/action lists become stacked cards at narrow widths. Text wraps safely; page-level horizontal overflow, clipped controls, overlapping dialogs, and color-only status meaning are prohibited.
