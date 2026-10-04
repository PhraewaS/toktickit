import { expect, test } from "@playwright/test";
import { resetLab4Seed, signInAndOpenDashboard } from "./fixture.js";

test("E2E-05 Requester Dashboard metrics and active-ticket drill-down", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The Requester drill-down flow runs once on desktop; responsive coverage is separate.");
  resetLab4Seed();
  await signInAndOpenDashboard(page, "jennifer@example.test", "Lab4-Requester-Dashboard2!");
  await expect(page.getByText("Open Tickets")).toBeVisible();
  await expect(page.getByText("Waiting for Requester")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recently Updated Tickets" })).toBeVisible();
  await page.getByRole("article").filter({ hasText: "Open Tickets" }).getByRole("button", { name: "View My Tickets" }).click();
  await expect(page.getByRole("heading", { name: "My Tickets" })).toBeVisible();
  await expect(page.getByLabel("Current Status")).toHaveValue("ACTIVE");
});

test("E2E-06 Staff Dashboard metrics and unassigned-active drill-down", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The Staff drill-down flow runs once on desktop; responsive coverage is separate.");
  resetLab4Seed();
  await signInAndOpenDashboard(page, "mali.staff@example.test", "Lab4-Staff-Dashboard2!");
  await expect(page.getByText("Unassigned Tickets")).toBeVisible();
  await expect(page.getByText("My Active Tickets")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tickets by Status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tickets by IT Priority" })).toBeVisible();
  await page.getByRole("article").filter({ hasText: "Unassigned Tickets" }).getByRole("button", { name: "Open Queue" }).click();
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByLabel("Owner")).toHaveValue("unassigned");
  await expect(page.getByLabel("Activity")).toHaveValue("true");
});
