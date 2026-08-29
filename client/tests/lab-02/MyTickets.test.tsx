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
const secondTicket = {
  ...ticket,
  id: 43,
  ticketNumber: "TKT-20260825-B2C3D4E5",
  summary: "Email access is unavailable",
};

function listResult(data = [ticket], pagination = {}) {
  return {
    data,
    pagination: {
      page: 1,
      pageSize: 10 as const,
      totalItems: data.length,
      totalOwnedItems: data.length,
      totalPages: data.length ? 1 : 0,
      ...pagination,
    },
  };
}

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

  it("clears search and filters while keeping the visible sort controls in sync", async () => {
    const user = userEvent.setup();
    render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    await screen.findByText(ticket.ticketNumber);
    await user.selectOptions(screen.getByLabelText("Sort by"), "summary");
    await user.selectOptions(screen.getByLabelText("Direction"), "asc");
    await user.selectOptions(screen.getByLabelText("Category"), "2");
    await user.type(screen.getByLabelText("Search"), "battery");
    await user.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ search: "battery", categoryId: 2, sortBy: "summary", sortOrder: "asc" })));

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(1, { sortBy: "summary", sortOrder: "asc", page: 1, pageSize: 10 }));
    expect(screen.getByLabelText("Sort by")).toHaveValue("summary");
    expect(screen.getByLabelText("Direction")).toHaveValue("asc");
    expect(screen.getByLabelText("Search")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("");
  });

  it("clears requester A results before loading requester B results", async () => {
    apiMocks.fetchMyTickets.mockImplementation(async (requesterId: number) =>
      requesterId === 1 ? listResult([ticket]) : listResult([secondTicket]),
    );
    const { rerender } = render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    expect(await screen.findByText(ticket.ticketNumber)).toBeInTheDocument();

    rerender(<MyTickets requester={{ ...requester, id: 2, name: "Michael Chen" }} onCreateTicket={vi.fn()} />);
    expect(screen.queryByText(ticket.ticketNumber)).not.toBeInTheDocument();
    expect(await screen.findByText(secondTicket.ticketNumber)).toBeInTheDocument();
    expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(2, expect.any(Object));
  });

  it("covers all list controls and previous/next pagination requests", async () => {
    const user = userEvent.setup();
    apiMocks.fetchMyTickets.mockImplementation(async (_requesterId: number, query: { page?: number; pageSize?: number }) => ({
      data: [query.page === 2 ? secondTicket : ticket],
      pagination: { page: query.page ?? 1, pageSize: (query.pageSize ?? 20) as 10 | 20 | 50, totalItems: 21, totalOwnedItems: 21, totalPages: 2 },
    }));
    render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    await screen.findByText(ticket.ticketNumber);
    await user.selectOptions(screen.getByLabelText("Category"), "2");
    await user.selectOptions(screen.getByLabelText("Related System"), "7");
    await user.selectOptions(screen.getByLabelText("Requested Priority"), "HIGH");
    await user.selectOptions(screen.getByLabelText("Current Status"), "NEW");
    await user.selectOptions(screen.getByLabelText("Sort by"), "updatedAt");
    await user.selectOptions(screen.getByLabelText("Direction"), "asc");
    await user.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ categoryId: 2, relatedSystemId: 7, requestedPriority: "HIGH", currentStatus: "NEW", sortBy: "updatedAt", sortOrder: "asc", page: 1 })));
    await user.selectOptions(screen.getByLabelText("Page size"), "20");
    await waitFor(() => expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ pageSize: 20 })));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ page: 2, pageSize: 20 })));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await waitFor(() => expect(apiMocks.fetchMyTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ page: 1, pageSize: 20 })));
  });

  it("announces the loading state while the list request is pending", async () => {
    let resolveRequest!: (value: ReturnType<typeof listResult>) => void;
    apiMocks.fetchMyTickets.mockReturnValueOnce(new Promise((resolve) => { resolveRequest = resolve; }));
    render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent(/Loading My Tickets/i);
    resolveRequest(listResult());
    expect(await screen.findByText(ticket.ticketNumber)).toBeInTheDocument();
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
    const user = userEvent.setup();
    apiMocks.fetchMyTickets.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(listResult());
    render(<MyTickets requester={requester} onCreateTicket={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/Could not load My Tickets/i);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText(ticket.ticketNumber)).toBeInTheDocument();
  });
});
