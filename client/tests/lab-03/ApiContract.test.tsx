import { describe, expect, it, vi } from "vitest";
import { fetchRequesterComments, fetchStaffTickets, StaffTicket } from "../../src/api.js";

describe("Lab 3 client API response contracts", () => {
  it("unwraps the Staff Queue envelope into items and pagination", async () => {
    const item = { id: 42, ticketNumber: "TKT-20260908-10000000" } as StaffTicket;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { items: [item], pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 } } }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchStaffTickets({ requestedPriority: "HIGH", itPriority: "LOW" })).resolves.toEqual({ items: [item], pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 } });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("requestedPriority=HIGH"), expect.objectContaining({ credentials: "include" }));
    vi.unstubAllGlobals();
  });

  it("unwraps nested requester comment responses consistently", async () => {
    const comment = { id: 8, content: "Update", createdAt: "2026-09-08T00:00:00Z", author: { id: 1, name: "Jennifer", role: "REQUESTER" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { items: [comment] } }), { status: 200, headers: { "Content-Type": "application/json" } })));
    await expect(fetchRequesterComments(42)).resolves.toEqual([comment]);
    vi.unstubAllGlobals();
  });
});
