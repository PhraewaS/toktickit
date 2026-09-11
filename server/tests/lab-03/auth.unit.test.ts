import express from "express";
import request from "supertest";
import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { AuthenticatedRequest, hashPassword, requireRole, validatePassword, verifyPassword } from "../../src/auth.js";

describe("Lab 3 authentication primitives", () => {
  it("hashes and verifies passwords without storing plaintext", () => {
    const password = "Correct-Horse1!";
    const encoded = hashPassword(password, "test-salt");
    expect(encoded).toContain("scrypt$test-salt$");
    expect(encoded).not.toContain(password);
    expect(verifyPassword(password, encoded)).toBe(true);
    expect(verifyPassword("wrong-password", encoded)).toBe(false);
  });
  it("enforces the documented password boundaries", () => {
    expect(validatePassword("short")).toMatch(/12 and 128/);
    expect(validatePassword("alllowercase123")).toMatch(/upper-case/);
    expect(validatePassword("Correct-Horse1!")).toBeUndefined();
  });

  it("rejects a user whose role is not allowed by the route policy", async () => {
    const roleApp = express();
    roleApp.get(
      "/protected",
      (req, _res, next) => {
        (req as AuthenticatedRequest).authUser = {
          id: 1,
          name: "Requester",
          email: "requester@example.test",
          role: UserRole.REQUESTER,
          isActive: true,
          mustChangePassword: false,
        };
        next();
      },
      requireRole(UserRole.IT_STAFF),
      (_req, res) => res.status(200).json({ ok: true }),
    );

    const response = await request(roleApp).get("/protected");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("ROLE_FORBIDDEN");
  });
});
