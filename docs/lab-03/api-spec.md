# TokTickIT Lab 3 REST API Contract

Base URL: `/api`. JSON success is `{ "data": ... }`; errors are `{ "error": { "code", "message", "fields"? } }`. Dates are ISO 8601 UTC. The server never returns password hashes, session tokens, stored filenames, filesystem paths, SQL, or stack traces.

## Authentication

`POST /auth/login` body `{email,password}`. `200` returns `{data:{user:{id,name,email,role,isActive,mustChangePassword}}}` and sets an HttpOnly `toktickit_session` cookie. Invalid credentials and inactive users return `401 AUTHENTICATION_FAILED` without revealing which condition occurred.

`GET /auth/me` returns `200 {data:{user}}` for a valid session, `401 AUTHENTICATION_REQUIRED` when no cookie is present, and `401 SESSION_INVALID` when the cookie is expired or unknown. `POST /auth/logout` returns `200 {data:{loggedOut:true}}`, invalidates the current session, and clears the cookie; it returns `401 AUTHENTICATION_REQUIRED` when no session exists. `POST /auth/change-password` body `{newPassword,confirmPassword}` returns `200 {data:{user}}` for an authenticated initial-password user. It returns `400 VALIDATION_ERROR` with field details for missing, mismatched, or weak passwords, and `401` for a missing/invalid session. Passwords are 12-128 characters and must contain upper, lower, number, and symbol characters.

## Requester routes

The Lab 2 routes remain: `GET /development-requesters` is retired from production and returns `410 {error:{code:"DEVELOPMENT_REQUESTERS_RETIRED",message}}` unless `LAB2_COMPATIBILITY_MODE=true` is explicitly enabled for regression/migration tooling. It is not an authenticated identity source and is never called by the Lab 3 client. Authenticated Requesters use `POST /tickets`, `GET /tickets`, `GET /tickets/:ticketId`, attachment list/upload/download/remove routes, without a requester header. The server derives `requesterId` from the session. Existing response shapes and safe 404 ownership behavior remain; protected Requester routes return `401 AUTHENTICATION_REQUIRED`/`401 SESSION_INVALID` before ownership checks.

`GET /tickets/:ticketId/comments` and `POST /tickets/:ticketId/comments` expose/create Public Comments for an owned Requester ticket. Body: `{content}`. `POST /tickets/:ticketId/resolved` marks the Requester's problem indication and leaves formal status unchanged.

## IT Staff routes

`GET /staff/tickets` accepts `search` (ticket number or summary), `status`, `requestedPriority`, `itPriority`, `ownerId`, `sortBy` (`ticketNumber|summary|createdAt|updatedAt|itPriority|currentStatus`), `sortOrder` (`asc|desc`), `page` (default 1), and `pageSize` (10, 20, 50). IT Staff and Administrators receive `200 {data:{items:[...],pagination:{page,pageSize,totalItems,totalPages}}}`. Invalid filters/page values return `400 VALIDATION_ERROR`; missing/invalid session returns `401 AUTHENTICATION_REQUIRED`/`401 SESSION_INVALID`; other authenticated roles return `403 ROLE_FORBIDDEN`; unexpected read failures return `500 STAFF_QUEUE_UNAVAILABLE`.

`GET /staff/tickets/:ticketId` returns `200 {data:{ticket,attachments,publicComments,internalNotes,owner,requesterResolvedAt}}` to IT Staff and Administrators. A missing ticket returns `404 TICKET_NOT_FOUND`; Requester or other non-staff roles receive `403 ROLE_FORBIDDEN`; missing/invalid session returns `401`. Internal notes are included only for these staff-visible roles. Read failures return `500 STAFF_TICKET_UNAVAILABLE`.

`POST /staff/tickets/:ticketId/assignment` body `{ownerId:number|null}` claims, assigns, or unassigns a ticket and returns `200 {data:{ticket}}`. `ownerId` must be null or an active IT Staff user; malformed IDs return `400 VALIDATION_ERROR`, inactive/non-IT owners return `400 INVALID_OWNER`, and a missing ticket returns `404 TICKET_NOT_FOUND`. Missing/invalid session is `401`; Administrator and other non-IT roles receive `403 ROLE_FORBIDDEN`; persistence failures return `500 STAFF_ASSIGNMENT_UNAVAILABLE`.

