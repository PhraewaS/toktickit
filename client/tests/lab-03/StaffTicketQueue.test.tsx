import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StaffTicketQueue from "../../src/StaffTicketQueue.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchStaffTickets: vi.fn() }));
const ticket = { id: 42, ticketNumber: "TKT-20260908-10000000", requester: { id: 1, name: "Jennifer", email: "j@example.test" }, category: { id: 1, name: "Hardware" }, relatedSystem: { id: 1, name: "Laptop" }, summary: "VPN unavailable", requestedPriority: "HIGH" as const, itPriority: "HIGH" as const, currentStatus: "OPEN" as const, owner: null, requesterResolvedAt: null, createdAt: "2026-09-08T00:00:00Z", updatedAt: "2026-09-08T00:00:00Z", ticketDate: "2026-09-08T00:00:00Z", description: "VPN unavailable" };
describe("Lab 3 IT Staff queue", () => {
  it("shows queue data and empty/no-results feedback from one response", async () => {
    vi.mocked(api.fetchStaffTickets).mockResolvedValue({ data: [ticket], pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 } }); render(<StaffTicketQueue onOpen={vi.fn()} />); expect(await screen.findByText(ticket.ticketNumber)).toBeInTheDocument(); expect(screen.getAllByText("Unassigned").length).toBeGreaterThan(0);
  });
});
