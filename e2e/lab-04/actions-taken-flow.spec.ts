import { expect, test } from "@playwright/test";
import { resetLab4Seed, signInAndOpenDashboard } from "./fixture.js";

test("E2E-04 Staff create/edit and Requester read-only Actions Taken", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The mutating Actions Taken flow runs once on desktop; responsive coverage is separate.");
  resetLab4Seed();
  await signInAndOpenDashboard(page, "mali.staff@example.test", "Lab4-Staff-Action2!");
  await page.getByRole("link", { name: "Ticket Queue" }).click();
  const vpnRow = page.getByRole("row").filter({ hasText: "Laptop cannot connect to VPN" });
  await expect(vpnRow).toBeVisible();
  await vpnRow.getByRole("button", { name: "Open detail" }).click();
  await expect(page.getByRole("heading", { name: /TKT-/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Actions Taken" })).toBeVisible();

  const actionDescription = `E2E Action ${Date.now()}`;
  await page.getByRole("button", { name: "Add Action Taken" }).click();
  await page.getByLabel(/Action Description/).fill(actionDescription);
  await page.getByLabel(/^Result/).fill("The E2E workflow verified the action write.");
  await page.getByRole("checkbox", { name: "Follow-Up Required?" }).check();
  await page.getByLabel(/Follow-Up Note/).fill("Confirm the VPN connection with the Requester.");
  await page.getByRole("button", { name: "Save Action Taken" }).click();
  await expect(page.getByText(actionDescription)).toBeVisible();
  await expect(page.getByText("Confirm the VPN connection with the Requester.")).toBeVisible();

  await page.getByRole("button", { name: /^Edit Action Taken from/ }).last().click();
  await page.getByLabel(/^Result/).fill("The E2E workflow verified edit and persisted result.");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("The E2E workflow verified edit and persisted result.")).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).click();
  await signInAndOpenDashboard(page, "jennifer@example.test", "Lab4-Requester-Action2!");
  await page.getByRole("link", { name: "My Tickets" }).click();
  await page.getByLabel("Search").fill("Laptop cannot connect to VPN");
  await page.getByRole("button", { name: "Apply filters" }).click();
  const requesterRow = page.getByRole("row").filter({ hasText: "Laptop cannot connect to VPN" });
  await requesterRow.getByRole("button", { name: "View details" }).click();
  await expect(page.getByRole("heading", { name: "Actions Taken" })).toBeVisible();
  await expect(page.getByText(actionDescription)).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Action Taken" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Edit Action Taken/ })).toHaveCount(0);
});
