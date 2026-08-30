import { ChangeEvent, useState } from "react";
import {
  Attachment,
  downloadAttachment,
  removeAttachment,
  uploadTicketAttachments,
} from "./api.js";

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function validateFile(file: File) {
  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!MIME_BY_EXTENSION[extension] || MIME_BY_EXTENSION[extension] !== file.type) {
    return "Only JPG, JPEG, PNG, WEBP, and PDF files are supported.";
  }
  if (file.size < 1 || file.size > MAX_BYTES) return "File must be no larger than 5 MiB.";
  return "";
}

export default function AttachmentSection({
  requesterId,
  ticketId,
  attachments,
  onChanged,
}: {
  requesterId: number;
  ticketId: number;
  attachments: Attachment[];
  onChanged: (attachments: Attachment[]) => void;
}) {
  const [selected, setSelected] = useState<File[]>([]);
  const [validation, setValidation] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Attachment | null>(null);
  const [reason, setReason] = useState("");

  const active = attachments.filter((attachment) => attachment.state === "ACTIVE");
  const removed = attachments.filter((attachment) => attachment.state === "REMOVED");

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const invalid = files.map(validateFile).find(Boolean);
    if (invalid) {
      setValidation(invalid);
      setSelected([]);
      return;
    }
    if (files.length > 5 || active.length + files.length > 5) {
      setValidation("A Ticket can have at most five active Attachments.");
      setSelected([]);
      return;
    }
    setValidation("");
    setFailure("");
    setSelected(files);
  }

  async function upload() {
    if (selected.length === 0 || busy) return;
    setBusy(true);
    setFailure("");
    try {
      const created = await uploadTicketAttachments(requesterId, ticketId, selected);
      onChanged([...attachments, ...created]);
      setSelected([]);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Attachment upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmRemove() {
    if (!removeTarget || reason.trim().length < 3 || reason.trim().length > 500 || busy) return;
    setBusy(true);
    setFailure("");
    try {
      const updated = await removeAttachment(requesterId, removeTarget.id, reason);
      onChanged(attachments.map((attachment) => attachment.id === updated.id ? updated : attachment));
      setRemoveTarget(null);
      setReason("");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Attachment removal failed.");
    } finally {
      setBusy(false);
    }
  }

  async function download(attachment: Attachment) {
    setFailure("");
    try {
      const result = await downloadAttachment(requesterId, attachment.id);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Attachment download failed.");
    }
  }

  return (
    <section className="form-section attachment-section" aria-labelledby="attachments-heading">
      <div className="section-heading">
        <div>
          <h2 id="attachments-heading">Attachments</h2>
          <p>{active.length} of 5 active attachments. Removed files remain in the record.</p>
        </div>
        <label className="button button--secondary attachment-picker">
          Add attachments
          <input
            type="file"
            name="files"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={selectFiles}
            disabled={busy || active.length >= 5}
          />
        </label>
      </div>

      {validation && <div className="field-error" role="alert">{validation}</div>}
      {selected.length > 0 && (
        <div className="attachment-upload-panel" aria-live="polite">
          <strong>Selected files</strong>
          <ul>{selected.map((file) => <li key={file.name}>{file.name} ({formatSize(file.size)})</li>)}</ul>
          <button className="button button--primary" type="button" onClick={() => void upload()} disabled={busy}>
            {busy ? "Uploading…" : "Confirm add attachments"}
          </button>
        </div>
      )}
      {failure && <div className="state-panel state-panel--error" role="alert">{failure}</div>}

      {attachments.length === 0 ? (
        <div className="state-panel" role="note">No attachments have been added.</div>
      ) : (
        <ul className="attachment-list">
          {active.map((attachment) => (
            <li key={attachment.id} className="attachment-row">
              <div>
                <strong>{attachment.originalFilename}</strong>
                <span>{attachment.mimeType} · {formatSize(attachment.sizeBytes)} · Uploaded {formatDate(attachment.uploadedAt)}</span>
              </div>
              <div className="attachment-actions">
                <button className="button button--secondary" type="button" onClick={() => void download(attachment)}>Download</button>
                <button className="button button--danger" type="button" onClick={() => setRemoveTarget(attachment)} disabled={busy}>Remove</button>
              </div>
            </li>
          ))}
          {removed.map((attachment) => (
            <li key={attachment.id} className="attachment-row attachment-row--removed">
              <div>
                <strong>{attachment.originalFilename} <span className="badge badge--removed">Removed</span></strong>
                <span>{attachment.mimeType} · {formatSize(attachment.sizeBytes)} · Removed {attachment.removedAt ? formatDate(attachment.removedAt) : ""}</span>
                {attachment.removalReason && <span>Reason: {attachment.removalReason}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {removeTarget && (
        <div className="dialog-backdrop" role="presentation">
          <section className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="remove-heading">
            <h2 id="remove-heading">Remove attachment?</h2>
            <p><strong>{removeTarget.originalFilename}</strong> will no longer be available for download.</p>
            <label htmlFor="removal-reason">Removal reason (3–500 characters)</label>
            <textarea id="removal-reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={4} />
            {reason.trim().length > 0 && (reason.trim().length < 3 || reason.trim().length > 500) && <span className="field-error">Enter a reason between 3 and 500 characters.</span>}
            <div className="form-actions">
              <button className="button button--tertiary" type="button" onClick={() => { setRemoveTarget(null); setReason(""); }} disabled={busy}>Cancel</button>
              <button className="button button--danger" type="button" onClick={() => void confirmRemove()} disabled={busy || reason.trim().length < 3 || reason.trim().length > 500}>{busy ? "Removing…" : "Confirm removal"}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
