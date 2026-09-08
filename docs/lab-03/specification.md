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
- FR-07: IT Staff can retrieve a searchable, filterable, sortable, paginated queue and open ticket detail.
- FR-08: IT Staff can claim/reassign ownership, set IT Priority, perform permitted status transitions, post Public Comments, and create Internal Notes.
- FR-09: Public Comments are retrievable by all roles with ticket visibility; Internal Notes are retrievable only by IT Staff and Administrators.
- FR-10: Administrators can list/search/filter users, create users, edit name/email/role/activation, and set a new initial password.
- FR-11: User management rejects invalid roles and duplicate emails, prevents self-deactivation, and preserves at least one active Administrator.
- FR-12: All protected operations enforce authorization on the server and return safe, distinguishable errors.

## 5. Business rules

- BR-01: Only an active user with valid credentials may authenticate.
- BR-02: Initial-password users may call only current-user, logout, and password-change actions until they change it.
- BR-03: Passwords are stored only as salted scrypt hashes; plaintext passwords never enter responses or the database.
- BR-04: Sessions are opaque, hashed at rest, HttpOnly, SameSite=Lax cookies with a bounded expiry.
- BR-05: The authenticated Requester identity determines ticket ownership; supplied requester IDs are ignored by authenticated routes.
- BR-06: Requester ticket and attachment access is ownership checked; another user's protected resource has the same safe 404 as a missing resource.
- BR-07: A Ticket has zero or one owner, and an owner must be an active IT Staff or Administrator account.
- BR-08: Requested Priority is immutable requester input; IT Priority initially copies it and changes only through the staff operation.
- BR-09: Ticket statuses are `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
- BR-10: IT Staff may transition `NEW -> OPEN`, `OPEN -> IN_PROGRESS|WAITING_FOR_REQUESTER|CANCELLED`, `IN_PROGRESS -> WAITING_FOR_REQUESTER|RESOLVED|CANCELLED`, `WAITING_FOR_REQUESTER -> IN_PROGRESS|RESOLVED|CANCELLED`, `RESOLVED -> CLOSED|REOPENED`, and `CLOSED -> REOPENED`. No-op and other transitions conflict.
- BR-11: A Requester can indicate a problem appears resolved, but cannot set a formal Resolved or Closed status.
- BR-12: Comments and notes are append-only, backend-authored, trimmed, non-empty, and limited to 5,000 characters. Public Comments are visible to Requester, IT Staff, and Administrator; Internal Notes are visible only to IT Staff and Administrator.
- BR-13: User email is unique case-insensitively; each user has exactly one permitted role.
- BR-14: New and reset initial passwords set `mustChangePassword=true`.
- BR-15: An Administrator cannot deactivate their own account or deactivate/remove the last active Administrator. Users are deactivated, never deleted.
- BR-16: Seed data is deterministic and idempotent and contains at least four active Requesters, one inactive Requester, three active IT Staff, one inactive IT Staff, one active Administrator, realistic tickets, comments, and notes.
- BR-17: Invalid input, unauthenticated access, forbidden access, missing resources, conflicts, and unexpected failures use safe distinct status/error codes.

## 6. Authorization matrix

| Operation | Requester | IT Staff | Administrator |
|---|---:|---:|---:|
| Login/logout/current user/password change | Yes | Yes | Yes |
| Create/list/detail own tickets and attachments | Own only | No | No |
| Requester resolved indication | Own only | No | No |
| Public Comments retrieve/create | Visible tickets/create own | Queue tickets | Visible tickets/read-only |
| Staff queue/detail/assignment/priority/status | No | Yes | No |
| Internal Notes retrieve/create | No | Yes | Yes |
| User list/create/edit/reset password | No | No | Yes |

The backend is authoritative; UI hiding is only usability feedback.

## 7. Data and migration decisions

The Lab 2 `requester_users` table is evolved in place into the account table so existing IDs and Ticket foreign keys remain valid. It gains `passwordHash`, `role`, `mustChangePassword`, and login timestamps. Existing Requester rows receive deterministic local-only initial passwords and remain active/inactive as before. Tickets gain nullable `ownerId`, `itPriority`, and `requesterResolvedAt`; existing IT Priority values are backfilled from Requested Priority. Comment and Internal Note tables are additive. Session rows store only a hash of the opaque cookie token. Indexes cover active role/name, ticket queue status/priority/owner/updated time, and comment/note ticket ordering.

## 8. API summary

Base path is `/api`; JSON uses `{data}` and errors use `{error:{code,message,fields?}}`. Authentication uses the HttpOnly `toktickit_session` cookie. Sessions expire after eight hours and logout deletes the server session and clears the cookie.

Authentication: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`.

