import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AttachmentSection from "../../src/AttachmentSection.js";

const apiMocks = vi.hoisted(() => ({
  uploadTicketAttachments: vi.fn(),
  removeAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
}));

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js");
  return { ...actual, ...apiMocks };
});

const active = {
  id: 8,
  originalFilename: "report.png",
  mimeType: "image/png",
  sizeBytes: 4,
  uploadedAt: "2026-08-24T08:31:00.000Z",
  removedAt: null,
  removalReason: null,
  state: "ACTIVE" as const,
};

describe("AttachmentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.uploadTicketAttachments.mockResolvedValue([]);
    apiMocks.removeAttachment.mockResolvedValue({ ...active, removedAt: "2026-08-25T08:30:00.000Z", removalReason: "Wrong file", state: "REMOVED" });
  });

  it("keeps removed metadata visible without active-file actions", () => {
    render(<AttachmentSection requesterId={1} ticketId={42} attachments={[{ ...active, removedAt: "2026-08-25T08:30:00.000Z", removalReason: "Wrong file", state: "REMOVED" }]} onChanged={vi.fn()} />);
    expect(screen.getByText("Removed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Download" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("shows specific validation and retains valid selection behavior", async () => {
    const user = userEvent.setup();
    render(<AttachmentSection requesterId={1} ticketId={42} attachments={[]} onChanged={vi.fn()} />);
    const invalid = new File(["x"], "bad.pdf", { type: "image/png" });
    await user.upload(screen.getByLabelText("Add attachments"), invalid);
    expect(screen.getByRole("alert")).toHaveTextContent(/Only JPG, JPEG, PNG, WEBP, and PDF/i);
    const valid = new File(["pdf"], "report.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Add attachments"), valid);
    expect(screen.getByText(/report\.pdf/)).toBeInTheDocument();
  });
});
