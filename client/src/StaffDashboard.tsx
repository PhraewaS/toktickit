import { useEffect, useState } from "react";
import { ApiError, DashboardTicket, fetchStaffDashboard, StaffDashboard as StaffDashboardData, StaffTicketQuery, TicketStatus, RequestedPriority } from "./api.js";

function label(value: string) { return value.replaceAll("_", " "); }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

function TicketList({ title, tickets, onOpen }: { title: string; tickets: DashboardTicket[]; onOpen: (id: number) => void }) {
  return <section className="dashboard-list" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>
    <div className="section-heading"><h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>{title}</h2></div>
    {tickets.length === 0 ? <p className="state-panel" role="status">No matching Tickets.</p> : <ul className="dashboard-ticket-list">{tickets.map((ticket) => <li key={ticket.id}>
      <div><button className="ticket-link" type="button" onClick={() => onOpen(ticket.id)}>{ticket.ticketNumber}</button><strong>{ticket.summary}</strong><span>{ticket.requester?.name ?? "Requester"} · {formatDate(ticket.updatedAt)}</span></div>
      <span className="badge badge--priority">{ticket.itPriority}</span>
    </li>)}</ul>}
  </section>;
}

export default function StaffDashboard({ onOpenTicket, onOpenQueue, isAdmin, currentUserId }: { onOpenTicket: (id: number) => void; onOpenQueue: (filters?: StaffTicketQuery) => void; isAdmin: boolean; currentUserId: number }) {
  const [state, setState] = useState<"loading" | "ready" | "error" | "forbidden">("loading");
  const [dashboard, setDashboard] = useState<StaffDashboardData | null>(null);

  async function load() {
    setDashboard(null);
    setState("loading");
    try {
      setDashboard(await fetchStaffDashboard());
      setState("ready");
    } catch (error) {
      setState(error instanceof ApiError && error.code === "ROLE_FORBIDDEN" ? "forbidden" : "error");
    }
  }

  useEffect(() => { void load(); }, []);

  return <section className="ticket-page dashboard-page" aria-labelledby="staff-dashboard-heading" aria-busy={state === "loading"}>
    <div className="page-heading"><div><span className="eyebrow">{isAdmin ? "Administrator oversight" : "IT Staff workspace"}</span><h1 id="staff-dashboard-heading">Dashboard</h1><p className="lead-copy">Prioritize urgent work, see your current ownership, and open the detailed queue.</p></div><button className="button button--primary" type="button" onClick={() => onOpenQueue()}>Open Ticket Queue</button></div>
    {state === "loading" && <div className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Loading IT Staff Dashboard…</div>}
    {state === "forbidden" && <div className="state-panel state-panel--error" role="alert"><strong>Dashboard access is unavailable for this account.</strong><span>No protected Dashboard information is being shown.</span><button className="button button--secondary" type="button" onClick={() => onOpenQueue()}>Back to Ticket Queue</button></div>}
    {state === "error" && <div className="state-panel state-panel--error" role="alert"><strong>Could not load Dashboard.</strong><span>TokTickIT could not load the IT Staff Dashboard. Please try again.</span><button className="button button--secondary" type="button" onClick={() => void load()}>Try again</button></div>}
    {state === "ready" && dashboard && <>
      <div className="metric-grid" aria-label="IT Staff Dashboard metrics">
        <article className="metric-card"><span>Unassigned Tickets</span><strong>{dashboard.metrics.unassignedActive}</strong><button type="button" className="dashboard-link" onClick={() => onOpenQueue({ ownerId: "unassigned", activeOnly: true })}>Open Queue</button></article>
        <article className="metric-card"><span>My Active Tickets</span><strong>{dashboard.metrics.myActive}</strong><button type="button" className="dashboard-link" onClick={() => onOpenQueue({ ownerId: currentUserId, activeOnly: true })}>View My Queue</button></article>
        <article className="metric-card"><span>My Actions Taken</span><strong>{dashboard.metrics.myActionsTaken}</strong><span className="metric-help">Recorded by your account</span></article>
        <article className="metric-card"><span>Urgent Tickets</span><strong>{dashboard.metrics.urgentTickets}</strong><button type="button" className="dashboard-link" onClick={() => onOpenQueue({ itPriority: "HIGH", activeOnly: true })}>Review High Priority</button></article>
      </div>
      <div className="dashboard-breakdown">
        <section className="dashboard-list" aria-labelledby="staff-status-heading"><h2 id="staff-status-heading">Tickets by Status</h2><div className="breakdown-list">{Object.entries(dashboard.byStatus).map(([status, count]) => <button type="button" className="breakdown-filter" key={status} aria-label={`Filter queue by status ${status}`} onClick={() => onOpenQueue({ status: status as TicketStatus })}><span>{label(status)}</span><strong>{count}</strong></button>)}</div></section>
        <section className="dashboard-list" aria-labelledby="staff-priority-heading"><h2 id="staff-priority-heading">Tickets by IT Priority</h2><div className="breakdown-list">{Object.entries(dashboard.byPriority).map(([priority, count]) => <button type="button" className="breakdown-filter" key={priority} aria-label={`Filter queue by IT priority ${priority}`} onClick={() => onOpenQueue({ itPriority: priority as RequestedPriority })}><span>{priority}</span><strong>{count}</strong></button>)}</div></section>
      </div>
      <div className="dashboard-grid">
        <TicketList title="Urgent Tickets" tickets={dashboard.urgentTickets} onOpen={onOpenTicket} />
        <TicketList title="Recently Updated Tickets" tickets={dashboard.recentlyUpdated} onOpen={onOpenTicket} />
        <section className="dashboard-list" aria-labelledby="staff-actions-heading"><h2 id="staff-actions-heading">My Recent Actions Taken</h2>{dashboard.recentActions.length === 0 ? <p className="state-panel" role="status">No Actions Taken recorded by your account in the recent period.</p> : <ul className="dashboard-ticket-list">{dashboard.recentActions.map((action) => <li key={action.id}><div><button className="ticket-link" type="button" onClick={() => onOpenTicket(action.ticketId)}>{action.ticketNumber}</button><strong>{action.description}</strong><span>{formatDate(action.actionDateTime)} · {action.result}</span></div></li>)}</ul>}</section>
        <section className="dashboard-quick-actions" aria-labelledby="staff-queue-heading"><h2 id="staff-queue-heading">Ticket Queue</h2><p>Open the full searchable list for assignment, workflow, and Actions Taken operations.</p><button className="button button--primary" type="button" onClick={() => onOpenQueue()}>Open Ticket Queue</button></section>
      </div>
    </>}
  </section>;
}
