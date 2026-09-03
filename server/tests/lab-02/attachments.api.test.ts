import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requesterFindFirst: vi.fn(),
  ticketFindFirst: vi.fn(),
  attachmentCount: vi.fn(),
  attachmentCreate: vi.fn(),
  attachmentFindFirst: vi.fn(),
  attachmentFindMany: vi.fn(),
  attachmentUpdate: vi.fn(),
  transaction: vi.fn(),
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    requesterUser: { findFirst: mocks.requesterFindFirst },
    ticket: { findFirst: mocks.ticketFindFirst },
    attachment: {
      count: mocks.attachmentCount,
      create: mocks.attachmentCreate,
      findFirst: mocks.attachmentFindFirst,
      findMany: mocks.attachmentFindMany,
      update: mocks.attachmentUpdate,
    },
    $transaction: mocks.transaction,
  }),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: mocks.mkdir,
  readFile: mocks.readFile,
  writeFile: mocks.writeFile,
  unlink: mocks.unlink,
}));

import { app } from "../../src/app.js";

const uploadedAt = new Date("2026-08-24T08:31:00.000Z");
const attachment = {
  id: 8,
  originalFilename: "report.png",
  mimeType: "image/png",
  sizeBytes: 4,
  uploadedAt,
  removedAt: null,
  removalReason: null,
};

