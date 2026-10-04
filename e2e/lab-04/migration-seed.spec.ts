import { expect, test, request as playwrightRequest } from "@playwright/test";
import { getLab4SeedPassword } from "./credentials.js";
import { resetLab4Seed } from "./fixture.js";

const apiBase = process.env.E2E_API_URL ?? "http://127.0.0.1:3000";

async function snapshotSeed() {
  const context = await playwrightRequest.newContext({ baseURL: apiBase });
  const login = await context.post("/api/auth/login", { data: { email: "mali.staff@example.test", password: getLab4SeedPassword() } });
  expect(login.status()).toBe(200);
  const loginBody = await login.json() as { data: { user: { mustChangePassword: boolean } } };
  if (loginBody.data.user.mustChangePassword) {
    const change = await context.post("/api/auth/change-password", { data: { newPassword: "Lab4-Migration-Seed2!", confirmPassword: "Lab4-Migration-Seed2!" } });
    expect(change.status()).toBe(200);
  }
  const dashboardResponse = await context.get("/api/dashboard/staff");
  expect(dashboardResponse.status()).toBe(200);
  const dashboard = (await dashboardResponse.json() as { data: { metrics: { unassignedActive: number; myActionsTaken: number }; recentActions: Array<{ description: string; result: string }> } }).data;
  const queueResponse = await context.get("/api/staff/tickets?search=Laptop%20cannot%20connect%20to%20VPN&page=1&pageSize=10");
  expect(queueResponse.status()).toBe(200);
  const ticketId = (await queueResponse.json() as { data: { items: Array<{ id: number }> } }).data.items[0]?.id;
  expect(ticketId).toBeTruthy();
  const actionsResponse = await context.get(`/api/staff/tickets/${ticketId}/actions`);
  expect(actionsResponse.status()).toBe(200);
  const actions = (await actionsResponse.json() as { data: { items: Array<{ description: string; result: string }> } }).data.items;
  await context.dispose();
  return { metrics: dashboard.metrics, recentActions: dashboard.recentActions.map(({ description, result }) => ({ description, result })), actions: actions.map(({ description, result }) => ({ description, result })) };
}

test("E2E-00 Lab 4 migration deploys and deterministic seed is repeatable", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Migration/seed evidence runs once on desktop.");
  resetLab4Seed();
  const first = await snapshotSeed();
  resetLab4Seed();
  const second = await snapshotSeed();
  expect(second).toEqual(first);
});
