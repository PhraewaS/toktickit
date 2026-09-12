# Lab 3 Verification Evidence

Revision: `d56b069`

All commands below were executed locally with PostgreSQL at `127.0.0.1:5433`. The seed password was supplied through the environment only and is intentionally not recorded here.

## Migration and seed

```text
Command: npm run prisma:deploy (from server/)
Result: passed; 3 migrations found; no pending migrations to apply.

Command: npm run prisma:seed (from server/)
Result: passed.
Seeded 4 categories, 6 related systems, 5 requesters, 3 active IT Staff, and one Administrator.
```

## Server verification

```text
Command: npm test -- --run (from server/)
Test Files  22 passed (22)
Tests       104 passed (104)

Command: npm run build (from server/)
Result: passed.
```

## Client verification

```text
Command: npm test -- --run (from client/)
Test Files  16 passed (16)
Tests       65 passed (65)

Command: npm run build (from client/)
Result: passed.
```

## Playwright verification

```text
Command: npm exec --prefix e2e playwright test -- --config e2e/playwright.lab3.config.ts
Result: exit code 0
Passed: 6
Skipped: 6
Failed: 0
```

The six skipped tests are intentional. Authentication, staff, and administrator mutation flows modify the seeded first-login fixture and are limited to the desktop project. Responsive coverage runs in desktop, tablet, and mobile projects, and all three responsive tests passed.

## Evidence files

- [Playwright report](./playwright-report.html)
- [Login screenshot - desktop](./screenshots/login-desktop.png)
- [Login screenshot - tablet](./screenshots/login-tablet.png)
- [Login screenshot - mobile](./screenshots/login-mobile.png)
