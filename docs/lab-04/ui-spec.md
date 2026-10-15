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

## Implemented fields, modes and feedback

| Field / control | Staff/Admin create or edit | Requester view |
| --- | --- | --- |
| Action Date/Time | Required datetime-local; browser-local display, UTC submission; unchanged edits retain original seconds | Formatted action time in read-only list |
| Performed by | Readonly session-derived identity hint; never submitted as an editable performer | Stored actor name; no role/email added |
| Description / Result | Required labelled textareas, 5,000-character limits | Read-only labelled content |
| Follow-Up Required? / Note | Checkbox; Note revealed and required when checked, 5,000 limit; cleared when unchecked | Yes/No and applicable note |
| Attachment Notes | Optional labelled textarea, 2,000 limit; no new upload control | Applicable evidence note |
| Save / Save Changes / Discard draft | Save disabled while saving/loading; uncertain create locks submitted fields, keeps stable retry key; deliberate discard/reconcile | No Add/Edit/Save controls |

Validation errors appear after the matching control with `field-error`, `aria-invalid` and `aria-describedby`; a safe operation error/conflict/unknown-outcome message appears in the shared state panel. Ticket/Action IDs and creation/version values are not user-editable controls. The form is inline, not a new modal dialog, so no new modal focus-trap claim is made.

| Feedback | Required existing behavior |
| --- | --- |
| Loading / retry | Busy section and live Loading message; do not show stale Dashboard metrics as current |
| Success / empty | Update Action list or Ticket summary after successful save; distinguish zero counts / empty list from errors; no separate Action toast is required |
| Forbidden | Safe access message, protected form/data hidden; backend remains authority |
| Not found | Safe Ticket Detail missing-resource state; Action missing-resource error keeps draft, no fabricated record |
| Validation | Message tied to its field, input retained |
| Conflict | Status: Refresh Ticket before retry; Action: refresh list without losing draft or silently applying it to a newer version |
| Network / API failure | Safe message and suitable retry; no raw server details; uncertain create uses same key rather than another insert |

This table documents existing behavior, not new per-list independent requests. Dashboards load one envelope: a request failure affects the dashboard data; empty recent lists are independent successful states within that envelope. Metric-specific destinations and informational count cards are defined in [specification.md](specification.md); recent informational cards are not falsely described as filtered list buttons.

## Zen Green style and layout contract

Reuse [styles.css](../../client/src/styles.css): green-950 `#004c2b`, green-800 `#006b3c`, green-700 `#0b7a46`, white surface, muted `#52665e`, border `#c7d2cc`, danger `#8a1c1c`. Metric/card hierarchy, rounded borders, shared primary/secondary/tertiary buttons, semantic status/priority text and labelled form sections match the earlier shell. Color complements text; it is never the only status or error cue. These tokens document the implemented theme, not a newly measured contrast ratio.

Desktop metric grid uses four columns, tablet at <=991px two, and mobile at <=767px one; Dashboard lists/breakdowns and two-column form grids stack at <=767px. Action text wraps; headers stack on narrow screens. Vertical scrolling is normal: a viewport screenshot ending at the fold does not prove a missing/clipped below-fold control. Full editor element captures show all fields and Save/Discard even when the form exceeds viewport height. Single-line readonly input values can scroll internally; the label and control must remain accessible and inside the viewport.

## Review and final demonstration evidence

**Current main:** product **e1fa72f9fa1ad26ead74f82cf1de6bbf09de6384** has fresh RESP-04 and 72 supplementary full-page/element captures at three widths. [Results/gallery](../../artifacts/lab-04/evidence/final-main/summary.md), [capture provenance](../../artifacts/lab-04/evidence/final-main/visual/results.json). Live seed/API success and real 400 validation are distinct from controlled empty/loading/403/409/500 UI fixtures; actual backend cases pass separately. PDF uses readable labelled regions with unchanged full originals linked. Human final evidence/PDF approval remains pending.

Historical pre-release evidence:

[Responsive, visual and accessibility checklist](responsive-accessibility-checklist.md) records actual staging assertions, screenshot/source inspection and remaining full-page/error-state final checks separately. [Documentation-review images](../../artifacts/lab-04/evidence/documentation-review/summary.md) preserve the 12 unmodified captures from tested staging 5ab13bb. Final Part 9 needs fresh released-main captures and the completed checklist; these images do not replace that gate.
