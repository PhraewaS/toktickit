# Lab 4 Specification DD

## 1. Sprint Goal

Complete the TokTickIT service-desk workflow by recording operational Actions Taken under each Ticket, enforcing the final Ticket lifecycle rules, and giving Requesters and IT Staff concise role-appropriate dashboards. All Lab 1-3 authentication, authorization, ownership, comments, notes, attachments, and ticket-list behavior remains available.

## 2. Stakeholder Request

The service desk can receive Tickets and communicate with Requesters, but it needs a reliable, auditable record of the work performed. Each action records when it happened, what was done, the result, who performed it, whether follow-up is needed, the follow-up note, and any related attachment note. Dashboards summarize authoritative Ticket and action data without replacing the detailed screens.

## 3. Scope

### Included

- Add the parent-child `ActionTaken` model and additive migration.
- Allow IT Staff and Administrators to create and update Actions Taken; the performer is always derived from the authenticated session.
- Let Requesters read Actions Taken only on their own Tickets.
- Enforce required follow-up notes and optimistic stale-update conflicts.
- Require at least one Action Taken before formal `RESOLVED` status.
- Add Requester and IT Staff/Administrator dashboards with backend-calculated metrics, recent/urgent lists, action counts, empty states, and drill-down buttons.
- Preserve existing role boundaries for Lab 3 operations and preserve all earlier APIs.
- Add Lab 4 Spec DD, Test DD, UI/API contracts, AI-use reflection, reviewer record, regression evidence, and final PDF evidence.

### Explicitly excluded

SLA clocks, escalation/on-call scheduling, external notifications, inventory/purchasing/cost accounting, payroll/time sheets, multi-level approvals/signatures, BI/report builders, multi-tenancy, multiple roles per account, and product features not listed in this contract.

## 4. Functional Requirements

- FR-01: A Ticket may have zero, one, or many Actions Taken.
- FR-02: An Action Taken contains Action Date/Time, Action Description, Result, authenticated Performed By, Follow-Up Required, conditional Follow-Up Note, and optional Attachment Notes.
- FR-03: IT Staff and Administrators may create and update Actions Taken on an accessible Ticket. Requesters may not mutate them.
- FR-04: The backend derives `performedBy` from the session; clients cannot supply or override the performer field.
- FR-05: Requesters can list Actions Taken only for their own Ticket; Staff and Administrators can list them for Staff-accessible Tickets.
- FR-06: Action updates accept the last `updatedAt` value and return a safe `409 ACTION_UPDATE_CONFLICT` when another update won the race.
- FR-07: `RESOLVED` requires a persisted Action Taken. A Requester’s “appears resolved” indication remains advisory and never changes the formal status.
- FR-08: Requester Dashboard metrics are `openTickets`, `waitingForRequester`, `recentlyUpdated`, and `recentlyResolved`; each list item drills into the existing Ticket Detail.
- FR-09: IT Staff Dashboard metrics are unassigned active Tickets, active Tickets owned by the current user, Actions Taken by the current user, recently updated Tickets, and urgent high-priority Tickets. Status and priority breakdowns and recent Actions Taken are included.
- FR-10: Dashboards calculate from authoritative database queries, return concise summaries, and return safe `500 INTERNAL_ERROR` responses on failure.
- FR-11: All state-changing browser requests keep the existing session-cookie and Origin protections.
- FR-12: Existing Lab 1-3 routes and regression behavior remain intact unless this contract explicitly adds the Lab 4 resolution gate or Actions Taken capability.

## 5. Business Rules

