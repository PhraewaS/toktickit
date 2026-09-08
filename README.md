# TokTickIT

TokTickIT is an IT service desk application developed for CPE 334. Lab 3 replaces the Lab 2 Development Requester selector with real cookie-backed authentication and adds Requester, IT Staff, and Administrator workflows while preserving Lab 2 tickets and attachments.

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

- `npm --prefix server run prisma:deploy` — apply the committed Lab 1, Lab 2, and Lab 3 migrations without creating a new migration.
- `npm --prefix server run prisma:migrate` — create/apply a migration during intentional local schema development only.
- `npm --prefix server run prisma:seed` — idempotently seed reference data, 4 active Requesters plus 1 inactive Requester, 3 active IT Staff plus 1 inactive IT Staff, 1 active Administrator, realistic Tickets, Public Comments, and Internal Notes.

Do not use `prisma migrate reset` against a shared or evidence database. It is only appropriate for a disposable local development database.

## Lab 3 authentication and local credentials

The production client opens on Login and sends the HttpOnly `toktickit_session` cookie with API calls. Users with `mustChangePassword` are shown only the mandatory Change Password screen until they save a valid password. The shell displays the authenticated user and role; navigation and backend endpoints are role-restricted. Logout invalidates the server session.

Seed credentials are local-development fixtures only and must not be reused as real passwords:

- Requesters: `jennifer@example.test`, `kanya@example.test`, `narin@example.test`, or `preecha@example.test` with `Requester-Change1!`.
- IT Staff: `mali.staff@example.test`, `somchai.staff@example.test`, or `arisa.staff@example.test` with `Staff-Change1!`.
- Administrator: `admin@example.test` with `Admin-Change1!`.

Every seeded account requires a first-login password change. The migration gives pre-Lab 3 requester rows the local migration password `Lab3-ChangeMe1!` so their existing Ticket ownership remains usable; the seed updates named local fixtures without resetting a changed password.

## Lab 2 compatibility path

The client loads active requesters from `GET /api/development-requesters` and stores the selected requester ID in `sessionStorage`, so the selection lasts only for the current browser tab.

Requester-specific API calls must send:

```text
X-Development-Requester-Id: <positive integer>
```

This header is retained only for Lab 2 regression tests and migration tooling. It is not authentication. The Lab 3 client never renders the selector or sends the header; authenticated requester operations derive ownership from the session identity. The backend still validates the legacy context when that compatibility path is explicitly used.

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

The same requester and `submissionKey` replay the original Ticket with HTTP `200` instead of creating a duplicate. First creation returns HTTP `201`. After creation, permitted attachments can be uploaded and managed through the Attachment Lifecycle API described below.

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

## Lab 3 operations

The IT Staff Ticket Queue supports search, status/priority/ownership filters, sorting, pagination, assignment, IT Priority, permitted status transitions, Public Comments, and Internal Notes. Administrator User Management supports list/search/role filter, create, basic edit, activation/deactivation, and setting a new initial password. See [`docs/lab-03/specification.md`](docs/lab-03/specification.md), [`docs/lab-03/api-spec.md`](docs/lab-03/api-spec.md), and [`docs/lab-03/ui-spec.md`](docs/lab-03/ui-spec.md).

## Testing

Run tests and builds from the repository root:

```bash
npm --prefix server test
npm --prefix client test
npm --prefix server run build
npm --prefix client run build
```

Lab 3 API/component suites are included in the same commands under `server/tests/lab-03/` and `client/tests/lab-03/`. Run the database-backed migration and seed before E2E testing. The Lab 3 submission evidence must be assembled as one concise PDF with headings `Answer Part 1` through `Answer Part 9`.

Run the Lab 2 Responsive, Accessibility, E2E, and Visual Evidence suite after the local PostgreSQL service is available:

```bash
npm --prefix e2e ci
npm --prefix e2e exec playwright install chromium
npm --prefix e2e exec playwright test -- --config e2e/playwright.config.ts
```

The Playwright configuration starts the server and client dev processes, applies the committed migrations, and runs the idempotent seed during global setup. It writes HTML reports to `artifacts/lab-02/playwright-report/`, required-screen screenshots to `artifacts/lab-02/screenshots/{create-ticket,my-tickets,ticket-detail}/{desktop,tablet,mobile}.png`, and state evidence to `artifacts/lab-02/screenshots/states/{state}/{desktop,tablet,mobile}.png`.

Run the Lab 3 authentication, staff, administrator, and responsive flows with the Lab 3 configuration:

```bash
npm --prefix e2e exec playwright test -- --config e2e/playwright.lab3.config.ts
```

This writes the Lab 3 HTML report and responsive evidence under `artifacts/lab-03/`.

## Security

Do not commit `.env`, database credentials, tokens, or `node_modules`.
