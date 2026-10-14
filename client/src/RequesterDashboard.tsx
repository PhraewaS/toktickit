import { useEffect, useState } from "react";
import { ApiError, DashboardTicket, fetchRequesterDashboard, RequesterDashboard as RequesterDashboardData, TicketListQuery } from "./api.js";

function label(value: string) { return value.replaceAll("_", " "); }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

function TicketList({ title, tickets, onOpen }: { title: string; tickets: DashboardTicket[]; onOpen: (id: number) => void }) {
  return <section className="dashboard-list" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>
    <div className="section-heading"><h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>{title}</h2></div>
    {tickets.length === 0 ? <p className="state-panel" role="status">No matching Tickets in the recent period.</p> : <ul className="dashboard-ticket-list">{tickets.map((ticket) => <li key={ticket.id}>
      <div><button className="ticket-link" type="button" onClick={() => onOpen(ticket.id)}>{ticket.ticketNumber}</button><strong>{ticket.summary}</strong><span>{formatDate(ticket.updatedAt)}</span></div>
      <span className="badge badge--status">{label(ticket.currentStatus)}</span>
    </li>)}</ul>}
  </section>;
}

export default function RequesterDashboard({ onOpenTicket, onCreateTicket, onOpenMyTickets }: { onOpenTicket: (id: number) => void; onCreateTicket: () => void; onOpenMyTickets: (filters?: TicketListQuery) => void }) {
  const [state, setState] = useState<"loading" | "ready" | "error" | "forbidden">("loading");
  const [dashboard, setDashboard] = useState<RequesterDashboardData | null>(null);

  async function load() {
    setDashboard(null);
    setState("loading");
    try {
      setDashboard(await fetchRequesterDashboard());
      setState("ready");
    } catch (error) {
      setState(error instanceof ApiError && error.code === "ROLE_FORBIDDEN" ? "forbidden" : "error");
    }
  }

  useEffect(() => { void load(); }, []);

  return <section className="ticket-page dashboard-page" aria-labelledby="requester-dashboard-heading" aria-busy={state === "loading"}>
    <div className="page-heading"><div><span className="eyebrow">Requester workspace</span><h1 id="requester-dashboard-heading">Dashboard</h1><p className="lead-copy">A concise view of your Tickets that need attention and recent updates.</p></div><button className="button button--primary" type="button" onClick={onCreateTicket}>Create Ticket</button></div>
    {state === "loading" && <div className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Loading Requester Dashboard…</div>}
    {state === "forbidden" && <div className="state-panel state-panel--error" role="alert"><strong>Dashboard access is unavailable for this account.</strong><span>No protected Dashboard information is being shown.</span><button className="button button--secondary" type="button" onClick={() => onOpenMyTickets()}>Go to My Tickets</button></div>}
    {state === "error" && <div className="state-panel state-panel--error" role="alert"><strong>Could not load Dashboard.</strong><span>TokTickIT could not load your Dashboard. Please try again.</span><button className="button button--secondary" type="button" onClick={() => void load()}>Try again</button></div>}
    {state === "ready" && dashboard && <>
      <div className="metric-grid" aria-label="Requester Dashboard metrics">
        <article className="metric-card"><span>Open Tickets</span><strong>{dashboard.metrics.openTickets}</strong><button type="button" className="dashboard-link" onClick={() => onOpenMyTickets({ activeOnly: true })}>View My Tickets</button></article>
        <article className="metric-card"><span>Waiting for Requester</span><strong>{dashboard.metrics.waitingForRequester}</strong><button type="button" className="dashboard-link" onClick={() => onOpenMyTickets({ currentStatus: "WAITING_FOR_REQUESTER" })}>Review My Tickets</button></article>
        <article className="metric-card"><span>Recently Updated</span><strong>{dashboard.metrics.recentlyUpdated}</strong><span className="metric-help">Last 30 days</span></article>
        <article className="metric-card"><span>Recently Resolved</span><strong>{dashboard.metrics.recentlyResolved}</strong><span className="metric-help">Last 30 days</span></article>
      </div>
      <div className="dashboard-grid">
        <TicketList title="Recently Updated Tickets" tickets={dashboard.recentlyUpdated} onOpen={onOpenTicket} />
        <TicketList title="Recently Resolved Tickets" tickets={dashboard.recentlyResolved} onOpen={onOpenTicket} />
        <section className="dashboard-quick-actions" aria-labelledby="requester-create-heading"><h2 id="requester-create-heading">Create Ticket</h2><p>Submit a new service request and track it from My Tickets.</p><button className="button button--primary" type="button" onClick={onCreateTicket}>Create a Ticket</button></section>
      </div>
    </>}
  </section>;
}
