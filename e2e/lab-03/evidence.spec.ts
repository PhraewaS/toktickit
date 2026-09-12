import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { getLab3SeedPassword } from "./credentials.js";
import { resetLocalSeed } from "./fixture.js";

async function signInAndChangePassword(page: Page, email: string, changedPassword: string) {
  await page.goto("/");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill(changedPassword);
  await page.getByLabel("Confirm new password", { exact: true }).fill(changedPassword);
  await page.getByRole("button", { name: "Save password" }).click();
  await page.reload();
}

async function capture(page: Page, testInfo: TestInfo, filename: string) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath(filename), fullPage: true });
}

test("EVIDENCE-01 Staff Queue screenshot", async ({ page }, testInfo) => {
  resetLocalSeed();
  await signInAndChangePassword(page, "somchai.staff@example.test", "Evidence-Staff-Queue2!");
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();
  await capture(page, testInfo, "staff-queue.png");
});

test("EVIDENCE-02 Staff Ticket Detail screenshot", async ({ page }, testInfo) => {
  resetLocalSeed();
  await signInAndChangePassword(page, "somchai.staff@example.test", "Evidence-Staff-Detail2!");
  await page.getByRole("heading", { name: "Ticket Queue" }).waitFor();
  await page.getByRole("button", { name: "Open detail" }).first().click();
  await expect(page.getByRole("heading", { name: /TKT-/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attachments" })).toBeVisible();
  await capture(page, testInfo, "staff-ticket-detail.png");
});

test("EVIDENCE-03 Administrator User Management screenshot", async ({ page }, testInfo) => {
  resetLocalSeed();
  await signInAndChangePassword(page, "admin@example.test", "Evidence-Admin-Users2!");
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create user" }).first()).toBeVisible();
  await capture(page, testInfo, "user-management.png");
});
