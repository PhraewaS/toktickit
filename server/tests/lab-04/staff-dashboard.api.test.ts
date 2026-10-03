import request from "supertest";
import { RequestedPriority, TicketStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sessionFindUnique: vi.fn(), ticketCount: vi.fn(), ticketFindMany: vi.fn(), ticketGroupBy: vi.fn(), actionCount: vi.fn(), actionFindMany: vi.fn() }));
vi.mock("../../src/prisma.js", () => ({ getPrisma: () => ({ session: { findUnique: mocks.sessionFindUnique }, ticket: { count: mocks.ticketCount, findMany: mocks.ticketFindMany, groupBy: mocks.ticketGroupBy }, actionTaken: { count: mocks.actionCount, findMany: mocks.actionFindMany } }) }));
import { app } from "../../src/app.js";

const now = new Date("2026-09-30T12:00:00.000Z");
const cutoff = new Date("2026-08-31T12:00:00.000Z");
const ticket = {
  id: 42,
  ticketNumber: "TKT-20260930-00000042",
  summary: "VPN access is unavailable",
  currentStatus: TicketStatus.OPEN,
  itPriority: RequestedPriority.HIGH,
  updatedAt: now,
  requester: { id: 1, name: "Requester" },
  owner: { id: 2, name: "IT Staff" },
};
const action = {
  id: 9,
  actionDateTime: now,
  description: "Reviewed the VPN logs.",
  result: "Authentication failure confirmed.",
  ticket: { id: 42, ticketNumber: ticket.ticketNumber, summary: ticket.summary },
};
const activeStatuses = [TicketStatus.NEW, TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.REOPENED];

function signIn(role: UserRole, id = 2) {
  mocks.sessionFindUnique.mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000), user: { id, name: role, email: `${role.toLowerCase()}@example.test`, role, isActive: true, mustChangePassword: false } });
  return "toktickit_session=staff-dashboard-token";
}

function setupDashboardData() {
  mocks.ticketCount.mockResolvedValueOnce(14).mockResolvedValueOnce(5).mockResolvedValueOnce(12);
  mocks.ticketGroupBy.mockResolvedValueOnce([
    { currentStatus: TicketStatus.OPEN, _count: { _all: 4 } },
    { currentStatus: TicketStatus.RESOLVED, _count: { _all: 3 } },
    { currentStatus: TicketStatus.CANCELLED, _count: { _all: 1 } },
  ]).mockResolvedValueOnce([
    { itPriority: RequestedPriority.HIGH, _count: { _all: 4 } },
    { itPriority: RequestedPriority.MEDIUM, _count: { _all: 3 } },
  ]);
  mocks.ticketFindMany.mockResolvedValueOnce(Array.from({ length: 10 }, (_, index) => ({ ...ticket, id: index + 1 }))).mockResolvedValueOnce(Array.from({ length: 10 }, (_, index) => ({ ...ticket, id: index + 1 })));
  mocks.actionCount.mockResolvedValue(28);
  mocks.actionFindMany.mockResolvedValueOnce(Array.from({ length: 10 }, (_, index) => ({ ...action, id: index + 1 })));
}

describe("Lab 4 Staff and Administrator Dashboard API", () => {
  beforeEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

  it("returns authoritative metrics, all-status/priority breakdowns, and bounded lists with consistent UTC recency", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const cookie = signIn(UserRole.IT_STAFF, 2);
    setupDashboardData();

    const response = await request(app).get("/api/dashboard/staff").set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.data.metrics).toEqual({ unassignedActive: 14, myActive: 5, myActionsTaken: 28, urgentTickets: 12 });
    expect(response.body.data.byStatus).toEqual({ NEW: 0, OPEN: 4, IN_PROGRESS: 0, WAITING_FOR_REQUESTER: 0, RESOLVED: 3, CLOSED: 0, REOPENED: 0, CANCELLED: 1 });
    expect(response.body.data.byPriority).toEqual({ LOW: 0, MEDIUM: 3, HIGH: 4 });
    expect(response.body.data.recentlyUpdated).toHaveLength(10);
    expect(response.body.data.urgentTickets).toHaveLength(10);
    expect(response.body.data.recentActions).toHaveLength(10);
    expect(response.body.data.recentActions[0]).toMatchObject({ ticketId: 42, ticketNumber: ticket.ticketNumber, description: action.description });

    expect(mocks.ticketCount).toHaveBeenNthCalledWith(1, { where: { ownerId: null, currentStatus: { in: activeStatuses } } });
    expect(mocks.ticketCount).toHaveBeenNthCalledWith(2, { where: { ownerId: 2, currentStatus: { in: activeStatuses } } });
    expect(mocks.ticketCount).toHaveBeenNthCalledWith(3, { where: { currentStatus: { in: activeStatuses }, itPriority: RequestedPriority.HIGH } });
    expect(mocks.ticketGroupBy).toHaveBeenNthCalledWith(1, { by: ["currentStatus"], _count: { _all: true } });
    expect(mocks.ticketGroupBy).toHaveBeenNthCalledWith(2, { by: ["itPriority"], _count: { _all: true } });
    expect(mocks.ticketFindMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ take: 10, where: { updatedAt: { gte: cutoff } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }] }));
    expect(mocks.ticketFindMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ take: 10, where: { currentStatus: { in: activeStatuses }, itPriority: RequestedPriority.HIGH } }));
    expect(mocks.actionCount).toHaveBeenCalledWith({ where: { performedById: 2 } });
    expect(mocks.actionFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { performedById: 2, actionDateTime: { gte: cutoff } }, take: 10, orderBy: [{ actionDateTime: "desc" }, { id: "desc" }] }));
  });

  it("allows Administrator access and rejects Requester access without loading protected data", async () => {
    const requesterCookie = signIn(UserRole.REQUESTER, 1);
    const forbidden = await request(app).get("/api/dashboard/staff").set("Cookie", requesterCookie);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe("ROLE_FORBIDDEN");
    expect(mocks.ticketCount).not.toHaveBeenCalled();

    const adminCookie = signIn(UserRole.ADMINISTRATOR, 3);
    setupDashboardData();
    const allowed = await request(app).get("/api/dashboard/staff").set("Cookie", adminCookie);
    expect(allowed.status).toBe(200);
    expect(mocks.ticketCount).toHaveBeenCalledWith({ where: { ownerId: 3, currentStatus: { in: activeStatuses } } });
  });

  it("returns a safe internal error if dashboard data cannot be queried", async () => {
    const cookie = signIn(UserRole.IT_STAFF, 2);
    mocks.ticketCount.mockRejectedValue(new Error("private SQL detail"));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await request(app).get("/api/dashboard/staff").set("Cookie", cookie);

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({ code: "INTERNAL_ERROR", message: "TokTickIT could not load the IT Staff dashboard. Please try again." });
    expect(JSON.stringify(response.body)).not.toContain("private SQL detail");
    log.mockRestore();
  });
});
