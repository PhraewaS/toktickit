import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@prisma/client";

const prismaMocks = vi.hoisted(() => ({
  sessionFindUnique: vi.fn(),
  sessionDeleteMany: vi.fn(),
  userFindMany: vi.fn(),
  userFindFirst: vi.fn(),
  userFindUnique: vi.fn(),
  userCount: vi.fn(),
  userCreate: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    session: {
      findUnique: prismaMocks.sessionFindUnique,
      deleteMany: prismaMocks.sessionDeleteMany,
    },
    requesterUser: {
      findMany: prismaMocks.userFindMany,
      findFirst: prismaMocks.userFindFirst,
      findUnique: prismaMocks.userFindUnique,
      count: prismaMocks.userCount,
      create: prismaMocks.userCreate,
      update: prismaMocks.userUpdate,
    },
  }),
}));

import { app } from "../../src/app.js";

const password = "InitialPassword1!";
const admin = { id: 1, name: "Admin", email: "admin@example.test", role: UserRole.ADMINISTRATOR as UserRole, isActive: true, mustChangePassword: false };
const requester = { id: 2, name: "Requester", email: "requester@example.test", role: UserRole.REQUESTER as UserRole, isActive: true, mustChangePassword: true };

function authenticate(user = admin) {
  prismaMocks.sessionFindUnique.mockResolvedValue({
    expiresAt: new Date(Date.now() + 60_000),
    user,
  });
  return "toktickit_session=admin-session";
}

describe("Administrator User Management API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.userFindMany.mockResolvedValue([admin, requester]);
    prismaMocks.userFindFirst.mockResolvedValue(null);
    prismaMocks.userFindUnique.mockResolvedValue(requester);
    prismaMocks.userCount.mockResolvedValue(2);
    prismaMocks.userCreate.mockResolvedValue({ ...requester, id: 3, mustChangePassword: true });
    prismaMocks.userUpdate.mockResolvedValue(requester);
    prismaMocks.sessionDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("rejects unauthenticated access and non-Administrators", async () => {
    const unauthenticated = await request(app).get("/api/admin/users");
    expect(unauthenticated.status).toBe(401);
    expect(unauthenticated.body.error.code).toBe("AUTHENTICATION_REQUIRED");

    const staff = await request(app).get("/api/admin/users").set("Cookie", authenticate({ ...admin, id: 7, role: UserRole.IT_STAFF }));
    expect(staff.status).toBe(403);
    expect(staff.body.error.code).toBe("ROLE_FORBIDDEN");
  });

  it("lists users with search and role filters without exposing password fields", async () => {
    const response = await request(app).get("/api/admin/users?search=requester&role=REQUESTER").set("Cookie", authenticate());
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).not.toHaveProperty("passwordHash");
    expect(prismaMocks.userFindMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: [{ name: "asc" }, { id: "asc" }] }));
  });

  it.each(["unknown=value", "role=INVALID", "search=a&search=b"]) ("rejects invalid user query: %s", async (query) => {
    const response = await request(app).get(`/api/admin/users?${query}`).set("Cookie", authenticate());
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });

  it("creates a user with a must-change-password gate without returning the initial password", async () => {
    const response = await request(app).post("/api/admin/users").set("Cookie", authenticate()).send({
      name: "New Requester",
      email: "new.requester@example.test",
      role: UserRole.REQUESTER,
      isActive: true,
      initialPassword: password,
    });
    expect(response.status).toBe(201);
    expect(response.body.data.user).not.toHaveProperty("initialPassword");
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
    expect(prismaMocks.userCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ mustChangePassword: true }) }));
  });

  it("separates malformed input, duplicate email, and state conflicts", async () => {
    const invalid = await request(app).patch("/api/admin/users/2").set("Cookie", authenticate()).send({ email: "not-an-email" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");

    prismaMocks.userFindUnique.mockResolvedValue(requester);
    prismaMocks.userFindFirst.mockResolvedValue({ id: 9 });
    const duplicate = await request(app).patch("/api/admin/users/2").set("Cookie", authenticate()).send({ email: "taken@example.test" });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("DUPLICATE_EMAIL");

    prismaMocks.userFindFirst.mockResolvedValue(null);
    prismaMocks.userUpdate.mockResolvedValue({ ...requester, isActive: false });
    prismaMocks.sessionFindUnique.mockReset();
    prismaMocks.sessionFindUnique
      .mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 60_000), user: admin })
      .mockResolvedValueOnce(null);
    const deactivated = await request(app).patch("/api/admin/users/2").set("Cookie", "toktickit_session=admin-session").send({ isActive: false });
    expect(deactivated.status).toBe(200);
    expect(prismaMocks.sessionDeleteMany).toHaveBeenCalledWith({ where: { userId: 2 } });

    const oldSession = await request(app).get("/api/auth/me").set("Cookie", "toktickit_session=target-session");
    expect(oldSession.status).toBe(401);
    expect(oldSession.body.error.code).toBe("SESSION_INVALID");
  });

  it("rejects self-deactivation and removal of the last active Administrator", async () => {
    prismaMocks.userFindUnique.mockResolvedValue(admin);
    prismaMocks.userCount.mockResolvedValue(1);
    const self = await request(app).patch("/api/admin/users/1").set("Cookie", authenticate()).send({ isActive: false });
    expect(self.status).toBe(409);
    expect(self.body.error.code).toBe("USER_UPDATE_CONFLICT");

    prismaMocks.userFindUnique.mockResolvedValue({ ...admin, id: 9 });
    const lastAdmin = await request(app).patch("/api/admin/users/9").set("Cookie", authenticate()).send({ isActive: false });
    expect(lastAdmin.status).toBe(409);
    expect(lastAdmin.body.error.code).toBe("USER_UPDATE_CONFLICT");
  });

  it("resets an initial password, sets the first-login gate, and revokes sessions", async () => {
    prismaMocks.userFindUnique.mockResolvedValue({ id: 2 });
    prismaMocks.userUpdate.mockResolvedValue({ ...requester, mustChangePassword: true });
    prismaMocks.sessionFindUnique.mockReset();
    prismaMocks.sessionFindUnique
      .mockResolvedValueOnce({ expiresAt: new Date(Date.now() + 60_000), user: admin })
      .mockResolvedValueOnce(null);
    const response = await request(app).post("/api/admin/users/2/initial-password").set("Cookie", "toktickit_session=admin-session").send({ initialPassword: password });
    expect(response.status).toBe(200);
    expect(response.body.data.user.mustChangePassword).toBe(true);
    expect(response.body.data.user).not.toHaveProperty("initialPassword");
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
    expect(prismaMocks.sessionDeleteMany).toHaveBeenCalledWith({ where: { userId: 2 } });

    const oldSession = await request(app).get("/api/auth/me").set("Cookie", "toktickit_session=target-session");
    expect(oldSession.status).toBe(401);
    expect(oldSession.body.error.code).toBe("SESSION_INVALID");
  });

  it("rejects invalid initial passwords and missing users safely", async () => {
    const invalid = await request(app).post("/api/admin/users/2/initial-password").set("Cookie", authenticate()).send({ initialPassword: "weak" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");

    prismaMocks.userFindUnique.mockResolvedValue(null);
    const missing = await request(app).post("/api/admin/users/999/initial-password").set("Cookie", authenticate()).send({ initialPassword: password });
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("USER_NOT_FOUND");
  });
});
