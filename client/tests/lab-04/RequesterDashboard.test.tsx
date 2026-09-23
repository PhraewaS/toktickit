import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RequesterDashboard from "../../src/RequesterDashboard.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => ({ ...(await vi.importActual<typeof import("../../src/api.js")>("../../src/api.js")), fetchRequesterDashboard: vi.fn() }));

describe("Lab 4 Requester Dashboard", () => {
  it("renders Requester metrics and an empty state", async () => {
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValue({ metrics: { openTickets: 2, waitingForRequester: 1, recentlyUpdated: 1, recentlyResolved: 0 }, recentlyUpdated: [], recentlyResolved: [] });
    render(<RequesterDashboard onOpenTicket={vi.fn()} onCreateTicket={vi.fn()} />);
    expect(await screen.findByText("Open Tickets")).toBeInTheDocument();
    expect(screen.getAllByText("No matching Tickets in the recent period.")).toHaveLength(2);
  });
});
