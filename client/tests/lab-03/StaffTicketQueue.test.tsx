import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StaffTicketQueue from "../../src/StaffTicketQueue.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchStaffTickets: vi.fn() }));
const ticket = { id: 42, ticketNumber: "TKT-20260908-10000000", requester: { id: 1, name: "Jennifer", email: "j@example.test" }, category: { id: 1, name: "Hardware" }, relatedSystem: { id: 1, name: "Laptop" }, summary: "VPN unavailable", requestedPriority: "HIGH" as const, itPriority: "HIGH" as const, currentStatus: "OPEN" as const, owner: null, requesterResolvedAt: null, createdAt: "2026-09-08T00:00:00Z", updatedAt: "2026-09-08T00:00:00Z", ticketDate: "2026-09-08T00:00:00Z", description: "VPN unavailable" };
describe("Lab 3 IT Staff queue", () => {
  it("shows queue data and empty/no-results feedback from one response", async () => {
    vi.mocked(api.fetchStaffTickets).mockResolvedValue({ data: [ticket], pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 } }); render(<StaffTicketQueue onOpen={vi.fn()} />); expect(await screen.findByText(ticket.ticketNumber)).toBeInTheDocument(); expect(screen.getAllByText("Unassigned").length).toBeGreaterThan(0);
  });

  it("sends independent requested and IT priority filters with search, sort and pagination", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffTickets).mockResolvedValue({ data: [ticket], pagination: { page: 1, pageSize: 10, totalItems: 11, totalPages: 2 } });
    render(<StaffTicketQueue onOpen={vi.fn()} />);
    await screen.findByText(ticket.ticketNumber);
    await user.type(screen.getByLabelText("Search"), "VPN");
    await user.selectOptions(screen.getByLabelText("Status"), "OPEN");
    await user.selectOptions(screen.getByLabelText("Requested Priority"), "LOW");
    await user.selectOptions(screen.getByLabelText("IT Priority"), "HIGH");
    await user.selectOptions(screen.getByLabelText("Sort by"), "itPriority");
    await user.selectOptions(screen.getByLabelText("Direction"), "asc");
    await user.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(api.fetchStaffTickets).toHaveBeenLastCalledWith({ search: "VPN", status: "OPEN", requestedPriority: "LOW", itPriority: "HIGH", sortBy: "itPriority", sortOrder: "asc", page: 1, pageSize: 10 }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(api.fetchStaffTickets).toHaveBeenLastCalledWith({ search: "VPN", status: "OPEN", requestedPriority: "LOW", itPriority: "HIGH", sortBy: "itPriority", sortOrder: "asc", page: 2, pageSize: 10 }));
  });

  it("shows a safe queue error and retries", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffTickets).mockRejectedValueOnce(new Error("private queue details")).mockResolvedValueOnce({ data: [ticket], pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 } });
    render(<StaffTicketQueue onOpen={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not load the ticket queue/i);
    expect(screen.getByRole("alert")).not.toHaveTextContent("private queue details");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText(ticket.ticketNumber)).toBeInTheDocument();
  });
});
