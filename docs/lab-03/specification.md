# TokTickIT Lab 3 Sprint 3 Engineering Contract

Status: implementation contract for the Lab 3 increment.

## 1. Sprint goal

Replace the Lab 2 development requester selector with secure account authentication and role-based access while preserving requester ticketing and attachments. Add the first operational IT Staff workflow and a deliberately small Administrator user-management screen using the existing Zen Green language.

## 2. Stakeholder request

Users sign in with an email and password. An initial password forces a password change before application access. Requesters continue to create and manage only their own tickets, IT Staff process a shared queue and ticket detail, and Administrators manage accounts without deletion or advanced identity-management features.

## 3. Scope

Included: cookie-backed sessions, logout, current-user retrieval, first-login password change, three single-role accounts, migration of Lab 2 requester records, requester regression, ticket ownership and IT priority, permitted status workflow, Public Comments, Internal Notes, IT Staff queue/detail, and minimalist Administrator user management.

Excluded: invitations, email or social login, MFA/SSO, self-registration, password-reset email, Actions Taken, SLA/escalation/notifications, dashboards/KPIs, multi-tenancy, departments, multiple roles, user deletion/bulk/import/export, account history, and production deployment changes.

## 4. Functional requirements

- FR-01: An active user with valid credentials can log in; inactive users and invalid credentials receive safe failures.
- FR-02: A session identifies the authenticated user server-side; logout invalidates it and normal routes cannot be used afterward.
- FR-03: A user with `mustChangePassword` cannot access normal application routes until a valid new password is saved.
- FR-04: The shell shows the authenticated name and role and exposes only permitted navigation.
- FR-05: Requester ticket and attachment APIs derive ownership from the authenticated Requester, not a client requester ID.
- FR-06: Requesters can create tickets, list/detail their own tickets, upload/download/remove permitted attachments, post Public Comments, and indicate that a problem appears resolved.
- FR-07: IT Staff can retrieve a searchable, filterable, sortable, paginated queue and open ticket detail. Administrators may retrieve the same ticket views for oversight and may update IT Priority; all other Staff operations remain unavailable to Administrators.
- FR-08: IT Staff can assign/reassign ownership, set IT Priority, perform permitted status transitions, post Public Comments, and create Internal Notes. Administrators may be selected as a Ticket Owner and may update IT Priority, but may not assign/reassign, change status, or append staff-side comments/notes.
- FR-09: Requesters can retrieve and create Public Comments only on their own tickets. IT Staff and Administrators can retrieve Public Comments and Internal Notes for tickets visible to them; only IT Staff may append staff-side comments/notes.
- FR-10: Administrators can list/search/filter users, create users, edit name/email/role/activation, and set a new initial password.
- FR-11: User management rejects invalid roles and duplicate emails, prevents self-deactivation, and preserves at least one active Administrator.
- FR-12: All protected operations enforce authorization on the server and return safe, distinguishable errors.

## 5. Business rules

