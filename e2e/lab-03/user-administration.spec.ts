import { expect, test } from "@playwright/test";

test("E2E-03 Administrator sees minimalist User Management", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This flow mutates the seeded first-login fixture; responsive coverage is provided by RESP-01.");
  await page.goto("/");
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.getByLabel("Password").fill("Admin-Change1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Admin-Changed2!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Admin-Changed2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create user" }).first()).toBeVisible();
});
