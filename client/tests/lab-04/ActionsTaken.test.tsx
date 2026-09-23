import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ActionsTaken from "../../src/ActionsTaken.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), createStaffAction: vi.fn(), updateStaffAction: vi.fn() }));
const actor = { id: 2, name: "Mali Staff", email: "mali@example.test", role: "IT_STAFF" as const };
const action = { id: 9, ticketId: 42, actionDateTime: "2026-09-22T09:30:00.000Z", description: "Checked logs.", result: "Failure reproduced.", performedBy: actor, followUpRequired: false, followUpNote: null, attachmentNotes: null, createdAt: "2026-09-22T09:31:00.000Z", updatedAt: "2026-09-22T09:31:00.000Z" };
describe("Lab 4 Actions Taken UI", () => {
  it("keeps Requester Actions Taken read-only", () => { render(<ActionsTaken ticketId={42} initialActions={[action]} readOnly />); expect(screen.getByRole("heading", { name: "Actions Taken" })).toBeInTheDocument(); expect(screen.getByText("Checked logs.")).toBeInTheDocument(); expect(screen.queryByRole("button", { name: "Add Action Taken" })).not.toBeInTheDocument(); });
  it("creates an Action Taken with required follow-up data", async () => { const user = userEvent.setup(); vi.mocked(api.createStaffAction).mockResolvedValue({ ...action, id: 10, followUpRequired: true, followUpNote: "Confirm with Requester." }); render(<ActionsTaken ticketId={42} />); await user.click(screen.getByRole("button", { name: "Add Action Taken" })); await user.type(screen.getByLabelText(/Action Description/), "Checked logs."); await user.type(screen.getByLabelText(/^Result/), "Failure reproduced."); await user.click(screen.getByLabelText("Follow-Up Required?")); await user.type(screen.getByLabelText(/Follow-Up Note/), "Confirm with Requester."); await user.click(screen.getByRole("button", { name: "Save Action Taken" })); await waitFor(() => expect(api.createStaffAction).toHaveBeenCalledWith(42, expect.objectContaining({ followUpRequired: true, followUpNote: "Confirm with Requester." }))); });
});