Requester-compatible routes remain at `/tickets`, `/tickets/:id`, attachment routes, and add `POST/GET /tickets/:id/comments` and `POST /tickets/:id/resolved`.

Staff routes: `GET /staff/tickets`, `GET /staff/tickets/:id`, `POST /staff/tickets/:id/assignment`, `PATCH /staff/tickets/:id/priority`, `PATCH /staff/tickets/:id/status`, `GET/POST /staff/tickets/:id/comments`, and `GET/POST /staff/tickets/:id/notes`.

Administrator routes: `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id`, and `POST /admin/users/:id/initial-password`.

Authentication failures are `401`; forbidden role/ownership is `403` or safe `404` as specified; invalid input is `400`; duplicate/state conflicts are `409`; unexpected failures are `500` with no SQL, stack, path, hash, or secret detail.

## 9. Acceptance criteria

- AC-01: Valid active credentials establish a session and return safe user identity and role.
- AC-02: Invalid credentials and inactive users receive safe failures and no session.
- AC-03: Initial-password login blocks normal routes until a valid password change succeeds.
- AC-04: Logout invalidates access and direct normal-route access fails afterward.
- AC-05: Requester create/list/detail/attachment behavior continues using authenticated identity only.
- AC-06: Requester cannot access another user's ticket, attachment, Internal Note, or staff/admin routes.
- AC-07: IT Staff queue supports search, filters, sorting, pagination, ownership, status, and priority data.
- AC-08: IT Staff can claim/reassign, update IT Priority, make only permitted status transitions, and append comments/notes.
- AC-09: Public Comments are shared; Internal Notes never appear in Requester responses.
- AC-10: Requester resolved indication is available without changing formal status.
- AC-11: Administrator can list/search/filter/create/edit/deactivate/reset users with the stated safety rules.
- AC-12: Seed and migration preserve Lab 2 tickets/attachments and are safe to rerun.
- AC-13: Required screens provide loading, saving, validation, success, empty/no-results, forbidden, not-found, conflict, and safe failure feedback where applicable.
- AC-14: Major screens fit desktop, tablet, and mobile viewports with keyboard-visible focus and no horizontal page overflow.

## 10. Product Definition of Done

- [ ] This contract, API spec, UI spec, and test plan existed before final implementation integration.
- [ ] Schema migration is additive/backfills existing data; seed is idempotent and credentials are documented as local-only.
- [ ] Every protected endpoint has backend auth, role, and ownership checks with safe errors.
- [ ] Acceptance criteria map to passing unit/API/UI/E2E and responsive/accessibility evidence.
- [ ] Existing Lab 2 requester and attachment regression tests pass or are updated to authenticated equivalents.
- [ ] Client/server builds pass; no secrets, plaintext passwords, stored filenames, or storage paths are exposed.
- [ ] Evidence includes reviewer record, AI-use reflection, final-main test/build output, and one concise Answer Part 1-9 PDF.

## 11. Assumptions and decisions

Session cookies are selected because the existing browser application is same-site and the server can invalidate sessions immediately. SameSite=Lax, JSON state-changing endpoints, and an Origin check for browser mutations provide the Lab 3 CSRF baseline. Seed credentials are local development fixtures only and must be changed at first login.
