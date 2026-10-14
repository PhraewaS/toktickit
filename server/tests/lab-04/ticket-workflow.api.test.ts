import request from "supertest";
import { TicketStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sessionFindUnique: vi.fn(), ticketFindUnique: vi.fn(), ticketFindFirst: vi.fn(), actionCount: vi.fn(), ticketUpdate: vi.fn(), ticketUpdateMany: vi.fn() }));
vi.mock("../../src/prisma.js", () => ({ getPrisma: () => ({ session: { findUnique: mocks.sessionFindUnique }, ticket: { findUnique: mocks.ticketFindUnique, findFirst: mocks.ticketFindFirst, update: mocks.ticketUpdate, updateMany: mocks.ticketUpdateMany }, actionTaken: { count: mocks.actionCount } }) }));
import { app } from "../../src/app.js";
import { allowedStaffStatusTransitions, isAllowedStaffStatusTransition } from "../../src/staff.js";

const now = new Date("2026-09-30T12:00:00.000Z");
const staffTicket = {
  id: 42,
  ticketNumber: "TKT-20260930-00000042",
  createdAt: now,
  requester: { id: 1, name: "Requester", email: "requester@example.test" },
  category: { id: 1, name: "Network" },
  relatedSystem: { id: 1, name: "VPN" },
  summary: "VPN access is unavailable",
  description: "VPN access is unavailable.",
  requestedPriority: "HIGH",
  itPriority: "HIGH",
  currentStatus: TicketStatus.RESOLVED,
  owner: null,
  requesterResolvedAt: null,
  updatedAt: now,
  attachments: [],
  publicComments: [],
  internalNotes: [],
};

function signIn(role: UserRole, id = role === UserRole.REQUESTER ? 1 : 2) {
  mocks.sessionFindUnique.mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000), user: { id, name: role, email: `${role.toLowerCase()}@example.test`, role, isActive: true, mustChangePassword: false } });
  return "toktickit_session=lab4-workflow-token";
}

