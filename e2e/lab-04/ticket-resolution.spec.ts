import { expect, test } from "@playwright/test";
import { getLab3SeedPassword } from "../lab-03/credentials.js";
import { API_BASE_URL, signInAndChangePassword, getJson, postJson } from "../lab-03/api-helpers.js";

test("E2E-04 resolution is backed by an Action Taken", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The mutating fixture runs once in the desktop project.");
  await signInAndChangePassword(request, "mali.staff@example.test", getLab3SeedPassword(), "Lab4-Resolution-Changed2!");
  const queue = await getJson(request, "/api/staff/tickets?page=1&pageSize=10&sortBy=updatedAt&sortOrder=desc");
  expect(queue.status()).toBe(200);
  const ticketId = (await queue.json() as { data: { items: Array<{ id: number }> } }).data.items[0].id;
  const action = await postJson(request, `/api/staff/tickets/${ticketId}/actions`, { actionDateTime: new Date().toISOString(), description: "E2E resolution evidence", result: "Resolution evidence recorded", followUpRequired: false });
  expect(action.status()).toBe(201);
  const resolved = await request.patch(`${API_BASE_URL}/api/staff/tickets/${ticketId}/status`, { data: { status: "RESOLVED" } });
  expect(resolved.status()).toBe(200);
});
