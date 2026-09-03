import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/categories", () => {
  it("returns the four active seeded categories in Lab 2 name order", async () => {
    const response = await request(app).get("/api/categories");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        { id: 1, name: "Account and Access" },
        { id: 2, name: "Hardware" },
        { id: 4, name: "Network" },
        { id: 3, name: "Software" },
      ],
    });
  });
});
