import express, { Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  requesterFindMany: vi.fn(),
  requesterFindFirst: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    requesterUser: {
      findMany: prismaMocks.requesterFindMany,
      findFirst: prismaMocks.requesterFindFirst,
    },
  }),
}));

import { app } from "../../src/app.js";
import {
  DevelopmentRequesterRequest,
  requireDevelopmentRequester,
} from "../../src/requester-context.js";

describe("GET /api/development-requesters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only active requesters in deterministic name order", async () => {
    prismaMocks.requesterFindMany.mockResolvedValue([
      { id: 2, name: "Jennifer Anderson", email: "jennifer@example.test" },
      { id: 4, name: "Narin Chai", email: "narin@example.test" },
    ]);

    const response = await request(app).get("/api/development-requesters");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        { id: 2, name: "Jennifer Anderson", email: "jennifer@example.test" },
        { id: 4, name: "Narin Chai", email: "narin@example.test" },
      ],
    });
    expect(prismaMocks.requesterFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  });

  it("returns a safe 503 response when the requester list cannot be loaded", async () => {
    prismaMocks.requesterFindMany.mockRejectedValue(
      new Error("database password at C:\\private\\database.env"),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await request(app).get("/api/development-requesters");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: "REQUESTER_LIST_UNAVAILABLE",
        message: "Development requesters are temporarily unavailable. Please try again.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("database.env");
  });
});

describe("requireDevelopmentRequester", () => {
  const protectedApp = express();
  protectedApp.get(
    "/protected",
    requireDevelopmentRequester,
    (req: Request, res: Response) => {
      const requester = (req as DevelopmentRequesterRequest).developmentRequester;
      res.status(200).json({ data: requester });
    },
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a missing or malformed requester header without querying the database", async () => {
    const missing = await request(protectedApp).get("/protected");
    const malformed = await request(protectedApp)
      .get("/protected")
      .set("X-Development-Requester-Id", "not-an-id");

    for (const response of [missing, malformed]) {
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("REQUESTER_REQUIRED");
    }
    expect(prismaMocks.requesterFindFirst).not.toHaveBeenCalled();
  });

  it("rejects a missing or inactive requester with the same safe response", async () => {
    prismaMocks.requesterFindFirst.mockResolvedValue(null);

    const response = await request(protectedApp)
      .get("/protected")
      .set("X-Development-Requester-Id", "7");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "REQUESTER_UNAVAILABLE",
        message: "The selected Development Requester is unavailable. Select another requester.",
      },
    });
  });

  it("attaches the active requester to the protected request", async () => {
    prismaMocks.requesterFindFirst.mockResolvedValue({
      id: 7,
      name: "Jennifer Anderson",
      email: "jennifer@example.test",
    });

    const response = await request(protectedApp)
      .get("/protected")
      .set("X-Development-Requester-Id", "7");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        id: 7,
        name: "Jennifer Anderson",
        email: "jennifer@example.test",
      },
    });
    expect(prismaMocks.requesterFindFirst).toHaveBeenCalledWith({
      where: { id: 7, isActive: true },
      select: { id: true, name: true, email: true },
    });
  });
});
