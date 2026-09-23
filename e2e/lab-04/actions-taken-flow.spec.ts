import { expect, test } from "@playwright/test";
import { getLab3SeedPassword } from "../lab-03/credentials.js";
import { resetLocalSeed } from "../lab-03/fixture.js";
import { signInAndChangePassword, getJson, postJson } from "../lab-03/api-helpers.js";

test("E2E-04 Staff can create an Action Taken and Requester can read it", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The mutating fixture runs once in the desktop project.");
  resetLocalSeed();
  await signInAndChangePassword(request, "mali.staff@example.test", getLab3SeedPassword(), "Lab4-Staff-Changed2!");
  const queue = await getJson(request, "/api/staff/tickets?page=1&pageSize=10&sortBy=updatedAt&sortOrder=desc");
  expect(queue.status()).toBe(200);
  const ticketId = (await queue.json() as { data: { items: Array<{ id: number }> } }).data.items[0].id;
  const created = await postJson(request, `/api/staff/tickets/${ticketId}/actions`, { actionDateTime: new Date().toISOString(), description: "E2E diagnostic action", result: "E2E result", followUpRequired: false });
  expect(created.status()).toBe(201);
  const body = await created.json() as { data: { id: number; performedBy: { email: string } } };
  expect(body.data.performedBy.email).toBe("mali.staff@example.test");
});
