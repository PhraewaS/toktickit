import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UserManagement from "../../src/UserManagement.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchUsers: vi.fn(), createAdminUser: vi.fn(), updateAdminUser: vi.fn(), resetAdminPassword: vi.fn() }));
const admin = { id: 9, name: "Nok Administrator", email: "admin@example.test", role: "ADMINISTRATOR" as const, isActive: true, mustChangePassword: false };
describe("Lab 3 User Management", () => { it("renders the minimalist administrator list and create action", async () => { vi.mocked(api.fetchUsers).mockResolvedValue([admin]); render(<UserManagement currentUser={admin} />); expect(await screen.findByText(admin.email)).toBeInTheDocument(); expect(screen.getAllByRole("button", { name: "Create user" }).length).toBeGreaterThan(0); expect(screen.getByRole("button", { name: "Set initial password" })).toBeInTheDocument(); }); });

it("submits the administrator create-user action", async () => {
  const user = userEvent.setup();
  vi.mocked(api.fetchUsers).mockResolvedValue([admin]);
  vi.mocked(api.createAdminUser).mockResolvedValue({ ...admin, id: 10, name: "New Requester", email: "new@example.test", role: "REQUESTER", mustChangePassword: true });
  render(<UserManagement currentUser={admin} />);
  await screen.findByText(admin.email);
  await user.click(screen.getAllByRole("button", { name: "Create user" })[0]);
  await user.type(screen.getByLabelText("Name"), "New Requester");
  await user.type(screen.getByLabelText("Email"), "new@example.test");
  await user.type(screen.getByLabelText("Initial password"), "InitialPassword!1");
  await user.click(screen.getAllByRole("button", { name: "Create user" })[1]);
  await waitFor(() => expect(api.createAdminUser).toHaveBeenCalledWith({ name: "New Requester", email: "new@example.test", role: "REQUESTER", isActive: true, initialPassword: "InitialPassword!1" }));
  expect(await screen.findByText(/user created/i)).toBeInTheDocument();
});
