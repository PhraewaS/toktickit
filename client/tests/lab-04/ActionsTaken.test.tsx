import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActionsTaken from "../../src/ActionsTaken.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({
  ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")),
  fetchRequesterActions: vi.fn(),
  fetchStaffActions: vi.fn(),
  createStaffAction: vi.fn(),
  updateStaffAction: vi.fn(),
}));

const actor = { id: 2, name: "Mali Staff" };
const action = { id: 9, ticketId: 42, actionDateTime: "2026-09-22T09:30:00.000Z", description: "Checked logs.", result: "Failure reproduced.", performedBy: actor, followUpRequired: false, followUpNote: null, attachmentNotes: null, createdAt: "2026-09-22T09:31:00.000Z", updatedAt: "2026-09-22T09:31:00.000Z" };

describe("Lab 4 Actions Taken UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchRequesterActions).mockResolvedValue([]);
    vi.mocked(api.fetchStaffActions).mockResolvedValue([]);
  });

  it("loads Requester Actions Taken in read-only mode", async () => {
    vi.mocked(api.fetchRequesterActions).mockResolvedValue([action]);
    render(<ActionsTaken ticketId={42} readOnly />);

    expect(await screen.findByText("Checked logs.")).toBeInTheDocument();
    expect(screen.getByText("Failure reproduced.")).toBeInTheDocument();
    expect(screen.getByText("Performed by Mali Staff")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Action Taken" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Edit Action Taken/ })).not.toBeInTheDocument();
    expect(api.fetchRequesterActions).toHaveBeenCalledWith(42);
    expect(api.fetchStaffActions).not.toHaveBeenCalled();
  });

  it("loads an empty state and allows IT Staff to create an action with follow-up", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createStaffAction).mockResolvedValue({ ...action, id: 10, followUpRequired: true, followUpNote: "Confirm with Requester." });
    render(<ActionsTaken ticketId={42} />);

    expect(await screen.findByText("No Actions Taken have been recorded for this Ticket.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add Action Taken" }));
    await user.type(screen.getByLabelText(/Action Description/), "Checked logs.");
    await user.type(screen.getByLabelText(/^Result/), "Failure reproduced.");
    await user.click(screen.getByRole("checkbox", { name: "Follow-Up Required?" }));
    await user.type(screen.getByLabelText(/Follow-Up Note/), "Confirm with Requester.");
    await user.click(screen.getByRole("button", { name: "Save Action Taken" }));

    await waitFor(() => expect(api.createStaffAction).toHaveBeenCalledWith(42, expect.objectContaining({ followUpRequired: true, followUpNote: "Confirm with Requester." }), expect.any(String)));
    expect(await screen.findByText("Confirm with Requester.")).toBeInTheDocument();
  });

  it("sends the loaded updatedAt token when editing", async () => {
    const user = userEvent.setup();
    const preciseAction = { ...action, actionDateTime: "2026-09-22T09:30:47.000Z" };
    vi.mocked(api.fetchStaffActions).mockResolvedValue([preciseAction]);
    vi.mocked(api.updateStaffAction).mockResolvedValue({ ...action, result: "Verified after repair." });
    render(<ActionsTaken ticketId={42} />);

    await user.click(await screen.findByRole("button", { name: /^Edit Action Taken/ }));
    const form = screen.getByRole("form", { name: "Edit Action Taken" });
    await user.clear(within(form).getByLabelText(/^Result/));
    await user.type(within(form).getByLabelText(/^Result/), "Verified after repair.");
    await user.click(within(form).getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(api.updateStaffAction).toHaveBeenCalledWith(42, 9, expect.objectContaining({ actionDateTime: preciseAction.actionDateTime, updatedAt: action.updatedAt, result: "Verified after repair." })));
    expect(await screen.findByText("Verified after repair.")).toBeInTheDocument();
  });

  it("maps server validation errors to the matching field", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createStaffAction).mockRejectedValue(new api.ApiError("Review the highlighted Action Taken fields and try again.", { followUpNote: "Follow-Up Note is required." }, "VALIDATION_ERROR"));
    render(<ActionsTaken ticketId={42} />);

    await user.click(await screen.findByRole("button", { name: "Add Action Taken" }));
    await user.type(screen.getByLabelText(/Action Description/), "Checked logs.");
    await user.type(screen.getByLabelText(/^Result/), "Failure reproduced.");
    await user.click(screen.getByRole("checkbox", { name: "Follow-Up Required?" }));
    await user.type(screen.getByLabelText(/Follow-Up Note/), "Confirm with Requester.");
    await user.click(screen.getByRole("button", { name: "Save Action Taken" }));

    expect(await screen.findByText("Follow-Up Note is required.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Follow-Up Note/)).toHaveAttribute("aria-invalid", "true");
  });

  it("shows a stale-update conflict and refreshes the Action list", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffActions).mockResolvedValueOnce([action]).mockRejectedValueOnce(new Error("Temporary refresh failure")).mockResolvedValueOnce([{ ...action, result: "Changed by another staff member." }]);
    vi.mocked(api.updateStaffAction).mockRejectedValue(new api.ApiError("This Action Taken changed after it was loaded. Refresh and try again.", undefined, "ACTION_UPDATE_CONFLICT"));
    render(<ActionsTaken ticketId={42} />);

    await user.click(await screen.findByRole("button", { name: /^Edit Action Taken/ }));
    const draftResult = screen.getByLabelText(/^Result/);
    await user.clear(draftResult);
    await user.type(draftResult, "My unsaved notes to keep.");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(await screen.findByText("This Action Taken changed after it was loaded. Refresh and try again.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Refresh Actions Taken" }));
    expect(await screen.findByText("Temporary refresh failure")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Result/)).toHaveValue("My unsaved notes to keep.");
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Changed by another staff member.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Result/)).toHaveValue("My unsaved notes to keep.");
    expect(api.fetchStaffActions).toHaveBeenCalledTimes(3);
  });

  it("reuses the same idempotency key when retrying a create after an uncertain response", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createStaffAction).mockRejectedValueOnce(new api.ApiError("TokTickIT could not complete the request. Please try again."))
      .mockResolvedValueOnce({ ...action, id: 10 });
    render(<ActionsTaken ticketId={42} />);

    await user.click(await screen.findByRole("button", { name: "Add Action Taken" }));
    await user.type(screen.getByLabelText(/Action Description/), "Checked logs.");
    await user.type(screen.getByLabelText(/^Result/), "Failure reproduced.");
    await user.click(screen.getByRole("button", { name: "Save Action Taken" }));
    expect(await screen.findByText("TokTickIT could not complete the request. Please try again.")).toBeInTheDocument();
    expect(await screen.findByText(/save result may be unknown/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Action Description/)).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Save Action Taken" }));

    await waitFor(() => expect(api.createStaffAction).toHaveBeenCalledTimes(2));
    const firstKey = vi.mocked(api.createStaffAction).mock.calls[0][2];
    const retryKey = vi.mocked(api.createStaffAction).mock.calls[1][2];
    expect(firstKey).toMatch(/^[0-9a-f-]{36}$/i);
    expect(retryKey).toBe(firstKey);
    expect(screen.getAllByText("Checked logs.")).toHaveLength(1);
  });

  it("reconciles the action list before allowing another create after discarding an uncertain draft", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffActions).mockResolvedValueOnce([]).mockResolvedValueOnce([{ ...action, id: 10 }]);
    vi.mocked(api.createStaffAction).mockRejectedValueOnce(new api.ApiError("TokTickIT could not complete the request. Please try again."));
    render(<ActionsTaken ticketId={42} />);

    await user.click(await screen.findByRole("button", { name: "Add Action Taken" }));
    await user.type(screen.getByLabelText(/Action Description/), "Checked logs.");
    await user.type(screen.getByLabelText(/^Result/), "Failure reproduced.");
    await user.click(screen.getByRole("button", { name: "Save Action Taken" }));
    expect(await screen.findByText(/save result may be unknown/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Discard draft" }));

    expect(await screen.findByText("Checked logs.")).toBeInTheDocument();
    expect(api.fetchStaffActions).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("form", { name: "Create Action Taken" })).not.toBeInTheDocument();
  });

  it("shows forbidden access without exposing a mutation form", async () => {
    vi.mocked(api.fetchRequesterActions).mockRejectedValue(new api.ApiError("Actions Taken are not available for this account.", undefined, "ROLE_FORBIDDEN"));
    render(<ActionsTaken ticketId={42} readOnly />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Actions Taken are not available for this account.");
    expect(screen.queryByRole("button", { name: "Add Action Taken" })).not.toBeInTheDocument();
  });

  it("offers retry when loading fails", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffActions).mockRejectedValueOnce(new Error("Temporary failure")).mockResolvedValueOnce([action]);
    render(<ActionsTaken ticketId={42} />);

    expect(await screen.findByText("Temporary failure")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Checked logs.")).toBeInTheDocument();
  });
});
