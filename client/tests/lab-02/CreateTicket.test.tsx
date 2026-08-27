import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", () => ({
  fetchDevelopmentRequesters: vi.fn(),
  fetchCategories: vi.fn(),
  fetchRelatedSystems: vi.fn(),
  createTicket: vi.fn(),
}));

const requester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer@example.test",
};

const createdTicket = {
  id: 42,
  ticketNumber: "TKT-20260824-A1B2C3D4",
  ticketDate: "2026-08-24T08:30:00.000Z",
  requester: { id: 1, name: "Jennifer Anderson" },
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
  summary: "Laptop battery drains quickly",
  requestedPriority: "MEDIUM" as const,
  description:
    "The battery falls from full charge to 20 percent within one hour.",
  currentStatus: "NEW" as const,
  createdAt: "2026-08-24T08:30:00.000Z",
  updatedAt: "2026-08-24T08:30:00.000Z",
};

async function openCreateTicket() {
  render(<App />);
  fireEvent.change(
    await screen.findByRole("combobox", { name: /development requester/i }),
    { target: { value: "1" } },
  );
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  return screen.findByRole("heading", { name: /create ticket/i });
}

function fillValidTicket() {
  fireEvent.change(screen.getByRole("combobox", { name: /^category/i }), {
    target: { value: "2" },
  });
  fireEvent.change(
    screen.getByRole("combobox", { name: /related system/i }),
    { target: { value: "7" } },
  );
  fireEvent.change(
    screen.getByRole("combobox", { name: /requested priority/i }),
    { target: { value: "MEDIUM" } },
  );
  fireEvent.change(screen.getByRole("textbox", { name: /ticket summary/i }), {
    target: { value: "Laptop battery drains quickly" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /^description/i }), {
    target: {
      value:
        "The battery falls from full charge to 20 percent within one hour.",
    },
  });
}

describe("Create Ticket", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(api.fetchDevelopmentRequesters).mockResolvedValue([requester]);
    vi.mocked(api.fetchCategories).mockResolvedValue([
      { id: 2, name: "Hardware" },
    ]);
    vi.mocked(api.fetchRelatedSystems).mockResolvedValue([
      { id: 7, name: "Corporate Laptop" },
    ]);
    vi.mocked(api.createTicket).mockResolvedValue({
      data: createdTicket,
      replayed: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads database reference data and distinguishes read-only context", async () => {
    await openCreateTicket();

    expect(await screen.findByRole("option", { name: "Hardware" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Corporate Laptop" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/ticket number/i)).toHaveValue(
      "Generated after submission",
    );
    expect(screen.getByLabelText(/ticket number/i)).toHaveAttribute("readonly");
    expect(screen.getByLabelText(/^requester$/i)).toHaveValue(
      "Jennifer Anderson",
    );
    expect(screen.getByLabelText(/current status/i)).toHaveValue("New");
    expect(api.fetchCategories).toHaveBeenCalledTimes(1);
    expect(api.fetchRelatedSystems).toHaveBeenCalledTimes(1);
  });

  it("shows accessible field-level errors and does not call the API", async () => {
    await openCreateTicket();

    fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    expect(await screen.findByText(/^select a category\.$/i)).toBeInTheDocument();
    expect(screen.getByText(/^select a related system\.$/i)).toBeInTheDocument();
    expect(screen.getByText(/summary must be between 5 and 150/i)).toBeInTheDocument();
    expect(
      screen.getByText(/description must be between 10 and 5000/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /^category/i })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("combobox", { name: /^category/i })).toHaveFocus();
    expect(api.createTicket).not.toHaveBeenCalled();
  });

  it("shows a safe reference-data failure and retries both database lists", async () => {
    vi.mocked(api.fetchCategories)
      .mockRejectedValueOnce(new Error("private database path"))
      .mockResolvedValueOnce([{ id: 2, name: "Hardware" }]);

    render(<App />);
    fireEvent.change(
      await screen.findByRole("combobox", { name: /development requester/i }),
      { target: { value: "1" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not load ticket reference data/i,
    );
    expect(screen.queryByText(/private database path/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByRole("option", { name: "Hardware" })).toBeInTheDocument();
    expect(api.fetchCategories).toHaveBeenCalledTimes(2);
    expect(api.fetchRelatedSystems).toHaveBeenCalledTimes(2);
  });

  it("prevents duplicate submission and displays the official Ticket Number", async () => {
    let resolveCreate!: (value: api.CreateTicketResult) => void;
    vi.mocked(api.createTicket).mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );

    await openCreateTicket();
    fillValidTicket();
    const submit = screen.getByRole("button", { name: /submit ticket/i });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(await screen.findByRole("button", { name: /submitting/i })).toBeDisabled();
    expect(api.createTicket).toHaveBeenCalledTimes(1);
    expect(api.createTicket).toHaveBeenCalledWith(1, {
      submissionKey: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
      categoryId: 2,
      relatedSystemId: 7,
      summary: "Laptop battery drains quickly",
      requestedPriority: "MEDIUM",
      description:
        "The battery falls from full charge to 20 percent within one hour.",
    });

    resolveCreate({ data: createdTicket, replayed: false });

    expect(await screen.findByText("TKT-20260824-A1B2C3D4")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/ticket created/i);
  });

  it("retains entered values and shows a safe error after API failure", async () => {
    vi.mocked(api.createTicket).mockRejectedValue(
      new Error("TokTickIT could not complete the request. Please try again."),
    );

    await openCreateTicket();
    fillValidTicket();
    fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not complete the request/i,
    );
    expect(screen.getByRole("textbox", { name: /ticket summary/i })).toHaveValue(
      "Laptop battery drains quickly",
    );
    expect(screen.getByRole("textbox", { name: /^description/i })).toHaveValue(
      "The battery falls from full charge to 20 percent within one hour.",
    );
  });
});
