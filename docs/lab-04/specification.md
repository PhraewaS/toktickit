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
- FR-06: Action updates require the last `updatedAt` value; missing/invalid versions return `400 VALIDATION_ERROR`, and a stale version returns a safe `409 ACTION_UPDATE_CONFLICT` without overwriting the newer row.
- FR-07: `RESOLVED` requires a persisted Action Taken. A Requester’s “appears resolved” indication remains advisory and never changes the formal status.
- FR-08: Requester Dashboard metrics are `openTickets`, `waitingForRequester`, `recentlyUpdated`, and `recentlyResolved`; each list item drills into the existing Ticket Detail.
- FR-09: IT Staff Dashboard has four metrics: unassigned active Tickets, active Tickets owned by the current user, all-time Actions Taken by the current user, and urgent high-priority Tickets. Status/priority breakdowns and bounded recently updated Ticket, urgent Ticket, and recent Action lists are separate response fields.
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
- BR-13: Assignment is a parent-Ticket operation, not an Action field. Only IT Staff may perform Assignment; a non-null chosen Owner must be an active IT Staff or Administrator account. Eligibility as an Owner does not grant Administrators permission to perform Assignment or formal status writes. Administrators retain Ticket read/IT-Priority access and the expressly granted Action create/edit capability.
- BR-14: Action Date/Time must be a string parseable as a date by the existing backend. Clients submit an ISO-8601 timestamp with an explicit offset/UTC; the response normalizes to UTC and storage retains millisecond precision. The existing handler has no past/future bound. Editing a different field preserves the exact stored time, including seconds.
- BR-15: Action creates require an `Idempotency-Key` UUID. A unique stored key and normalized-request fingerprint bind the Ticket, actor and draft. An exact retry returns the same record; changed-request reuse returns a conflict. The key is not a substitute for update-version checking.
- BR-16: Entered data survives recoverable refresh/save failures. A stale edit requires refresh; an uncertain create keeps the submitted draft/key stable until retry or deliberate discard followed by reconciliation. Server errors disclose no credentials, SQL, paths or stack traces.

### Role / operation matrix

All writes are authorized in the backend, independently of visible controls. Staff/Admin can read all existing Tickets through Staff routes; Requester reads are scoped to owned Tickets.

| Operation | Requester | IT Staff | Administrator |
| --- | --- | --- | --- |
| Own-Ticket Actions list | Own Ticket via Requester route | Staff route | Staff route |
| Create/edit an Action | Forbidden | Allowed | Allowed |
| Formal Ticket assignment/status | Forbidden | Allowed, subject to active assignee / status matrix | Forbidden (preserved Lab 3 boundary) |
| Ticket IT-Priority update | Forbidden | Allowed | Allowed |
| Requester advisory resolved indication | Own Ticket, advisory only | Not the Requester route | Not the Requester route |
| Dashboard | Own Requester metrics | Staff operational metrics | Reused Staff operational metrics plus existing User Management navigation |

There is no Action-specific assign, complete, cancel, status or delete API. Handout Part 6's lifecycle demonstration uses the parent Ticket. Public Comments/Internal Notes retain append-only list/create behavior; Actions remain editable with a version token. This interpretation preserves the reviewed contract rather than introducing an unapproved second workflow.

### Final Ticket status transition matrix

The backend is authoritative. The status control shows only the permitted next statuses below. Any no-op or unlisted transition returns `409 STATUS_TRANSITION_NOT_ALLOWED`. Each status request includes the `expectedCurrentStatus` shown when the Ticket was loaded. If another Staff member changed the Ticket while the page was open, the request returns `409 STATUS_UPDATE_CONFLICT` without applying the stale transition. The atomic database update also protects the interval between the Server's read and write. The Staff member must refresh the Ticket before retrying. Requesters cannot perform formal transitions, and Administrators retain Lab 3 read/IT-Priority behavior but do not perform Staff status transitions.

