import { expect, test } from "@playwright/test";
import { errorCode, getJson, login, signInAndChangePassword } from "./api-helpers.js";
import { getLab3SeedPassword } from "./credentials.js";
import { resetLocalSeed } from "./fixture.js";

test("E2E-01 login, mandatory first password change, and logout", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This flow mutates the seeded first-login fixture; responsive coverage is provided by RESP-01.");
  resetLocalSeed();
  await page.goto("/");
  await page.getByLabel("Email address").fill("jennifer@example.test");
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Requester-Changed2!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Requester-Changed2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Create Ticket" })).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("heading", { name: "Sign in to TokTickIT" })).toBeVisible();
});

test("E2E-04 authentication rejects invalid, inactive, gated, and revoked access", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "API boundary coverage runs once in the desktop project.");
  resetLocalSeed();
  const seedPassword = getLab3SeedPassword();

  const invalid = await login(request, "jennifer@example.test", "DefinitelyWrong!1");
  expect(invalid.status()).toBe(401);
  expect(await errorCode(invalid)).toBe("AUTHENTICATION_FAILED");

  const inactive = await login(request, "archived@example.test", seedPassword);
  expect(inactive.status()).toBe(401);
  expect(await errorCode(inactive)).toBe("AUTHENTICATION_FAILED");

  const unauthenticated = await getJson(request, "/api/staff/tickets");
  expect(unauthenticated.status()).toBe(401);
  expect(await errorCode(unauthenticated)).toBe("AUTHENTICATION_REQUIRED");

  await signInAndChangePassword(request, "jennifer@example.test", seedPassword, "Requester-E2E-Changed2!");
  const requesterTickets = await getJson(request, "/api/tickets");
  expect(requesterTickets.status()).toBe(200);

  const logout = await request.post(`${process.env.E2E_API_URL ?? "http://127.0.0.1:3000"}/api/auth/logout`);
  expect(logout.status()).toBe(200);
  const afterLogout = await getJson(request, "/api/tickets");
  expect(afterLogout.status()).toBe(401);
  expect(await errorCode(afterLogout)).toBe("AUTHENTICATION_REQUIRED");
});
