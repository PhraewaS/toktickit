import { expect, test, request as playwrightRequest } from "@playwright/test";
import { getLab3SeedPassword } from "./credentials.js";
import { resetLocalSeed } from "./fixture.js";
import { errorCode, getJson, postJson, signInAndChangePassword } from "./api-helpers.js";

test("E2E-02 IT Staff queue and detail workflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This flow mutates the seeded first-login fixture; responsive coverage is provided by RESP-01.");
  resetLocalSeed();
  await page.goto("/");
  await page.getByLabel("Email address").fill("mali.staff@example.test");
  await page.getByLabel("Password").fill(getLab3SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Staff-Changed2!");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Staff-Changed2!");
  await page.getByRole("button", { name: "Save password" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open detail" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Open detail" }).first().click();
  await expect(page.getByRole("heading", { name: /TKT-/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public Comments" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Internal Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attachments" })).toBeVisible();
});

test("E2E-06 IT Staff queue query and ticket operations use production API routes", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "API workflow coverage runs once in the desktop project.");
  resetLocalSeed();
  const seedPassword = getLab3SeedPassword();
  await signInAndChangePassword(request, "mali.staff@example.test", seedPassword, "Staff-API-Changed2!");

  const queue = await getJson(request, "/api/staff/tickets?page=1&pageSize=10&sortBy=updatedAt&sortOrder=desc");
  expect(queue.status()).toBe(200);
  const queueBody = await queue.json() as { data: { items: Array<{ id: number; currentStatus: string }>; pagination: { page: number } } };
  expect(queueBody.data.items.length).toBeGreaterThan(0);
  expect(queueBody.data.pagination.page).toBe(1);

  const filtered = await getJson(request, "/api/staff/tickets?search=VPN&ownerId=unassigned&page=1&pageSize=10&sortBy=summary&sortOrder=asc");
  expect(filtered.status()).toBe(200);
  const invalidSort = await getJson(request, "/api/staff/tickets?sortOrder=sideways");
  expect(invalidSort.status()).toBe(400);
  expect(await errorCode(invalidSort)).toBe("INVALID_QUERY");
  const unknownQuery = await getJson(request, "/api/staff/tickets?unexpected=true");
  expect(unknownQuery.status()).toBe(400);
  expect(await errorCode(unknownQuery)).toBe("INVALID_QUERY");

  const newQueue = await getJson(request, "/api/staff/tickets?status=NEW&page=1&pageSize=10&sortBy=createdAt&sortOrder=asc");
  expect(newQueue.status()).toBe(200);
  const newBody = await newQueue.json() as { data: { items: Array<{ id: number; currentStatus: string }> } };
  const ticket = newBody.data.items[0];
  expect(ticket).toBeTruthy();
  const detail = await getJson(request, `/api/staff/tickets/${ticket.id}`);
  expect(detail.status()).toBe(200);

  const assignees = await getJson(request, "/api/staff/assignees");
  expect(assignees.status()).toBe(200);
  const assigneeBody = await assignees.json() as { data: Array<{ id: number }> };
  const assignment = await postJson(request, `/api/staff/tickets/${ticket.id}/assignment`, { ownerId: assigneeBody.data[0].id });
  expect(assignment.status()).toBe(200);
  const invalidOwner = await postJson(request, `/api/staff/tickets/${ticket.id}/assignment`, { ownerId: 999999 });
  expect(invalidOwner.status()).toBe(400);
  expect(await errorCode(invalidOwner)).toBe("INVALID_OWNER");

  const priority = await request.patch(`${process.env.E2E_API_URL ?? "http://127.0.0.1:3000"}/api/staff/tickets/${ticket.id}/priority`, { data: { itPriority: "HIGH" } });
  expect(priority.status()).toBe(200);
  const status = await request.patch(`${process.env.E2E_API_URL ?? "http://127.0.0.1:3000"}/api/staff/tickets/${ticket.id}/status`, { data: { status: "OPEN" } });
  expect(status.status()).toBe(200);

  const emptyComment = await postJson(request, `/api/staff/tickets/${ticket.id}/comments`, { content: " " });
  expect(emptyComment.status()).toBe(400);
  const comment = await postJson(request, `/api/staff/tickets/${ticket.id}/comments`, { content: "E2E staff public update" });
  expect(comment.status()).toBe(201);
  const emptyNote = await postJson(request, `/api/staff/tickets/${ticket.id}/notes`, { content: " " });
  expect(emptyNote.status()).toBe(400);
  const note = await postJson(request, `/api/staff/tickets/${ticket.id}/notes`, { content: "E2E staff internal note" });
  expect(note.status()).toBe(201);

  const requester = await playwrightRequest.newContext();
  try {
    await signInAndChangePassword(requester, "jennifer@example.test", seedPassword, "Requester-Attachment2!");
    const ownTickets = await getJson(requester, "/api/tickets?page=1&pageSize=10");
    const ownBody = await ownTickets.json() as { data: Array<{ id: number }> };
    const upload = await requester.post(`${process.env.E2E_API_URL ?? "http://127.0.0.1:3000"}/api/tickets/${ownBody.data[0].id}/attachments`, { multipart: { files: { name: "e2e-proof.pdf", mimeType: "application/pdf", buffer: Buffer.from("E2E attachment proof") } } });
    expect(upload.status()).toBe(201);
    const uploaded = await upload.json() as { data: Array<{ id: number }> };
    const download = await request.get(`${process.env.E2E_API_URL ?? "http://127.0.0.1:3000"}/api/attachments/${uploaded.data[0].id}/download`);
    expect(download.status()).toBe(200);
  } finally {
    await requester.dispose();
  }
});
