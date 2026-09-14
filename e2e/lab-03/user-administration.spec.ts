import { expect, test, request as playwrightRequest } from "@playwright/test";
import { getLab3SeedPassword } from "./credentials.js";
import { resetLocalSeed } from "./fixture.js";
import { errorCode, getJson, postJson, signInAndChangePassword } from "./api-helpers.js";

test("E2E-03 Administrator sees minimalist User Management", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This flow mutates the seeded first-login fixture; responsive coverage is provided by RESP-01.");
  resetLocalSeed();
  await page.goto("/");
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Admin-Changed2!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Admin-Changed2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create user" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Create user" }).first().click();
  await expect(page.getByRole("heading", { name: "Create user" })).toBeVisible();
  await expect(page.getByLabel("Initial password")).toBeVisible();
});

test("E2E-07 Administrator user lifecycle and safety rules use production API routes", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "API workflow coverage runs once in the desktop project.");
  resetLocalSeed();
  const apiBase = process.env.E2E_API_URL ?? "http://127.0.0.1:3000";
  const seedPassword = getLab3SeedPassword();
  await signInAndChangePassword(request, "admin@example.test", seedPassword, "Admin-API-Changed2!");

  const list = await getJson(request, "/api/admin/users");
  expect(list.status()).toBe(200);
  const uniqueEmail = `e2e-user-${Date.now()}@example.test`;
  const created = await postJson(request, "/api/admin/users", { name: "E2E Managed User", email: uniqueEmail, role: "REQUESTER", isActive: true, initialPassword: "Managed-Initial2!" });
  expect(created.status()).toBe(201);
  const createdBody = await created.json() as { data: { user: { id: number; email: string; mustChangePassword: boolean } } };
  expect(createdBody.data.user.email).toBe(uniqueEmail);
  expect(createdBody.data.user.mustChangePassword).toBe(true);
  expect(JSON.stringify(createdBody)).not.toContain("Managed-Initial2!");
  expect(JSON.stringify(createdBody)).not.toContain("passwordHash");

  const malformed = await request.patch(`${apiBase}/api/admin/users/${createdBody.data.user.id}`, { data: { isActive: "false" } });
  expect(malformed.status()).toBe(400);
  expect(await errorCode(malformed)).toBe("VALIDATION_ERROR");
  const duplicate = await request.patch(`${apiBase}/api/admin/users/${createdBody.data.user.id}`, { data: { email: "admin@example.test" } });
  expect(duplicate.status()).toBe(409);
  expect(await errorCode(duplicate)).toBe("DUPLICATE_EMAIL");

  const edited = await request.patch(`${apiBase}/api/admin/users/${createdBody.data.user.id}`, { data: { name: "E2E Managed User Updated" } });
  expect(edited.status()).toBe(200);
  const reset = await request.post(`${apiBase}/api/admin/users/${createdBody.data.user.id}/initial-password`, { data: { initialPassword: "Managed-Reset2!" } });
  expect(reset.status()).toBe(200);
  const resetBody = await reset.json() as { data: { user: { mustChangePassword: boolean } } };
  expect(resetBody.data.user.mustChangePassword).toBe(true);
  expect(JSON.stringify(resetBody)).not.toContain("Managed-Reset2!");
  expect(JSON.stringify(resetBody)).not.toContain("passwordHash");

  const managedUser = await playwrightRequest.newContext();
  try {
    await signInAndChangePassword(managedUser, uniqueEmail, "Managed-Reset2!", "Managed-Final2!");
    const oldSession = await managedUser.get(`${apiBase}/api/auth/me`);
    expect(oldSession.status()).toBe(200);
    const deactivate = await request.patch(`${apiBase}/api/admin/users/${createdBody.data.user.id}`, { data: { isActive: false } });
    expect(deactivate.status()).toBe(200);
    const revoked = await managedUser.get(`${apiBase}/api/auth/me`);
    expect(revoked.status()).toBe(401);
    expect(await errorCode(revoked)).toBe("SESSION_INVALID");
  } finally {
    await managedUser.dispose();
  }

  const requester = await playwrightRequest.newContext();
  try {
    await signInAndChangePassword(requester, "jennifer@example.test", seedPassword, "Requester-AdminBoundary2!");
    const forbidden = await getJson(requester, "/api/admin/users");
    expect(forbidden.status()).toBe(403);
    expect(await errorCode(forbidden)).toBe("ROLE_FORBIDDEN");
  } finally {
    await requester.dispose();
  }

  const me = await getJson(request, "/api/auth/me");
  const meBody = await me.json() as { data: { user: { id: number } } };
  const selfDeactivate = await request.patch(`${apiBase}/api/admin/users/${meBody.data.user.id}`, { data: { isActive: false } });
  expect(selfDeactivate.status()).toBe(409);
  expect(await errorCode(selfDeactivate)).toBe("USER_UPDATE_CONFLICT");
});
