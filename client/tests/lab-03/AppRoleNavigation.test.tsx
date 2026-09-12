import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({
  ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")),
  fetchCurrentUser: vi.fn(),
  logoutUser: vi.fn(),
  fetchUsers: vi.fn(),
  fetchStaffTickets: vi.fn(),
  fetchCategories: vi.fn(),
  fetchRelatedSystems: vi.fn(),
}));

const requester = { id: 1, name: "Jennifer Requester", email: "jennifer@example.test", role: "REQUESTER" as const, isActive: true, mustChangePassword: false };
const staff = { id: 2, name: "Mali Staff", email: "mali@example.test", role: "IT_STAFF" as const, isActive: true, mustChangePassword: false };
const admin = { id: 3, name: "Nok Administrator", email: "admin@example.test", role: "ADMINISTRATOR" as const, isActive: true, mustChangePassword: false };

describe("Lab 3 role navigation and safe session failures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchUsers).mockResolvedValue([admin]);
    vi.mocked(api.fetchStaffTickets).mockResolvedValue({ data: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 } });
    vi.mocked(api.fetchCategories).mockResolvedValue([]);
    vi.mocked(api.fetchRelatedSystems).mockResolvedValue([]);
  });

  it.each([
    [requester, "Create Ticket"],
    [staff, "Ticket Queue"],
    [admin, "User Management"],
  ])("lands %s users on the role-appropriate workspace", async (user, landing) => {
    vi.mocked(api.fetchCurrentUser).mockResolvedValue(user);
    render(<App />);
    expect(await screen.findByRole("link", { name: landing })).toBeInTheDocument();
  });

  it("shows a safe retry state when session loading fails", async () => {
    vi.mocked(api.fetchCurrentUser).mockRejectedValue(new Error("database details must stay private"));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not load your session/i);
    expect(screen.getByRole("alert")).not.toHaveTextContent("database details");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("keeps the authenticated shell visible and reports a logout failure", async () => {
    vi.mocked(api.fetchCurrentUser).mockResolvedValue(admin);
    vi.mocked(api.logoutUser).mockRejectedValue(new Error("private logout details"));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("link", { name: "User Management" });
    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/logout failed/i);
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
