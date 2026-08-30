import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  DevelopmentRequester,
  fetchDevelopmentRequesters,
} from "./api.js";
import CreateTicket from "./CreateTicket.js";
import MyTickets from "./MyTickets.js";

type LoadState = "loading" | "ready" | "empty" | "error";

const REQUESTER_SESSION_KEY = "toktickit.developmentRequesterId";

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [requesters, setRequesters] = useState<DevelopmentRequester[]>([]);
  const [selectedRequesterId, setSelectedRequesterId] = useState("");
  const [currentRequester, setCurrentRequester] =
    useState<DevelopmentRequester | null>(null);
  const [activeView, setActiveView] = useState<"create" | "my-tickets">("create");

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
            <MyTickets requester={currentRequester} onCreateTicket={() => setActiveView("create")} />
          ) : (
            <CreateTicket requester={currentRequester} />
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
