import { expect, test, type Page } from "@playwright/test";
import { getLab3SeedPassword } from "./credentials.js";
import { resetLocalSeed } from "./fixture.js";

async function assertResponsive(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const viewport = window.innerWidth;
    const overflowFree = document.documentElement.scrollWidth <= viewport;
    const controlsFit = Array.from(document.querySelectorAll("button, a, input, select, textarea")).every((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= viewport + 1;
    });
    return overflowFree && controlsFit;
  })).toBe(true);
}

async function signInAndChangePassword(page: Page, email: string, changedPassword: string) {
  await page.goto("/");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill(changedPassword);
  await page.getByLabel("Confirm new password", { exact: true }).fill(changedPassword);
  await page.getByRole("button", { name: "Save password" }).click();
}

test("RESP-01 Lab 3 login remains within the viewport", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in to TokTickIT" })).toBeVisible();
  await assertResponsive(page);
  await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: true });
});

test("RESP-02 all major role screens remain usable without clipping", async ({ page }) => {
  resetLocalSeed();
  await signInAndChangePassword(page, "jennifer@example.test", "Responsive-Requester2!");
  await expect(page.getByRole("heading", { name: "Create Ticket" })).toBeVisible();
  await assertResponsive(page);
  await page.getByRole("link", { name: "My Tickets" }).click();
  await expect(page.getByRole("heading", { name: "My Tickets" })).toBeVisible();
  await assertResponsive(page);

  await page.context().clearCookies();
  resetLocalSeed();
  await signInAndChangePassword(page, "somchai.staff@example.test", "Responsive-Staff2!");
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await assertResponsive(page);
  await page.getByRole("button", { name: "Open detail" }).first().click();
  await expect(page.getByRole("heading", { name: /TKT-/ })).toBeVisible();
  await assertResponsive(page);

  await page.context().clearCookies();
  resetLocalSeed();
  await signInAndChangePassword(page, "admin@example.test", "Responsive-Admin2!");
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await assertResponsive(page);
  await page.getByRole("link", { name: "Ticket Queue" }).click();
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await assertResponsive(page);
});
