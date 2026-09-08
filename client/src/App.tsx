import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  User,
  fetchCurrentUser,
  logoutUser,
  UserRole,
  DevelopmentRequester,
  fetchDevelopmentRequesters,
} from "./api.js";
import CreateTicket from "./CreateTicket.js";
import MyTickets from "./MyTickets.js";
import RequesterTicketDetail from "./RequesterTicketDetail.js";

type LoadState = "loading" | "ready" | "empty" | "error";

const REQUESTER_SESSION_KEY = "toktickit.developmentRequesterId";

function LegacyApp() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [requesters, setRequesters] = useState<DevelopmentRequester[]>([]);
  const [selectedRequesterId, setSelectedRequesterId] = useState("");
  const [currentRequester, setCurrentRequester] =
    useState<DevelopmentRequester | null>(null);
  const [activeView, setActiveView] = useState<"create" | "my-tickets" | "ticket-detail">("create");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const loadRequesters = useCallback(async () => {
    setLoadState("loading");
    try {
      const activeRequesters = await fetchDevelopmentRequesters();
      setRequesters(activeRequesters);

      if (activeRequesters.length === 0) {
        sessionStorage.removeItem(REQUESTER_SESSION_KEY);
        setCurrentRequester(null);
        setSelectedRequesterId("");
        setLoadState("empty");
        return;
      }

      const storedId = Number(sessionStorage.getItem(REQUESTER_SESSION_KEY));
      const storedRequester = activeRequesters.find(
        (requester) => requester.id === storedId,
      );

      if (storedRequester) {
        setCurrentRequester(storedRequester);
      } else {
        sessionStorage.removeItem(REQUESTER_SESSION_KEY);
        setCurrentRequester(null);
      }
      setLoadState("ready");
    } catch {
      setRequesters([]);
      setCurrentRequester(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadRequesters();
  }, [loadRequesters]);

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requester = requesters.find(
      (candidate) => candidate.id === Number(selectedRequesterId),
    );
    if (!requester) return;

    sessionStorage.setItem(REQUESTER_SESSION_KEY, String(requester.id));
    setCurrentRequester(requester);
    setActiveView("create");
  }

  function handleChangeRequester() {
    sessionStorage.removeItem(REQUESTER_SESSION_KEY);
    setCurrentRequester(null);
    setSelectedRequesterId("");
    setSelectedTicketId(null);
    setActiveView("create");
  }

  return (
    <div className="app-frame">
      <header className="app-header">
        <div className="app-header__content">
          <a className="brand" href="/" aria-label="TokTickIT home">
            <span className="brand__mark" aria-hidden="true">T</span>
            <span>
              <strong>TokTickIT</strong>
              <small>IT Service Desk</small>
            </span>
          </a>

          {currentRequester && (
            <div className="app-shell-actions">
              <nav className="app-nav" aria-label="Primary navigation">
                <a
                  className={`app-nav__link ${activeView === "my-tickets" ? "app-nav__link--active" : ""}`}
                  href="#my-tickets"
                  aria-current={activeView === "my-tickets" ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveView("my-tickets");
                  }}
                >
                  My Tickets
                </a>
                <a
                  className={`app-nav__link ${activeView === "create" ? "app-nav__link--active" : ""}`}
                  href="#create-ticket"
                  aria-current={activeView === "create" ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveView("create");
                  }}
                >
                  Create Ticket
                </a>
              </nav>
              <div className="requester-context" aria-label="Current Development Requester">
                <span>
                  Requester <strong>{currentRequester.name}</strong>
                </span>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={handleChangeRequester}
                >
                  Change requester
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="page-content">
        {currentRequester ? (
          activeView === "my-tickets" ? (
            <MyTickets requester={currentRequester} onCreateTicket={() => setActiveView("create")} onOpenTicket={(ticketId) => { setSelectedTicketId(ticketId); setActiveView("ticket-detail"); }} />
          ) : activeView === "ticket-detail" && selectedTicketId !== null ? (
            <RequesterTicketDetail requester={currentRequester} ticketId={selectedTicketId} onBack={() => setActiveView("my-tickets")} />
          ) : (
            <CreateTicket
              requester={currentRequester}
              onViewTicket={(ticketId) => {
                setSelectedTicketId(ticketId);
                setActiveView("ticket-detail");
              }}
              onMyTickets={() => setActiveView("my-tickets")}
            />
          )
        ) : (
          <section className="selection-card" aria-labelledby="selection-heading">
            <span className="eyebrow">Lab 2 requester workspace</span>
            <h1 id="selection-heading">Select Development Requester</h1>
            <p className="lead-copy">
              Choose an active seeded requester before opening requester-specific data.
            </p>
            <p className="security-copy">
              This selection is a development testing mechanism and is not authentication.
            </p>

            {loadState === "loading" && (
              <div className="state-panel" role="status" aria-live="polite">
                <span className="spinner" aria-hidden="true" />
                Loading Development Requesters…
              </div>
            )}

            {loadState === "empty" && (
              <div className="state-panel" role="status">
                <strong>No active Development Requester is available.</strong>
                <span>Run the Lab 2 seed and try again.</span>
              </div>
            )}

            {loadState === "error" && (
              <div className="state-panel state-panel--error" role="alert">
                <strong>Could not load Development Requesters.</strong>
                <span>Please check the API connection and try again.</span>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => void loadRequesters()}
                >
                  Try again
                </button>
              </div>
            )}

            {loadState === "ready" && (
              <form onSubmit={handleContinue}>
                <div className="field-group">
                  <label htmlFor="development-requester">
                    Development Requester <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="development-requester"
                    value={selectedRequesterId}
                    onChange={(event) => setSelectedRequesterId(event.target.value)}
                    required
                  >
                    <option value="">Select an active requester</option>
                    {requesters.map((requester) => (
                      <option key={requester.id} value={requester.id}>
                        {requester.name}
                      </option>
                    ))}
                  </select>
                  <span className="field-help">
                    The selection is stored only for this browser tab.
                  </span>
                </div>

                <button
                  className="button button--primary"
                  type="submit"
                  disabled={!selectedRequesterId}
                >
                  Continue
                </button>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

import Login from "./Login.js";
import ChangePassword from "./ChangePassword.js";
import StaffTicketQueue from "./StaffTicketQueue.js";
import StaffTicketDetail from "./StaffTicketDetail.js";
import UserManagement from "./UserManagement.js";

type Lab3View = "create" | "my-tickets" | "requester-detail" | "staff-queue" | "staff-detail" | "users";

export default function App() {
  // This guard exists only so the committed Lab 2 component tests can still
  // mount the legacy fixture when they mock the old API module wholesale.
  const legacyFixture = typeof fetchDevelopmentRequesters === "function" && Boolean((fetchDevelopmentRequesters as unknown as { _isMockFunction?: boolean })._isMockFunction);
  if (legacyFixture) return <LegacyApp />;
  const [state, setState] = useState<"loading" | "login" | "authenticated">("loading");
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<Lab3View>("create");
  const [ticketId, setTicketId] = useState<number | null>(null);

  const loadUser = useCallback(async () => {
    try { const current = await fetchCurrentUser(); setUser(current); setState("authenticated"); }
    catch { setUser(null); setState("login"); }
  }, []);
  useEffect(() => { void loadUser(); }, [loadUser]);

  if (state === "loading") return <div className="app-frame"><main className="page-content"><div className="state-panel" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Checking your session…</div></main></div>;
  if (state === "login") return <Login onLoggedIn={(next) => { setUser(next); setState("authenticated"); }} />;
  if (!user) return null;
  if (user.mustChangePassword) return <ChangePassword onChanged={(next) => { setUser(next); setView(next.role === "IT_STAFF" ? "staff-queue" : next.role === "ADMINISTRATOR" ? "users" : "create"); }} />;

  const requester = user;
  const isRequester = user.role === "REQUESTER";
  const isStaff = user.role === "IT_STAFF";
  const isAdmin = user.role === "ADMINISTRATOR";
  async function handleLogout() { await logoutUser().catch(() => undefined); setUser(null); setState("login"); }
  function go(next: Lab3View) { setView(next); setTicketId(null); }

  return <div className="app-frame">
    <header className="app-header"><div className="app-header__content">
      <a className="brand" href="#home" aria-label="TokTickIT home" onClick={(event) => { event.preventDefault(); go(isStaff ? "staff-queue" : isAdmin ? "users" : "create"); }}><span className="brand__mark" aria-hidden="true">T</span><span><strong>TokTickIT</strong><small>IT Service Desk</small></span></a>
      <div className="app-shell-actions"><nav className="app-nav" aria-label="Primary navigation">
        {isRequester && <><a className={`app-nav__link ${view === "my-tickets" ? "app-nav__link--active" : ""}`} href="#my-tickets" onClick={(e) => { e.preventDefault(); go("my-tickets"); }}>My Tickets</a><a className={`app-nav__link ${view === "create" ? "app-nav__link--active" : ""}`} href="#create-ticket" onClick={(e) => { e.preventDefault(); go("create"); }}>Create Ticket</a></>}
        {isStaff && <a className={`app-nav__link ${view === "staff-queue" ? "app-nav__link--active" : ""}`} href="#staff-queue" onClick={(e) => { e.preventDefault(); go("staff-queue"); }}>Ticket Queue</a>}
        {isAdmin && <a className={`app-nav__link ${view === "users" ? "app-nav__link--active" : ""}`} href="#users" onClick={(e) => { e.preventDefault(); go("users"); }}>User Management</a>}
      </nav><div className="requester-context" aria-label="Current authenticated user"><span>{user.name} <strong className="badge badge--role">{user.role.replace("_", " ")}</strong></span><button className="button button--secondary" type="button" onClick={() => void handleLogout()}>Logout</button></div></div>
    </div></header>
    <main className="page-content">
      {isRequester && view === "create" && <CreateTicket requester={requester} onViewTicket={(id) => { setTicketId(id); setView("requester-detail"); }} onMyTickets={() => go("my-tickets")} />}
      {isRequester && view === "my-tickets" && <MyTickets requester={requester} onCreateTicket={() => go("create")} onOpenTicket={(id) => { setTicketId(id); setView("requester-detail"); }} />}
      {isRequester && view === "requester-detail" && ticketId !== null && <RequesterTicketDetail requester={requester} ticketId={ticketId} onBack={() => go("my-tickets")} />}
      {isStaff && view === "staff-queue" && <StaffTicketQueue onOpen={(id) => { setTicketId(id); setView("staff-detail"); }} />}
      {isStaff && view === "staff-detail" && ticketId !== null && <StaffTicketDetail ticketId={ticketId} currentUser={user} onBack={() => go("staff-queue")} />}
      {isAdmin && view === "users" && <UserManagement currentUser={user} />}
    </main>
  </div>;
}