describe("Lab 4 Ticket workflow API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserves the complete Lab 3 status-transition matrix", () => {
    expect(allowedStaffStatusTransitions).toEqual({
      NEW: [TicketStatus.OPEN],
      OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.CANCELLED],
      IN_PROGRESS: [TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
      WAITING_FOR_REQUESTER: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
      RESOLVED: [TicketStatus.CLOSED, TicketStatus.REOPENED],
      CLOSED: [TicketStatus.REOPENED],
      REOPENED: [],
      CANCELLED: [],
    });
    for (const current of Object.values(TicketStatus)) {
      for (const next of Object.values(TicketStatus)) {
        expect(isAllowedStaffStatusTransition(current, next)).toBe(allowedStaffStatusTransitions[current].includes(next));
      }
    }
  });

  it.each([TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER])("requires a persisted Action Taken before resolving from %s", async (currentStatus) => {
    const cookie = signIn(UserRole.IT_STAFF);
    mocks.ticketFindUnique.mockResolvedValue({ id: 42, currentStatus });
    mocks.actionCount.mockResolvedValue(0);

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.RESOLVED, expectedCurrentStatus: currentStatus });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatchObject({ code: "RESOLUTION_ACTION_REQUIRED", message: expect.any(String) });
    expect(mocks.actionCount).toHaveBeenCalledWith({ where: { ticketId: 42 } });
    expect(mocks.ticketUpdateMany).not.toHaveBeenCalled();
  });

  it("allows resolution after an Action Taken has been persisted", async () => {
    const cookie = signIn(UserRole.IT_STAFF);
    mocks.ticketFindUnique.mockResolvedValueOnce({ id: 42, currentStatus: TicketStatus.IN_PROGRESS }).mockResolvedValueOnce(staffTicket);
    mocks.actionCount.mockResolvedValue(1);
    mocks.ticketUpdateMany.mockResolvedValue({ count: 1 });

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.RESOLVED, expectedCurrentStatus: TicketStatus.IN_PROGRESS });

    expect(response.status).toBe(200);
    expect(response.body.data.currentStatus).toBe(TicketStatus.RESOLVED);
    expect(mocks.ticketUpdateMany).toHaveBeenCalledWith({ where: { id: 42, currentStatus: TicketStatus.IN_PROGRESS }, data: { currentStatus: TicketStatus.RESOLVED } });
    expect(mocks.ticketFindUnique).toHaveBeenLastCalledWith(expect.objectContaining({ where: { id: 42 }, include: expect.any(Object) }));
  });

  it("rejects a stale concurrent status update without overwriting the newer status", async () => {
    const cookie = signIn(UserRole.IT_STAFF);
    mocks.ticketFindUnique.mockResolvedValue({ id: 42, currentStatus: TicketStatus.OPEN });
    // Another Staff member changes OPEN to IN_PROGRESS after this request reads OPEN.
    mocks.ticketUpdateMany.mockResolvedValue({ count: 0 });

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.WAITING_FOR_REQUESTER, expectedCurrentStatus: TicketStatus.OPEN });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatchObject({ code: "STATUS_UPDATE_CONFLICT", message: expect.stringContaining("Refresh the Ticket") });
    expect(mocks.ticketUpdateMany).toHaveBeenCalledWith({ where: { id: 42, currentStatus: TicketStatus.OPEN }, data: { currentStatus: TicketStatus.WAITING_FOR_REQUESTER } });
    expect(mocks.ticketFindUnique).toHaveBeenCalledTimes(1);
  });

  it("rejects a status that became stale while the Ticket page was open", async () => {
    const cookie = signIn(UserRole.IT_STAFF);
    // The page loaded IN_PROGRESS, but another Staff member changed it before this request began.
    mocks.ticketFindUnique.mockResolvedValue({ id: 42, currentStatus: TicketStatus.WAITING_FOR_REQUESTER });

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.RESOLVED, expectedCurrentStatus: TicketStatus.IN_PROGRESS });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("STATUS_UPDATE_CONFLICT");
    expect(mocks.actionCount).not.toHaveBeenCalled();
    expect(mocks.ticketUpdateMany).not.toHaveBeenCalled();
  });

  it("requires the current status observed by the Client", async () => {
    const cookie = signIn(UserRole.IT_STAFF);

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.OPEN });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.fields).toHaveProperty("expectedCurrentStatus");
    expect(mocks.ticketFindUnique).not.toHaveBeenCalled();
  });

  it("rejects unlisted transitions before checking for Actions Taken", async () => {
    const cookie = signIn(UserRole.IT_STAFF);
    mocks.ticketFindUnique.mockResolvedValue({ id: 42, currentStatus: TicketStatus.IN_PROGRESS });

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.CLOSED, expectedCurrentStatus: TicketStatus.IN_PROGRESS });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("STATUS_TRANSITION_NOT_ALLOWED");
    expect(mocks.actionCount).not.toHaveBeenCalled();
    expect(mocks.ticketUpdateMany).not.toHaveBeenCalled();
  });

  it("keeps status changes IT Staff-only", async () => {
    const cookie = signIn(UserRole.ADMINISTRATOR, 3);

    const response = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: TicketStatus.OPEN, expectedCurrentStatus: TicketStatus.NEW });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("ROLE_FORBIDDEN");
    expect(mocks.ticketFindUnique).not.toHaveBeenCalled();
    expect(mocks.ticketUpdateMany).not.toHaveBeenCalled();
  });

  it("keeps the Requester resolution indication advisory", async () => {
    const cookie = signIn(UserRole.REQUESTER, 1);
    mocks.ticketFindFirst.mockResolvedValue({ id: 42, requesterResolvedAt: null, currentStatus: TicketStatus.IN_PROGRESS });
    mocks.ticketUpdate.mockResolvedValue({ id: 42, requesterResolvedAt: now, currentStatus: TicketStatus.IN_PROGRESS });

    const response = await request(app).post("/api/tickets/42/resolved").set("Cookie", cookie).send({});

    expect(response.status).toBe(200);
    expect(response.body.data.currentStatus).toBe(TicketStatus.IN_PROGRESS);
    expect(mocks.ticketUpdate).toHaveBeenCalledWith({ where: { id: 42 }, data: { requesterResolvedAt: expect.any(Date) }, select: { id: true, requesterResolvedAt: true, currentStatus: true } });
  });
});