`PATCH /staff/tickets/:ticketId/priority` body `{itPriority}` returns `200 {data:{ticket}}`. Unsupported/missing priority returns `400 VALIDATION_ERROR`; missing ticket `404 TICKET_NOT_FOUND`; non-IT Staff `403 ROLE_FORBIDDEN`; missing/invalid session `401`; persistence failure `500 STAFF_PRIORITY_UNAVAILABLE`.

`PATCH /staff/tickets/:ticketId/status` body `{status}` returns `200 {data:{ticket}}` only for an allowed transition. Unknown status returns `400 VALIDATION_ERROR`; a transition outside BR-10 returns `409 STATUS_TRANSITION_NOT_ALLOWED`; missing ticket is `404 TICKET_NOT_FOUND`; non-IT Staff is `403 ROLE_FORBIDDEN`; missing/invalid session is `401`; persistence failure is `500 STAFF_STATUS_UNAVAILABLE`.

`GET /staff/tickets/:ticketId/comments` returns `200 {data:[comment...]}` and is available to IT Staff and Administrators with ticket visibility. `POST /staff/tickets/:ticketId/comments` body `{content}` returns `201 {data:{comment}}` for IT Staff only. Empty, whitespace-only, or over-limit content returns `400 VALIDATION_ERROR`; missing ticket is `404 TICKET_NOT_FOUND`; Administrator POST is `403 ROLE_FORBIDDEN`; missing/invalid session is `401`; persistence failure is `500 COMMENT_UNAVAILABLE`.

`GET /staff/tickets/:ticketId/notes` returns `200 {data:[note...]}` to IT Staff and Administrators. `POST /staff/tickets/:ticketId/notes` body `{content}` returns `201 {data:{note}}` to IT Staff only. The same content validation returns `400 VALIDATION_ERROR`; missing ticket is `404 TICKET_NOT_FOUND`; Administrator POST is `403 ROLE_FORBIDDEN`; missing/invalid session is `401`; persistence failure is `500 NOTE_UNAVAILABLE`. Notes are append-only.

## Administrator routes

`GET /admin/users` accepts optional `search` and `role` and returns `200 {data:[user...]}`. Invalid role/query values return `400 VALIDATION_ERROR`; missing/invalid session returns `401`; non-Administrator roles return `403 ROLE_FORBIDDEN`; read failure returns `500 USER_LIST_UNAVAILABLE`.

`POST /admin/users` body `{name,email,role,isActive,initialPassword}` returns `201 {data:{user}}` and never returns a password or hash. Missing/invalid fields return `400 VALIDATION_ERROR` with safe `fields`; case-insensitive duplicate email returns `409 EMAIL_ALREADY_EXISTS`; non-Administrator is `403 ROLE_FORBIDDEN`; persistence failure is `500 USER_CREATE_UNAVAILABLE`.

`PATCH /admin/users/:userId` body may contain `name,email,role,isActive` and returns `200 {data:{user}}`. Invalid fields return `400 VALIDATION_ERROR`; missing user `404 USER_NOT_FOUND`; duplicate email `409 EMAIL_ALREADY_EXISTS`; self-deactivation or removal of the last active Administrator `409 ADMIN_SAFETY_CONFLICT`; non-Administrator is `403 ROLE_FORBIDDEN`; persistence failure is `500 USER_UPDATE_UNAVAILABLE`.

`POST /admin/users/:userId/initial-password` body `{initialPassword}` returns `200 {data:{user}}`, invalidates the target's sessions, and sets `mustChangePassword=true`. Invalid password `400 VALIDATION_ERROR`; missing user `404 USER_NOT_FOUND`; non-Administrator `403 ROLE_FORBIDDEN`; persistence failure `500 USER_PASSWORD_RESET_UNAVAILABLE`.

## Status codes and security

`200` retrieve/update, `201` create, `400` invalid input, `401` unauthenticated or authentication failure, `403` authenticated but forbidden, `404` missing or protected-other-owner resources, `409` conflicts, `410` retired compatibility endpoint, and `500` safe unexpected failure. State-changing browser requests require same-site origin when an Origin header is present. Internal Notes are never selected for Requester responses.
