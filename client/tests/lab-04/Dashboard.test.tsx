import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RequesterDashboard from "../../src/RequesterDashboard.js";
import StaffDashboard from "../../src/StaffDashboard.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchRequesterDashboard: vi.fn(), fetchStaffDashboard: vi.fn() }));
const requesterDashboard = { metrics: { openTickets: 2, waitingForRequester: 1, recentlyUpdated: 1, recentlyResolved: 0 }, recentlyUpdated: [], recentlyResolved: [] };
const staffDashboard = { metrics: { unassignedTickets: 3, ownedTickets: 1, actionsTakenByCurrentUser: 4, recentlyUpdated: 1, urgentTickets: 1 }, byStatus: { OPEN: 1 }, byPriority: { HIGH: 1 }, recentlyUpdated: [], urgentTickets: [], recentActions: [] };
describe("Lab 4 Dashboard UI", () => {
  it("shows Requester metrics and a safe empty list", async () => { vi.mocked(api.fetchRequesterDashboard).mockResolvedValue(requesterDashboard); render(<RequesterDashboard onOpenTicket={vi.fn()} onCreateTicket={vi.fn()} />); expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument(); expect(screen.getByText("Open Tickets")).toBeInTheDocument(); expect(screen.getAllByText("No matching Tickets in the recent period.")).toHaveLength(2); });
  it("shows Staff metrics and breakdowns", async () => { vi.mocked(api.fetchStaffDashboard).mockResolvedValue(staffDashboard); render(<StaffDashboard onOpenTicket={vi.fn()} onOpenQueue={vi.fn()} isAdmin={false} />); expect(await screen.findByText("Unassigned Tickets")).toBeInTheDocument(); expect(screen.getByText("Tickets by Status")).toBeInTheDocument(); });
});