| Current status | Permitted next status | Authorized actor | Additional rule |
| --- | --- | --- | --- |
| `NEW` | `OPEN` | IT Staff | — |
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | IT Staff | — |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff | `RESOLVED` requires at least one persisted Action Taken |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | IT Staff | `RESOLVED` requires at least one persisted Action Taken |
| `RESOLVED` | `CLOSED`, `REOPENED` | IT Staff | — |
| `CLOSED` | `REOPENED` | IT Staff | — |
| `REOPENED` | none | IT Staff | No transition is permitted by the Lab 3 matrix |
| `CANCELLED` | none | IT Staff | No transition is permitted by the Lab 3 matrix |

The Requester `POST /api/tickets/:ticketId/resolved` operation remains an idempotent advisory indication. It may record the Requester indication, but it never changes the formal status or bypasses the matrix.

## 6. Dashboard calculation contract

All dashboard calculations run in the backend against authoritative database queries. The server captures one `now` value per request and defines `recentCutoff = now - 30 days` in UTC. Counts and lists use the same cutoff and ownership scope. List results are concise summaries with ticket/action IDs for drill-down; they are not replacement Ticket Detail responses.

### Requester Dashboard

For the authenticated Requester’s Ticket set only:

- `openTickets`: count of Tickets whose status is `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, or `REOPENED`.
- `waitingForRequester`: count of Tickets with status `WAITING_FOR_REQUESTER`.
- `metrics.recentlyUpdated`: count of **all** owned Tickets with `updatedAt >= recentCutoff`; not limited to 10.
- `metrics.recentlyResolved`: count of **all** owned Tickets in `RESOLVED` or `CLOSED` with `updatedAt >= recentCutoff`; not limited to 10.
- `data.recentlyUpdated` / `data.recentlyResolved`: corresponding lists, each capped at 10, ordered by `updatedAt DESC, id DESC`. The shared names at different nesting levels do not make a metric count equal to a capped array length.

Each list item includes `id`, `ticketNumber`, `summary`, `currentStatus`, and `updatedAt`; its destination is the existing read-only Ticket Detail.

Dashboard metric and breakdown controls must open the corresponding filtered list, not the unfiltered Queue: Requester Open Tickets uses `activeOnly=true`, Waiting for Requester uses `currentStatus=WAITING_FOR_REQUESTER`, Staff Unassigned Active uses `ownerId=unassigned&activeOnly=true`, My Active uses `ownerId=<authenticatedUserId>&activeOnly=true`, and High Priority uses `itPriority=HIGH&activeOnly=true`. Staff status breakdowns filter by one exact status; IT Priority breakdowns filter by one exact IT Priority across all statuses. The filter is applied to the first list request and remains visible in its control.

### IT Staff / Administrator Dashboard

For Tickets visible to the authenticated IT Staff or Administrator:

- `unassignedActive`: count of active Tickets with `ownerId IS NULL`.
- `myActive`: count of active Tickets with `ownerId = authenticatedUser.id`.
- `myActionsTaken`: count of persisted Actions Taken with `performedById = authenticatedUser.id`.
- `metrics.urgentTickets`: count of all active visible Tickets with `itPriority = HIGH`; not limited to the urgent list's 10 items.
- `byStatus`: counts grouped by status for the visible Ticket set.
- `byPriority`: counts grouped by IT Priority for the visible Ticket set.
- `recentlyUpdated`: up to 10 visible Tickets with `updatedAt >= recentCutoff`, ordered by `updatedAt DESC, id DESC`.
- `urgentTickets`: up to 10 active visible Tickets with `itPriority = HIGH`, ordered by `updatedAt DESC, id DESC`.
- `recentActions`: up to 10 Actions Taken performed by the authenticated user with `actionDateTime >= recentCutoff`, ordered by `actionDateTime DESC, id DESC`.

`active` means status `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, or `REOPENED`. Ticket list items drill down to Staff Ticket Detail or the appropriate filtered Queue; Action items drill down to Staff Ticket Detail. Recent Ticket summaries include `id`, `ticketNumber`, `summary`, `currentStatus`, `updatedAt`, `itPriority`, `requester {id,name}`, and nullable `owner {id,name}`. Recent Action summaries include `id`, `ticketId`, `ticketNumber`, `summary`, `actionDateTime`, `description`, and `result`; they open Staff Ticket Detail by `ticketId`.

