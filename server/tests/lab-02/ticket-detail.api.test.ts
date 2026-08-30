import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requesterFindFirst: vi.fn(),
  ticketFindFirst: vi.fn(),
  attachmentFindMany: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    requesterUser: { findFirst: mocks.requesterFindFirst },
    ticket: { findFirst: mocks.ticketFindFirst },
    attachment: { findMany: mocks.attachmentFindMany },
  }),
}));

import { app } from "../../src/app.js";

const createdAt = new Date("2026-08-24T08:30:00.000Z");
const ticket = {
  id: 42,
  ticketNumber: "TKT-20260824-A1B2C3D4",
  createdAt,
  updatedAt: createdAt,
  requester: { id: 1, name: "Jennifer Anderson" },
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
  summary: "Laptop battery drains quickly",
  requestedPriority: "MEDIUM",
  description: "The battery falls from full charge to 20 percent within one hour.",
  currentStatus: "NEW",
  attachments: [{
    id: 8,
    originalFilename: "battery-report.pdf",
    mimeType: "application/pdf",
    sizeBytes: 104857,
    uploadedAt: createdAt,
    removedAt: null,
    removalReason: null,
  }],
};

describe("Requester Ticket Detail APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requesterFindFirst.mockResolvedValue({ id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" });
    mocks.ticketFindFirst.mockResolvedValue(ticket);
    mocks.attachmentFindMany.mockResolvedValue(ticket.attachments);
  });

  it("returns owned read-only detail with attachment metadata and state", async () => {
    const response = await request(app).get("/api/tickets/42").set("X-Development-Requester-Id", "1");
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 42,
      ticketNumber: ticket.ticketNumber,
      ticketDate: createdAt.toISOString(),
      currentStatus: "NEW",
      attachments: [{
        id: 8,
        originalFilename: "battery-report.pdf",
        state: "ACTIVE",
        removedAt: null,
      }],
    });
    expect(JSON.stringify(response.body)).not.toContain("storedFilename");
  });

  it("uses safe errors for invalid and cross-owner ticket access", async () => {
    expect((await request(app).get("/api/tickets/nope").set("X-Development-Requester-Id", "1")).body.error.code).toBe("INVALID_TICKET_ID");
    mocks.ticketFindFirst.mockResolvedValue(null);
    const response = await request(app).get("/api/tickets/42").set("X-Development-Requester-Id", "2");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: "TICKET_NOT_FOUND", message: "Ticket was not found." } });
  });

  it("lists active and removed metadata without exposing storage details", async () => {
    const removed = { ...ticket.attachments[0], removedAt: new Date("2026-08-25T08:30:00.000Z"), removalReason: "Wrong file" };
    mocks.ticketFindFirst.mockResolvedValue({ id: 42 });
    mocks.attachmentFindMany.mockResolvedValue([ticket.attachments[0], removed]);
    const response = await request(app).get("/api/tickets/42/attachments").set("X-Development-Requester-Id", "1");
    expect(response.status).toBe(200);
    expect(response.body.data.map((item: { state: string }) => item.state)).toEqual(["ACTIVE", "REMOVED"]);
    expect(JSON.stringify(response.body)).not.toContain("storedFilename");
  });
});
