import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const requesterA = { id: 1, name: "Jennifer Anderson" };
const requesterB = { id: 2, name: "Kanya Srisawat" };
const apiBaseURL = "http://127.0.0.1:3000";

async function chooseRequester(page: Page, requester = requesterA) {
  await page.goto("/");
  const selection = page.locator("#development-requester");
  await expect(selection).toBeVisible();
  await selection.selectOption(String(requester.id));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Create Ticket" })).toBeVisible();
}

async function fillTicket(page: Page, summary: string) {
  await page.getByLabel("Category").selectOption({ label: "Hardware" });
  await page.getByLabel("Related System").selectOption({ label: "Corporate Laptop" });
  await page.getByLabel("Requested Priority").selectOption("HIGH");
  await page.getByLabel("Ticket Summary").fill(summary);
  await page.getByLabel("Description").fill("E2E verification of the requester ticket workflow.");
}

async function createTicket(page: Page, summary = `E2E ticket ${Date.now()}`) {
  await chooseRequester(page);
  await fillTicket(page, summary);
  await page.getByRole("button", { name: "Submit Ticket" }).click();
  await expect(page.getByText("Ticket created successfully.")).toBeVisible();
  return summary;
}

async function createTicketViaApi(request: APIRequestContext, requesterId = requesterA.id) {
  const categories = await request.get(`${apiBaseURL}/api/categories`);
  const systems = await request.get(`${apiBaseURL}/api/related-systems`);
  const categoryId = (await categories.json()).data[0].id as number;
  const relatedSystemId = (await systems.json()).data[0].id as number;
  const summary = `E2E API ticket ${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const response = await request.post(`${apiBaseURL}/api/tickets`, {
    headers: { "X-Development-Requester-Id": String(requesterId) },
    data: {
      submissionKey: randomUUID(),
      categoryId,
      relatedSystemId,
      summary,
      requestedPriority: "MEDIUM",
      description: "Ticket created by the Lab 2 E2E setup.",
    },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).data as { id: number; ticketNumber: string; summary: string };
}

test.describe("Lab 2 requester E2E flows", () => {
  test("E2E-01 Select A, create, find in My Tickets, and open detail", async ({ page }) => {
    const summary = await createTicket(page);
    await page.getByRole("link", { name: "My Tickets" }).click();
    await expect(page.getByRole("heading", { name: "My Tickets" })).toBeVisible();
    await page.getByLabel("Search").fill(summary);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByText(summary)).toBeVisible();
    await page.getByRole("button", { name: "View details" }).click();
    await expect(page.getByRole("heading", { name: /TKT-\d{8}-[A-Z0-9]{8}/ })).toBeVisible();
    await expect(page.getByLabel("Summary")).toHaveValue(summary);
  });

  test("E2E-02 uploads, downloads, soft-removes, and blocks removed download", async ({ page }) => {
    await createTicket(page);
    const file = {
      name: "e2e-proof.png",
      mimeType: "image/png",
      buffer: Buffer.from("E2E attachment bytes"),
    };
    await page.getByLabel("Add attachments").setInputFiles(file);
    await page.getByRole("button", { name: "Confirm add attachments" }).click();
    await expect(page.getByText(file.name)).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(file.name);
    const downloadedBytes = await readFile((await download.path())!);
    expect(downloadedBytes.toString()).toBe("E2E attachment bytes");

    await page.getByRole("button", { name: "Remove" }).click();
    await page.getByLabel(/Removal reason/).fill("E2E replacement");
    await page.getByRole("button", { name: "Confirm removal" }).click();
    await expect(page.getByText("Removed", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download" })).toHaveCount(0);
  });

  test("E2E-03 clears requester A data and blocks direct cross-owner access", async ({ page, request }) => {
    const ticket = await createTicketViaApi(request);
    await chooseRequester(page, requesterA);
    await page.getByRole("link", { name: "My Tickets" }).click();
    await page.getByLabel("Search").fill(ticket.summary);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByText(ticket.summary)).toBeVisible();
    await page.getByRole("button", { name: "Change requester" }).click();
    await chooseRequester(page, requesterB);
    await page.getByRole("link", { name: "My Tickets" }).click();
    await page.getByLabel("Search").fill(ticket.summary);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByText("You do not have any Tickets yet.")).toBeVisible();

    const detail = await request.get(`${apiBaseURL}/api/tickets/${ticket.id}`, { headers: { "X-Development-Requester-Id": String(requesterB.id) } });
    expect(detail.status()).toBe(404);
    const attachments = await request.get(`${apiBaseURL}/api/tickets/${ticket.id}/attachments`, { headers: { "X-Development-Requester-Id": String(requesterB.id) } });
    expect(attachments.status()).toBe(404);
  });

  test("E2E-04 covers validation, API failure, empty, and no-results states", async ({ page }) => {
    await page.route("**/api/tickets*", async (route) => {
      if (route.request().method() === "POST") {
        await route.abort();
        return;
      }
      const hasSearch = new URL(route.request().url()).searchParams.has("search");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 10, totalItems: 0, totalOwnedItems: hasSearch ? 2 : 0, totalPages: 0 },
        }),
      });
    });
    await chooseRequester(page);
    await page.getByRole("link", { name: "My Tickets" }).click();
    await expect(page.getByText("You do not have any Tickets yet.")).toBeVisible();
    await page.getByRole("button", { name: "Create Ticket" }).first().click();
    await page.getByRole("button", { name: "Submit Ticket" }).click();
    await expect(page.getByText("Select a Category.")).toBeVisible();
    await fillTicket(page, `Failure ticket ${Date.now()}`);
    await page.getByRole("button", { name: "Submit Ticket" }).click();
    await expect(page.getByText("Ticket was not created.")).toBeVisible();
    await page.getByRole("link", { name: "My Tickets" }).click();
    await page.getByLabel("Search").fill("does-not-exist");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByText("No Tickets match these filters.")).toBeVisible();
  });
});

test.describe("RESP-01 responsive visual evidence", () => {
  test("required screens fit the viewport and produce evidence screenshots", async ({ page, request }, testInfo) => {
    const ticket = await createTicketViaApi(request);
    await chooseRequester(page);
    const screenshotRoot = path.resolve("artifacts/lab-02/screenshots");
    await mkdir(path.join(screenshotRoot, testInfo.project.name), { recursive: true });
    await page.screenshot({ path: path.join(screenshotRoot, testInfo.project.name, "create-ticket.png"), fullPage: true });
    await page.getByRole("link", { name: "My Tickets" }).click();
    await expect(page.getByRole("heading", { name: "My Tickets" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: path.join(screenshotRoot, testInfo.project.name, "my-tickets.png"), fullPage: true });
    await page.getByLabel("Search").fill(ticket.summary);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.getByRole("button", { name: "View details" }).click();
    await expect(page.getByRole("heading", { name: ticket.ticketNumber })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: path.join(screenshotRoot, testInfo.project.name, "ticket-detail.png"), fullPage: true });
  });
});
