import { randomBytes } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import { app } from "../../src/app.js";
import { hashPassword, sessionTokenHashForTests } from "../../src/auth.js";
import { getPrisma } from "../../src/prisma.js";

const databaseAvailable = Boolean(process.env.DATABASE_URL);
const testPassword = "Integration-Test1!";
const testEmail = `lab3-auth-${process.pid}-${randomBytes(4).toString("hex")}@example.test`;
let testUserId: number;

describe.skipIf(!databaseAvailable)("Lab 3 authentication PostgreSQL integration", () => {
  beforeAll(async () => {
    const user = await getPrisma().requesterUser.create({
      data: {
        name: "Lab 3 Integration User",
        email: testEmail,
        isActive: true,
        role: UserRole.REQUESTER,
        passwordHash: hashPassword(testPassword),
        mustChangePassword: true,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await getPrisma().session.deleteMany({ where: { userId: testUserId } });
      await getPrisma().requesterUser.delete({ where: { id: testUserId } });
    }
    await getPrisma().$disconnect();
  });

  it("creates a session and enforces the first-login gate", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    expect(login.status).toBe(200);
    expect(login.body.data.user.mustChangePassword).toBe(true);
    const cookie = login.headers["set-cookie"][0].split(";")[0];

    const me = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(me.status).toBe(200);
    const protectedRoute = await request(app).get("/api/tickets").set("Cookie", cookie);
    expect(protectedRoute.status).toBe(403);
    expect(protectedRoute.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
  });

  it("invalidates the session when logout is called during the first-login gate", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    const cookie = login.headers["set-cookie"][0].split(";")[0];
    const logout = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(logout.status).toBe(200);
    const afterLogout = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(afterLogout.status).toBe(401);
  });

  it("rejects an inactive user on the next request", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    const cookie = login.headers["set-cookie"][0].split(";")[0];
    await getPrisma().requesterUser.update({ where: { id: testUserId }, data: { isActive: false } });
    try {
      const response = await request(app).get("/api/auth/me").set("Cookie", cookie);
      expect(response.status).toBe(401);
    } finally {
      await getPrisma().requesterUser.update({ where: { id: testUserId }, data: { isActive: true } });
    }
  });

  it("rejects an expired session", async () => {
    const token = randomBytes(32).toString("base64url");
    await getPrisma().session.create({
      data: {
        tokenHash: sessionTokenHashForTests(token),
        userId: testUserId,
        expiresAt: new Date(Date.now() - 1_000),
      },
    });
    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `toktickit_session=${encodeURIComponent(token)}`);
    expect(response.status).toBe(401);
  });
});
