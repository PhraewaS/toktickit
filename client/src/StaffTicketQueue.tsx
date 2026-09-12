import { FormEvent, useEffect, useState } from "react";
import { fetchStaffTickets, RequestedPriority, StaffTicket, StaffTicketQuery, TicketStatus } from "./api.js";

const statuses: TicketStatus[] = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
const priorities: RequestedPriority[] = ["LOW", "MEDIUM", "HIGH"];

function label(value: string) {
  return value.replaceAll("_", " ");
}

export default function StaffTicketQueue({ onOpen }: { onOpen: (id: number) => void }) {
  const [data, setData] = useState<StaffTicket[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 as 10 | 20 | 50, totalItems: 0, totalPages: 0 });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | TicketStatus>("");
  const [requestedPriority, setRequestedPriority] = useState<"" | RequestedPriority>("");
  const [itPriority, setItPriority] = useState<"" | RequestedPriority>("");
  const [owner, setOwner] = useState<"" | "unassigned">("");
  const [sortBy, setSortBy] = useState<StaffTicketQuery["sortBy"]>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [applied, setApplied] = useState<StaffTicketQuery>({ sortBy: "updatedAt", sortOrder: "desc", page: 1, pageSize: 10 });

  async function load(query: StaffTicketQuery) {
    setState("loading");
    setFailure("");
    try {
      const result = await fetchStaffTickets(query);
      setData(result.data);
      setPagination(result.pagination);
      setApplied(query);
      setState("ready");
    } catch {
      setData([]);
      setFailure("TokTickIT could not load the Ticket queue. Please try again.");
      setState("error");
    }
  }

  useEffect(() => {
    void load(applied);
  }, []);

  function apply(event: FormEvent) {
    event.preventDefault();
    void load({
      search: search.trim() || undefined,
      status: status || undefined,
      requestedPriority: requestedPriority || undefined,
      itPriority: itPriority || undefined,
      ownerId: owner || undefined,
      sortBy,
      sortOrder,
      page: 1,
      pageSize: pagination.pageSize,
    });
  }

  const hasFilters = Boolean(applied.search || applied.status || applied.requestedPriority || applied.itPriority || applied.ownerId);

  return <section className="ticket-page" aria-labelledby="staff-queue-heading">
    <div className="page-heading"><div><span className="eyebrow">IT Staff workspace</span><h1 id="staff-queue-heading">Ticket Queue</h1><p className="lead-copy">Find, prioritize, and open operational work.</p></div><span className="status-badge">{pagination.totalItems} tickets</span></div>
    <form className="ticket-filters" onSubmit={apply} aria-label="Ticket Queue filters">
      <div className="field-group ticket-search-field"><label htmlFor="staff-search">Search</label><input id="staff-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ticket number or summary" maxLength={100} /></div>
      <div className="field-group"><label htmlFor="staff-status">Status</label><select id="staff-status" value={status} onChange={(e) => setStatus(e.target.value as "" | TicketStatus)}><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></div>
      <div className="field-group"><label htmlFor="staff-requested-priority">Requested Priority</label><select id="staff-requested-priority" value={requestedPriority} onChange={(e) => setRequestedPriority(e.target.value as "" | RequestedPriority)}><option value="">All requested priorities</option>{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
      <div className="field-group"><label htmlFor="staff-it-priority">IT Priority</label><select id="staff-it-priority" value={itPriority} onChange={(e) => setItPriority(e.target.value as "" | RequestedPriority)}><option value="">All IT priorities</option>{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
      <div className="field-group"><label htmlFor="staff-owner">Owner</label><select id="staff-owner" value={owner} onChange={(e) => setOwner(e.target.value as "" | "unassigned")}><option value="">All ownership</option><option value="unassigned">Unassigned</option></select></div>
      <div className="field-group"><label htmlFor="staff-sort">Sort by</label><select id="staff-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as StaffTicketQuery["sortBy"])}><option value="updatedAt">Last Updated</option><option value="createdAt">Created Date</option><option value="itPriority">IT Priority</option><option value="currentStatus">Status</option><option value="summary">Summary</option></select></div>
      <div className="field-group"><label htmlFor="staff-direction">Direction</label><select id="staff-direction" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}><option value="desc">Descending</option><option value="asc">Ascending</option></select></div>
      <button className="button button--primary" type="submit">Apply filters</button>
    </form>
    {state === "loading" && <div className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Loading Ticket Queue…</div>}
    {state === "error" && <div className="state-panel state-panel--error" role="alert"><strong>Could not load Ticket Queue.</strong><span>{failure}</span><button className="button button--secondary" type="button" onClick={() => void load(applied)}>Try again</button></div>}
    {state === "ready" && pagination.totalItems === 0 && <div className="state-panel" role="status"><strong>{hasFilters ? "No Tickets match these filters." : "The Ticket Queue is empty."}</strong><span>Try a different search or check back when new work arrives.</span></div>}
    {state === "ready" && data.length > 0 && <><div className="ticket-table-wrap"><table className="ticket-table"><caption className="visually-hidden">IT Staff Ticket Queue</caption><thead><tr><th>Ticket</th><th>Summary</th><th>Category</th><th>Requested</th><th>IT Priority</th><th>Status</th><th>Owner</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>{data.map((ticket) => <tr key={ticket.id}><td data-label="Ticket"><span className="ticket-number">{ticket.ticketNumber}</span></td><td data-label="Summary">{ticket.summary}</td><td data-label="Category">{ticket.category.name}</td><td data-label="Requested"><span className="badge badge--priority">{ticket.requestedPriority}</span></td><td data-label="IT Priority"><span className="badge badge--priority">{ticket.itPriority}</span></td><td data-label="Status"><span className="badge badge--status">{label(ticket.currentStatus)}</span></td><td data-label="Owner">{ticket.owner?.name ?? "Unassigned"}</td><td data-label="Last Updated">{new Date(ticket.updatedAt).toLocaleString()}</td><td data-label="Actions"><button className="button button--secondary" type="button" onClick={() => onOpen(ticket.id)}>Open detail</button></td></tr>)}</tbody></table></div><div className="pagination-controls"><span>Page {pagination.page} of {pagination.totalPages}</span><button className="button button--secondary" type="button" disabled={pagination.page <= 1} onClick={() => void load({ ...applied, page: pagination.page - 1 })}>Previous</button><button className="button button--secondary" type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => void load({ ...applied, page: pagination.page + 1 })}>Next</button></div></>}
  </section>;
}
