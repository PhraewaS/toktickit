# TokTickIT Lab 3 REST API Contract

Base URL: `/api`. JSON success is `{ "data": ... }`; errors are `{ "error": { "code", "message", "fields"? } }`. Dates are ISO 8601 UTC. The server never returns password hashes, session tokens, stored filenames, filesystem paths, SQL, or stack traces.

## Authentication

`POST /auth/login` body `{email,password}`. `200` returns `{data:{user:{id,name,email,role,isActive,mustChangePassword}}}` and sets an HttpOnly `toktickit_session` cookie. Invalid credentials and inactive users return `401 AUTHENTICATION_FAILED` without revealing which condition occurred.

`GET /auth/me` returns the current safe user. `POST /auth/logout` invalidates the current session and clears the cookie. `POST /auth/change-password` body `{newPassword,confirmPassword}` is available to an authenticated user with an initial password and returns the updated safe user. Passwords are 12-128 characters and must contain upper, lower, number, and symbol characters.

## Requester routes

The Lab 2 routes remain: `GET /development-requesters` is retained only for migration/regression tooling and is not used by the Lab 3 client. Authenticated Requesters use `POST /tickets`, `GET /tickets`, `GET /tickets/:ticketId`, attachment list/upload/download/remove routes, without a requester header. The server derives `requesterId` from the session. Existing response shapes and safe 404 ownership behavior remain.

`GET /tickets/:ticketId/comments` and `POST /tickets/:ticketId/comments` expose/create Public Comments for an owned Requester ticket. Body: `{content}`. `POST /tickets/:ticketId/resolved` marks the Requester's problem indication and leaves formal status unchanged.

## IT Staff routes

`GET /staff/tickets` accepts `search` (ticket number or summary), `status`, `requestedPriority`, `itPriority`, `ownerId`, `sortBy` (`ticketNumber|summary|createdAt|updatedAt|itPriority|currentStatus`), `sortOrder` (`asc|desc`), `page` (default 1), and `pageSize` (10, 20, 50). Response pagination contains `page,pageSize,totalItems,totalPages`. `GET /staff/tickets/:ticketId` returns ticket detail, attachments, public comments, internal notes, owner, and `requesterResolvedAt`.

`POST /staff/tickets/:ticketId/assignment` body `{ownerId:number|null}` claims, assigns, or unassigns a ticket. The owner must be an active IT Staff or Administrator. `PATCH /staff/tickets/:ticketId/priority` body `{itPriority}`. `PATCH /staff/tickets/:ticketId/status` body `{status}` and enforces the transition matrix. `GET/POST /staff/tickets/:ticketId/comments` uses `{content}` for Public Comments. `GET/POST /staff/tickets/:ticketId/notes` uses `{content}` for Internal Notes.

## Administrator routes

`GET /admin/users` accepts optional `search` and `role` and returns safe user rows. `POST /admin/users` body `{name,email,role,isActive,initialPassword}`. `PATCH /admin/users/:userId` body may contain `name,email,role,isActive`. `POST /admin/users/:userId/initial-password` body `{initialPassword}` resets the password and sets `mustChangePassword=true`. Duplicate email, invalid role, self-deactivation, last-active-Administrator removal, and invalid state changes return `409` or `400` with safe field details.

## Status codes and security

`200` retrieve/update, `201` create, `400` invalid input, `401` unauthenticated or authentication failure, `403` authenticated but forbidden, `404` missing or protected-other-owner resources, `409` conflicts, and `500` safe unexpected failure. State-changing browser requests require same-site origin when an Origin header is present. Internal Notes are never selected for Requester responses.
