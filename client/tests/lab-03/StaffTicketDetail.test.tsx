import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StaffTicketDetail from "../../src/StaffTicketDetail.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchStaffTicketDetail: vi.fn(), fetchAssignableStaff: vi.fn(), assignStaffTicket: vi.fn(), updateStaffPriority: vi.fn(), updateStaffStatus: vi.fn(), createStaffComment: vi.fn(), createStaffNote: vi.fn(), downloadStaffAttachment: vi.fn() }));
const actor = { id: 2, name: "Mali Support", email: "mali.staff@example.test", role: "IT_STAFF" as const, isActive: true, mustChangePassword: false }; const ticket = { id: 42, ticketNumber: "TKT-20260908-10000000", requester: { id: 1, name: "Jennifer", email: "j@example.test" }, category: { id: 1, name: "Hardware" }, relatedSystem: { id: 1, name: "Laptop" }, summary: "VPN unavailable", requestedPriority: "HIGH" as const, itPriority: "HIGH" as const, currentStatus: "OPEN" as const, owner: null, requesterResolvedAt: null, createdAt: "2026-09-08T00:00:00Z", updatedAt: "2026-09-08T00:00:00Z", ticketDate: "2026-09-08T00:00:00Z", description: "VPN unavailable", attachments: [], publicComments: [], internalNotes: [] };
describe("Lab 3 IT Staff ticket detail", () => { it("supports claim and private note controls", async () => { vi.mocked(api.fetchStaffTicketDetail).mockResolvedValue(ticket); vi.mocked(api.fetchAssignableStaff).mockResolvedValue([actor]); vi.mocked(api.assignStaffTicket).mockResolvedValue({ ...ticket, owner: actor }); const user = userEvent.setup(); render(<StaffTicketDetail ticketId={42} currentUser={actor} onBack={vi.fn()} />); expect(await screen.findByRole("heading", { name: ticket.ticketNumber })).toBeInTheDocument(); await user.click(screen.getByRole("button", { name: "Claim for me" })); expect(api.assignStaffTicket).toHaveBeenCalledWith(42, 2); expect(screen.getByText(/private to it staff/i)).toBeInTheDocument(); }); });

describe("Administrator ticket oversight", () => {
  it("allows IT Priority and attachment download while keeping operations read-only", async () => {
    const admin = { id: 9, name: "Nok Administrator", email: "admin@example.test", role: "ADMINISTRATOR" as const, isActive: true, mustChangePassword: false };
    const adminTicket = { ...ticket, attachments: [{ id: 8, originalFilename: "report.pdf", mimeType: "application/pdf", sizeBytes: 12, uploadedAt: "2026-09-08T00:00:00Z", removedAt: null, removalReason: null, state: "ACTIVE" as const }] };
    vi.mocked(api.fetchStaffTicketDetail).mockResolvedValue(adminTicket);
    render(<StaffTicketDetail ticketId={42} currentUser={admin} onBack={vi.fn()} />);
    expect(await screen.findByRole("heading", { name: ticket.ticketNumber })).toBeInTheDocument();
    expect(screen.getByLabelText("IT Priority")).toBeInTheDocument();
    expect(screen.getByLabelText("Ticket owner")).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: "Claim for me" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Move status from OPEN")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Post Public Comment" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Internal Note" })).not.toBeInTheDocument();
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
  });

  it("shows only status transitions allowed from the current status and requester resolution", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffTicketDetail).mockResolvedValue({ ...ticket, currentStatus: "RESOLVED", requesterResolvedAt: "2026-09-08T01:00:00Z" });
    vi.mocked(api.updateStaffStatus).mockResolvedValue({ ...ticket, currentStatus: "CLOSED" });
    render(<StaffTicketDetail ticketId={42} currentUser={actor} onBack={vi.fn()} />);
    await screen.findByRole("heading", { name: ticket.ticketNumber });
    const status = screen.getByLabelText(/Move status from RESOLVED/i);
    expect(status).toHaveValue("");
    expect(screen.getByRole("option", { name: "CLOSED" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "REOPENED" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "CANCELLED" })).not.toBeInTheDocument();
    expect(screen.getByText(/Requester marked this problem as appears resolved/i)).toBeInTheDocument();
    await user.selectOptions(status, "CLOSED");
    expect(api.updateStaffStatus).toHaveBeenCalledWith(42, "CLOSED");
  });
});

describe("Staff ticket operations and evidence", () => {
  it("posts Public Comments and Internal Notes through the staff controls", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchStaffTicketDetail).mockResolvedValue(ticket);
    vi.mocked(api.fetchAssignableStaff).mockResolvedValue([actor]);
    vi.mocked(api.createStaffComment).mockResolvedValue({ id: 10, content: "Public update", createdAt: "2026-09-08T01:00:00Z", author: actor });
    vi.mocked(api.createStaffNote).mockResolvedValue({ id: 11, content: "Internal update", createdAt: "2026-09-08T01:00:00Z", author: actor });
    render(<StaffTicketDetail ticketId={42} currentUser={actor} onBack={vi.fn()} />);
    await screen.findByRole("heading", { name: ticket.ticketNumber });
    await user.type(screen.getByLabelText("Add Public Comment"), "Public update");
    await user.click(screen.getByRole("button", { name: "Post Public Comment" }));
    await user.type(screen.getByLabelText("Add Internal Note"), "Internal update");
    await user.click(screen.getByRole("button", { name: "Add Internal Note" }));
    await waitFor(() => expect(api.createStaffComment).toHaveBeenCalledWith(42, "Public update"));
    expect(api.createStaffNote).toHaveBeenCalledWith(42, "Internal update");
  });

  it("downloads an Attachment from Staff Ticket Detail", async () => {
    const user = userEvent.setup();
    const attachmentTicket = { ...ticket, attachments: [{ id: 8, originalFilename: "report.pdf", mimeType: "application/pdf", sizeBytes: 12, uploadedAt: "2026-09-08T00:00:00Z", removedAt: null, removalReason: null, state: "ACTIVE" as const }] };
    vi.mocked(api.fetchStaffTicketDetail).mockResolvedValue(attachmentTicket);
    vi.mocked(api.fetchAssignableStaff).mockResolvedValue([actor]);
    vi.mocked(api.downloadStaffAttachment).mockResolvedValue({ blob: new Blob(["report"]), filename: "report.pdf" });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    render(<StaffTicketDetail ticketId={42} currentUser={actor} onBack={vi.fn()} />);
    await screen.findByRole("heading", { name: ticket.ticketNumber });
    await user.click(screen.getByRole("button", { name: "Download" }));
    await waitFor(() => expect(api.downloadStaffAttachment).toHaveBeenCalledWith(8));
    anchorClick.mockRestore();
  });
});
