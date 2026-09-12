import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/auth.js";
import { runSeed } from "../../prisma/seed.js";

describe("Lab 2 to Lab 3 migration contract", () => {
  it("uses a salted hash for migrated initial credentials", () => {
    const migrated = hashPassword("Lab3-ChangeMe1!", "lab3-migration-salt");
    expect(migrated).toMatch(/^scrypt\$lab3-migration-salt\$[0-9a-f]{64}$/);
  });
});

describe.skipIf(!process.env.DATABASE_URL || !process.env.LAB3_SEED_PASSWORD)("PostgreSQL migration and seed regression", () => {
  it("preserves Lab 2 identity and resource foreign-key relationships", async () => {
    const prisma = getPrisma();
    const result = await prisma.$queryRaw<Array<{ requesters: bigint; tickets: bigint; attachments: bigint; brokenRequesterRefs: bigint; brokenAttachmentRefs: bigint }>>(Prisma.sql`
      SELECT
        (SELECT count(*) FROM requester_users) AS requesters,
        (SELECT count(*) FROM tickets) AS tickets,
        (SELECT count(*) FROM attachments) AS attachments,
        (SELECT count(*) FROM tickets t LEFT JOIN requester_users u ON u.id = t."requesterId" WHERE u.id IS NULL) AS "brokenRequesterRefs",
        (SELECT count(*) FROM attachments a LEFT JOIN tickets t ON t.id = a."ticketId" WHERE t.id IS NULL) AS "brokenAttachmentRefs"
    `);
    expect(Number(result[0].requesters)).toBeGreaterThan(0);
    expect(Number(result[0].tickets)).toBeGreaterThan(0);
    expect(Number(result[0].attachments)).toBeGreaterThanOrEqual(0);
    expect(Number(result[0].brokenRequesterRefs)).toBe(0);
    expect(Number(result[0].brokenAttachmentRefs)).toBe(0);
  });

  it("keeps the deterministic seed idempotent on PostgreSQL", async () => {
    const prisma = getPrisma();
    await runSeed();
    const afterFirst = await Promise.all([
      prisma.requesterUser.count(),
      prisma.ticket.count(),
      prisma.publicComment.count(),
      prisma.internalNote.count(),
    ]);
    await runSeed();
    const afterSecond = await Promise.all([
      prisma.requesterUser.count(),
      prisma.ticket.count(),
      prisma.publicComment.count(),
      prisma.internalNote.count(),
    ]);
    expect(afterSecond).toEqual(afterFirst);
  });
});
