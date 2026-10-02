import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequesterDashboard from "../../src/RequesterDashboard.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchRequesterDashboard: vi.fn() }));

const ticket = { id: 42, ticketNumber: "TKT-20260930-00000042", summary: "VPN access is unavailable", currentStatus: "OPEN" as const, updatedAt: "2026-09-30T12:00:00.000Z" };
const dashboard = { metrics: { openTickets: 8, waitingForRequester: 3, recentlyUpdated: 18, recentlyResolved: 6 }, recentlyUpdated: [ticket], recentlyResolved: [{ ...ticket, id: 43, currentStatus: "RESOLVED" as const }] };
const props = { onOpenTicket: vi.fn(), onCreateTicket: vi.fn(), onOpenMyTickets: vi.fn() };

describe("Lab 4 Requester Dashboard", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders authoritative metrics, recent summaries, and routes each action to the right screen", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValue(dashboard);
    render(<RequesterDashboard {...props} />);

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: ticket.ticketNumber })[0]);
    expect(props.onOpenTicket).toHaveBeenCalledWith(42);
    await user.click(screen.getByRole("button", { name: "View My Tickets" }));
    expect(props.onOpenMyTickets).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Create a Ticket" }));
    expect(props.onCreateTicket).toHaveBeenCalledOnce();
  });

  it("shows loading and distinct empty states with zero metric values", async () => {
    let finish!: (value: typeof dashboard) => void;
    vi.mocked(api.fetchRequesterDashboard).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const { container } = render(<RequesterDashboard {...props} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Requester Dashboard");
    expect(container.querySelector(".dashboard-page")).toHaveAttribute("aria-busy", "true");

    finish({ metrics: { openTickets: 0, waitingForRequester: 0, recentlyUpdated: 0, recentlyResolved: 0 }, recentlyUpdated: [], recentlyResolved: [] });
    expect(await screen.findByText("Recently Updated")).toBeInTheDocument();
    expect(screen.getAllByText("No matching Tickets in the recent period.")).toHaveLength(2);
    expect(screen.getAllByText("0", { selector: ".metric-card strong" })).toHaveLength(4);
  });

  it("offers retry after a safe failure", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchRequesterDashboard).mockRejectedValue(new Error("network detail"));
    render(<RequesterDashboard {...props} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("TokTickIT could not load your Dashboard");
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValue(dashboard);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findAllByText(ticket.ticketNumber)).toHaveLength(2);
    expect(api.fetchRequesterDashboard).toHaveBeenCalledTimes(2);
  });

  it("hides protected metrics on forbidden and links back to My Tickets", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchRequesterDashboard).mockRejectedValue(new api.ApiError("forbidden", undefined, "ROLE_FORBIDDEN"));
    render(<RequesterDashboard {...props} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Dashboard access is unavailable");
    expect(screen.queryByText("Open Tickets")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Go to My Tickets" }));
    expect(props.onOpenMyTickets).toHaveBeenCalledOnce();
  });
});
