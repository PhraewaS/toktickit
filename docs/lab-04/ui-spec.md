# Lab 4 UI Specification

## Shell and navigation

Every authenticated role sees an active `Dashboard` navigation item. Requesters retain My Tickets/Create Ticket. IT Staff and Administrators retain Ticket Queue; Administrators retain User Management. Active-page indication remains visible and the brand returns to the role dashboard.

## Requester Dashboard

Metric cards: Open Tickets, Waiting for Requester, Recently Updated, Recently Resolved. Recent list items show ticket number, summary, status, and updated time; each ticket number opens the existing read-only Ticket Detail. Empty lists state that no recent records match. A Create Ticket quick action remains available.

## IT Staff / Administrator Dashboard

Metric cards: Unassigned Tickets, My Active Tickets, My Actions Taken, and Urgent Tickets. Breakdown cards show status and IT Priority counts. Lists show urgent and recently updated Tickets plus the current user’s recent Actions Taken. Every actionable ticket opens Staff Ticket Detail or Queue. Administrator retains the Lab 3 administrative navigation and may create/update Actions Taken.

## Actions Taken area

Ticket Detail shows an ordered list with Action Date/Time, Description, Result, Performed By, Follow-Up Required, Follow-Up Note, and Attachment Notes. Staff/Admin see Add Action Taken and Edit controls. The form labels every field, marks required fields, reveals Follow-Up Note only when required, and shows saving/validation/conflict feedback. Requesters see entries read-only and never see mutation controls.

## Accessibility and responsive behavior

All controls have semantic labels, visible focus, keyboard operation, live loading/status/error messages, and non-color status cues. Dashboard cards become one column on mobile. Ticket/action lists become stacked cards at narrow widths. Text wraps safely; page-level horizontal overflow, clipped controls, overlapping dialogs, and color-only status meaning are prohibited.
