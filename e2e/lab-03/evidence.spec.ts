import { expect, test, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLab3SeedPassword } from "./credentials.js";
import { resetLocalSeed } from "./fixture.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

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
  await expect.poll(() => page.evaluate(() => {
    const viewport = window.innerWidth;
    return document.documentElement.scrollWidth <= viewport && Array.from(document.querySelectorAll("button, a, input, select, textarea")).every((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= viewport + 1;
    });
  })).toBe(true);
  const root = path.join(repositoryRoot, "artifacts/lab-03/screenshots");
  fs.mkdirSync(path.dirname(path.join(root, filename)), { recursive: true });
  await page.screenshot({ path: path.join(root, filename), fullPage: true });
}

test("EVIDENCE-00 Login and Change Password screenshots", async ({ page }, testInfo) => {
  resetLocalSeed();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in to TokTickIT" })).toBeVisible();
  await capture(page, testInfo, `authentication/login-${testInfo.project.name}.png`);
  await page.getByLabel("Email address").fill("jennifer@example.test");
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await capture(page, testInfo, `authentication/change-password-${testInfo.project.name}.png`);
});

test("EVIDENCE-01 Staff Queue screenshot", async ({ page }, testInfo) => {
  resetLocalSeed();
  await signInAndChangePassword(page, "somchai.staff@example.test", "Evidence-Staff-Queue2!");
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open detail" }).first()).toBeVisible();
  await capture(page, testInfo, `staff-queue/staff-queue-${testInfo.project.name}.png`);
});

test("EVIDENCE-02 Staff Ticket Detail screenshot", async ({ page }, testInfo) => {
  resetLocalSeed();
  await signInAndChangePassword(page, "somchai.staff@example.test", "Evidence-Staff-Detail2!");
  await page.getByRole("heading", { name: "Ticket Queue" }).waitFor();
  await page.getByRole("button", { name: "Open detail" }).first().click();
  await expect(page.getByRole("heading", { name: /TKT-/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attachments" })).toBeVisible();
  await capture(page, testInfo, `staff-ticket-detail/staff-ticket-detail-${testInfo.project.name}.png`);
});

test("EVIDENCE-03 Administrator User Management screenshot", async ({ page }, testInfo) => {
  resetLocalSeed();
  await signInAndChangePassword(page, "admin@example.test", "Evidence-Admin-Users2!");
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create user" }).first()).toBeVisible();
  await expect(page.getByText("admin@example.test")).toBeVisible();
  await capture(page, testInfo, `user-management/user-management-${testInfo.project.name}.png`);
});
