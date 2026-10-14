import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

const databaseUrl = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
const isDedicatedLab4Database = (() => {
  if (process.env.LAB4_E2E_DATABASE !== "true" || !process.env.LAB4_SEED_PASSWORD || !databaseUrl) return false;
  try {
    const parsed = new URL(databaseUrl);
    const name = decodeURIComponent(parsed.pathname.replace(/^\//, "").split("?")[0]);
    return ["localhost", "127.0.0.1"].includes(parsed.hostname) && name === "toktickit_lab4_e2e";
  } catch { return false; }
})();

describe.skipIf(!isDedicatedLab4Database)("Lab 4 performance smoke (dedicated local PostgreSQL only)", () => {
  it("keeps dashboard summaries and Action Taken reads bounded under 10 sequential requests each", async () => {
    type SmokeBody = { data: Record<string, unknown> };
    function assertBoundedList(body: SmokeBody, key: string) {
      expect(body.data).not.toHaveProperty("tickets");
      const list = body.data[key];
      expect(Array.isArray(list)).toBe(true);
      if (Array.isArray(list)) expect(list.length).toBeLessThanOrEqual(10);
    }

    const seedPassword = process.env.LAB4_SEED_PASSWORD!;
    async function signIn(email: string, replacementPassword: string) {
      const login = await request(app).post("/api/auth/login").send({ email, password: seedPassword });
      expect(login.status).toBe(200);
      const cookie = login.headers["set-cookie"]?.[0]?.split(";")[0];
      expect(cookie).toBeTruthy();
      const changed = await request(app).post("/api/auth/change-password").set("Cookie", cookie!).send({ newPassword: replacementPassword, confirmPassword: replacementPassword });
      expect(changed.status).toBe(200);
      return cookie!;
    }

    const staffCookie = await signIn("mali.staff@example.test", "Lab4-Smoke-Staff2!");
    const requesterCookie = await signIn("jennifer@example.test", "Lab4-Smoke-Requester2!");
    const queue = await request(app).get("/api/staff/tickets?page=1&pageSize=10").set("Cookie", staffCookie);
    expect(queue.status).toBe(200);
    const ticketId = queue.body.data.items[0]?.id as number | undefined;
    expect(ticketId).toBeTypeOf("number");

    const requesterDashboard = await request(app).get("/api/dashboard/requester").set("Cookie", requesterCookie);
    expect(requesterDashboard.status).toBe(200);
    const requesterTicketId = requesterDashboard.body.data.recentlyUpdated[0]?.id as number | undefined;
    expect(requesterTicketId).toBeTypeOf("number");

    const targets = [
      { name: "staff-dashboard", cookie: staffCookie, path: "/api/dashboard/staff", listKey: "recentActions" },
      { name: "requester-dashboard", cookie: requesterCookie, path: "/api/dashboard/requester", listKey: "recentlyUpdated" },
      { name: "staff-actions-list", cookie: staffCookie, path: `/api/staff/tickets/${ticketId}/actions`, listKey: "items" },
      { name: "requester-actions-list", cookie: requesterCookie, path: `/api/tickets/${requesterTicketId}/actions`, listKey: "items" },
    ];
    const evidence: Array<{ endpoint: string; requests: number; maxDurationMs: number; failures: number }> = [];

    for (const target of targets) {
      let maxDurationMs = 0;
      let failures = 0;
      for (let index = 0; index < 10; index += 1) {
        const started = performance.now();
        const response = await request(app).get(target.path).set("Cookie", target.cookie);
        const durationMs = performance.now() - started;
        maxDurationMs = Math.max(maxDurationMs, durationMs);
        if (response.status !== 200 || durationMs >= 1_000) failures += 1;
        else {
          try {
            assertBoundedList(response.body as SmokeBody, target.listKey);
          } catch {
            failures += 1;
          }
        }
      }
      evidence.push({ endpoint: target.name, requests: 10, maxDurationMs: Math.round(maxDurationMs), failures });
    }

    console.log(`PERF-04 ${JSON.stringify({ requestCount: evidence.reduce((sum, item) => sum + item.requests, 0), results: evidence })}`);
    expect(evidence.flatMap((result) => Array.from({ length: result.failures }, () => `${result.endpoint} failed`))).toEqual([]);
  });
});
