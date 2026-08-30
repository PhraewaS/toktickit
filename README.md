# TokTickIT

TokTickIT is an IT service desk application developed for CPE 334. Lab 2 adds the Requester Ticketing foundation: database models, deterministic seed data, active reference-data APIs, and a Development Requester context used before real authentication is introduced in Lab 3.

## Technology Stack

- React, TypeScript, Vite and Bootstrap
- Node.js, Express and TypeScript
- PostgreSQL and Prisma
- Vitest and Supertest

## Prerequisites

- Node.js
- npm
- PostgreSQL
- Playwright Chromium (for Responsive/E2E tests)

## Frontend Setup

Install and run the client from the repository root:

```bash
npm --prefix client ci
npm --prefix client run dev
```

## Backend Setup

Copy `server/.env.example` to `server/.env` and update `DATABASE_URL` with your PostgreSQL connection string.

Install the server, apply the committed migrations, seed the development data, and run the API:

```bash
npm --prefix server ci
npm --prefix server run prisma:deploy
npm --prefix server run prisma:seed
npm --prefix server run dev
```

The Prisma commands will:

- `npm --prefix server run prisma:deploy` — apply the committed Lab 1 and Lab 2 migrations without creating a new migration.
- `npm --prefix server run prisma:migrate` — create/apply a migration during intentional local schema development only.
- `npm --prefix server run prisma:seed` — idempotently seed 4 categories, 6 related systems, 4 active requesters, and 1 inactive requester.

Do not use `prisma migrate reset` against a shared or evidence database. It is only appropriate for a disposable local development database.

## Lab 2 Requester Context

The client loads active requesters from `GET /api/development-requesters` and stores the selected requester ID in `sessionStorage`, so the selection lasts only for the current browser tab.

Requester-specific API calls must send:

```text
X-Development-Requester-Id: <positive integer>
```

This header is a Lab 2 testing mechanism, not authentication. The backend must still validate that the requester exists and is active before any requester-specific operation.

Active reference data is available from:

- `GET /api/categories`
- `GET /api/related-systems`

## Lab 2 Ticket Creation

After selecting a Development Requester, the client opens the responsive Create Ticket screen and loads active Categories and Related Systems from the API. Editable fields are Category, Related System, Requested Priority, Ticket Summary, and Description. Ticket Number, Ticket Date, Requester, and Current Status are read-only.

Create a Ticket with:

```text
POST /api/tickets
X-Development-Requester-Id: <positive integer>
Content-Type: application/json
```

The JSON body requires `submissionKey` (UUID), `categoryId`, `relatedSystemId`, `summary` (5–150 trimmed characters), `requestedPriority` (`LOW`, `MEDIUM`, or `HIGH`), and `description` (10–5000 trimmed characters). The backend owns `requesterId`, generates `TKT-YYYYMMDD-XXXXXXXX`, forces status `NEW`, and returns `ticketDate` as an alias of `createdAt`.

The same requester and `submissionKey` replay the original Ticket with HTTP `200` instead of creating a duplicate. First creation returns HTTP `201`. Attachment upload is intentionally deferred to the dedicated Attachment Lifecycle feature.

## Lab 2 My Tickets

After selecting a Development Requester, the `My Tickets` screen loads only tickets owned by that requester through:

```text
GET /api/tickets
X-Development-Requester-Id: <positive integer>
```

The endpoint supports case-insensitive `search` in Ticket Number/Summary, Category and Related System filters, Requested Priority and Current Status filters, stable sorting, and page sizes 10, 20, or 50. Responses include `totalOwnedItems`, `totalItems`, `page`, `pageSize`, and `totalPages` so the client can distinguish an empty requester from a filtered no-results state without a second unfiltered request.

## Lab 2 Ticket Detail and Attachments

The read-only detail view and attachment lifecycle are ownership checked with the same requester header:

- GET /api/tickets/:ticketId
- GET /api/tickets/:ticketId/attachments
- POST /api/tickets/:ticketId/attachments (multipart field: files)
- GET /api/attachments/:attachmentId/download
- DELETE /api/attachments/:attachmentId (JSON body with a reason)

Uploads accept JPG/JPEG, PNG, WEBP, and PDF files up to 5 MiB each, with at most five active attachments per Ticket. Original basenames are stored as metadata while backend UUID filenames are kept in the local server/storage/attachments directory, which is ignored by Git. Removed attachments keep their metadata and removal reason but cannot be downloaded.

## Testing

Run tests and builds from the repository root:

```bash
npm --prefix server test
npm --prefix client test
npm --prefix server run build
npm --prefix client run build
```

Run the Lab 2 Responsive, Accessibility, E2E, and Visual Evidence suite after the local PostgreSQL service is available:

```bash
npm --prefix e2e ci
npm --prefix e2e exec playwright install chromium
npm --prefix e2e exec playwright test -- --config e2e/playwright.config.ts
```

The Playwright configuration starts the server and client dev processes, applies the committed migrations, and runs the idempotent seed during global setup. It writes HTML reports to `artifacts/lab-02/playwright-report/` and viewport screenshots to `artifacts/lab-02/screenshots/{create-ticket,my-tickets,ticket-detail}/{desktop,tablet,mobile}.png`.

## Security

Do not commit `.env`, database credentials, tokens, or `node_modules`.
