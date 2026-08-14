# TokTickIT

TokTickIT is an IT service desk application developed for CPE 334 Lab 1.

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

Run the following commands:

```bash
cd client
npm install
npm run dev
```

## Backend Setup

Copy `server/.env.example` to `server/.env` and update `DATABASE_URL` with your PostgreSQL connection string.

Then run:

```bash
cd server
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The Prisma commands will:

- `npm run prisma:migrate` — apply the database migrations and create/update the required database tables.
- `npm run prisma:seed` — populate the database with the initial seed data.

## Testing

Run the tests inside both the `client` and `server` directories:

```bash
npm test
```

## Security

Do not commit `.env`, database credentials, tokens, or `node_modules`.