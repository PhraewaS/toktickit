# Lab 4 AI Use and Reflection

## Model used

OpenAI Codex, GPT-5-based coding agent in the Codex desktop workspace.

## Selected key prompts

1. Continue TokTickIT from the final Lab 3 repository state and follow the attached Lab 4 handout strictly.
2. Design an additive PostgreSQL/Prisma ActionTaken model with parent-child Ticket ownership, audit fields, indexes, seed behavior, and stale-update handling.
3. Define exact Lab 4 API response shapes, validation, authorization, conflicts, and safe errors.
4. Implement backend-calculated Requester and IT Staff dashboards with concise metrics, empty behavior, and drill-down IDs.
5. Extend the existing Staff Ticket Detail and Requester Ticket Detail with role-appropriate Actions Taken UI while preserving Zen Green accessibility and responsive conventions.
6. Build a Test DD that maps each requirement to unit, API, UI, responsive, E2E, migration, and regression coverage.
7. Review the implementation for accidental Lab 3 regressions, unknown fields, client-controlled performer identity, and stale overwrites.
8. Verify build/test output, diff hygiene, migration behavior, and final evidence against the handout’s nine answer parts.
9. For Issue #53, prepare a separately guarded Lab 4 database workflow, migration/seed repeatability check, role-based E2E scenarios, responsive screenshots, and a bounded performance-smoke test; report only checks that actually ran.
10. Integrate Issue #54 using the established peer-review workflow, verify isolated backup/restore on port 5433, rerun actual suites, correct evidence and keep release/final-main/PDF gates pending until approved.

## My Reflection

The specification-agent work was useful for turning the handout’s examples into numbered requirements and making the ambiguous “recent” dashboard phrase testable as a 30-day server-side window. The coding-agent work was most valuable when it kept the Action Taken write authority in the backend, made the performer session-derived, and used an additive migration rather than rewriting Lab 2/3 data. I treated generated suggestions as proposals: I retained existing Lab 3 role boundaries for assignment/status/comments/notes, added only the explicitly approved Lab 4 Action Taken capability for Administrators, and used regression tests/builds as the final authority.