describe("Attachment lifecycle APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requesterFindFirst.mockResolvedValue({ id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" });
    mocks.ticketFindFirst.mockResolvedValue({ id: 42 });
    mocks.attachmentCount.mockResolvedValue(0);
    mocks.attachmentCreate.mockResolvedValue(attachment);
    mocks.mkdir.mockResolvedValue(undefined);
    mocks.readFile.mockResolvedValue(Buffer.from("PNG bytes"));
    mocks.writeFile.mockResolvedValue(undefined);
    mocks.unlink.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation((callback) => callback({
      ticket: { findFirst: mocks.ticketFindFirst },
      attachment: { count: mocks.attachmentCount, create: mocks.attachmentCreate },
    }));
    mocks.attachmentFindFirst.mockResolvedValue({ ...attachment, storedFilename: "stored-uuid" });
    mocks.attachmentUpdate.mockResolvedValue({ ...attachment, removedAt: new Date("2026-08-25T08:30:00.000Z"), removalReason: "Wrong file" });
  });

  it("uploads permitted files with sanitized metadata", async () => {
    const response = await request(app)
      .post("/api/tickets/42/attachments")
      .set("X-Development-Requester-Id", "1")
      .attach("files", Buffer.from("png"), { filename: "../report.png", contentType: "image/png" });
    expect(response.status).toBe(201);
    expect(response.body.data[0]).toMatchObject({ originalFilename: "report.png", state: "ACTIVE" });
    expect(mocks.attachmentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ ticketId: 42, originalFilename: "report.png", mimeType: "image/png", sizeBytes: 3 }),
    }));
  });

  it("rejects invalid type and active-count overflow", async () => {
    const invalid = await request(app).post("/api/tickets/42/attachments").set("X-Development-Requester-Id", "1").attach("files", Buffer.from("x"), { filename: "script.txt", contentType: "text/plain" });
    expect(invalid.status).toBe(415);
    mocks.attachmentCount.mockResolvedValue(5);
    const limited = await request(app).post("/api/tickets/42/attachments").set("X-Development-Requester-Id", "1").attach("files", Buffer.from("x"), { filename: "report.png", contentType: "image/png" });
    expect(limited.status).toBe(409);
    expect(limited.body.error.code).toBe("ATTACHMENT_LIMIT");
  });

  it("serializes concurrent uploads so the active limit cannot be exceeded", async () => {
    let activeCount = 4;
    let queue = Promise.resolve();
    mocks.attachmentCount.mockImplementation(async () => activeCount);
    mocks.attachmentCreate.mockImplementation(async () => {
      activeCount += 1;
      return { ...attachment, id: activeCount };
    });
    mocks.transaction.mockImplementation((callback, options) => {
      expect(options).toEqual({ isolationLevel: "Serializable" });
      const run = queue.then(() => callback({
        ticket: { findFirst: mocks.ticketFindFirst },
        attachment: { count: mocks.attachmentCount, create: mocks.attachmentCreate },
      }));
      queue = run.then(() => undefined, () => undefined);
      return run;
    });

    const makeUpload = () => request(app)
      .post("/api/tickets/42/attachments")
      .set("X-Development-Requester-Id", "1")
      .attach("files", Buffer.from("x"), { filename: "concurrent.png", contentType: "image/png" });
    const [first, second] = await Promise.all([makeUpload(), makeUpload()]);

    expect([first.status, second.status].sort()).toEqual([201, 409]);
    expect(activeCount).toBe(5);
  });

  it("allows a replacement upload after soft-removing one of five active attachments", async () => {
    mocks.attachmentCount.mockResolvedValue(5);
    const full = await request(app)
      .post("/api/tickets/42/attachments")
      .set("X-Development-Requester-Id", "1")
      .attach("files", Buffer.from("x"), { filename: "new.png", contentType: "image/png" });
    expect(full.status).toBe(409);

    const removal = await request(app)
      .delete("/api/attachments/8")
      .set("X-Development-Requester-Id", "1")
      .send({ reason: "Replace file" });
    expect(removal.status).toBe(200);

    mocks.attachmentCount.mockResolvedValue(4);
    const replacement = await request(app)
      .post("/api/tickets/42/attachments")
      .set("X-Development-Requester-Id", "1")
      .attach("files", Buffer.from("x"), { filename: "new.png", contentType: "image/png" });
    expect(replacement.status).toBe(201);
  });

  it("downloads owned active attachments with bytes and controlled metadata", async () => {
    const fileBytes = Buffer.from("PNG bytes");
    mocks.readFile.mockResolvedValue(fileBytes);
    const response = await request(app)
      .get("/api/attachments/8/download")
      .set("X-Development-Requester-Id", "1");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fileBytes);
    expect(response.headers["content-type"]).toMatch(/^image\/png/);
    expect(response.headers["content-disposition"]).toBe('attachment; filename="report.png"');
    expect(response.headers["access-control-expose-headers"]).toBe("Content-Disposition");
  });

  it("soft-removes an owned active attachment and validates the reason", async () => {
    const invalid = await request(app).delete("/api/attachments/8").set("X-Development-Requester-Id", "1").send({ reason: "ab" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("INVALID_REMOVAL_REASON");
    const tooLong = await request(app).delete("/api/attachments/8").set("X-Development-Requester-Id", "1").send({ reason: "a".repeat(501) });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.error.code).toBe("INVALID_REMOVAL_REASON");
    const response = await request(app).delete("/api/attachments/8").set("X-Development-Requester-Id", "1").send({ reason: "  Wrong file  " });
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ state: "REMOVED", removalReason: "Wrong file" });
    expect(mocks.attachmentUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { removedAt: expect.any(Date), removalReason: "Wrong file" } }));
  });

  it("blocks removed or other-owner attachment access with safe 404", async () => {
    mocks.attachmentFindFirst.mockResolvedValue(null);
    const response = await request(app).get("/api/attachments/8/download").set("X-Development-Requester-Id", "2");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: "ATTACHMENT_NOT_FOUND", message: "Attachment was not found." } });
    const removal = await request(app).delete("/api/attachments/8").set("X-Development-Requester-Id", "2").send({ reason: "Wrong file" });
    expect(removal.status).toBe(404);
  });

  it("hides ticket attachments from another requester with safe 404", async () => {
    mocks.requesterFindFirst.mockResolvedValue({ id: 2, name: "Other Requester", email: "other@example.test" });
    mocks.ticketFindFirst.mockResolvedValue(null);
    const response = await request(app)
      .get("/api/tickets/42/attachments")
      .set("X-Development-Requester-Id", "2");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: "TICKET_NOT_FOUND", message: "Ticket was not found." } });
    expect(mocks.ticketFindFirst).toHaveBeenLastCalledWith({
      where: { id: 42, requesterId: 2 },
      select: { id: true },
    });
  });

  it("returns safe 500 for an unexpected database failure during download", async () => {
    const internalDetail = "SQL password /var/private/attachments";
    mocks.attachmentFindFirst.mockRejectedValue(new Error(internalDetail));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app)
      .get("/api/attachments/8/download")
      .set("X-Development-Requester-Id", "1");
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.toContain(internalDetail);
  });

  it("compensates stored files when metadata persistence fails", async () => {
    mocks.attachmentCreate.mockRejectedValue(new Error("SQL secret /var/private"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app).post("/api/tickets/42/attachments").set("X-Development-Requester-Id", "1").attach("files", Buffer.from("x"), { filename: "report.png", contentType: "image/png" });
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.toContain("SQL secret");
    expect(mocks.unlink).toHaveBeenCalled();
  });
});
