import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("Public Comments and Internal Notes API", () => {
  it("protects internal notes from unauthenticated access", async () => {
    const response = await request(app).get("/api/staff/tickets/42/notes");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
    expect(JSON.stringify(response.body)).not.toContain("internal");
  });
});