The recent window is the rolling duration `30 * 24 * 60 * 60 * 1000` milliseconds, with an inclusive lower boundary, not calendar-month/local-midnight grouping. Queries use `>= recentCutoff`; they do not impose an upper `<= now` bound. Recently resolved means current status plus **Ticket updatedAt**, not a new resolution timestamp. Changing an Action alone does not update the parent Ticket's timestamp in the existing implementation. All status/IT-Priority breakdowns include inactive lifecycle states and zero-valued enum entries; every count is 0 and every list is `[]` when its query matches no records.

| Surface / field | Drill-down destination | Empty behavior |
| --- | --- | --- |
| Requester Open / Waiting cards | My Tickets with `activeOnly=true` / `currentStatus=WAITING_FOR_REQUESTER` | 0; shortcut still opens the matching list |
| Requester recent metric cards | Informational count, no count-card button; corresponding recent-list Ticket buttons open Requester Detail | 0 / explicit empty-list text |
| Staff Unassigned / My Active / Urgent cards | Queue with the matching owner/active/priority filters defined above | 0; shortcut remains filter-specific |
| Staff My Actions count | Informational all-time count; recent Action Ticket buttons open Staff Detail by `ticketId` | 0 / explicit empty recent-Actions text |
| Staff status / priority breakdown | Queue with exact `status` / `itPriority`, without active-only for breakdowns | Zero-valued entries remain visible |
| Staff recent / urgent Ticket lists | Staff Detail by Ticket `id` | Explicit empty-list text |

These informational-card choices are deliberate: the existing APIs have no all-time performer-Action list or recent-window My Tickets filter. Detailed navigation remains available without pretending an unfiltered list represents a metric's exact calculation.

## 7. UI Specification Summary

Each authenticated role has a Dashboard navigation item. Requesters see their own metrics, recent updates, recent resolutions, and Create Ticket shortcut. IT Staff and Administrators see unassigned/owned/urgent metrics, status and priority breakdowns, recent Tickets, and recent Actions Taken. Ticket Detail includes an Actions Taken list; Staff and Administrators receive the create/edit form, while Requesters receive read-only entries. Empty, loading, forbidden, validation, conflict, and safe-failure states use the established Zen Green patterns, visible focus, semantic labels, non-color status cues, and responsive stacked cards.

## 8. Data Changes and Decisions

`ActionTaken` is additive with `ticketId`, `actionDateTime`, `description`, `result`, `performedById`, `followUpRequired`, `followUpNote`, `attachmentNotes`, `createdAt`, and `updatedAt`. Indexes support Ticket chronology and performer chronology. `onDelete: Restrict` preserves audit history. Every update requires the current `updatedAt` token and uses conditional `updateMany`; missing tokens are rejected and stale tokens cannot overwrite another actor’s edit. Existing Ticket, User, Attachment, PublicComment, InternalNote, and Session records are not rewritten.

### Implemented field and constraint contract

Source of truth: [Prisma schema](../../server/prisma/schema.prisma), model `ActionTaken`, PostgreSQL table `actions_taken`.

| Field | Prisma / PostgreSQL type | Null / default | Constraint or purpose |
| --- | --- | --- | --- |
| `id` | Int / SERIAL integer | Not null, autoincrement | Primary key |
| `ticketId` | Int / INTEGER | Not null | FK to `tickets.id`, RESTRICT delete / CASCADE update |
| `performedById` | Int / INTEGER | Not null | FK to `requester_users.id`, RESTRICT delete / CASCADE update; immutable authenticated creator |
| `actionDateTime` | DateTime / TIMESTAMPTZ(3) | Not null, no DB default | Explicit action time; UTC response |
| `description`, `result` | String / VARCHAR(5000) | Not null | API trims and requires 1-5,000 characters |
| `followUpRequired` | Boolean / BOOLEAN | Not null, false | Conditional note rule enforced by API |
| `followUpNote` | String? / VARCHAR(5000) | Nullable | Required trimmed note when true; null when false |
| `attachmentNotes` | String? / VARCHAR(2000) | Nullable | Optional trimmed description of existing evidence, not an attachment FK |
| `createdAt` | DateTime / TIMESTAMPTZ(3) | Not null, now | Creation timestamp |
| `updatedAt` | DateTime / TIMESTAMPTZ(3) | Not null, Prisma @updatedAt | Required client token for conditional Action update |
| `idempotencyKey` | String? / UUID | Nullable, no default | Globally unique non-null create key; not returned by the API |
| `idempotencyFingerprint` | String? / VARCHAR(64) | Nullable, no default | SHA-256 normalized create-request fingerprint; not returned by the API |

