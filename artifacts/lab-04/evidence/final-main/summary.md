# Released-main verification and final-evidence review candidate

## Source identity and workflow

[Final-evidence PR #66](https://github.com/PhraewaS/toktickit/pull/66) is open for guluJa's review into main. Its approval/merge is pending and is not supplied by the earlier release approval.

- Released and tested product: **`e1fa72f9fa1ad26ead74f82cf1de6bbf09de6384`**, actual `main` merge of [release PR #63](https://github.com/PhraewaS/toktickit/pull/63).
- Peer [guluJa APPROVED release head f95ba5c](https://github.com/PhraewaS/toktickit/pull/63#pullrequestreview-5519700187) at 2026-10-14 14:38:54 UTC, before release merge at 14:39:03 UTC (21:39:03 Asia/Bangkok).
- Evidence branch: `codex/lab4-final-verification-evidence`, created from that main SHA. No application code, schema, seed, dependencies or existing tests are changed. Supplemental visual harness is separately supplied as an evidence tool, not claimed to have existed in the tested main commit.
- All six phases ran sequentially on unchanged product HEAD: **2026-10-14 14:46:46-14:57:26 UTC**; exact timestamps/command exits are in the phase JSON. Later evidence-only commits do not replace the tested product SHA.
- These are actual local results, not GitHub CI. Historical staging/feature reports remain unchanged at their original paths; fresh main reports/captures are archived here.

## Actual results

| Gate | Observed result | Raw evidence |
| --- | --- | --- |
| Recovery command safety | 6 passed, 0 failed | [recovery-safety.txt](recovery-safety.txt) |
| Prepare | Prisma generation, deploy/seed and actual dedicated DB/port check passed; 5 migrations, none pending | [prepare-results.json](prepare-results.json), [migration-deploy.txt](migration-deploy.txt), [seed.txt](seed.txt) |
| Recovery | Matching PostgreSQL 15.19 pg_dump/psql; 9 table fingerprints plus 5 migration-history rows match; generated temporary database and SQL dump removed | [recovery-results.json](recovery-results.json), recovery-backup/create/restore/cleanup.txt |
| Server | 164/164 tests; production build passed | [server-tests.txt](server-tests.txt), [server-build.txt](server-build.txt), [server-results.json](server-results.json) |
| Client | 89/89 tests; production build passed | [client-tests.txt](client-tests.txt), [client-build.txt](client-build.txt), [client-results.json](client-results.json) |
| Lab 4 E2E | 21 total: 11 passed, 10 intentional viewport skips, 0 failed/flaky | [lab4-e2e.txt](lab4-e2e.txt), [lab4-results.json](lab4-results.json), [fresh report](lab4-playwright-report/index.html) |
| Lab 3 regression E2E | 42 total: 26 passed, 16 intentional viewport skips, 0 failed/flaky | [lab3-e2e.txt](lab3-e2e.txt), [lab3-results.json](lab3-results.json), [fresh report](lab3-playwright-report/index.html) |
| Performance smoke | 40 requests / 0 failures; 10 per endpoint; maxima Staff Dashboard 360, Requester Dashboard 14, Staff Actions 11, Requester Actions 8 ms, each <1,000 ms | PERF-04 in server-tests.txt; [validated-summary.json](validated-summary.json) |
| Selected metrics | Requester open/waiting/recent/resolved = 2/0/2/0; Staff unassigned/mine/my actions/urgent = 2/1/2/2; independent DB = API = UI for all 8 values | DASHBOARD-METRICS in lab4-e2e.txt and report attachments; validated-summary.json |
| Responsive keyboard/browser | 6 flows, three widths: Tab/Enter/Space/focus-visible, horizontal fit; 0 unexpected HTTP/page errors | BROWSER-SCAN and RESP-04 in lab4-e2e.txt; [12 captures](lab4-screenshots/) |
| Supplemental visual states | 72 captures at desktop 1440x1000, tablet 834x1112, mobile 390x844; full-page Dashboard/read-only/list, create/edit with Follow-Up Note, validation/forbidden/conflict/failed-refresh draft | [visual results/provenance](visual/results.json), [gallery](visual/), [reproducible harness](visual-harness.mjs) |
| Peer archive | Both repositories: 21 PRs, 111 original events; all 21 approved reviewed heads match their actual PR heads and approval predates merge; all 89 historical event IDs retained | [quotation validation](review-quotation-validation.json), [reviewer.md](../../../../docs/lab-04/reviewer.md), [snapshot](../../../../docs/lab-04/review-history-final-main.json) |

Fresh report ZIP contents were reopened: nonzero totals, errors empty, outcome counts unchanged after credential redaction; Lab 4 contains metric logs. Intentional tablet/mobile mutation skips are not passed executions; responsive suites run separately. Main snapshots and phase JSON are never relabelled from an earlier staging run.

## Reproduction and data safety

Run sequentially from the repository root at the product SHA above:

```powershell
node --test scripts/postgres-recovery.test.mjs
node scripts/verify-lab4.mjs prepare --env-file <existing-untracked-env-file> --output-dir artifacts/lab-04/evidence/final-main
node scripts/verify-lab4.mjs recovery --env-file <existing-untracked-env-file> --output-dir artifacts/lab-04/evidence/final-main
node scripts/verify-lab4.mjs server --env-file <existing-untracked-env-file> --output-dir artifacts/lab-04/evidence/final-main
node scripts/verify-lab4.mjs client --env-file <existing-untracked-env-file> --output-dir artifacts/lab-04/evidence/final-main
node scripts/verify-lab4.mjs lab4 --env-file <existing-untracked-env-file> --output-dir artifacts/lab-04/evidence/final-main
node scripts/verify-lab4.mjs lab3 --env-file <existing-untracked-env-file> --output-dir artifacts/lab-04/evidence/final-main
node artifacts/lab-04/evidence/final-main/visual-harness.mjs <existing-untracked-env-file>
```

The runner binds both connection variables to the same guarded dedicated database on localhost **5433**, generates seed passwords in memory and never seeds the normal application DB from the supplied URL. Supplemental harness likewise validates host/port, explicitly retargets `toktickit_lab4_e2e`, checks product SHA and refuses occupied application ports; it closes only its own servers. It reseeds only that dedicated test DB. Never include credentials, tokens or .env in screenshots/commits.

Live seed/API captures and controlled HTTP feedback fixtures are separately labelled in visual/results.json. The latter test released UI appearance/retention, not actual server permission/concurrency failures; those are independently covered by the actual API/component suites. The live validation capture receives a real 400 for whitespace Description and creates no invalid Action. Full-page images show below-fold content; element images keep forms/feedback legible.

## Review and submission gates

For a new clean checkout, the supplemental harness is a later evidence file, not in product e1fa72f: retain a copy in ignored `tmp/visual-harness.mjs` before selecting the tested product checkout, then run `node tmp/visual-harness.mjs <existing-untracked-env-file>` there after installing/building its locked dependencies. The main runner already exists at e1fa72f and is run there normally. The PDF generator runs from the evidence checkout using archived main receipts, with Python reportlab/Pillow/pypdf and Windows Tahoma fonts.

- [x] Actual released-main suites/builds/regression, migration/seed/recovery, metrics/performance and targeted keyboard evidence archived with source SHA.
- [x] Both directions of peer comments/responses/approvals refreshed without replacing historical snapshots or inventing quotations.
- [x] Fresh major-screen and error-state visual evidence prepared at all three widths; every capture passes horizontal-fit assertions.
- [ ] Human review/approval and merge of the final-evidence PR.
- [ ] Final accepted PDF/link/readability check, final evidence merge receipt and all-Done Project capture.
- [ ] Complete submission acceptance; only then Issue #54 closes / Project Done.

The concise PDF is a **peer-review candidate**, not proof that pending human/submission gates have already passed. Every Answer Part 1-9 is present; final accepted PDF may be updated with actual evidence approval/merge/Done receipts afterwards. Keep #54 open using non-closing body hyperlinks. Do not add an automatic-closing Development association.

## Explicit limitations

Targeted visual/semantic/keyboard verification is not full WCAG/axe certification or a measured contrast audit. Source inspections of Action ordering and append-only communication routes are labelled separately from automated assertions. Parent Ticket assignment/resolve/close/cancel is the approved handout interpretation; no unsupported Action assignee/status/delete is added. Nine-table DB restore includes an empty seeded attachment table and does not prove recovery of physical uploaded bytes; those need a separate storage backup. Dependency audit results remain dated 2026-10-08, not a fresh clean full audit: development-tool advisories are retained in integration.md. Historical #53 PDF and staging reports are not final-main or this final review PDF.
