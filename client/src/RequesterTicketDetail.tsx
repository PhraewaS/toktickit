import { useCallback, useEffect, useState } from "react";
import { createRequesterComment, DevelopmentRequester, fetchRequesterComments, fetchTicketDetail, markRequesterResolved, Ticket, CommentEntry } from "./api.js";
import AttachmentSection from "./AttachmentSection.js";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default function RequesterTicketDetail({
  requester,
  ticketId,
  onBack,
}: {
  requester: DevelopmentRequester;
  ticketId: number;
  onBack: () => void;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [failure, setFailure] = useState("");
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    setTicket(null);
    try {
      const loaded = await fetchTicketDetail(requester.id, ticketId);
      setTicket(loaded);
      void fetchRequesterComments(ticketId).then(setComments).catch(() => undefined);
      setState("ready");
    } catch (error) {
      void error;
      setFailure("TokTickIT could not load the Ticket. Please try again.");
      setState("error");
    }
  }, [requester.id, ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === "loading") {
    return <section className="ticket-page" aria-labelledby="ticket-detail-heading"><div className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Loading Ticket detail…</div></section>;
  }

  if (state === "error" || !ticket) {
    return <section className="ticket-page" aria-labelledby="ticket-detail-heading"><button className="button button--tertiary" type="button" onClick={onBack}>← Back to My Tickets</button><div className="state-panel state-panel--error" role="alert"><strong>Could not load Ticket detail.</strong><span>{failure}</span><button className="button button--secondary" type="button" onClick={() => void load()}>Try again</button></div></section>;
  }

  return (
    <section className="ticket-page ticket-detail-page" aria-labelledby="ticket-detail-heading">
      <button className="button button--tertiary back-link" type="button" onClick={onBack}>← Back to My Tickets</button>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Requester ticket detail</span>
          <h1 id="ticket-detail-heading">{ticket.ticketNumber}</h1>
          <p className="lead-copy">Read-only details for {requester.name}.</p>
        </div>
        <div className="detail-badges">
          <span className="badge badge--status">{ticket.currentStatus}</span>
          <span className="badge badge--priority">{ticket.requestedPriority}</span>
        </div>
      </div>

      <div className="detail-grid">
        <fieldset className="form-section" disabled>
          <legend>Ticket information</legend>
          <div className="form-grid form-grid--three">
            <div className="field-group"><label htmlFor="detail-number">Ticket Number</label><input id="detail-number" value={ticket.ticketNumber} readOnly /></div>
            <div className="field-group"><label htmlFor="detail-date">Ticket Date</label><input id="detail-date" value={formatDate(ticket.ticketDate)} readOnly /></div>
            <div className="field-group"><label htmlFor="detail-requester">Requester</label><input id="detail-requester" value={ticket.requester.name} readOnly /></div>
            <div className="field-group"><label htmlFor="detail-category">Category</label><input id="detail-category" value={ticket.category.name} readOnly /></div>
            <div className="field-group"><label htmlFor="detail-system">Related System</label><input id="detail-system" value={ticket.relatedSystem.name} readOnly /></div>
            <div className="field-group"><label htmlFor="detail-updated">Last Updated</label><input id="detail-updated" value={formatDate(ticket.updatedAt)} readOnly /></div>
          </div>
          <div className="field-group"><label htmlFor="detail-summary">Summary</label><input id="detail-summary" value={ticket.summary} readOnly /></div>
          <div className="field-group"><label htmlFor="detail-description">Description</label><textarea id="detail-description" value={ticket.description} rows={7} readOnly /></div>
        </fieldset>
      </div>

      <AttachmentSection
        requesterId={requester.id}
        ticketId={ticket.id}
        attachments={ticket.attachments ?? []}
        onChanged={(attachments) => setTicket((current) => current ? { ...current, attachments } : current)}
      />
      <section className="form-section comment-panel" aria-labelledby="requester-comments-heading">
        <h2 id="requester-comments-heading">Public Comments</h2>
        <p>Shared with the Requester and IT Staff.</p>
        <div className="entry-list">{comments.map((entry) => <article className="entry" key={entry.id}><strong>{entry.author.name}</strong><time>{formatDate(entry.createdAt)}</time><p>{entry.content}</p></article>)}</div>
        <div className="field-group"><label htmlFor="requester-comment">Add Public Comment</label><textarea id="requester-comment" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={5000} /><button className="button button--primary" type="button" disabled={posting || !comment.trim()} onClick={async () => { setPosting(true); try { const entry = await createRequesterComment(ticket.id, comment); setComments((current) => [...current, entry]); setComment(""); } catch (error) { setFailure(error instanceof Error ? error.message : "The Public Comment could not be saved."); } finally { setPosting(false); } }}>Post Public Comment</button></div>
      </section>
      <section className="form-section requester-resolution-panel" aria-labelledby="requester-resolution-heading"><h2 id="requester-resolution-heading">Problem resolution</h2><p>This does not formally resolve or close the Ticket; it tells IT Staff that the problem appears resolved.</p><button className="button button--secondary" type="button" disabled={!!ticket.requesterResolvedAt || posting} onClick={async () => { setPosting(true); try { const result = await markRequesterResolved(ticket.id); setTicket((current) => current ? { ...current, requesterResolvedAt: result.requesterResolvedAt } : current); } catch (error) { setFailure(error instanceof Error ? error.message : "The resolution indication could not be saved."); } finally { setPosting(false); } }}>{ticket.requesterResolvedAt ? "Problem marked as appears resolved" : "Problem appears resolved"}</button></section>
    </section>
  );
}
