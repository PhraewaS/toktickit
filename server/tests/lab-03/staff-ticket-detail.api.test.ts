import request from "supertest";
import { TicketStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { allowedStaffStatusTransitions, isAllowedStaffStatusTransition } from "../../src/staff.js";

describe("IT Staff Ticket Detail API", () => {
  it("protects assignment, priority, and status operations", async () => {
    const response = await request(app).patch("/api/staff/tickets/42/status").send({ status: "RESOLVED" });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("accepts exactly every transition in the Lab 3 status matrix", () => {
    for (const [current, allowed] of Object.entries(allowedStaffStatusTransitions) as [TicketStatus, readonly TicketStatus[]][]) {
      for (const next of allowed) {
        expect(isAllowedStaffStatusTransition(current, next)).toBe(true);
      }
    }
  });

  it("rejects no-op and every transition outside the Lab 3 status matrix", () => {
    const allStatuses = Object.values(TicketStatus);
    for (const current of allStatuses) {
      for (const next of allStatuses) {
        const expected = allowedStaffStatusTransitions[current].includes(next);
        expect(isAllowedStaffStatusTransition(current, next)).toBe(expected);
      }
    }
  });
});
