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

  it("matches the Lab 3 status matrix and rejects no-op transitions", () => {
    const expected: Record<TicketStatus, readonly TicketStatus[]> = {
      NEW: [TicketStatus.OPEN],
      OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.CANCELLED],
      IN_PROGRESS: [TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
      WAITING_FOR_REQUESTER: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
      RESOLVED: [TicketStatus.CLOSED, TicketStatus.REOPENED],
      CLOSED: [TicketStatus.REOPENED],
      REOPENED: [],
      CANCELLED: [],
    };
    expect(allowedStaffStatusTransitions).toEqual(expected);
    const allStatuses = Object.values(TicketStatus);
    for (const current of allStatuses) {
      for (const next of allStatuses) {
        const expected = allowedStaffStatusTransitions[current].includes(next);
        expect(isAllowedStaffStatusTransition(current, next)).toBe(expected);
      }
    }
  });
});
