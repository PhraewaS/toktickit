import { useEffect, useState } from "react";
import { assignStaffTicket, createStaffComment, createStaffNote, downloadStaffAttachment, fetchAssignableStaff, fetchStaffTicketDetail, StaffTicket, TicketStatus, updateStaffPriority, updateStaffStatus, User } from "./api.js";

const allowedTransitions: Readonly<Record<TicketStatus, readonly TicketStatus[]>> = { NEW: ["OPEN"], OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "CANCELLED"], IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"], WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"], RESOLVED: ["CLOSED", "REOPENED"], CLOSED: ["REOPENED"], REOPENED: [], CANCELLED: [] };

function label(value: string) {
  return value.replaceAll("_", " ");
}

export default function StaffTicketDetail({ ticketId, onBack, currentUser }: { ticketId: number; onBack: () => void; currentUser: User }) {
  const [ticket, setTicket] = useState<StaffTicket | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState("");
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [owners, setOwners] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [attachmentFailure, setAttachmentFailure] = useState("");
  const isStaff = currentUser.role === "IT_STAFF";
  const isAdmin = currentUser.role === "ADMINISTRATOR";

  async function load() {
    setState("loading");
    setFailure("");
    try {
      const loaded = await fetchStaffTicketDetail(ticketId);
      const assignees = isStaff ? await fetchAssignableStaff() : [];
      setTicket(loaded);
      setOwners(assignees);
      setState("ready");
    } catch {
      setFailure("TokTickIT could not load this Ticket. Please try again.");
      setState("error");
    }
  }

  useEffect(() => {
    void load();
  }, [ticketId, currentUser.role]);

  async function operation(action: () => Promise<StaffTicket>) {
    setSaving(true);
    setFailure("");
    try {
      setTicket(await action());
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The Ticket could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function downloadAttachment(attachmentId: number) {
    setDownloadId(attachmentId);
    setAttachmentFailure("");
    try {
      const result = await downloadStaffAttachment(attachmentId);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setAttachmentFailure("TokTickIT could not download this Attachment. Please try again.");
    } finally {
      setDownloadId(null);
    }
  }

  if (state === "loading") return <section className="ticket-page"><div className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Loading Ticket detail…</div></section>;
  if (state === "error" || !ticket) return <section className="ticket-page"><button className="button button--tertiary" type="button" onClick={onBack}>← Back to Queue</button><div className="state-panel state-panel--error" role="alert"><strong>Could not load Ticket detail.</strong><span>{failure}</span><button className="button button--secondary" type="button" onClick={() => void load()}>Try again</button></div></section>;

  const attachments = ticket.attachments ?? [];
  const comments = ticket.publicComments ?? [];
  const notes = ticket.internalNotes ?? [];

  return <section className="ticket-page ticket-detail-page" aria-labelledby="staff-detail-heading">
    <button className="button button--tertiary back-link" type="button" onClick={onBack}>← Back to Queue</button>
    <div className="page-heading"><div><span className="eyebrow">{isAdmin ? "Administrator ticket oversight" : "IT Staff ticket detail"}</span><h1 id="staff-detail-heading">{ticket.ticketNumber}</h1><p className="lead-copy">Operational controls are server-authorized and append-only communication is preserved.</p></div><div className="detail-badges"><span className="badge badge--status">{label(ticket.currentStatus)}</span><span className="badge badge--priority">Requested {ticket.requestedPriority}</span><span className="badge badge--priority">IT {ticket.itPriority}</span></div></div>
    {failure && <div className="state-panel state-panel--error" role="alert">{failure}</div>}
    <div className="detail-grid">
      <fieldset className="form-section" disabled><legend>Ticket information</legend><div className="form-grid form-grid--three"><div className="field-group"><label htmlFor="staff-detail-number">Ticket Number</label><input id="staff-detail-number" value={ticket.ticketNumber} readOnly /></div><div className="field-group"><label htmlFor="staff-detail-requester">Requester</label><input id="staff-detail-requester" value={ticket.requester.name} readOnly /></div><div className="field-group"><label htmlFor="staff-detail-category">Category</label><input id="staff-detail-category" value={ticket.category.name} readOnly /></div></div><div className="field-group"><label htmlFor="staff-detail-summary">Summary</label><input id="staff-detail-summary" value={ticket.summary} readOnly /></div><div className="field-group"><label htmlFor="staff-detail-description">Description</label><textarea id="staff-detail-description" value={ticket.description} rows={5} readOnly /></div></fieldset>
      <fieldset className="form-section"><legend>Operational controls</legend><div className="form-grid form-grid--three">
        <div className="field-group"><label htmlFor="staff-owner-select">Ticket owner</label>{isStaff ? <><select id="staff-owner-select" value={ticket.owner?.id ?? ""} onChange={(e) => void operation(() => assignStaffTicket(ticket.id, e.target.value ? Number(e.target.value) : null))} disabled={saving}><option value="">Unassigned</option>{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} ({label(owner.role)})</option>)}{!owners.some((owner) => owner.id === currentUser.id) && <option value={currentUser.id}>{currentUser.name} (me)</option>}</select><button className="button button--secondary" type="button" disabled={saving || ticket.owner?.id === currentUser.id} onClick={() => void operation(() => assignStaffTicket(ticket.id, currentUser.id))}>Claim for me</button></> : <input id="staff-owner-select" value={ticket.owner ? `${ticket.owner.name} (${label(ticket.owner.role ?? "")})` : "Unassigned"} readOnly aria-readonly="true" />}</div>
        <div className="field-group"><label htmlFor="staff-it-priority">IT Priority</label><select id="staff-it-priority" value={ticket.itPriority} onChange={(e) => void operation(() => updateStaffPriority(ticket.id, e.target.value as StaffTicket["itPriority"]))} disabled={saving}>{["LOW", "MEDIUM", "HIGH"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></div>
        {isStaff && <div className="field-group"><label htmlFor="staff-status-update">Move status from {label(ticket.currentStatus)}</label><select id="staff-status-update" defaultValue="" onChange={(e) => { if (e.target.value) void operation(() => updateStaffStatus(ticket.id, e.target.value as StaffTicket["currentStatus"])); }} disabled={saving}><option value="">Choose next status</option>{allowedTransitions[ticket.currentStatus].map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></div>}
      </div>{isAdmin && <p className="field-help">Administrator oversight is read-only except for IT Priority.</p>}</fieldset>
    </div>
    <section className="form-section attachment-panel" aria-labelledby="staff-attachments-heading"><h2 id="staff-attachments-heading">Attachments</h2>{attachments.length === 0 ? <p className="state-panel" role="status">No Attachments are available for this Ticket.</p> : <ul className="attachment-list">{attachments.map((attachment) => <li key={attachment.id} className="attachment-item"><div><strong>{attachment.originalFilename}</strong><span>{attachment.mimeType} · {attachment.sizeBytes} bytes</span></div><button className="button button--secondary" type="button" disabled={downloadId === attachment.id} onClick={() => void downloadAttachment(attachment.id)}>{downloadId === attachment.id ? "Downloading…" : "Download"}</button></li>)}</ul>}{attachmentFailure && <div className="state-panel state-panel--error" role="alert">{attachmentFailure}</div>}</section>
    <section className="form-section requester-resolution-panel" aria-labelledby="staff-requester-resolution-heading"><h2 id="staff-requester-resolution-heading">Requester resolution</h2>{ticket.requesterResolvedAt ? <p role="status">Requester marked this problem as appears resolved on <time dateTime={ticket.requesterResolvedAt}>{new Date(ticket.requesterResolvedAt).toLocaleString()}</time>.</p> : <p role="status">Requester has not marked this problem as appears resolved.</p>}</section>
    <section className="form-section comment-panel" aria-labelledby="staff-comments-heading"><h2 id="staff-comments-heading">Public Comments</h2><p>Visible to the Requester, IT Staff, and Administrator.</p><div className="entry-list">{comments.length === 0 ? <p className="state-panel" role="status">No Public Comments yet.</p> : comments.map((entry) => <article className="entry" key={entry.id}><strong>{entry.author.name}</strong><time>{new Date(entry.createdAt).toLocaleString()}</time><p>{entry.content}</p></article>)}</div>{isStaff ? <div className="field-group"><label htmlFor="staff-public-comment">Add Public Comment</label><textarea id="staff-public-comment" rows={3} value={content} onChange={(e) => setContent(e.target.value)} maxLength={5000} /><button className="button button--primary" type="button" disabled={saving || !content.trim()} onClick={async () => { setSaving(true); setFailure(""); try { const entry = await createStaffComment(ticket.id, content); setTicket({ ...ticket, publicComments: [...comments, entry] }); setContent(""); } catch (error) { setFailure(error instanceof Error ? error.message : "The Public Comment could not be saved."); } finally { setSaving(false); } }}>Post Public Comment</button></div> : <p className="field-help">Administrator view is read-only for Public Comments.</p>}</section>
    <section className="form-section internal-note-panel" aria-labelledby="staff-notes-heading"><h2 id="staff-notes-heading">Internal Notes</h2><p>Private to IT Staff and Administrators. Never post sensitive operational content publicly.</p><div className="entry-list">{notes.length === 0 ? <p className="state-panel" role="status">No Internal Notes yet.</p> : notes.map((entry) => <article className="entry" key={entry.id}><strong>{entry.author.name}</strong><time>{new Date(entry.createdAt).toLocaleString()}</time><p>{entry.content}</p></article>)}</div>{isStaff ? <div className="field-group"><label htmlFor="staff-internal-note">Add Internal Note</label><textarea id="staff-internal-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={5000} /><button className="button button--primary" type="button" disabled={saving || !note.trim()} onClick={async () => { setSaving(true); setFailure(""); try { const entry = await createStaffNote(ticket.id, note); setTicket({ ...ticket, internalNotes: [...notes, entry] }); setNote(""); } catch (error) { setFailure(error instanceof Error ? error.message : "The Internal Note could not be saved."); } finally { setSaving(false); } }}>Add Internal Note</button></div> : <p className="field-help">Administrator view is read-only for Internal Notes.</p>}</section>
  </section>;
}
