import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Category,
  DevelopmentRequester,
  fetchCategories,
  fetchMyTickets,
  fetchRelatedSystems,
  RelatedSystem,
  RequestedPriority,
  TicketListItem,
  TicketListQuery,
  TicketListResult,
} from "./api.js";

type LoadState = "loading" | "ready" | "error";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function hasFilters(query: TicketListQuery) {
  return Boolean(
    query.search || query.categoryId || query.relatedSystemId || query.requestedPriority || query.currentStatus,
  );
}

export default function MyTickets({
  requester,
  onCreateTicket,
  onOpenTicket,
}: {
  requester: DevelopmentRequester;
  onCreateTicket: () => void;
  onOpenTicket?: (ticketId: number) => void;
}) {
  const [state, setState] = useState<LoadState>("loading");
  const [result, setResult] = useState<TicketListResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [relatedSystemId, setRelatedSystemId] = useState("");
  const [requestedPriority, setRequestedPriority] = useState<"" | RequestedPriority>("");
  const [currentStatus, setCurrentStatus] = useState<"" | "NEW">("");
  const [sortBy, setSortBy] = useState<TicketListQuery["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<TicketListQuery["sortOrder"]>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);
  const [appliedQuery, setAppliedQuery] = useState<TicketListQuery>({
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 10,
  });

  const load = useCallback(async (query: TicketListQuery) => {
    setState("loading");
    try {
      const [tickets, loadedCategories, loadedSystems] = await Promise.all([
        fetchMyTickets(requester.id, query),
        fetchCategories(),
        fetchRelatedSystems(),
      ]);
      setResult(tickets);
      setCategories(loadedCategories);
      setRelatedSystems(loadedSystems);
      setState("ready");
    } catch {
      setResult(null);
      setState("error");
    }
  }, [requester.id]);

  useEffect(() => {
    void load(appliedQuery);
  }, [appliedQuery, load]);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: TicketListQuery = {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      ...(relatedSystemId ? { relatedSystemId: Number(relatedSystemId) } : {}),
      ...(requestedPriority ? { requestedPriority } : {}),
      ...(currentStatus ? { currentStatus } : {}),
      sortBy,
      sortOrder,
      page: 1,
      pageSize,
    };
    setPage(1);
    setAppliedQuery(next);
  }

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setRelatedSystemId("");
    setRequestedPriority("");
    setCurrentStatus("");
    setPage(1);
    setAppliedQuery({
      sortBy,
      sortOrder,
      page: 1,
      pageSize,
    });
  }

  function changePage(nextPage: number) {
    if (nextPage < 1 || !result || nextPage > result.pagination.totalPages) return;
    setPage(nextPage);
    setAppliedQuery({ ...appliedQuery, page: nextPage });
  }

  function changePageSize(nextSize: 10 | 20 | 50) {
    setPageSize(nextSize);
    setPage(1);
    setAppliedQuery({ ...appliedQuery, page: 1, pageSize: nextSize });
  }

  const pagination = result?.pagination ?? null;
  const noResults = state === "ready" && result && pagination && result.data.length === 0 && pagination.totalOwnedItems > 0 && hasFilters(appliedQuery);
  const empty = state === "ready" && result && pagination && result.data.length === 0 && pagination.totalOwnedItems === 0;

  return (
    <section className="ticket-page my-tickets-page" aria-labelledby="my-tickets-heading">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Requester workspace</span>
          <h1 id="my-tickets-heading">My Tickets</h1>
          <p className="lead-copy">Tickets owned by {requester.name}. Search, filter, and open the request you need.</p>
        </div>
        <button className="button button--primary" type="button" onClick={onCreateTicket}>Create Ticket</button>
      </div>

      <form className="ticket-filters" onSubmit={submitFilters} aria-label="My Tickets filters">
        <div className="field-group ticket-search-field">
          <label htmlFor="ticket-search">Search</label>
          <input id="ticket-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ticket number or summary" maxLength={100} />
        </div>
        <div className="field-group"><label htmlFor="ticket-category">Category</label><select id="ticket-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div className="field-group"><label htmlFor="ticket-related-system">Related System</label><select id="ticket-related-system" value={relatedSystemId} onChange={(event) => setRelatedSystemId(event.target.value)}><option value="">All systems</option>{relatedSystems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div className="field-group"><label htmlFor="ticket-priority">Requested Priority</label><select id="ticket-priority" value={requestedPriority} onChange={(event) => setRequestedPriority(event.target.value as "" | RequestedPriority)}><option value="">All priorities</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option></select></div>
        <div className="field-group"><label htmlFor="ticket-status">Current Status</label><select id="ticket-status" value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value as "" | "NEW")}><option value="">All statuses</option><option value="NEW">NEW</option></select></div>
        <div className="field-group"><label htmlFor="ticket-sort">Sort by</label><select id="ticket-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as TicketListQuery["sortBy"])}><option value="createdAt">Created Date</option><option value="updatedAt">Last Updated</option><option value="ticketNumber">Ticket Number</option><option value="summary">Summary</option></select></div>
        <div className="field-group"><label htmlFor="ticket-sort-order">Direction</label><select id="ticket-sort-order" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as TicketListQuery["sortOrder"])}><option value="desc">Descending</option><option value="asc">Ascending</option></select></div>
        <div className="filter-actions"><button className="button button--primary" type="submit">Apply filters</button><button className="button button--tertiary" type="button" onClick={clearFilters}>Clear filters</button></div>
      </form>

      {state === "loading" && <div className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Loading My Tickets…</div>}
      {state === "error" && <div className="state-panel state-panel--error" role="alert"><strong>Could not load My Tickets.</strong><span>Check the API connection and try again.</span><button className="button button--secondary" type="button" onClick={() => void load(appliedQuery)}>Try again</button></div>}
      {empty && <div className="state-panel" role="status"><strong>You do not have any Tickets yet.</strong><span>Create a Ticket to start tracking your request.</span><button className="button button--primary" type="button" onClick={onCreateTicket}>Create Ticket</button></div>}
      {noResults && <div className="state-panel" role="status"><strong>No Tickets match these filters.</strong><span>Try a different search or clear the filters.</span><button className="button button--secondary" type="button" onClick={clearFilters}>Clear filters</button></div>}

      {state === "ready" && result && pagination && result.data.length > 0 && (
        <>
          <div className="ticket-table-wrap">
            <table className="ticket-table"><caption className="visually-hidden">Tickets owned by {requester.name}</caption><thead><tr><th>Ticket Number</th><th>Summary</th><th>Category</th><th>Related System</th><th>Priority</th><th>Status</th><th>Created Date</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>{result.data.map((ticket) => <tr key={ticket.id}><td data-label="Ticket Number"><span className="ticket-number">{ticket.ticketNumber}</span></td><td data-label="Summary">{ticket.summary}</td><td data-label="Category">{ticket.category.name}</td><td data-label="Related System">{ticket.relatedSystem.name}</td><td data-label="Priority"><span className="badge badge--priority">{ticket.requestedPriority}</span></td><td data-label="Status"><span className="badge badge--status">{ticket.currentStatus}</span></td><td data-label="Created Date">{formatDate(ticket.createdAt)}</td><td data-label="Last Updated">{formatDate(ticket.updatedAt)}</td><td data-label="Actions"><button className="button button--secondary" type="button" onClick={() => onOpenTicket?.(ticket.id)}>View details</button></td></tr>)}</tbody></table>
          </div>
          <div className="pagination" aria-label="Ticket pagination"><span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} matching / {pagination.totalOwnedItems} total</span><label>Page size <select value={pageSize} onChange={(event) => changePageSize(Number(event.target.value) as 10 | 20 | 50)}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label><div><button className="button button--secondary" type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</button><button className="button button--secondary" type="button" disabled={page >= pagination.totalPages} onClick={() => changePage(page + 1)}>Next</button></div></div>
        </>
      )}
    </section>
  );
}
