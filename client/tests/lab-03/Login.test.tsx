import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Login from "../../src/Login.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), loginUser: vi.fn() }));
const user = { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test", role: "REQUESTER" as const, isActive: true, mustChangePassword: false };
describe("Lab 3 Login", () => {
  it("validates credentials and returns the authenticated user", async () => {
    const onLoggedIn = vi.fn(); vi.mocked(api.loginUser).mockResolvedValue(user); const actor = userEvent.setup(); render(<Login onLoggedIn={onLoggedIn} />);
    await actor.click(screen.getByRole("button", { name: "Sign in" })); expect(screen.getByRole("alert")).toHaveTextContent(/enter your email/i);
    await actor.type(screen.getByLabelText("Email address"), user.email); await actor.type(screen.getByLabelText("Password"), "Requester-Change1!"); await actor.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onLoggedIn).toHaveBeenCalledWith(user);
  });
});
