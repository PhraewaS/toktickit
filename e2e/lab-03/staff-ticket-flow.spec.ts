import { expect, test } from "@playwright/test";
import { getLab3SeedPassword } from "./credentials.js";

test("E2E-02 IT Staff queue and detail workflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This flow mutates the seeded first-login fixture; responsive coverage is provided by RESP-01.");
  await page.goto("/");
  await page.getByLabel("Email address").fill("mali.staff@example.test");
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Staff-Changed2!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Staff-Changed2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open detail" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Open detail" }).first().click();
  await expect(page.getByRole("heading", { name: /TKT-/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public Comments" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Internal Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attachments" })).toBeVisible();
});
