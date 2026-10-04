import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { resetLab4Seed, signInAndOpenDashboard } from "./fixture.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function assertResponsive(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return document.documentElement.scrollWidth <= width && Array.from(document.querySelectorAll("button, a, input, select, textarea")).every((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width === 0 || (rect.left >= -1 && rect.right <= width + 1);
    });
  })).toBe(true);
}

async function capture(page: Page, testInfo: TestInfo, filename: string) {
  await assertResponsive(page);
  const target = path.join(repositoryRoot, "artifacts/lab-04/screenshots", `${filename}-${testInfo.project.name}.png`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await page.screenshot({ path: target, fullPage: false });
}

test("RESP-04 Requester Dashboard and Ticket Detail fit the viewport", async ({ page }, testInfo) => {
  resetLab4Seed();
  await signInAndOpenDashboard(page, "jennifer@example.test", "Lab4-Responsive-Requester2!");
  await capture(page, testInfo, "requester-dashboard");
  await page.getByRole("link", { name: "My Tickets" }).click();
  const row = page.getByRole("row").filter({ hasText: "Laptop cannot connect to VPN" });
  await row.getByRole("button", { name: "View details" }).click();
  await expect(page.getByRole("heading", { name: "Actions Taken" })).toBeVisible();
  await capture(page, testInfo, "requester-actions-detail");
});

test("RESP-04 IT Staff Dashboard and Actions Taken editor fit the viewport", async ({ page }, testInfo) => {
  resetLab4Seed();
  await signInAndOpenDashboard(page, "mali.staff@example.test", "Lab4-Responsive-Staff2!");
  await capture(page, testInfo, "staff-dashboard");
  await page.getByRole("link", { name: "Ticket Queue" }).click();
  const row = page.getByRole("row").filter({ hasText: "Laptop cannot connect to VPN" });
  await row.getByRole("button", { name: "Open detail" }).click();
  await expect(page.getByRole("heading", { name: "Actions Taken" })).toBeVisible();
  await page.getByRole("button", { name: "Add Action Taken" }).click();
  await expect(page.getByRole("form", { name: "Create Action Taken" })).toBeVisible();
  await capture(page, testInfo, "staff-actions-editor");
});
