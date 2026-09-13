import { expect, test } from "@playwright/test";
import { getLab3SeedPassword } from "./credentials.js";
import { resetLocalSeed } from "./fixture.js";

test("E2E-05 authenticated Requester regression: create, own detail, comment, and resolved indication", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Requester mutation flow runs once in the desktop project; responsive coverage is separate.");
  resetLocalSeed();
  await page.goto("/");
  await page.getByLabel("Email address").fill("jennifer@example.test");
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Requester-Regression2!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Requester-Regression2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByRole("heading", { name: "Create Ticket" })).toBeVisible();

  await page.getByLabel("Category").selectOption({ index: 1 });
  await page.getByLabel("Related System").selectOption({ index: 1 });
  await page.getByLabel("Requested Priority").selectOption("HIGH");
  await page.getByLabel("Ticket Summary").fill("E2E requester regression ticket");
  await page.getByLabel("Description").fill("This ticket verifies the authenticated requester regression flow.");
  await page.getByRole("button", { name: "Submit Ticket" }).click();
  await expect(page.getByText("Ticket created successfully.")).toBeVisible();
  await page.getByRole("button", { name: "My Tickets" }).click();
  await expect(page.getByRole("heading", { name: "My Tickets" })).toBeVisible();
  await page.getByRole("button", { name: "View details" }).first().click();
  await expect(page.getByRole("heading", { name: /TKT-/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public Comments" })).toBeVisible();
  await page.getByLabel("Add Public Comment").fill("Requester regression public comment");
  await page.getByRole("button", { name: "Post Public Comment" }).click();
  await expect(page.getByText("Requester regression public comment")).toBeVisible();
  await page.getByRole("button", { name: "Problem appears resolved" }).click();
  await expect(page.getByRole("button", { name: "Problem marked as appears resolved" })).toBeDisabled();
  await expect(page.getByText(/does not formally resolve or close/i)).toBeVisible();
});
