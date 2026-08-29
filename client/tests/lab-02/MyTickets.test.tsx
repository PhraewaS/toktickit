import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MyTickets from "../../src/MyTickets.js";

const apiMocks = vi.hoisted(() => ({
  fetchMyTickets: vi.fn(),
  fetchCategories: vi.fn(),
  fetchRelatedSystems: vi.fn(),
}));

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js");
  return { ...actual, ...apiMocks };
});

const requester = { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" };
const ticket = {
  id: 42,
  ticketNumber: "TKT-20260824-A1B2C3D4",
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
  summary: "Laptop battery drains quickly",
  requestedPriority: "MEDIUM" as const,
  currentStatus: "NEW" as const,
  createdAt: "2026-08-24T08:30:00.000Z",
  updatedAt: "2026-08-24T08:30:00.000Z",
};

describe("My Tickets screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.fetchCategories.mockResolvedValue([{ id: 2, name: "Hardware" }]);
    apiMocks.fetchRelatedSystems.mockResolvedValue([{ id: 7, name: "Corporate Laptop" }]);
    apiMocks.fetchMyTickets.mockResolvedValue({
      data: [ticket],
      pagination: { page: 1, pageSize: 10, totalItems: 1, totalOwnedItems: 1, totalPages: 1 },
    });
  });

  it("loads owned tickets and applies search/filter controls", async () => {
    const user = userEvent.setup();
    render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    expect(await screen.findByText(ticket.ticketNumber)).toBeInTheDocument();
    await user.type(screen.getByLabelText("Search"), "battery");
    await user.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ search: "battery", page: 1 })));
  });

  it("shows the contract's empty and no-results messages from one response", async () => {
    const user = userEvent.setup();
    apiMocks.fetchMyTickets.mockResolvedValueOnce({ data: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalOwnedItems: 0, totalPages: 0 } });
    const { rerender } = render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    expect(await screen.findByText(/do not have any Tickets/i)).toBeInTheDocument();

    rerender(<MyTickets requester={{ ...requester, id: 2 }} onCreateTicket={vi.fn()} />);
    apiMocks.fetchMyTickets.mockResolvedValue({ data: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalOwnedItems: 2, totalPages: 0 } });
    await user.type(screen.getByLabelText("Search"), "missing");
    await user.click(screen.getByRole("button", { name: "Apply filters" }));
    expect(await screen.findByText(/No Tickets match these filters/i)).toBeInTheDocument();
  });

  it("shows a safe failure state with retry", async () => {
    apiMocks.fetchMyTickets.mockRejectedValueOnce(new Error("network"));
    render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/Could not load My Tickets/i);
  });
});