Indexes are `actions_taken_ticket_datetime_idx(ticketId, actionDateTime, id)`, `actions_taken_performer_datetime_idx(performedById, actionDateTime, id)` and unique `actions_taken_idempotencyKey_key(idempotencyKey)`. Existing `tickets_staff_queue_idx(currentStatus, itPriority, ownerId, updatedAt, id)` supports Staff queue access; Dashboard queries reuse existing Ticket/User data rather than duplicating aggregates or adding a reporting store. There are no new Action enums/reference tables.

### Migration, legacy behavior and seed

1. [20260922090000_lab4_actions_taken](../../server/prisma/migrations/20260922090000_lab4_actions_taken/migration.sql) creates only the child table, FKs and chronological indexes.
2. [20261004090000_action_idempotency_key](../../server/prisma/migrations/20261004090000_action_idempotency_key/migration.sql) adds nullable UUID/fingerprint columns and the unique key index. Existing/seeded Actions retain null keys; no fabricated historical request key is backfilled. New API creates require a key.
3. Legacy Tickets receive no invented Action or rewritten status. Their Action list is empty; a **new** transition to RESOLVED requires evidence, but an already-resolved legacy Ticket may still close via the existing matrix. Dashboard counts include legacy Tickets using their existing status/owner/priority/updatedAt, not their Action count.
4. [seed.ts](../../server/prisma/seed.ts) upserts reference data/users and Tickets using fixed submission keys; Actions are deduplicated by seeded Ticket/description. Its six baseline Tickets cover NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED and REOPENED, all priorities and assigned/unassigned ownership; the first Ticket has two Actions, the second one, and the rest zero. CLOSED/CANCELLED are exercised by the lifecycle E2E, not claimed as baseline seeded statuses. Seeded rows with zero metrics and other rows with non-zero metrics support both states.
5. The explicit E2E reset deletes only guarded dedicated fixture data; it is not the ordinary idempotent-seed path or a migration operation. The verification runner uses dedicated local databases on 5433 and creates seed credentials in memory. Never reset shared/application data or commit `.env` credentials.
6. Five applied migrations and repeatable seed/recovery are recorded at exact staging sources in [integration.md](integration.md). Recovery restores an isolated SQL backup with matching PostgreSQL tools; no destructive down-migration or attachment-byte restore is claimed.

### Database-design decisions and rationale

- **Normalized child + restricted FKs:** separate Ticket responsibility from authenticated action authorship and prevent removal of the parent/actor from erasing operational history.
- **Precise timestamps + conditional updates:** preserve action timing and reject a mismatched update token at write time, rather than relying on an earlier read or disabling a UI control.
- **Unique key + fingerprint, nullable for legacy rows:** safely retry uncertain creates and concurrent inserts without modifying historical Actions or confusing changed drafts with replays.
- **Query authoritative records rather than cached counts:** metric definitions, ownership and zero states remain testable against the same operational database; bounded summary lists avoid returning entire collections.

## 9. API Contract

See [api-spec.md](api-spec.md). Primary additions are `GET /api/tickets/:ticketId/actions`, `GET/POST /api/staff/tickets/:ticketId/actions`, `PATCH /api/staff/tickets/:ticketId/actions/:actionId`, `GET /api/dashboard/requester`, and `GET /api/dashboard/staff`.

## 10. Acceptance Criteria

