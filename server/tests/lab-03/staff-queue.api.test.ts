import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("IT Staff Ticket Queue API", () => {
  it("protects queue search and pagination behind a session", async () => {
    const response = await request(app).get("/api/staff/tickets?search=vpn&page=1&pageSize=10");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });
});
