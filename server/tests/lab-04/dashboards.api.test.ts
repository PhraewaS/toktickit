import request from "supertest";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sessionFindUnique: vi.fn(), ticketCount: vi.fn(), ticketFindMany: vi.fn(), ticketGroupBy: vi.fn(), actionCount: vi.fn(), actionFindMany: vi.fn() }));
vi.mock("../../src/prisma.js", () => ({ getPrisma: () => ({ session: { findUnique: mocks.sessionFindUnique }, ticket: { count: mocks.ticketCount, findMany: mocks.ticketFindMany, groupBy: mocks.ticketGroupBy }, actionTaken: { count: mocks.actionCount, findMany: mocks.actionFindMany } }) }));
import { app } from "../../src/app.js";

function signIn(role: UserRole, id = 1) { mocks.sessionFindUnique.mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000), user: { id, name: role, email: `${role.toLowerCase()}@example.test`, role, isActive: true, mustChangePassword: false } }); return "toktickit_session=dashboard-token"; }
const ticket = { id: 42, ticketNumber: "TKT-20260922-00000042", summary: "VPN", currentStatus: "OPEN", itPriority: "HIGH", updatedAt: new Date("2026-09-22T09:00:00.000Z") };

describe("Lab 4 Dashboard API", () => {
  beforeEach(() => vi.clearAllMocks());
  it("returns only Requester-owned dashboard metrics and recent tickets", async () => { const cookie = signIn(UserRole.REQUESTER, 7); mocks.ticketCount.mockResolvedValueOnce(2).mockResolvedValueOnce(1); mocks.ticketFindMany.mockResolvedValueOnce([ticket]).mockResolvedValueOnce([]); const response = await request(app).get("/api/dashboard/requester").set("Cookie", cookie); expect(response.status).toBe(200); expect(response.body.data.metrics).toEqual({ openTickets: 2, waitingForRequester: 1, recentlyUpdated: 1, recentlyResolved: 0 }); expect(mocks.ticketCount.mock.calls[0][0].where.requesterId).toBe(7); });
  it("rejects Requester access to Staff dashboard", async () => { const cookie = signIn(UserRole.REQUESTER); const response = await request(app).get("/api/dashboard/staff").set("Cookie", cookie); expect(response.status).toBe(403); expect(response.body.error.code).toBe("ROLE_FORBIDDEN"); });
  it("returns Staff dashboard breakdowns and current-user Actions Taken", async () => { const cookie = signIn(UserRole.IT_STAFF, 2); mocks.ticketCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1); mocks.ticketFindMany.mockResolvedValueOnce([ticket]).mockResolvedValueOnce([ticket]); mocks.ticketGroupBy.mockResolvedValueOnce([{ currentStatus: "OPEN", _count: { _all: 1 } }]).mockResolvedValueOnce([{ itPriority: "HIGH", _count: { _all: 1 } }]); mocks.actionCount.mockResolvedValue(4); mocks.actionFindMany.mockResolvedValue([]); const response = await request(app).get("/api/dashboard/staff").set("Cookie", cookie); expect(response.status).toBe(200); expect(response.body.data.metrics).toMatchObject({ unassignedTickets: 3, ownedTickets: 1, actionsTakenByCurrentUser: 4 }); expect(response.body.data.byStatus.OPEN).toBe(1); });
});
