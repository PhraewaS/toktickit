import request from "supertest";
import { TicketStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sessionFindUnique: vi.fn(), ticketFindUnique: vi.fn(), actionCount: vi.fn(), ticketUpdate: vi.fn() }));
vi.mock("../../src/prisma.js", () => ({ getPrisma: () => ({ session: { findUnique: mocks.sessionFindUnique }, ticket: { findUnique: mocks.ticketFindUnique, update: mocks.ticketUpdate }, actionTaken: { count: mocks.actionCount } }) }));
import { app } from "../../src/app.js";

function signIn(role: UserRole) {
  mocks.sessionFindUnique.mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000), user: { id: 2, name: "Mali Staff", email: "mali.staff@example.test", role, isActive: true, mustChangePassword: false } });
  return "toktickit_session=lab4-workflow-token";
}

describe("Lab 4 Ticket workflow API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires an Action Taken before staff can resolve a Ticket", async () => {
    const cookie = signIn(UserRole.IT_STAFF);
    mocks.ticketFindUnique.mockResolvedValue({ id: 42, currentStatus: TicketStatus.IN_PROGRESS });
    mocks.actionCount.mockResolvedValue(0);

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.RESOLVED });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("RESOLUTION_ACTION_REQUIRED");
    expect(mocks.ticketUpdate).not.toHaveBeenCalled();
  });
});
