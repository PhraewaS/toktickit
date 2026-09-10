import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@prisma/client";

const prismaMocks = vi.hoisted(() => ({
  sessionFindUnique: vi.fn(),
  ticketCount: vi.fn(),
  ticketFindMany: vi.fn(),
  ticketFindUnique: vi.fn(),
  ticketFindFirst: vi.fn(),
  ticketUpdate: vi.fn(),
  requesterFindFirst: vi.fn(),
  publicCommentFindMany: vi.fn(),
  publicCommentCreate: vi.fn(),
  internalNoteFindMany: vi.fn(),
  internalNoteCreate: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    session: { findUnique: prismaMocks.sessionFindUnique },
    ticket: {
      count: prismaMocks.ticketCount,
      findMany: prismaMocks.ticketFindMany,
      findUnique: prismaMocks.ticketFindUnique,
      findFirst: prismaMocks.ticketFindFirst,
      update: prismaMocks.ticketUpdate,
    },
    requesterUser: { findFirst: prismaMocks.requesterFindFirst },
    publicComment: {
      findMany: prismaMocks.publicCommentFindMany,
      create: prismaMocks.publicCommentCreate,
    },
    internalNote: {
      findMany: prismaMocks.internalNoteFindMany,
      create: prismaMocks.internalNoteCreate,
    },
  }),
}));

import { app } from "../../src/app.js";

const now = new Date("2026-01-01T00:00:00.000Z");
const author = { id: 7, name: "IT Staff", role: UserRole.IT_STAFF };
const comment = { id: 101, content: "Investigating the issue.", createdAt: now, author };
const note = { id: 201, content: "Internal diagnostic note.", createdAt: now, author };
const staffTicket = {
  id: 42,
  ticketNumber: "TKT-20260101-00000042",
  ticketDate: now,
  requester: { id: 8, name: "Requester", email: "requester@example.test" },
  category: { id: 1, name: "Network" },
  relatedSystem: { id: 1, name: "VPN" },
  summary: "VPN access",
  description: "VPN access is unavailable.",
  requestedPriority: "HIGH",
  itPriority: "HIGH",
  currentStatus: "NEW",
  owner: null,
  requesterResolvedAt: null,
  createdAt: now,
  updatedAt: now,
  attachments: [],
  publicComments: [],
  internalNotes: [],
};

function authenticate(role: UserRole) {
  prismaMocks.sessionFindUnique.mockResolvedValue({
    expiresAt: new Date(Date.now() + 60_000),
    user: {
      id: role === UserRole.IT_STAFF ? 7 : 8,
      name: role,
      email: role.toLowerCase() + "@example.test",
      role,
      isActive: true,
      mustChangePassword: false,
    },
  });
  return "toktickit_session=integration-token";
}

