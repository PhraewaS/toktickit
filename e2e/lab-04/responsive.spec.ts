import { expect, test, type Page } from "@playwright/test";
import { getLab3SeedPassword } from "../lab-03/credentials.js";

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

test("RESP-04 Lab 4 dashboard and Actions Taken surfaces remain within the viewport", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByLabel("Email address").fill("mali.staff@example.test");
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await assertResponsive(page);
  await page.screenshot({ path: testInfo.outputPath("staff-dashboard.png"), fullPage: true });
  await page.getByRole("link", { name: "Ticket Queue" }).click();
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await assertResponsive(page);
});
