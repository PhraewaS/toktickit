import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  requesterFindFirst: vi.fn(),
  categoryFindFirst: vi.fn(),
  relatedSystemFindFirst: vi.fn(),
  ticketFindUnique: vi.fn(),
  ticketCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => {
  const client = {
    requesterUser: { findFirst: prismaMocks.requesterFindFirst },
    category: { findFirst: prismaMocks.categoryFindFirst },
    relatedSystem: { findFirst: prismaMocks.relatedSystemFindFirst },
    ticket: {
      findUnique: prismaMocks.ticketFindUnique,
      create: prismaMocks.ticketCreate,
    },
    $transaction: prismaMocks.transaction,
  };

  return { getPrisma: () => client };
});

import { app } from "../../src/app.js";

const requestBody = {
  submissionKey: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  categoryId: 2,
  relatedSystemId: 7,
  summary: "  Laptop battery drains quickly  ",
  requestedPriority: "MEDIUM",
  description:
    "  The battery falls from full charge to 20 percent within one hour.  ",
};

const createdAt = new Date("2026-08-24T08:30:00.000Z");
const baseTicket = {
  id: 42,
  ticketNumber: "TKT-20260824-A1B2C3D4",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 7,
  summary: "Laptop battery drains quickly",
  requestedPriority: "MEDIUM",
  description:
    "The battery falls from full charge to 20 percent within one hour.",
  currentStatus: "NEW",
  submissionKey: requestBody.submissionKey,
  createdAt,
  updatedAt: createdAt,
  requester: { id: 1, name: "Jennifer Anderson" },
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
};

describe("POST /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.requesterFindFirst.mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
      email: "jennifer@example.test",
    });
    prismaMocks.categoryFindFirst.mockResolvedValue({ id: 2, name: "Hardware" });
    prismaMocks.relatedSystemFindFirst.mockResolvedValue({
      id: 7,
      name: "Corporate Laptop",
    });
    prismaMocks.ticketFindUnique.mockResolvedValue(null);
    prismaMocks.ticketCreate.mockImplementation(({ data }) =>
      Promise.resolve({ ...baseTicket, ...data, createdAt, updatedAt: createdAt }),
    );
    prismaMocks.transaction.mockImplementation((callback) =>
      callback({
        category: { findFirst: prismaMocks.categoryFindFirst },
        relatedSystem: { findFirst: prismaMocks.relatedSystemFindFirst },
        ticket: {
          findUnique: prismaMocks.ticketFindUnique,
          create: prismaMocks.ticketCreate,
        },
      }),
    );
  });

  it("creates one owned NEW Ticket and returns backend-generated values", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("X-Development-Requester-Id", "1")
      .send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: expect.objectContaining({
        id: 42,
        ticketNumber: expect.stringMatching(/^TKT-\d{8}-[A-F0-9]{8}$/),
        ticketDate: createdAt.toISOString(),
        requester: { id: 1, name: "Jennifer Anderson" },
        category: { id: 2, name: "Hardware" },
        relatedSystem: { id: 7, name: "Corporate Laptop" },
        summary: "Laptop battery drains quickly",
        requestedPriority: "MEDIUM",
        description:
          "The battery falls from full charge to 20 percent within one hour.",
        currentStatus: "NEW",
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
      }),
      replayed: false,
    });
    expect(response.body.data.ticketDate).toBe(response.body.data.createdAt);
    expect(prismaMocks.ticketCreate).toHaveBeenCalledTimes(1);
    expect(prismaMocks.categoryFindFirst).toHaveBeenCalledWith({
      where: { id: 2, isActive: true },
      select: { id: true },
    });
    expect(prismaMocks.relatedSystemFindFirst).toHaveBeenCalledWith({
      where: { id: 7, isActive: true },
      select: { id: true },
    });
    expect(prismaMocks.ticketCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requesterId: 1,
          categoryId: 2,
          relatedSystemId: 7,
          summary: "Laptop battery drains quickly",
          requestedPriority: "MEDIUM",
          description:
            "The battery falls from full charge to 20 percent within one hour.",
          currentStatus: "NEW",
          submissionKey: requestBody.submissionKey,
          ticketNumber: expect.stringMatching(/^TKT-\d{8}-[A-F0-9]{8}$/),
        }),
      }),
    );
  });

  it("replays the original Ticket for the same requester and submission key", async () => {
    prismaMocks.ticketFindUnique.mockResolvedValue(baseTicket);

    const response = await request(app)
      .post("/api/tickets")
      .set("X-Development-Requester-Id", "1")
      .send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body.replayed).toBe(true);
    expect(response.body.data.id).toBe(42);
    expect(prismaMocks.ticketCreate).not.toHaveBeenCalled();
  });

  it("returns safe field details and does not create a Ticket for invalid input", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("X-Development-Requester-Id", "1")
      .send({
        ...requestBody,
        summary: " ",
        description: "short",
        requestedPriority: "URGENT",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Review the highlighted fields and try again.",
        fields: expect.objectContaining({
          summary: expect.any(String),
          description: expect.any(String),
          requestedPriority: expect.any(String),
        }),
      },
    });
    expect(prismaMocks.transaction).not.toHaveBeenCalled();
    expect(prismaMocks.ticketCreate).not.toHaveBeenCalled();
  });

  it("rejects missing or inactive reference data without creating a Ticket", async () => {
    prismaMocks.categoryFindFirst.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/tickets")
      .set("X-Development-Requester-Id", "1")
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "REFERENCE_DATA_UNAVAILABLE",
        message: "Select active Category and Related System values.",
        fields: { categoryId: expect.any(String) },
      },
    });
    expect(prismaMocks.ticketCreate).not.toHaveBeenCalled();
  });

  it("returns a safe 500 response when persistence fails", async () => {
    prismaMocks.transaction.mockRejectedValue(
      new Error("INSERT failed at C:\\private\\database.env"),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await request(app)
      .post("/api/tickets")
      .set("X-Development-Requester-Id", "1")
      .send(requestBody);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "TokTickIT could not complete the request. Please try again.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("database.env");
  });
});
