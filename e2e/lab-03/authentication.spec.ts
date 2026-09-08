import { expect, test } from "@playwright/test";

test("E2E-01 login, mandatory first password change, and logout", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email address").fill("jennifer@example.test");
  await page.getByLabel("Password").fill("Requester-Change1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password").fill("Requester-Changed2!");
  await page.getByLabel("Confirm new password").fill("Requester-Changed2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByRole("heading", { name: "Create Ticket" })).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("heading", { name: "Sign in to TokTickIT" })).toBeVisible();
});
