import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  categoryFindMany: vi.fn(),
  relatedSystemFindMany: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    category: { findMany: prismaMocks.categoryFindMany },
    relatedSystem: { findMany: prismaMocks.relatedSystemFindMany },
  }),
}));

import { app } from "../../src/app.js";

describe("active reference-data APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active categories ordered by name and id", async () => {
    prismaMocks.categoryFindMany.mockResolvedValue([
      { id: 1, name: "Account and Access" },
      { id: 2, name: "Hardware" },
    ]);

    const response = await request(app).get("/api/categories");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        { id: 1, name: "Account and Access" },
        { id: 2, name: "Hardware" },
      ],
    });
    expect(prismaMocks.categoryFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  });

  it("returns active related systems ordered by name and id", async () => {
    prismaMocks.relatedSystemFindMany.mockResolvedValue([
      { id: 3, name: "Corporate Laptop" },
      { id: 6, name: "Email" },
    ]);

    const response = await request(app).get("/api/related-systems");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        { id: 3, name: "Corporate Laptop" },
        { id: 6, name: "Email" },
      ],
    });
    expect(prismaMocks.relatedSystemFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  });

  it.each([
    ["categories", prismaMocks.categoryFindMany],
    ["related-systems", prismaMocks.relatedSystemFindMany],
  ])("returns a safe 503 when %s cannot be loaded", async (path, findMany) => {
    findMany.mockRejectedValue(new Error("SELECT failed at C:\\private\\db"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await request(app).get(`/api/${path}`);

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: "REFERENCE_DATA_UNAVAILABLE",
        message: "Reference data is temporarily unavailable. Please try again.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("private");
  });
});
