import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StaffDashboard from "../../src/StaffDashboard.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchStaffDashboard: vi.fn() }));

const ticket = { id: 42, ticketNumber: "TKT-20260930-00000042", summary: "VPN access is unavailable", currentStatus: "OPEN" as const, itPriority: "HIGH" as const, updatedAt: "2026-09-30T12:00:00.000Z", requester: { id: 1, name: "Requester" } };
const dashboard = {
  metrics: { unassignedActive: 14, myActive: 5, myActionsTaken: 28, urgentTickets: 12 },
  byStatus: { NEW: 0, OPEN: 4, IN_PROGRESS: 0, WAITING_FOR_REQUESTER: 0, RESOLVED: 3, CLOSED: 0, REOPENED: 0, CANCELLED: 1 },
  byPriority: { LOW: 0, MEDIUM: 3, HIGH: 4 },
  recentlyUpdated: [ticket],
  urgentTickets: [ticket],
  recentActions: [{ id: 9, ticketId: 42, ticketNumber: ticket.ticketNumber, summary: ticket.summary, actionDateTime: ticket.updatedAt, description: "Reviewed VPN logs", result: "Authentication failure confirmed" }],
};
const props = { onOpenTicket: vi.fn(), onOpenQueue: vi.fn(), isAdmin: false, currentUserId: 7 };

describe("Lab 4 Staff Dashboard", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders metrics and all breakdown groups and drills down to Ticket Detail or Queue", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue(dashboard);
    render(<StaffDashboard {...props} />);

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("Tickets by Status")).toBeInTheDocument();
    expect(screen.getByText("Tickets by IT Priority")).toBeInTheDocument();
    expect(screen.getByText("CANCELLED")).toBeInTheDocument();
    expect(screen.getByText("Reviewed VPN logs")).toBeInTheDocument();

    const actionItem = screen.getByText("Reviewed VPN logs").closest("li");
    expect(actionItem).not.toBeNull();
    await user.click(within(actionItem as HTMLElement).getByRole("button", { name: ticket.ticketNumber }));
    expect(props.onOpenTicket).toHaveBeenCalledWith(42);
    await user.click(screen.getAllByRole("button", { name: "Open Ticket Queue" })[0]);
    expect(props.onOpenQueue).toHaveBeenCalledOnce();
  });

  it("drills each metric and breakdown into the matching queue filters", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue(dashboard);
    render(<StaffDashboard {...props} />);

    await screen.findByRole("heading", { name: "Dashboard" });
    await user.click(screen.getByRole("button", { name: "Open Queue" }));
    expect(props.onOpenQueue).toHaveBeenLastCalledWith({ ownerId: "unassigned", activeOnly: true });

    await user.click(screen.getByRole("button", { name: "View My Queue" }));
    expect(props.onOpenQueue).toHaveBeenLastCalledWith({ ownerId: 7, activeOnly: true });

    await user.click(screen.getByRole("button", { name: "Review High Priority" }));
    expect(props.onOpenQueue).toHaveBeenLastCalledWith({ itPriority: "HIGH", activeOnly: true });

    await user.click(screen.getByRole("button", { name: "Filter queue by status OPEN" }));
    expect(props.onOpenQueue).toHaveBeenLastCalledWith({ status: "OPEN" });

    await user.click(screen.getByRole("button", { name: "Filter queue by IT priority HIGH" }));
    expect(props.onOpenQueue).toHaveBeenLastCalledWith({ itPriority: "HIGH" });
  });

  it("shows an empty Action Taken state separately from successful zero metrics", async () => {
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue({ ...dashboard, metrics: { unassignedActive: 0, myActive: 0, myActionsTaken: 0, urgentTickets: 0 }, recentlyUpdated: [], urgentTickets: [], recentActions: [] });
    render(<StaffDashboard {...props} />);

    expect(await screen.findByText("My Actions Taken")).toBeInTheDocument();
    expect(screen.getByText("No Actions Taken recorded by your account in the recent period.")).toBeInTheDocument();
    expect(screen.getAllByText("No matching Tickets.")).toHaveLength(2);
  });

  it("offers retry after a safe failure", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffDashboard).mockRejectedValueOnce(new Error("database detail")).mockResolvedValue(dashboard);
    render(<StaffDashboard {...props} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("TokTickIT could not load the IT Staff Dashboard");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Reviewed VPN logs")).toBeInTheDocument();
    expect(api.fetchStaffDashboard).toHaveBeenCalledTimes(2);
  });

  it("hides protected metrics on forbidden and offers the allowed queue", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffDashboard).mockRejectedValue(new api.ApiError("forbidden", undefined, "ROLE_FORBIDDEN"));
    render(<StaffDashboard {...props} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Dashboard access is unavailable");
    expect(screen.queryByText("Unassigned Tickets")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to Ticket Queue" }));
    expect(props.onOpenQueue).toHaveBeenCalledOnce();
  });
});
