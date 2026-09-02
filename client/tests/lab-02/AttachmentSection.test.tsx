import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps removed metadata visible without active-file actions", () => {
    render(<AttachmentSection requesterId={1} ticketId={42} attachments={[{ ...active, removedAt: "2026-08-25T08:30:00.000Z", removalReason: "Wrong file", state: "REMOVED" }]} onChanged={vi.fn()} />);
    expect(screen.getByText("Removed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Download" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("reports invalid files while retaining valid files for upload", async () => {
    const user = userEvent.setup();
    const valid = new File(["pdf"], "report.pdf", { type: "application/pdf" });
    const invalid = new File(["x"], "bad.pdf", { type: "image/png" });
    render(<AttachmentSection requesterId={1} ticketId={42} attachments={[]} onChanged={vi.fn()} />);
    await user.upload(screen.getByLabelText("Add attachments"), [valid, invalid]);
    expect(screen.getByRole("alert")).toHaveTextContent(/Invalid file.*bad\.pdf/i);
    expect(screen.getByText(/report\.pdf/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm add attachments" }));
    expect(apiMocks.uploadTicketAttachments).toHaveBeenCalledWith(1, 42, [valid]);
  });

  it("downloads an attachment with the active requester and attachment id", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    apiMocks.downloadAttachment.mockResolvedValue({ blob: new Blob(["bytes"], { type: "image/png" }), filename: "report.png" });
    render(<AttachmentSection requesterId={7} ticketId={42} attachments={[active]} onChanged={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Download" }));
    expect(apiMocks.downloadAttachment).toHaveBeenCalledWith(7, 8);
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });

  it("enforces the 3–500 character removal-reason contract", () => {
    render(<AttachmentSection requesterId={1} ticketId={42} attachments={[active]} onChanged={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    const reason = screen.getByLabelText(/Removal reason/);
    const confirm = screen.getByRole("button", { name: "Confirm removal" });
    expect(screen.getByText(/Removal reason \*/)).toBeInTheDocument();
    expect(reason).toBeRequired();
    expect(reason).toHaveAttribute("aria-required", "true");
    expect(reason).toHaveAttribute("minlength", "3");
    expect(reason).toHaveAttribute("maxlength", "500");

    fireEvent.change(reason, { target: { value: "ab" } });
    expect(confirm).toBeDisabled();
    expect(screen.getByText(/between 3 and 500 characters/)).toBeInTheDocument();

    fireEvent.change(reason, { target: { value: "abc" } });
    expect(confirm).not.toBeDisabled();
    fireEvent.change(reason, { target: { value: "a".repeat(500) } });
    expect(confirm).not.toBeDisabled();
    fireEvent.change(reason, { target: { value: "a".repeat(501) } });
    expect(confirm).toBeDisabled();
  });
});
