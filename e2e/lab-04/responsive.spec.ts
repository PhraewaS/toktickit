import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
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

async function capture(page: Page, testInfo: TestInfo, filename: string, focus?: Locator) {
  await assertResponsive(page);
  const target = path.join(repositoryRoot, "artifacts/lab-04/screenshots", `${filename}-${testInfo.project.name}.png`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (focus) await focus.screenshot({ path: target });
  else await page.screenshot({ path: target, fullPage: false });
}

async function tabToAndVerifyFocus(page: Page, target: Locator, description: string) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  for (let index = 0; index < 40; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) {
      await expect(target, `${description} receives keyboard focus`).toBeFocused();
      expect(await target.evaluate((element) => element.matches(":focus-visible")), `${description} exposes visible keyboard focus`).toBe(true);
      return;
    }
  }
  throw new Error(`Could not reach ${description} with Tab within 40 focusable elements.`);
}

function watchBrowserErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const unexpectedResponses: string[] = [];
  let expectedUnauthenticatedProbes = 0;
  page.on("console", (message) => {
    if (message.type() === "error" && !/failed to load resource:.*401 \(unauthorized\)/i.test(message.text())) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const url = new URL(response.url());
    if (response.status() === 401 && response.request().method() === "GET" && url.pathname === "/api/auth/me") {
      expectedUnauthenticatedProbes += 1;
      return;
    }
    unexpectedResponses.push(`${response.request().method()} ${url.pathname} returned ${response.status()}`);
  });
  return () => {
    expect(consoleErrors, "unexpected browser console errors").toEqual([]);
    expect(pageErrors, "uncaught browser page errors").toEqual([]);
    expect(unexpectedResponses, "unexpected failed HTTP responses").toEqual([]);
    console.log(`BROWSER-SCAN ${JSON.stringify({ expectedUnauthenticatedAuthMe401: expectedUnauthenticatedProbes, unexpectedHttpFailures: 0, pageErrors: 0 })}`);
  };
}

test("RESP-04 Requester Dashboard and Ticket Detail fit the viewport", async ({ page }, testInfo) => {
  const assertNoBrowserErrors = watchBrowserErrors(page);
  resetLab4Seed();
  await signInAndOpenDashboard(page, "jennifer@example.test", "Lab4-Responsive-Requester2!");
  await capture(page, testInfo, "requester-dashboard");
  const openTicketsCard = page.getByRole("article").filter({ hasText: "Open Tickets" });
  const requesterDrillDown = openTicketsCard.getByRole("button", { name: "View My Tickets" });
  await tabToAndVerifyFocus(page, requesterDrillDown, "Requester Dashboard View My Tickets control");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "My Tickets" })).toBeVisible();
  await expect(page.getByLabel("Current Status")).toHaveValue("ACTIVE");
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "My Tickets" }).click();
  const row = page.getByRole("row").filter({ hasText: "Laptop cannot connect to VPN" });
  await row.getByRole("button", { name: "View details" }).click();
  await expect(page.getByRole("heading", { name: "Actions Taken" })).toBeVisible();
  await capture(page, testInfo, "requester-actions-detail");
  assertNoBrowserErrors();
});

test("RESP-04 IT Staff Dashboard and Actions Taken editor fit the viewport", async ({ page }, testInfo) => {
  const assertNoBrowserErrors = watchBrowserErrors(page);
  resetLab4Seed();
  await signInAndOpenDashboard(page, "mali.staff@example.test", "Lab4-Responsive-Staff2!");
  await capture(page, testInfo, "staff-dashboard");
  const unassignedCard = page.getByRole("article").filter({ hasText: "Unassigned Tickets" });
  const staffDrillDown = unassignedCard.getByRole("button", { name: "Open Queue" });
  await tabToAndVerifyFocus(page, staffDrillDown, "Staff Dashboard Open Queue control");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByLabel("Owner")).toHaveValue("unassigned");
  await expect(page.getByLabel("Activity")).toHaveValue("true");
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Ticket Queue" }).click();
  const row = page.getByRole("row").filter({ hasText: "Laptop cannot connect to VPN" });
  await row.getByRole("button", { name: "Open detail" }).click();
  await expect(page.getByRole("heading", { name: "Actions Taken" })).toBeVisible();
  const addAction = page.getByRole("button", { name: "Add Action Taken" });
  await tabToAndVerifyFocus(page, addAction, "Actions Taken Add Action Taken control");
  await page.keyboard.press("Enter");
  const editor = page.getByRole("form", { name: "Create Action Taken" });
  await expect(editor).toBeVisible();
  const followUpRequired = editor.getByLabel("Follow-Up Required?");
  await tabToAndVerifyFocus(page, followUpRequired, "Actions Taken Follow-Up Required checkbox");
  await page.keyboard.press("Space");
  const followUpNote = editor.getByLabel(/Follow-Up Note/);
  await expect(followUpNote).toBeVisible();
  await tabToAndVerifyFocus(page, followUpNote, "Actions Taken Follow-Up Note field");
  await followUpNote.fill("Confirm the Requester can access the VPN after the policy refresh.");
  const saveAction = editor.getByRole("button", { name: "Save Action Taken" });
  await tabToAndVerifyFocus(page, saveAction, "Actions Taken Save Action Taken button");
  await capture(page, testInfo, "staff-actions-editor", editor);
  assertNoBrowserErrors();
});
