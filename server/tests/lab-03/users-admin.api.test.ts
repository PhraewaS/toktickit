import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("Administrator User Management API", () => {
  it("protects user listing and creation from non-authenticated callers", async () => {
    const response = await request(app).post("/api/admin/users").send({ name: "Test User" });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });
});
