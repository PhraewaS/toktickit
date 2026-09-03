import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.js";
import CreateTicket from "../../src/CreateTicket.js";
import * as api from "../../src/api.js";

const requester = { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" };
const categories = [{ id: 1, name: "Hardware" }];
const systems = [{ id: 2, name: "Corporate Laptop" }];

describe("A11Y-01 required accessible semantics", () => {
  beforeEach(() => {
    vi.spyOn(api, "fetchDevelopmentRequesters").mockResolvedValue([
      requester,
    ]);
    vi.spyOn(api, "fetchCategories").mockResolvedValue(categories);
    vi.spyOn(api, "fetchRelatedSystems").mockResolvedValue(systems);
    vi.spyOn(api, "fetchMyTickets").mockResolvedValue({
      data: [],
      pagination: { page: 1, pageSize: 10, totalItems: 0, totalOwnedItems: 0, totalPages: 0 },
    });
  });

  it("supports keyboard focus order and labeled requester selection", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    const selection = await screen.findByRole("combobox");
    expect(selection).toHaveAccessibleName(/Development Requester/);
    await user.tab();
    expect(document.activeElement).toHaveAttribute("href", "/");
    await user.tab();
    expect(document.activeElement).toBe(selection);
  });

  it("associates validation errors with invalid controls via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<CreateTicket requester={requester} />);
    const submit = await screen.findByRole("button", { name: "Submit Ticket" });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    const category = screen.getByLabelText(/Category/);
    expect(category).toHaveAttribute("aria-invalid", "true");
    expect(category).toHaveAttribute("aria-describedby", "categoryId-error");
    expect(document.getElementById("categoryId-error")).toHaveTextContent("Select a Category.");
  });

  it("marks the active navigation page and exposes badge meaning as text", async () => {
    const user = userEvent.setup();
    render(<App />);
    const selection = await screen.findByRole("combobox");
    await user.selectOptions(selection, "1");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const createLink = screen.getByRole("link", { name: "Create Ticket" });
    expect(createLink).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Status: New")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "My Tickets" }));
    expect(screen.getByRole("link", { name: "My Tickets" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("You do not have any Tickets yet.")).toBeInTheDocument();
  });
});
