import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({ sessionFindUnique: vi.fn() }));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    session: { findUnique: prismaMocks.sessionFindUnique },
  }),
}));

import { app } from "../../src/app.js";

describe("Lab 3 authentication API", () => {
  it("rejects incomplete credentials with safe validation", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: "", password: "" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });
  it("requires a session for current-user access", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("rejects an expired or invalid session distinctly", async () => {
    prismaMocks.sessionFindUnique.mockResolvedValue(null);
    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "toktickit_session=invalid-session-token");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("SESSION_INVALID");
  });

  it("rejects an invalid session on protected staff routes", async () => {
    prismaMocks.sessionFindUnique.mockResolvedValue(null);
    const response = await request(app)
      .get("/api/staff/tickets")
      .set("Cookie", "toktickit_session=invalid-session-token");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("SESSION_INVALID");
  });

  it("supports the browser credentialed CORS contract for the local client", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST");
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("does not grant CORS permission to an unlisted origin", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "http://evil.example.test")
      .set("Access-Control-Request-Method", "POST");
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    expect(response.headers["access-control-allow-credentials"]).toBeUndefined();
  });
});