- BR-01: Every Action Taken belongs to exactly one Ticket.
- BR-02: The Ticket Owner coordinates the Ticket, but an Action Taken may be performed by a different active IT Staff member or Administrator.
- BR-03: `performedById` is the authenticated actor, never a body field.
- BR-04: Action Description and Result contain 1-5,000 trimmed characters.
- BR-05: If Follow-Up Required is true, Follow-Up Note is required; otherwise it is stored as null.
- BR-06: Attachment Notes are optional and limited to 2,000 characters.
- BR-07: Action list ordering is deterministic by Action Date/Time ascending, then Action ID ascending.
- BR-08: The additive migration preserves all earlier rows and foreign keys. Seed is idempotent and demonstrates zero, one, and multiple Actions Taken.
- BR-09: Open Dashboard Tickets are `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, or `REOPENED`; `CLOSED` and `CANCELLED` are not open.
- BR-10: Recently updated/resolved Dashboard windows use the last 30 days in server time; counts and list data use the same authoritative query boundary.
- BR-11: A Requester’s resolved indication is advisory and does not set formal `RESOLVED` or `CLOSED` status.
- BR-12: Staff status transitions remain the Lab 3 permitted transition matrix; a transition to `RESOLVED` additionally requires at least one Action Taken.

## 6. UI Specification Summary

Each authenticated role has a Dashboard navigation item. Requesters see their own metrics, recent updates, recent resolutions, and Create Ticket shortcut. IT Staff and Administrators see unassigned/owned/urgent metrics, status and priority breakdowns, recent Tickets, and recent Actions Taken. Ticket Detail includes an Actions Taken list; Staff and Administrators receive the create/edit form, while Requesters receive read-only entries. Empty, loading, forbidden, validation, conflict, and safe-failure states use the established Zen Green patterns, visible focus, semantic labels, non-color status cues, and responsive stacked cards.

## 7. Data Changes and Decisions

`ActionTaken` is additive with `ticketId`, `actionDateTime`, `description`, `result`, `performedById`, `followUpRequired`, `followUpNote`, `attachmentNotes`, `createdAt`, and `updatedAt`. Indexes support Ticket chronology and performer chronology. `onDelete: Restrict` preserves audit history. `updatedAt` plus conditional `updateMany` provides stale-write detection without overwriting another actor’s edit. Existing Ticket, User, Attachment, PublicComment, InternalNote, and Session records are not rewritten.

## 8. API Contract

See [api-spec.md](api-spec.md). Primary additions are `GET /api/tickets/:ticketId/actions`, `GET/POST /api/staff/tickets/:ticketId/actions`, `PATCH /api/staff/tickets/:ticketId/actions/:actionId`, `GET /api/dashboard/requester`, and `GET /api/dashboard/staff`.

## 9. Acceptance Criteria

- AC-01: Valid Staff/Admin Action Taken creates under the requested Ticket with the authenticated actor and returns the complete response shape.
- AC-02: Follow-up validation, invalid fields, missing Tickets, Requester ownership, role restrictions, and safe failures return documented codes.
- AC-03: An Action Taken can be edited with a matching version and stale edits return `409 ACTION_UPDATE_CONFLICT` without overwriting the newer row.
- AC-04: Formal resolution without an Action Taken returns `409 RESOLUTION_ACTION_REQUIRED`; resolution with an Action Taken succeeds through the existing permitted transition.
- AC-05: Requester Dashboard data contains only the authenticated Requester’s Tickets; Staff Dashboard data contains authoritative operational counts and drill-down summaries.
- AC-06: Dashboard and Actions Taken UI works at desktop, tablet, and mobile widths without page-level horizontal scrolling.
- AC-07: All Lab 1-3 tests and builds remain passing in the configured environment, and the Lab 4 suite covers unit/API/integration/UI/responsive/E2E/regression paths.

## 10. Final Implementation Definition of Done

The following checklist is intentionally not claimed by the contract PR. It is the completion gate for the later feature branches, staging integration, and final evidence record.

- [ ] Specification, API, UI, test plan, reviewer, and AI-use documents are committed before the final integration record.
- [ ] Migration is additive, deployable, reversible by documented recovery, and seed is repeatable.
- [ ] Backend authorization and validation enforce every write rule.
- [ ] Actions Taken and both dashboards have loading, empty, error, and success behavior.
- [ ] Unit/API/UI/E2E/responsive/regression checks run from the final integrated branch.
- [ ] Build, diff, console, accessibility, and responsive evidence are recorded.
- [ ] Final PDF contains exactly Answer Part 1 through Answer Part 9 and working repository/evidence links.

## 11. Assumptions and Decisions

The 30-day dashboard window is a stable, testable interpretation of “recent.” Administrators can perform Actions Taken because the Lab 4 role table explicitly grants IT Staff behavior for this capability; the Lab 3 Administrator restrictions on assignment/status/comments/notes remain unchanged. Attachment Notes describe related evidence and do not create a second attachment relationship. Recovery is through the normal database backup/restore plus re-deploying the previous migration set; no destructive rollback is run against a shared database.
