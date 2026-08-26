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

## Testing

Run tests and builds from the repository root:

```bash
npm --prefix server test
npm --prefix client test
npm --prefix server run build
npm --prefix client run build
```

## Security

Do not commit `.env`, database credentials, tokens, or `node_modules`.
