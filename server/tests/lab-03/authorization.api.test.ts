import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("Lab 3 backend authorization boundary", () => {
  it("does not expose the staff queue without authentication", async () => {
    const response = await request(app).get("/api/staff/tickets");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });
  it("does not expose user administration without authentication", async () => {
    const response = await request(app).get("/api/admin/users");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });
});