- BR-01: Only an active user with valid credentials may authenticate.
- BR-02: Initial-password users may call only `GET /auth/me`, `POST /auth/logout`, and `POST /auth/change-password` until they change it. Any other protected route returns `403 PASSWORD_CHANGE_REQUIRED` after session authentication and before route-specific ownership or role checks. A successful password change clears `mustChangePassword`; missing or invalid sessions still return `401`.
- BR-03: Passwords are stored only as salted scrypt hashes; plaintext passwords never enter responses or the database.
- BR-04: Sessions are opaque, hashed at rest, HttpOnly, SameSite=Lax cookies with a bounded expiry.
- BR-05: The authenticated Requester identity determines ticket ownership; supplied requester IDs are ignored by authenticated routes.
- BR-06: Requester ticket and attachment access is ownership checked; another user's protected resource has the same safe 404 as a missing resource.
- BR-07: A Ticket has zero or one primary owner, and the owner must be an active IT Staff or Administrator account. Only IT Staff may assign, reassign, or unassign the owner; an Administrator may be the selected owner but cannot perform assignment operations.
- BR-08: Requested Priority is immutable requester input; IT Priority initially copies it and may be changed by IT Staff or Administrator through the authorized priority operation.
- BR-09: Ticket statuses are `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
- BR-10: IT Staff may transition `NEW -> OPEN`, `OPEN -> IN_PROGRESS|WAITING_FOR_REQUESTER|CANCELLED`, `IN_PROGRESS -> WAITING_FOR_REQUESTER|RESOLVED|CANCELLED`, `WAITING_FOR_REQUESTER -> IN_PROGRESS|RESOLVED|CANCELLED`, `RESOLVED -> CLOSED|REOPENED`, and `CLOSED -> REOPENED`. No-op and other transitions conflict.
- BR-11: A Requester can indicate a problem appears resolved, but cannot set a formal Resolved or Closed status.
- BR-12: Comments and notes are append-only, backend-authored, trimmed, non-empty, and limited to 5,000 characters. Requesters may retrieve/create Public Comments only for their own tickets. Public Comments are visible to roles with ticket visibility; Internal Notes are visible read-only to IT Staff and Administrator. Only IT Staff may create staff-side Public Comments or Internal Notes; Administrators cannot append, edit, or delete them.
- BR-13: User email is unique case-insensitively; each user has exactly one permitted role.
- BR-14: New and reset initial passwords set `mustChangePassword=true`.
- BR-15: An Administrator cannot deactivate their own account or deactivate/remove the last active Administrator. Users are deactivated, never deleted.
- BR-16: Seed data is deterministic and idempotent and contains at least four active Requesters, one inactive Requester, three active IT Staff, one inactive IT Staff, one active Administrator, realistic tickets, comments, and notes.
- BR-17: Invalid input, unauthenticated access, forbidden access, missing resources, conflicts, and unexpected failures use safe distinct status/error codes. The legacy Development Requester route is not a production API and returns `410 DEVELOPMENT_REQUESTERS_RETIRED` in production regardless of environment flags. It may be enabled only by non-production regression or migration tooling with an explicit compatibility context.

## 6. Authorization matrix

| Operation | Requester | IT Staff | Administrator |
|---|---:|---:|---:|
| Login/logout/current user/password change | Yes | Yes | Yes |
| Create/list/detail own tickets and attachments | Own only | No | No |
| Requester resolved indication | Own only | No | No |
| Staff queue/detail | No | Yes | Yes, read-only except IT Priority update |
| Staff assignment/reassignment | No | Yes | No |
| IT Priority update | No | Yes | Yes |
| Staff status transition | No | Yes | No |
| Public Comments retrieve/create | Own ticket only | Visible tickets | Retrieve only |
| Internal Notes retrieve/create | No | Yes | Retrieve only |
| Ticket Owner eligibility | No | Yes | Yes |
| User list/create/edit/reset password | No | No | Yes |

The backend is authoritative; UI hiding is only usability feedback.

## 7. Data and migration decisions

The Lab 2 `requester_users` table is evolved in place into the account table so existing IDs and Ticket foreign keys remain valid. It gains `passwordHash`, `role`, `mustChangePassword`, and login timestamps. Existing Requester rows receive deterministic local-only initial passwords and remain active/inactive as before. Tickets gain nullable `ownerId`, `itPriority`, and `requesterResolvedAt`; existing IT Priority values are backfilled from Requested Priority. Comment and Internal Note tables are additive. Session rows store only a hash of the opaque cookie token. Indexes cover active role/name, ticket queue status/priority/owner/updated time, and comment/note ticket ordering.

## 8. API summary

Base path is `/api`; JSON uses `{data}` and errors use `{error:{code,message,fields?}}`. Authentication uses the HttpOnly `toktickit_session` cookie. Sessions expire after eight hours and logout deletes the server session and clears the cookie.

Authentication: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`. During the first-login gate, only `GET /auth/me`, `POST /auth/logout`, and `POST /auth/change-password` are allowed; every other protected route returns `403 PASSWORD_CHANGE_REQUIRED` without performing its normal operation.

Requester-compatible routes remain at `/tickets`, `/tickets/:id`, attachment routes, and add `POST/GET /tickets/:id/comments` and `POST /tickets/:id/resolved`.

Requester comment routes: `GET/POST /tickets/:id/comments` are available to an authenticated Requester only when the ticket belongs to that Requester; GET returns `200`, POST returns `201`, invalid content returns `400`, missing/invalid session returns `401`, and another user's/missing ticket returns safe `404`.

`POST /tickets/:id/resolved` accepts an empty JSON object `{}` and is idempotent for the authenticated Requester's own ticket. It returns `200 {data:{ticketId,requesterResolvedAt,currentStatus}}`, sets the Requester's resolved indication, and never changes `currentStatus`. Invalid ticket IDs or malformed/unexpected request fields return `400`; missing/invalid sessions return `401`; another user's or missing tickets return safe `404`; non-Requester roles receive `403 ROLE_FORBIDDEN`; a first-login-gated session receives `403 PASSWORD_CHANGE_REQUIRED` before route-specific validation, ownership, or role checks; unexpected failures return `500 INTERNAL_ERROR`.

