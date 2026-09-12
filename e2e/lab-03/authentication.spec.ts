import { expect, test } from "@playwright/test";
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