describe("Lab 3 staff operations production routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the queue envelope and uses ascending id as the tie-breaker", async () => {
    const cookie = authenticate(UserRole.IT_STAFF);
    prismaMocks.ticketCount.mockResolvedValue(1);
    prismaMocks.ticketFindMany.mockResolvedValue([staffTicket]);

    const response = await request(app)
      .get("/api/staff/tickets?sortBy=updatedAt&sortOrder=asc&page=1&pageSize=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.pagination).toEqual({ page: 1, pageSize: 10, totalItems: 1, totalPages: 1 });
    expect(prismaMocks.ticketFindMany.mock.calls[0][0].orderBy).toEqual([{ updatedAt: "asc" }, { id: "asc" }]);
  });

  it("rejects invalid sortOrder and unknown queue query parameters", async () => {
    const cookie = authenticate(UserRole.IT_STAFF);

    const invalidSort = await request(app)
      .get("/api/staff/tickets?sortOrder=sideways")
      .set("Cookie", cookie);
    const unknownQuery = await request(app)
      .get("/api/staff/tickets?unexpected=value")
      .set("Cookie", cookie);
    const repeatedQuery = await request(app)
      .get("/api/staff/tickets?sortOrder=asc&sortOrder=desc")
      .set("Cookie", cookie);

    expect(invalidSort.status).toBe(400);
    expect(invalidSort.body.error.code).toBe("INVALID_QUERY");
    expect(unknownQuery.status).toBe(400);
    expect(unknownQuery.body.error.code).toBe("INVALID_QUERY");
    expect(repeatedQuery.status).toBe(400);
    expect(repeatedQuery.body.error.code).toBe("INVALID_QUERY");
    expect(prismaMocks.ticketCount).not.toHaveBeenCalled();
  });

  it("serves Staff Detail through the production route and returns Ticket not found", async () => {
    const cookie = authenticate(UserRole.IT_STAFF);
    prismaMocks.ticketFindUnique.mockResolvedValueOnce(staffTicket).mockResolvedValueOnce(null);

    const detail = await request(app).get("/api/staff/tickets/42").set("Cookie", cookie);
    const missing = await request(app).get("/api/staff/tickets/999").set("Cookie", cookie);

    expect(detail.status).toBe(200);
    expect(detail.body.data).toMatchObject({ id: 42, ticketNumber: staffTicket.ticketNumber, publicComments: [], internalNotes: [] });
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("TICKET_NOT_FOUND");
  });

  it("checks Ticket existence before reading staff comments and notes", async () => {
    const cookie = authenticate(UserRole.IT_STAFF);
    prismaMocks.ticketFindUnique.mockResolvedValue(null);

    const comments = await request(app).get("/api/staff/tickets/999/comments").set("Cookie", cookie);
    const notes = await request(app).get("/api/staff/tickets/999/notes").set("Cookie", cookie);

    expect(comments.status).toBe(404);
    expect(comments.body.error.code).toBe("TICKET_NOT_FOUND");
    expect(notes.status).toBe(404);
    expect(notes.body.error.code).toBe("TICKET_NOT_FOUND");
    expect(prismaMocks.publicCommentFindMany).not.toHaveBeenCalled();
    expect(prismaMocks.internalNoteFindMany).not.toHaveBeenCalled();
  });

  it("returns consistent comment and note envelopes for list and create routes", async () => {
    const cookie = authenticate(UserRole.IT_STAFF);
    prismaMocks.ticketFindUnique.mockResolvedValue({ id: 42 });
    prismaMocks.publicCommentFindMany.mockResolvedValue([comment]);
    prismaMocks.internalNoteFindMany.mockResolvedValue([note]);
    prismaMocks.publicCommentCreate.mockResolvedValue(comment);
    prismaMocks.internalNoteCreate.mockResolvedValue(note);

    const listedComments = await request(app).get("/api/staff/tickets/42/comments").set("Cookie", cookie);
    const createdComment = await request(app).post("/api/staff/tickets/42/comments").set("Cookie", cookie).send({ content: comment.content });
    const listedNotes = await request(app).get("/api/staff/tickets/42/notes").set("Cookie", cookie);
    const createdNote = await request(app).post("/api/staff/tickets/42/notes").set("Cookie", cookie).send({ content: note.content });

    expect(listedComments.body).toEqual({ data: { items: [{ id: 101, content: comment.content, createdAt: now.toISOString(), author }] } });
    expect(createdComment.body).toEqual({ data: { comment: { id: 101, content: comment.content, createdAt: now.toISOString(), author } } });
    expect(listedNotes.body).toEqual({ data: { items: [{ id: 201, content: note.content, createdAt: now.toISOString(), author }] } });
    expect(createdNote.body).toEqual({ data: { note: { id: 201, content: note.content, createdAt: now.toISOString(), author } } });
  });

  it("enforces role authorization on real staff operation routes", async () => {
    const requesterCookie = authenticate(UserRole.REQUESTER);
    const requesterResponse = await request(app).get("/api/staff/tickets").set("Cookie", requesterCookie);
    expect(requesterResponse.status).toBe(403);
    expect(requesterResponse.body.error.code).toBe("ROLE_FORBIDDEN");

    const adminCookie = authenticate(UserRole.ADMINISTRATOR);
    prismaMocks.ticketUpdate.mockResolvedValue(staffTicket);
    const priority = await request(app).patch("/api/staff/tickets/42/priority").set("Cookie", adminCookie).send({ itPriority: "HIGH" });
    const status = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", adminCookie).send({ status: "OPEN" });

    expect(priority.status).toBe(200);
    expect(status.status).toBe(403);
    expect(status.body.error.code).toBe("ROLE_FORBIDDEN");
  });

  it("allows Administrator to read comments and notes but keeps staff mutations IT Staff-only", async () => {
    const cookie = authenticate(UserRole.ADMINISTRATOR);
    prismaMocks.ticketFindUnique.mockResolvedValue({ id: 42 });
    prismaMocks.publicCommentFindMany.mockResolvedValue([comment]);
    prismaMocks.internalNoteFindMany.mockResolvedValue([note]);

    const comments = await request(app).get("/api/staff/tickets/42/comments").set("Cookie", cookie);
    const notes = await request(app).get("/api/staff/tickets/42/notes").set("Cookie", cookie);
    const createComment = await request(app).post("/api/staff/tickets/42/comments").set("Cookie", cookie).send({ content: "Admin must not post." });
    const createNote = await request(app).post("/api/staff/tickets/42/notes").set("Cookie", cookie).send({ content: "Admin must not post." });

    expect(comments.status).toBe(200);
    expect(comments.body.data.items).toHaveLength(1);
    expect(notes.status).toBe(200);
    expect(notes.body.data.items).toHaveLength(1);
    expect(createComment.status).toBe(403);
    expect(createComment.body.error.code).toBe("ROLE_FORBIDDEN");
    expect(createNote.status).toBe(403);
    expect(createNote.body.error.code).toBe("ROLE_FORBIDDEN");
    expect(prismaMocks.publicCommentCreate).not.toHaveBeenCalled();
    expect(prismaMocks.internalNoteCreate).not.toHaveBeenCalled();
  });

  it("allows a Requester to read and create Public Comments on the Requester's own Ticket", async () => {
    const cookie = authenticate(UserRole.REQUESTER);
    prismaMocks.ticketFindFirst.mockResolvedValue({ id: 42 });
    prismaMocks.publicCommentFindMany.mockResolvedValue([comment]);
    prismaMocks.publicCommentCreate.mockResolvedValue(comment);

    const comments = await request(app).get("/api/tickets/42/comments").set("Cookie", cookie);
    const created = await request(app).post("/api/tickets/42/comments").set("Cookie", cookie).send({ content: comment.content });

    expect(comments.status).toBe(200);
    expect(comments.body).toEqual({ data: { items: [{ id: 101, content: comment.content, createdAt: now.toISOString(), author }] } });
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ data: { comment: { id: 101, content: comment.content, createdAt: now.toISOString(), author } } });
  });

  it("runs assignment and status operations through the real IT Staff routes", async () => {
    const cookie = authenticate(UserRole.IT_STAFF);
    prismaMocks.ticketFindUnique
      .mockResolvedValueOnce({ id: 42 })
      .mockResolvedValueOnce({ currentStatus: "NEW" });
    prismaMocks.requesterFindFirst.mockResolvedValue({ id: 9 });
    prismaMocks.ticketUpdate.mockResolvedValue(staffTicket);

    const assignment = await request(app).post("/api/staff/tickets/42/assignment").set("Cookie", cookie).send({ ownerId: 9 });
    const status = await request(app).patch("/api/staff/tickets/42/status").set("Cookie", cookie).send({ status: "OPEN" });

    expect(assignment.status).toBe(200);
    expect(status.status).toBe(200);
    expect(prismaMocks.requesterFindFirst).toHaveBeenCalled();
    expect(prismaMocks.ticketUpdate).toHaveBeenCalledTimes(2);
  });
});
