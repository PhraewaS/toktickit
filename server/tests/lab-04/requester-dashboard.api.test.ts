import request from "supertest";
import { TicketStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sessionFindUnique: vi.fn(), ticketCount: vi.fn(), ticketFindMany: vi.fn() }));
vi.mock("../../src/prisma.js", () => ({ getPrisma: () => ({ session: { findUnique: mocks.sessionFindUnique }, ticket: { count: mocks.ticketCount, findMany: mocks.ticketFindMany } }) }));
import { app } from "../../src/app.js";

const now = new Date("2026-09-30T12:00:00.000Z");
const cutoff = new Date("2026-08-31T12:00:00.000Z");
const requesterTicket = {
  id: 42,
  ticketNumber: "TKT-20260930-00000042",
  summary: "VPN access is unavailable",
  currentStatus: TicketStatus.OPEN,
  updatedAt: now,
};

function signIn(role: UserRole, id = 1) {
  mocks.sessionFindUnique.mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000), user: { id, name: role, email: `${role.toLowerCase()}@example.test`, role, isActive: true, mustChangePassword: false } });
  return "toktickit_session=requester-dashboard-token";
}

describe("Lab 4 Requester Dashboard API", () => {
  beforeEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

  it("returns owned metrics as total counts and bounded recent Ticket summaries using one UTC cutoff", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const cookie = signIn(UserRole.REQUESTER, 7);
    mocks.ticketCount.mockResolvedValueOnce(8).mockResolvedValueOnce(3).mockResolvedValueOnce(18).mockResolvedValueOnce(6);
    mocks.ticketFindMany.mockResolvedValueOnce(Array.from({ length: 10 }, (_, index) => ({ ...requesterTicket, id: index + 1 }))).mockResolvedValueOnce([requesterTicket]);

    const response = await request(app).get("/api/dashboard/requester").set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.data.metrics).toEqual({ openTickets: 8, waitingForRequester: 3, recentlyUpdated: 18, recentlyResolved: 6 });
    expect(response.body.data.recentlyUpdated).toHaveLength(10);
    expect(response.body.data.recentlyUpdated[0]).toEqual({ ...requesterTicket, id: 1, updatedAt: now.toISOString() });
    expect(response.body.data.recentlyResolved).toHaveLength(1);
    expect(mocks.ticketCount).toHaveBeenCalledTimes(4);
    expect(mocks.ticketFindMany).toHaveBeenCalledTimes(2);
    for (const call of [...mocks.ticketCount.mock.calls, ...mocks.ticketFindMany.mock.calls]) {
      expect(call[0].where.requesterId).toBe(7);
    }
    expect(mocks.ticketCount.mock.calls[2][0].where.updatedAt).toEqual({ gte: cutoff });
    expect(mocks.ticketCount.mock.calls[3][0].where).toMatchObject({ requesterId: 7, currentStatus: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }, updatedAt: { gte: cutoff } });
    expect(mocks.ticketFindMany.mock.calls[0][0]).toMatchObject({ take: 10, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], where: { requesterId: 7, updatedAt: { gte: cutoff } } });
    expect(mocks.ticketFindMany.mock.calls[1][0]).toMatchObject({ take: 10, where: { requesterId: 7, currentStatus: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }, updatedAt: { gte: cutoff } } });
  });

  it("returns a safe error envelope when an authoritative query fails", async () => {
    const cookie = signIn(UserRole.REQUESTER, 7);
    mocks.ticketCount.mockRejectedValue(new Error("private SQL detail"));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await request(app).get("/api/dashboard/requester").set("Cookie", cookie);

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({ code: "INTERNAL_ERROR", message: "TokTickIT could not load the Requester dashboard. Please try again." });
    expect(JSON.stringify(response.body)).not.toContain("private SQL detail");
    log.mockRestore();
  });

  it("rejects non-Requester access before querying dashboard data", async () => {
    const cookie = signIn(UserRole.IT_STAFF, 2);

    const response = await request(app).get("/api/dashboard/requester").set("Cookie", cookie);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("ROLE_FORBIDDEN");
    expect(mocks.ticketCount).not.toHaveBeenCalled();
    expect(mocks.ticketFindMany).not.toHaveBeenCalled();
  });
});
