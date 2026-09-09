import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("Lab 3 backend authorization boundary", () => {
  it("does not expose requester tickets without authentication", async () => {
    const previousMode = process.env.LAB2_COMPATIBILITY_MODE;
    process.env.LAB2_COMPATIBILITY_MODE = "false";
    try {
      const response = await request(app).get("/api/tickets");
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
    } finally {
      process.env.LAB2_COMPATIBILITY_MODE = previousMode;
    }
  });

  it("does not accept the Lab 2 requester header when compatibility mode is disabled", async () => {
    const previousMode = process.env.LAB2_COMPATIBILITY_MODE;
    process.env.LAB2_COMPATIBILITY_MODE = "false";
    try {
      const response = await request(app)
        .get("/api/tickets")
        .set("X-Development-Requester-Id", "1");
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
    } finally {
      process.env.LAB2_COMPATIBILITY_MODE = previousMode;
    }
  });

  it("retires the Development Requester selector outside compatibility tooling", async () => {
    const previousMode = process.env.LAB2_COMPATIBILITY_MODE;
    process.env.LAB2_COMPATIBILITY_MODE = "false";
    try {
      const response = await request(app).get("/api/development-requesters");
      expect(response.status).toBe(410);
      expect(response.body.error.code).toBe("DEVELOPMENT_REQUESTERS_RETIRED");
    } finally {
      process.env.LAB2_COMPATIBILITY_MODE = previousMode;
    }
  });
});
