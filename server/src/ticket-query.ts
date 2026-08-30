import { RequestedPriority, TicketStatus } from "@prisma/client";

export const LIST_SORT_FIELDS = [
  "ticketNumber",
  "summary",
  "createdAt",
  "updatedAt",
] as const;

export type ListSortField = (typeof LIST_SORT_FIELDS)[number];
export type ListSortOrder = "asc" | "desc";

export interface TicketListQuery {
  search?: string;
  categoryId?: number;
  relatedSystemId?: number;
  requestedPriority?: RequestedPriority;
  currentStatus?: TicketStatus;
  sortBy: ListSortField;
  sortOrder: ListSortOrder;
  page: number;
  pageSize: 10 | 20 | 50;
}

export type TicketQueryResult =
  | { success: true; data: TicketListQuery }
  | { success: false; fields: Record<string, string> };

function singleValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function parsePositiveInteger(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseTicketListQuery(query: unknown): TicketQueryResult {
  const source = typeof query === "object" && query !== null ? query : {};
  const read = (key: string) => singleValue((source as Record<string, unknown>)[key]);
  const fields: Record<string, string> = {};

  const rawSearch = read("search");
  const search = rawSearch?.trim();
  if (search && search.length > 100) fields.search = "Search must be 100 characters or fewer.";

  const rawCategoryId = read("categoryId");
  const categoryId = rawCategoryId ? parsePositiveInteger(rawCategoryId) : undefined;
  if (rawCategoryId && categoryId === undefined) fields.categoryId = "Category ID must be a positive integer.";

  const rawRelatedSystemId = read("relatedSystemId");
  const relatedSystemId = rawRelatedSystemId ? parsePositiveInteger(rawRelatedSystemId) : undefined;
  if (rawRelatedSystemId && relatedSystemId === undefined) {
    fields.relatedSystemId = "Related System ID must be a positive integer.";
  }

  const rawPriority = read("requestedPriority");
  const requestedPriority = rawPriority as RequestedPriority | undefined;
  if (rawPriority && !["LOW", "MEDIUM", "HIGH"].includes(rawPriority)) {
    fields.requestedPriority = "Requested Priority must be LOW, MEDIUM, or HIGH.";
  }

  const rawStatus = read("currentStatus");
  const currentStatus = rawStatus as TicketStatus | undefined;
  if (rawStatus && rawStatus !== "NEW") fields.currentStatus = "Current Status must be NEW.";

  const rawSortBy = read("sortBy");
  const sortBy = (rawSortBy || "createdAt") as ListSortField;
  if (rawSortBy && !LIST_SORT_FIELDS.includes(sortBy)) {
    fields.sortBy = "Sort field is not supported.";
  }

  const rawSortOrder = read("sortOrder");
  const sortOrder = (rawSortOrder || "desc") as ListSortOrder;
  if (rawSortOrder && rawSortOrder !== "asc" && rawSortOrder !== "desc") {
    fields.sortOrder = "Sort order must be asc or desc.";
  }

  const rawPage = read("page");
  const page = rawPage ? parsePositiveInteger(rawPage) : 1;
  if (rawPage && page === undefined) fields.page = "Page must be a positive integer.";

  const rawPageSize = read("pageSize");
  const parsedPageSize = rawPageSize ? parsePositiveInteger(rawPageSize) : 10;
  const pageSize = parsedPageSize as 10 | 20 | 50;
  const allowedPageSizes = [10, 20, 50];
  if (rawPageSize && !allowedPageSizes.includes(parsedPageSize ?? 0)) {
    fields.pageSize = "Page size must be 10, 20, or 50.";
  }

  if (Object.keys(fields).length > 0) return { success: false, fields };
  return {
    success: true,
    data: {
      ...(search ? { search } : {}),
      ...(categoryId === undefined ? {} : { categoryId }),
      ...(relatedSystemId === undefined ? {} : { relatedSystemId }),
      ...(rawPriority ? { requestedPriority } : {}),
      ...(rawStatus ? { currentStatus } : {}),
      sortBy,
      sortOrder,
      page: page as number,
      pageSize,
    },
  };
}
