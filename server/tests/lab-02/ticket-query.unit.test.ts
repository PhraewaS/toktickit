import { describe, expect, it } from "vitest";
import { parseTicketListQuery } from "../../src/ticket-query.js";

describe("My Tickets query parsing", () => {
  it("applies the contract defaults and trims search", () => {
    expect(parseTicketListQuery({ search: "  battery  " })).toEqual({
      success: true,
      data: {
        search: "battery",
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 1,
        pageSize: 10,
      },
    });
  });

  it("accepts supported filters and paging values", () => {
    const result = parseTicketListQuery({
      categoryId: "2",
      relatedSystemId: "7",
      requestedPriority: "HIGH",
      currentStatus: "NEW",
      sortBy: "summary",
      sortOrder: "asc",
      page: "2",
      pageSize: "20",
    });
    expect(result).toEqual({
      success: true,
      data: {
        categoryId: 2,
        relatedSystemId: 7,
        requestedPriority: "HIGH",
        currentStatus: "NEW",
        sortBy: "summary",
        sortOrder: "asc",
        page: 2,
        pageSize: 20,
      },
    });
  });

  it("rejects unsupported and malformed values without silent fallback", () => {
    const result = parseTicketListQuery({
      categoryId: "0",
      requestedPriority: "URGENT",
      currentStatus: "OPEN",
      sortBy: "id",
      sortOrder: "sideways",
      page: "0",
      pageSize: "15",
      search: "x".repeat(101),
    });
    expect(result).toEqual({
      success: false,
      fields: {
        search: "Search must be 100 characters or fewer.",
        categoryId: "Category ID must be a positive integer.",
        requestedPriority: "Requested Priority must be LOW, MEDIUM, or HIGH.",
        currentStatus: "Current Status must be NEW.",
        sortBy: "Sort field is not supported.",
        sortOrder: "Sort order must be asc or desc.",
        page: "Page must be a positive integer.",
        pageSize: "Page size must be 10, 20, or 50.",
      },
    });
  });
});

