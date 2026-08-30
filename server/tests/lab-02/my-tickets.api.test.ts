import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  requesterFindFirst: vi.fn(),
  ticketCount: vi.fn(),
  ticketFindMany: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    requesterUser: { findFirst: prismaMocks.requesterFindFirst },
    ticket: {
      count: prismaMocks.ticketCount,
      findMany: prismaMocks.ticketFindMany,
    },
  }),
}));

import { app } from "../../src/app.js";

const ticket = {
  id: 42,
  ticketNumber: "TKT-20260824-A1B2C3D4",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 7,
  summary: "Laptop battery drains quickly",
  requestedPriority: "MEDIUM",
  description: "The battery drains quickly.",
  currentStatus: "NEW",
  submissionKey: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  createdAt: new Date("2026-08-24T08:30:00.000Z"),
  updatedAt: new Date("2026-08-24T08:30:00.000Z"),
  requester: { id: 1, name: "Jennifer Anderson" },
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
};

describe("GET /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.requesterFindFirst.mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
      email: "jennifer@example.test",
    });
    prismaMocks.ticketCount.mockResolvedValueOnce(12).mockResolvedValueOnce(1);
    prismaMocks.ticketFindMany.mockResolvedValue([ticket]);
  });

  it("returns only owned tickets with filtering and pagination metadata", async () => {
    const response = await request(app)
      .get("/api/tickets")
      .query({ search: " battery ", categoryId: 2, sortBy: "summary", sortOrder: "asc", pageSize: 20 })
      .set("X-Development-Requester-Id", "1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        {
          id: 42,
          ticketNumber: ticket.ticketNumber,
          summary: ticket.summary,
          category: ticket.category,
          relatedSystem: ticket.relatedSystem,
          requestedPriority: "MEDIUM",
          currentStatus: "NEW",
          createdAt: ticket.createdAt.toISOString(),
          updatedAt: ticket.updatedAt.toISOString(),
        },
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        totalOwnedItems: 12,
        totalPages: 1,
      },
    });
    expect(prismaMocks.ticketCount).toHaveBeenNthCalledWith(1, { where: { requesterId: 1 } });
    expect(prismaMocks.ticketFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: [{ summary: "asc" }, { id: "desc" }],
      }),
    );
  });

  it("distinguishes empty ownership from filtered no-results in one response", async () => {
    prismaMocks.ticketCount.mockReset().mockResolvedValueOnce(4).mockResolvedValueOnce(0);
    prismaMocks.ticketFindMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/tickets?search=missing")
      .set("X-Development-Requester-Id", "1");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalOwnedItems: 4,
      totalPages: 0,
    });
    expect(prismaMocks.ticketCount).toHaveBeenCalledTimes(2);
  });

  it("rejects a page beyond totalPages without loading an empty page", async () => {
    prismaMocks.ticketCount.mockReset().mockResolvedValueOnce(11).mockResolvedValueOnce(11);

    const response = await request(app)
      .get("/api/tickets?page=2&pageSize=10")
      .set("X-Development-Requester-Id", "1");

    expect(response.status).toBe(200);
    expect(prismaMocks.ticketFindMany).toHaveBeenCalledTimes(1);

    prismaMocks.ticketCount.mockReset().mockResolvedValueOnce(11).mockResolvedValueOnce(11);
    const outOfRange = await request(app)
      .get("/api/tickets?page=3&pageSize=10")
      .set("X-Development-Requester-Id", "1");
    expect(outOfRange.status).toBe(400);
    expect(outOfRange.body.error.code).toBe("PAGE_OUT_OF_RANGE");
  });

  it("rejects invalid query values", async () => {
    const response = await request(app)
      .get("/api/tickets?pageSize=15&sortOrder=sideways")
      .set("X-Development-Requester-Id", "1");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
    expect(prismaMocks.ticketCount).not.toHaveBeenCalled();
  });

  it("returns a safe internal error when the database fails unexpectedly", async () => {
    const internalDetail = "SQL password and filesystem path must never be exposed";
    prismaMocks.ticketCount.mockReset().mockRejectedValue(new Error(internalDetail));

    const response = await request(app)
      .get("/api/tickets")
      .set("X-Development-Requester-Id", "1");

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({
      code: "INTERNAL_ERROR",
      message: "TokTickIT could not load Tickets. Please try again.",
    });
    expect(JSON.stringify(response.body)).not.toContain(internalDetail);
  });
});
