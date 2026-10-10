import { expect, test } from "@playwright/test";
import { resetLab4Seed, signInAndOpenDashboard } from "./fixture.js";

test("E2E-07 resolution requires an Action Taken, closes completed work, and cancels a separate Ticket", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The status mutation flow runs once on desktop; responsive coverage is separate.");
  resetLab4Seed();
  await signInAndOpenDashboard(page, "mali.staff@example.test", "Lab4-Staff-Resolve2!");
  await page.getByRole("link", { name: "Ticket Queue" }).click();
  const row = page.getByRole("row").filter({ hasText: "Request for approved software" });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Open detail" }).click();

  const status = page.locator("#staff-status-update");
  await status.selectOption("OPEN");
  await expect(page.locator(".badge--status").first()).toHaveText("OPEN");
  await status.selectOption("IN_PROGRESS");
  await expect(page.locator(".badge--status").first()).toHaveText("IN PROGRESS");
  await status.selectOption("RESOLVED");
  await expect(page.getByRole("alert")).toContainText("Record at least one Action Taken before resolving a Ticket.");
  await expect(page.locator(".badge--status").first()).toHaveText("IN PROGRESS");

  await page.getByRole("button", { name: "Add Action Taken" }).click();
  await page.getByLabel(/Action Description/).fill("Verified the approved software installation path.");
  await page.getByLabel(/^Result/).fill("The requested software installed and launched successfully.");
  await page.getByRole("button", { name: "Save Action Taken" }).click();
  await expect(page.getByText("Verified the approved software installation path.")).toBeVisible();
  await status.selectOption("RESOLVED");
  await expect(page.locator(".badge--status").first()).toHaveText("RESOLVED");
  await status.selectOption("CLOSED");
  await expect(page.locator(".badge--status").first()).toHaveText("CLOSED");

  await page.getByRole("link", { name: "Ticket Queue" }).click();
  const cancellable = page.getByRole("row").filter({ hasText: "Laptop cannot connect to VPN" });
  await cancellable.getByRole("button", { name: "Open detail" }).click();
  await page.locator("#staff-status-update").selectOption("CANCELLED");
  await expect(page.locator(".badge--status").first()).toHaveText("CANCELLED");
});