Staff routes: `GET /staff/tickets`, `GET /staff/tickets/:id`, `GET /staff/tickets/:id/comments`, and `GET /staff/tickets/:id/notes` are available to IT Staff and Administrators as read operations. `PATCH /staff/tickets/:id/priority` is available to IT Staff and Administrators. `POST /staff/tickets/:id/assignment`, `PATCH /staff/tickets/:id/status`, `POST /staff/tickets/:id/comments`, and `POST /staff/tickets/:id/notes` are IT Staff-only operations. Assignment accepts an active IT Staff or Administrator owner, while only IT Staff can perform the assignment.

Administrator routes: `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id`, and `POST /admin/users/:id/initial-password`.

Authentication failures are `401`; forbidden role/ownership is `403` or safe `404` as specified; invalid input is `400`; duplicate/state conflicts are `409`; retired compatibility access is `410`; unexpected failures are `500` with no SQL, stack, path, hash, or secret detail. `LAB2_COMPATIBILITY_MODE=true` is accepted only in a non-production migration/regression process and must be rejected or ignored when `NODE_ENV=production`.

## 9. Acceptance criteria

- AC-01: Valid active credentials establish a session and return safe user identity and role.
- AC-02: Invalid credentials and inactive users receive safe failures and no session.
- AC-03: Initial-password login blocks normal routes until a valid password change succeeds.
- AC-04: Logout invalidates access and direct normal-route access fails afterward.
- AC-05: Requester create/list/detail/attachment behavior continues using authenticated identity only.
- AC-06: Requester cannot access another user's ticket, attachment, Internal Note, or staff/admin routes.
- AC-07: IT Staff queue supports search, filters, sorting, pagination, ownership, status, and priority data.
- AC-08: IT Staff can assign/reassign to an active IT Staff or Administrator, update IT Priority, make only permitted status transitions, and append comments/notes. Administrators can update IT Priority and may be assigned as owner, but Administrator assignment/status/comment/note mutations receive `403 ROLE_FORBIDDEN`.
- AC-09: Requesters can read/create Public Comments only on their own tickets. IT Staff and Administrators can read staff-visible Public Comments and Internal Notes according to the matrix; Administrators are otherwise read-only; Internal Notes never appear in Requester responses.
- AC-10: Requester resolved indication is available without changing formal status.
- AC-11: Administrator can list/search/filter/create/edit/deactivate/reset users with the stated safety rules.
- AC-12: Seed and migration preserve Lab 2 tickets/attachments and are safe to rerun.
- AC-13: Required screens provide loading, saving, validation, success, empty/no-results, forbidden, not-found, conflict, and safe failure feedback where applicable.
- AC-14: Major screens fit desktop, tablet, and mobile viewports with keyboard-visible focus and no horizontal page overflow.
- AC-15: The production client never calls or renders the Development Requester selector. `GET /development-requesters` returns `410 DEVELOPMENT_REQUESTERS_RETIRED` in production, even if `LAB2_COMPATIBILITY_MODE=true`; only explicit non-production regression/migration tooling may enable it.

## 10. Product Definition of Done

- [ ] This contract, API spec, UI spec, and test plan existed before final implementation integration.
- [ ] Schema migration is additive/backfills existing data; seed is idempotent and credentials are documented as local-only.
- [ ] Every protected endpoint has backend auth, role, and ownership checks with safe errors.
- [ ] Acceptance criteria map to passing unit/API/UI/E2E and responsive/accessibility evidence.
- [ ] Existing Lab 2 requester and attachment regression tests pass or are updated to authenticated equivalents.
- [ ] Client/server builds pass; no secrets, plaintext passwords, stored filenames, or storage paths are exposed.
- [ ] Evidence includes reviewer record, AI-use reflection, final-main test/build output, and one concise Answer Part 1-9 PDF.

## 11. Assumptions and decisions

Session cookies are selected because the existing browser application is same-site and the server can invalidate sessions immediately. SameSite=Lax, JSON state-changing endpoints, and an Origin check for browser mutations provide the Lab 3 CSRF baseline. Seed credentials are local development fixtures only and must be changed at first login. Administrators may be Ticket Owners and may update IT Priority, but only IT Staff may assign/reassign, change status, or append staff-side comments/notes. The legacy Development Requester endpoint is disabled in production and can be enabled only by an explicit non-production regression/migration tooling context.
