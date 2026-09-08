import { expect, test } from "@playwright/test";

test("E2E-02 IT Staff queue and detail workflow", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email address").fill("mali.staff@example.test");
  await page.getByLabel("Password").fill("Staff-Change1!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Staff-Changed2!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Staff-Changed2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();
});