- AC-01: Given an authenticated Staff/Admin, an existing Ticket and a valid draft/key, when an Action is created, then return 201 with the correct Ticket, immutable actor and documented fields.
- AC-02: Given an invalid field/ID, absent resource, unauthorized role/ownership or backend failure, when the route is called, then return the documented safe error without exposing protected data or saving invalid input.
- AC-03: Given a loaded Action, when the full edit draft and current `updatedAt` are sent, then update it; missing/invalid tokens return 400, and stale tokens return 409 without overwriting the current row.
- AC-04: Given a permitted Staff transition, when resolution is requested without an Action, then reject with 409; with an Action allow resolution and closure. Stale loaded status and read/write races conflict; Requester advisory remains non-formal; cancellation and inactive-assignee rejection retain Lab 3 rules.
- AC-05: Given each authenticated role, when its Dashboard loads, then counts, bounded lists, ownership, zero states and first-request drill-down filters match the backend query contract, and selected counts match independent DB/API/UI evidence.
- AC-06: Given desktop/tablet/mobile widths, when Dashboard/Actions controls are used, then responsive layouts fit horizontally, required/readonly fields are distinguishable, keyboard focus/activation works and Zen Green visual conventions remain consistent. Loading/empty/forbidden/failure states remain distinct.
- AC-07: Given the guarded configured environment, when the complete regression/verification is run, then suites/builds, additive migration, seed, recovery, performance smoke and legacy role/navigation/attachment/communication/user-management checks pass with intentional skips recorded separately. Final completion requires a repeat on released main.
- AC-08: Given an unsaved/uncertain draft or a precise stored time, when refresh/retry or a different-field edit occurs, then preserve entered data until deliberate discard, reuse the create key without duplicates, reconcile after uncertain discard and retain the unchanged exact Action Date/Time.

## 11. Final Implementation Definition of Done

**Current 2026-10-14:** approved release #63 merged into main as **e1fa72f9fa1ad26ead74f82cf1de6bbf09de6384**. Six phases, builds/regression, selected metric comparisons and keyboard checks passed there; 72 supplementary full-page/feedback/editor captures completed at three widths. [Fresh main results](../../artifacts/lab-04/evidence/final-main/summary.md). Final-evidence approval/merge, accepted submission and Kanban Done remain separate human gates.

- [x] Repeat verification on actual released main with product SHA, phase outputs, reports and source-scoped limitations recorded separately.
- [x] Prepare Answer Parts 1-9 PDF review candidate with readable screenshot regions and linked full originals; no false approval/Done.
- [ ] Peer accepts/merges final evidence and completes PDF/submission acceptance; then record real Done and complete #54.

The following is the preserved **pre-release checklist**, not a claim that the main repeat is still pending:

PR #55 established the contract before the feature PRs; this maintenance does not rewrite that history or add product scope. Feature/integration evidence at `4e532887835770b0f4ec851e34e1bb92fab7c685` and actual staging evidence at `5ab13bbf53371b1e42bacbfe22c00296b9f68d0c` remain separately dated. The ticks below describe verified pre-release work, not final-main completion. See [integration.md](integration.md) and [reviewer.md](reviewer.md) for human approvals and pending release/submission gates.

- [x] Specification, API, UI, test plan, reviewer, and AI-use documents are committed before the final integration record.
- [x] Migration is additive/deployable, isolated backup/restore recovery is tested, and seed is repeatable (limitations documented).
- [x] Backend authorization and validation rules are covered by the passing integration suites.
- [x] Actions Taken and both dashboards have tested loading, empty, error, and success behavior.
- [x] Unit/API/UI/E2E/responsive/performance-smoke/regression checks run from the integration feature branch with its exact source revision recorded.
- [x] Build, diff, console, targeted accessibility, and responsive evidence are recorded.
- [ ] Repeat verification on released final main and record its exact product revision separately.
- [ ] Final PDF contains exactly Answer Part 1 through Answer Part 9 and working repository/evidence links.

## 12. Assumptions and Decisions

The 30-day dashboard window is a stable, testable interpretation of “recent.” Administrators can perform Actions Taken because the Lab 4 role table explicitly grants IT Staff behavior for this capability; the Lab 3 Administrator restrictions on assignment/status/comments/notes remain unchanged. Attachment Notes describe related evidence and do not create a second attachment relationship. Recovery uses backup/restore tested on an isolated local database with matching PostgreSQL tools, table counts and data fingerprints; no destructive rollback runs against shared data. Restoring a pre-change backup with the compatible application version is the recovery approach, not erasing applied migration history. See [integration.md](integration.md) for the tested procedure, attachment-byte limitation and final-main gate.
