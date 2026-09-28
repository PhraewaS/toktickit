# Lab 4 Reviewer Record

## Review scope and current workflow state

This record is maintained across the Lab 4 feature branches. At the contract-review stage, reviewers check that the scope and testable contracts match the Lab 4 handout. Implementation, database execution, responsive evidence, E2E evidence, and final PDF approval are later gates; they are not claimed by PR #55.

| Work item | Branch / target | State | Review purpose |
| --- | --- | --- | --- |
| Issue [#48](https://github.com/PhraewaS/toktickit/issues/48) | Contract definition | Open | Traceability and review plan |
| PR [#55](https://github.com/PhraewaS/toktickit/pull/55) | `feature/lab4-spec-contract` → `lab4-staging` | Open; reviewer requested `@guluJa` | Contract-only review |
| [#49](https://github.com/PhraewaS/toktickit/issues/49), [#50](https://github.com/PhraewaS/toktickit/issues/50), [#51](https://github.com/PhraewaS/toktickit/issues/51), [#52](https://github.com/PhraewaS/toktickit/issues/52), [#53](https://github.com/PhraewaS/toktickit/issues/53) | One feature branch per issue | Created; PRs sequenced after #55 | Implementation and verification |
| Issue [#54](https://github.com/PhraewaS/toktickit/issues/54) | `lab4-staging` → `main` and final evidence | Planned | Integration, peer review, and submission |

The staging target is deliberate: each feature PR must be reviewed and merged in dependency order before the release PR targets `main`.

## Contract PR #55 checklist

- [ ] Included scope covers Actions Taken, resolution enforcement, dashboards, API/UI contracts, tests, evidence, and required documents.
- [ ] Excluded scope prevents SLA, escalation, notifications, inventory/purchasing, payroll, BI, multi-tenancy, and unrelated features.
- [ ] Action fields, performer derivation, Requester read-only access, Staff/Admin mutation, follow-up validation, ordering, and stale-write conflict are testable.
- [ ] All Lab 4 statuses, the complete permitted transition matrix, and the `RESOLVED` Action Taken prerequisite are explicit; the Requester resolved indication remains advisory.
- [ ] Requester and Staff/Admin dashboard metric formulas, UTC/date boundaries, response shapes, ownership boundaries, drill-downs, empty states, and authoritative backend calculation are explicit.
- [ ] API success/error envelopes include documented response fields, status codes, authorization failures, validation failures, conflict codes, and safe unexpected failures.
- [ ] Migration, seed, API error, session/origin, responsive, accessibility, regression, E2E, screenshot, and console/diff evidence requirements are explicit.
- [ ] Required test paths, performance-smoke coverage, and required `docs/lab-04/*` deliverables match the handout.
- [ ] Dashboard UI feedback distinguishes loading, success, empty, failure, forbidden, and retry/refresh states.
- [ ] The PR contains documentation only; implementation and final test status are not represented as complete here.

## Final implementation and evidence checklist

- [ ] Additive migration preserves Lab 1–3 data and has Ticket/performer foreign keys and indexes.
- [ ] Seed is repeatable and demonstrates zero, one, and multiple Actions Taken.
- [ ] Backend derives `performedBy`, validates conditional follow-up fields, protects ownership, and returns safe errors.
- [ ] Stale action edits return a conflict without overwriting a newer row.
- [ ] Formal resolution requires an Action Taken; Requester indication remains advisory.
- [ ] Dashboard metrics match documented queries and drill-down IDs.
- [ ] UI supports loading, empty, error, forbidden, validation, conflict, responsive, and accessible states.
- [ ] Lab 1–3 regression suites, final database-backed evidence, and the required Answer Part 1–9 PDF are attached before release.

## Review comments and responses

### `@guluJa` — PR #55 review, 2026-09-27 — Changes requested

Feedback requested four Labsheet-aligned contract clarifications: complete Status Transition Matrix; explicit Dashboard calculations and API response/error shapes; a performance-smoke test with Labsheet-matching test paths; and separate Dashboard loading, empty, failure, forbidden, and retry feedback states.

Response in this revision:

- Added the complete transition matrix to `specification.md` and repeated the API-enforced matrix in `api-spec.md`.
- Added exact Requester and Staff/Admin dashboard formulas, UTC 30-day boundary, list limits/order, drill-down fields, success envelopes, and error envelopes.
- Added `PERF-04` and `server/tests/lab-04/performance-smoke.test.ts`, corrected required server/client/E2E paths, and clearly marked all results as planned for later feature branches.
- Added the Dashboard feedback-state contract to `ui-spec.md`.

The implementation and performance results remain intentionally open because PR #55 is documentation-only. Do not mark the final checklist complete until the corresponding feature PRs and evidence are attached.
