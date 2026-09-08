import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserManagement from "../../src/UserManagement.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchUsers: vi.fn(), createAdminUser: vi.fn(), updateAdminUser: vi.fn(), resetAdminPassword: vi.fn() }));
const admin = { id: 9, name: "Nok Administrator", email: "admin@example.test", role: "ADMINISTRATOR" as const, isActive: true, mustChangePassword: false };
describe("Lab 3 User Management", () => { it("renders the minimalist administrator list and create action", async () => { vi.mocked(api.fetchUsers).mockResolvedValue([admin]); render(<UserManagement currentUser={admin} />); expect(await screen.findByText(admin.email)).toBeInTheDocument(); expect(screen.getAllByRole("button", { name: "Create user" }).length).toBeGreaterThan(0); expect(screen.getByRole("button", { name: "Set initial password" })).toBeInTheDocument(); }); });
