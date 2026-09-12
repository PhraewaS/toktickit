import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ChangePassword from "../../src/ChangePassword.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), changePassword: vi.fn() }));
describe("Lab 3 first-login password change", () => {
  it("requires matching passwords and continues after saving", async () => {
    const next = { id: 1, name: "Mali Support", email: "mali.staff@example.test", role: "IT_STAFF" as const, isActive: true, mustChangePassword: false }; vi.mocked(api.changePassword).mockResolvedValue(next); const actor = userEvent.setup(); const onChanged = vi.fn(); render(<ChangePassword onChanged={onChanged} />);
    await actor.type(screen.getByLabelText("New password"), "Staff-Changed2!"); await actor.type(screen.getByLabelText("Confirm new password"), "different"); await actor.click(screen.getByRole("button", { name: "Save password" })); expect(screen.getByRole("alert")).toHaveTextContent(/match/i);
    await actor.clear(screen.getByLabelText("Confirm new password")); await actor.type(screen.getByLabelText("Confirm new password"), "Staff-Changed2!"); await actor.click(screen.getByRole("button", { name: "Save password" })); expect(onChanged).toHaveBeenCalledWith(next);
  });

  it("shows a safe password-change failure", async () => {
    vi.mocked(api.changePassword).mockRejectedValue(new Error("private password details"));
    const actor = userEvent.setup();
    render(<ChangePassword onChanged={vi.fn()} />);
    await actor.type(screen.getByLabelText("New password"), "Staff-Changed2!");
    await actor.type(screen.getByLabelText("Confirm new password"), "Staff-Changed2!");
    await actor.click(screen.getByRole("button", { name: "Save password" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not change the password/i);
    expect(screen.getByRole("alert")).not.toHaveTextContent("private password details");
  });
});
