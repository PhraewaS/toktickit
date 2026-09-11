import express, { Request, Response } from "express";
import request from "supertest";
import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { AuthenticatedRequest, requireRole } from "../../src/auth.js";

function policyApp(role: UserRole) {
  const testApp = express();
  const attachRole = (req: Request, _res: Response, next: () => void) => {
    (req as AuthenticatedRequest).authUser = {
      id: 1,
      name: "Policy Test User",
      email: "policy@example.test",
      role,
      isActive: true,
      mustChangePassword: false,
    };
    next();
  };
  testApp.get("/api/admin/users", attachRole, requireRole(UserRole.ADMINISTRATOR), (_req, res) => res.status(200).json({ data: "admin" }));
  testApp.get("/api/staff/tickets", attachRole, requireRole(UserRole.IT_STAFF, UserRole.ADMINISTRATOR), (_req, res) => res.status(200).json({ data: "read-only" }));
  testApp.patch("/api/staff/tickets/1/priority", attachRole, requireRole(UserRole.IT_STAFF, UserRole.ADMINISTRATOR), (_req, res) => res.status(200).json({ data: "priority" }));
  testApp.post("/api/staff/tickets/1/status", attachRole, requireRole(UserRole.IT_STAFF), (_req, res) => res.status(200).json({ data: "mutation" }));
  return testApp;
}

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
  it.each([UserRole.REQUESTER, UserRole.IT_STAFF])("rejects %s from Administrator user routes", async (role) => {
    const response = await request(policyApp(role)).get("/api/admin/users");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("ROLE_FORBIDDEN");
  });

  it("allows Administrator read-only staff visibility but rejects staff mutations", async () => {
    const testApp = policyApp(UserRole.ADMINISTRATOR);
    const read = await request(testApp).get("/api/staff/tickets");
    const mutate = await request(testApp).post("/api/staff/tickets/1/status").send({ status: "OPEN" });
    expect(read.status).toBe(200);
    expect(mutate.status).toBe(403);
    expect(mutate.body.error.code).toBe("ROLE_FORBIDDEN");
  });

  it("allows Administrator to change IT Priority but not status", async () => {
    const testApp = policyApp(UserRole.ADMINISTRATOR);
    const priority = await request(testApp).patch("/api/staff/tickets/1/priority").send({ itPriority: "HIGH" });
    const status = await request(testApp).post("/api/staff/tickets/1/status").send({ status: "OPEN" });
    expect(priority.status).toBe(200);
    expect(status.status).toBe(403);
    expect(status.body.error.code).toBe("ROLE_FORBIDDEN");
  });

  it("allows IT Staff to use the staff mutation policy", async () => {
    const response = await request(policyApp(UserRole.IT_STAFF)).post("/api/staff/tickets/1/status").send({ status: "OPEN" });
    expect(response.status).toBe(200);
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
