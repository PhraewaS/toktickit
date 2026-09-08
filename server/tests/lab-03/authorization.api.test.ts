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
  testApp.post("/api/staff/tickets/1/status", attachRole, requireRole(UserRole.IT_STAFF), (_req, res) => res.status(200).json({ data: "mutation" }));
  return testApp;
}

describe("Lab 3 backend authorization boundary", () => {
  it("does not expose the staff queue without authentication", async () => {
    const response = await request(app).get("/api/staff/tickets");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
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

  it("allows IT Staff to use the staff mutation policy", async () => {
    const response = await request(policyApp(UserRole.IT_STAFF)).post("/api/staff/tickets/1/status").send({ status: "OPEN" });
    expect(response.status).toBe(200);
  });
});
