import { expect, test, type TestInfo } from "@playwright/test";
import { createPrismaClient } from "../../server/src/prisma.js";
import { getDedicatedE2EDatabaseUrl } from "../lab-03/database-guard.js";
import { resetLab4Seed, signInAndOpenDashboard } from "./fixture.js";

const activeStatuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "REOPENED"];
const recentCutoff = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

async function verifyDashboardMetrics(page: import("@playwright/test").Page, role: "requester" | "staff", testInfo: TestInfo) {
  // Use the exact URL accepted by the dedicated-database guard for this query client.
  const guardedDatabaseUrl = getDedicatedE2EDatabaseUrl("lab4");
  const prisma = createPrismaClient(guardedDatabaseUrl);
  try {
    const db = role === "requester"
    ? await (async () => {
      const requester = await prisma.requesterUser.findUniqueOrThrow({ where: { email: "jennifer@example.test" }, select: { id: true } });
      const recent = recentCutoff();
      const [openTickets, waitingForRequester, recentlyUpdated, recentlyResolved] = await Promise.all([
        prisma.ticket.count({ where: { requesterId: requester.id, currentStatus: { in: activeStatuses } } }),
        prisma.ticket.count({ where: { requesterId: requester.id, currentStatus: "WAITING_FOR_REQUESTER" } }),
        prisma.ticket.count({ where: { requesterId: requester.id, updatedAt: { gte: recent } } }),
        prisma.ticket.count({ where: { requesterId: requester.id, updatedAt: { gte: recent }, currentStatus: { in: ["RESOLVED", "CLOSED"] } } }),
      ]);
      return { openTickets, waitingForRequester, recentlyUpdated, recentlyResolved };
    })()
    : await (async () => {
      const staff = await prisma.requesterUser.findUniqueOrThrow({ where: { email: "mali.staff@example.test" }, select: { id: true } });
      const [unassignedActive, myActive, myActionsTaken, urgentTickets] = await Promise.all([
        prisma.ticket.count({ where: { ownerId: null, currentStatus: { in: activeStatuses } } }),
        prisma.ticket.count({ where: { ownerId: staff.id, currentStatus: { in: activeStatuses } } }),
        prisma.actionTaken.count({ where: { performedById: staff.id } }),
        prisma.ticket.count({ where: { currentStatus: { in: activeStatuses }, itPriority: "HIGH" } }),
      ]);
      return { unassignedActive, myActive, myActionsTaken, urgentTickets };
      })();

    const apiResponse = await page.context().request.get(`http://127.0.0.1:3000/api/dashboard/${role}`);
    expect(apiResponse.status(), `${role} Dashboard API response`).toBe(200);
    const payload = await apiResponse.json() as { data: { metrics: Record<string, number> } };
    expect(payload.data.metrics).toEqual(db);

    const labels: Record<string, string> = role === "requester"
      ? { openTickets: "Open Tickets", waitingForRequester: "Waiting for Requester", recentlyUpdated: "Recently Updated", recentlyResolved: "Recently Resolved" }
      : { unassignedActive: "Unassigned Tickets", myActive: "My Active Tickets", myActionsTaken: "My Actions Taken", urgentTickets: "Urgent Tickets" };
    const ui: Record<string, number> = {};
    for (const [metric, value] of Object.entries(db)) {
      const label = labels[metric];
      const card = page.getByRole("article").filter({ hasText: label });
      const displayed = await card.locator("strong").innerText();
      ui[metric] = Number(displayed);
      expect(displayed, `${role} UI metric ${label}`).toBe(String(value));
    }
    console.log(`DASHBOARD-METRICS ${JSON.stringify({ role, database: db, api: payload.data.metrics, ui })}`);
    await testInfo.attach(`dashboard-metrics-${role}`, {
      body: JSON.stringify({ role, database: db, api: payload.data.metrics, ui }, null, 2),
      contentType: "application/json",
    });
  } finally {
    await prisma.$disconnect();
  }
}

test("E2E-05 Requester Dashboard metrics and active-ticket drill-down", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The Requester drill-down flow runs once on desktop; responsive coverage is separate.");
  resetLab4Seed();
  await signInAndOpenDashboard(page, "jennifer@example.test", "Lab4-Requester-Dashboard2!");
  await verifyDashboardMetrics(page, "requester", testInfo);
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
  await verifyDashboardMetrics(page, "staff", testInfo);
  await expect(page.getByText("Unassigned Tickets")).toBeVisible();
  await expect(page.getByText("My Active Tickets")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tickets by Status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tickets by IT Priority" })).toBeVisible();
  await page.getByRole("article").filter({ hasText: "Unassigned Tickets" }).getByRole("button", { name: "Open Queue" }).click();
  await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
  await expect(page.getByLabel("Owner")).toHaveValue("unassigned");
  await expect(page.getByLabel("Activity")).toHaveValue("true");
});
