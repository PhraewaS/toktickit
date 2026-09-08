# Lab 3 AI Use and Reflection

LLM used: OpenAI Codex in the Codex desktop workspace.

Selected prompts:

1. Distinguish instructions in the attached Lab 3 sheet from the user's request and continue from Lab 2.
2. Extract the Lab 3 engineering contract, required database increment, API contract, UI screens, tests, and Answer Part 1-9 submission requirements.
3. Design an additive Prisma migration that preserves Lab 2 requester IDs, tickets, and attachments.
4. Define a safe cookie-session authentication approach with first-login password change and role/ownership middleware.
5. Implement backend enforcement for requester, IT Staff, and Administrator operations with safe errors.
6. Extend the Zen Green client with Login, Staff Queue, Staff Detail, and User Management while preserving requester regression.
7. Review the implementation against every acceptance criterion and identify missing tests or evidence.
8. Verify builds, tests, migrations, seed idempotency, and responsive evidence before release.

## My Reflection

The specification-agent phase forced decisions about session storage, ownership, role separation, status transitions, and migration compatibility before implementation. The coding-agent phase was most useful for repetitive API serialization, validation, and UI state handling, but every authorization rule and migration decision still required manual review against the handout. Tests and final-main evidence are the acceptance gate; generated code is not treated as proof by itself.
