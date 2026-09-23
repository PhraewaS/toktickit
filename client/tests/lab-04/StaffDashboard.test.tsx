import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StaffDashboard from "../../src/StaffDashboard.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchStaffDashboard: vi.fn() }));

describe("Lab 4 Staff Dashboard", () => {
  it("renders authoritative staff metrics", async () => {
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue({ metrics: { unassignedTickets: 3, ownedTickets: 1, actionsTakenByCurrentUser: 4, recentlyUpdated: 1, urgentTickets: 1 }, byStatus: { OPEN: 1 }, byPriority: { HIGH: 1 }, recentlyUpdated: [], urgentTickets: [], recentActions: [] });
    render(<StaffDashboard onOpenTicket={vi.fn()} onOpenQueue={vi.fn()} isAdmin={false} />);
    expect(await screen.findByText("Unassigned Tickets")).toBeInTheDocument();
  });
});
