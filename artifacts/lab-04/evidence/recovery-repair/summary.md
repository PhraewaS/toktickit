# Recovery repair verification

## Identity and environment

- Branch: `codex/lab4-recovery-tools-54` -> `lab4-staging`, part of [Issue #54](https://github.com/PhraewaS/toktickit/issues/54).
- Exact tested tooling source: `10675917f46ceb58376c3db2eafe2b218cd1ec25`; base staging `b6185479a4f800d37b8251474d1ffb4c35c0b460`.
- Passing prepare/recovery runs: 2026-10-12 Asia/Bangkok (00:35–00:37), corresponding to 2026-10-11 17:35–17:37 UTC. The separate negative tool check ran at 00:38 Bangkok / 17:38 UTC, as its JSON records.
- Windows, Node 24.19.0; PostgreSQL 15, pg_dump/psql 15.19; dedicated `toktickit_lab4_e2e` on **5433**.
- Later commits attach documentation/evidence only. No product Server/Client/E2E source changed.

## Actual results

| Check | Result | Evidence |
| --- | --- | --- |
| Command safety | 6 passed, 0 failed/skipped | [recovery-unit-tests.txt](recovery-unit-tests.txt) |
| Prepare | Generate, five migrations/no pending migration, seed and actual database/port check passed | [prepare-results.json](prepare-results.json), generate/deploy/seed logs |
| Recovery | All four command exits 0; nine Prisma-table fingerprints/counts and five migration-history records match | [recovery-results.json](recovery-results.json), recovery-*.txt |
| Independent repeat | All four exits 0; same complete fingerprints match | [repeat/recovery-results.json](repeat/recovery-results.json), repeat logs |
| Cleanup | Both uniquely created recovery databases dropped and both SQL dumps removed | temporaryDatabaseRemoved/dumpRemoved in both JSON records |
| Expected missing-tool failure | Runner exit 1 as expected; failedAt/error persisted; completedAt absent | [expected-tool-failure/recovery-results.json](expected-tool-failure/recovery-results.json) |
| Syntax/diff | node --check and git diff --check passed | commands below |
| Windows security | VerifiedAndReputablePolicyState=1 after successful runs; no policy/exclusion/executable changes | local registry read during verification |

Only the two disposable recovery databases and dumps created by the runner were removed. The source E2E database remains intact; the normal application database was not seeded or dropped. Empty attachments/sessions verify empty-table recovery only. Physical attachment storage still requires a separate backup.

## Supported method, not a policy exemption

Windows Smart App Control still blocks unsigned createdb.exe/pg_restore.exe; matching pg_dump/psql execute normally. The fix changes the recovery procedure, **not Windows security**.

Use the [PostgreSQL-supported SQL dump procedure](https://www.postgresql.org/docs/15/backup-dump.html): pg_dump plain SQL; psql creates a unique template0 database; psql restores with --no-psqlrc, ON_ERROR_STOP=1 and --single-transaction; compare data/migration fingerprints; psql drops only the generated target. No blocked executable is copied, renamed, unblocked or launched through another environment.

No new dependency, manual seed password or port change is needed. Credentials stay in the existing untracked environment file; seed passwords are generated in memory. SQL dumps are never committed.

## Reproduce

```powershell
node --test scripts/postgres-recovery.test.mjs
node --check scripts/verify-lab4.mjs
node scripts/verify-lab4.mjs prepare --env-file <existing-local-env-file> --output-dir artifacts/lab-04/evidence/recovery-repair
node scripts/verify-lab4.mjs recovery --env-file <existing-local-env-file> --output-dir artifacts/lab-04/evidence/recovery-repair
node scripts/verify-lab4.mjs recovery --env-file <existing-local-env-file> --output-dir artifacts/lab-04/evidence/recovery-repair/repeat
git diff --check
```

Negative test intentionally selected a nonexistent --pg-bin, then asserted exit 1, failedAt/error and no completedAt. It is not an unexpected failing test or a claimed recovery pass. Full application suites/builds/E2E were not rerun for this tooling-only patch; previous results retain their original date/source in Issue #54.

## Workflow boundary

- [x] Separate repair branch, safety tests, real recovery twice and sanitized evidence.
- [ ] Human approval/merge of repair into staging.
- [ ] Repeat all six phases on that actual staging merge SHA before Ready release.
- [ ] Approved release into main, actual final-main verification, reviewed evidence/PDF and #54 Done.

These are tooling-branch results, not staging/final-main results. Original blocked staging and historical custom-format evidence are not overwritten.

