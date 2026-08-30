import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequesterTicketDetail from "../../src/RequesterTicketDetail.js";

const apiMocks = vi.hoisted(() => ({
  fetchTicketDetail: vi.fn(),
  uploadTicketAttachments: vi.fn(),
  removeAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
}));

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js");
  return { ...actual, ...apiMocks };
});

const requester = { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" };
const attachment = {
  id: 8,
  originalFilename: "report.png",
  mimeType: "image/png",
  sizeBytes: 4,
  uploadedAt: "2026-08-24T08:31:00.000Z",
  removedAt: null,
  removalReason: null,
  state: "ACTIVE" as const,
};
const ticket = {
  id: 42,
  ticketNumber: "TKT-20260824-A1B2C3D4",
  ticketDate: "2026-08-24T08:30:00.000Z",
  requester,
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
  summary: "Laptop battery drains quickly",
  requestedPriority: "MEDIUM" as const,
  description: "The battery falls from full charge to 20 percent within one hour.",
  currentStatus: "NEW" as const,
  createdAt: "2026-08-24T08:30:00.000Z",
  updatedAt: "2026-08-24T08:30:00.000Z",
  attachments: [attachment],
};

describe("Requester Ticket Detail and attachments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.fetchTicketDetail.mockResolvedValue(ticket);
    apiMocks.uploadTicketAttachments.mockResolvedValue([{ ...attachment, id: 9, originalFilename: "new.pdf", mimeType: "application/pdf" }]);
    apiMocks.removeAttachment.mockResolvedValue({ ...attachment, removedAt: "2026-08-25T08:30:00.000Z", removalReason: "Wrong file", state: "REMOVED" });
  });

  it("shows owned ticket information as read-only and active attachment actions", async () => {
    render(<RequesterTicketDetail requester={requester} ticketId={42} onBack={vi.fn()} />);
    expect(await screen.findByRole("heading", { name: ticket.ticketNumber })).toBeInTheDocument();
    expect(screen.getByLabelText("Summary")).toHaveAttribute("readonly");
    expect(screen.getByText("report.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("uploads a valid file and soft-removes it with a reason", async () => {
    const user = userEvent.setup();
    render(<RequesterTicketDetail requester={requester} ticketId={42} onBack={vi.fn()} />);
    await screen.findByRole("heading", { name: ticket.ticketNumber });
    const file = new File(["pdf"], "new.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Add attachments"), file);
    await user.click(screen.getByRole("button", { name: "Confirm add attachments" }));
    expect(apiMocks.uploadTicketAttachments).toHaveBeenCalledWith(1, 42, [file]);
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    await user.type(screen.getByLabelText(/Removal reason/), "Wrong file");
    await user.click(screen.getByRole("button", { name: "Confirm removal" }));
    expect(apiMocks.removeAttachment).toHaveBeenCalledWith(1, 8, "Wrong file");
    expect(await screen.findByText("Removed")).toBeInTheDocument();
  });

  it("shows a safe detail failure with retry", async () => {
    const user = userEvent.setup();
    apiMocks.fetchTicketDetail.mockRejectedValueOnce(new Error("private SQL path")).mockResolvedValueOnce(ticket);
    render(<RequesterTicketDetail requester={requester} ticketId={42} onBack={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/Could not load Ticket detail/i);
    expect(screen.getByRole("alert")).not.toHaveTextContent("private SQL path");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: ticket.ticketNumber })).toBeInTheDocument();
  });
});
