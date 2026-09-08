import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("IT Staff Ticket Detail API", () => {
  it("protects assignment, priority, and status operations", async () => {
    const response = await request(app).patch("/api/staff/tickets/42/status").send({ status: "RESOLVED" });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });
});
