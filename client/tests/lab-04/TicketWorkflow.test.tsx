import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StaffTicketDetail from "../../src/StaffTicketDetail.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchStaffTicketDetail: vi.fn(), fetchAssignableStaff: vi.fn(), updateStaffStatus: vi.fn() }));

const actor = { id: 2, name: "Mali Support", email: "mali.staff@example.test", role: "IT_STAFF" as const, isActive: true, mustChangePassword: false };
const ticket = { id: 42, ticketNumber: "TKT-20260930-00000042", requester: { id: 1, name: "Jennifer", email: "requester@example.test" }, category: { id: 1, name: "Network" }, relatedSystem: { id: 1, name: "VPN" }, summary: "VPN access is unavailable", requestedPriority: "HIGH" as const, itPriority: "HIGH" as const, currentStatus: "IN_PROGRESS" as const, owner: null, requesterResolvedAt: null, createdAt: "2026-09-30T12:00:00.000Z", updatedAt: "2026-09-30T12:00:00.000Z", ticketDate: "2026-09-30T12:00:00.000Z", description: "VPN access is unavailable.", attachments: [], publicComments: [], internalNotes: [] };

describe("Lab 4 Ticket resolution feedback", () => {
  it("shows the safe resolution prerequisite and resets the status selector after conflict", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffTicketDetail).mockResolvedValue(ticket);
    vi.mocked(api.fetchAssignableStaff).mockResolvedValue([actor]);
    vi.mocked(api.updateStaffStatus).mockRejectedValue(new api.ApiError("Record at least one Action Taken before resolving a Ticket.", undefined, "RESOLUTION_ACTION_REQUIRED"));

    render(<StaffTicketDetail ticketId={42} currentUser={actor} onBack={vi.fn()} />);
    await screen.findByRole("heading", { name: ticket.ticketNumber });
    const status = screen.getByLabelText(/Move status from IN PROGRESS/i);
    await user.selectOptions(status, "RESOLVED");

    expect(await screen.findByRole("alert")).toHaveTextContent("Record at least one Action Taken before resolving a Ticket.");
    expect(status).toHaveValue("");
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    expect(api.updateStaffStatus).toHaveBeenCalledWith(42, "RESOLVED");
  });
});
