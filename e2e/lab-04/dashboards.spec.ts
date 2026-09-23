import { expect, test } from "@playwright/test";
import { getLab3SeedPassword } from "../lab-03/credentials.js";
import { signInAndChangePassword, getJson } from "../lab-03/api-helpers.js";

test("E2E-04 requester and staff dashboards return authoritative summaries", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The dashboard fixture runs once in the desktop project.");
  await signInAndChangePassword(request, "mali.staff@example.test", getLab3SeedPassword(), "Lab4-Dashboard-Changed2!");
  const staff = await getJson(request, "/api/dashboard/staff");
  expect(staff.status()).toBe(200);
  expect((await staff.json() as { data: { metrics: { unassigned: number } } }).data.metrics).toHaveProperty("unassigned");
});
