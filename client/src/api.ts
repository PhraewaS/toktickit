const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface ReferenceDataItem {
  id: number;
  name: string;
}

export type Category = ReferenceDataItem;
export type RelatedSystem = ReferenceDataItem;

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
}

export type RequestedPriority = "LOW" | "MEDIUM" | "HIGH";

export interface CreateTicketPayload {
  submissionKey: string;
  categoryId: number;
  relatedSystemId: number;
  summary: string;
  requestedPriority: RequestedPriority;
  description: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  ticketDate: string;
  requester: ReferenceDataItem;
  category: ReferenceDataItem;
  relatedSystem: ReferenceDataItem;
  summary: string;
  requestedPriority: RequestedPriority;
  description: string;
  currentStatus: "NEW";
  createdAt: string;
  updatedAt: string;
}

export type TicketListItem = Omit<Ticket, "ticketDate" | "requester" | "description">;

export interface TicketPagination {
  page: number;
  pageSize: 10 | 20 | 50;
  totalItems: number;
  totalOwnedItems: number;
  totalPages: number;
}

export interface TicketListResult {
  data: TicketListItem[];
  pagination: TicketPagination;
}

export interface TicketListQuery {
  search?: string;
  categoryId?: number;
  relatedSystemId?: number;
  requestedPriority?: RequestedPriority;
  currentStatus?: "NEW";
  sortBy?: "ticketNumber" | "summary" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: 10 | 20 | 50;
}

export interface CreateTicketResult {
  data: Ticket;
  replayed: boolean;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

interface DataResponse<T> {
  data: T;
}

interface ErrorResponse {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
}

async function fetchData<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const body = (await response.json()) as DataResponse<T>;
  return body.data;
}

export function developmentRequesterHeaders(requesterId: number): HeadersInit {
  return { "X-Development-Requester-Id": String(requesterId) };
}

export function fetchDevelopmentRequesters(): Promise<DevelopmentRequester[]> {
  return fetchData<DevelopmentRequester[]>("/api/development-requesters");
}

export function fetchCategories(): Promise<Category[]> {
  return fetchData<Category[]>("/api/categories");
}

export function fetchRelatedSystems(): Promise<RelatedSystem[]> {
  return fetchData<RelatedSystem[]>("/api/related-systems");
}

export async function createTicket(
  requesterId: number,
  payload: CreateTicketPayload,
): Promise<CreateTicketResult> {
  const safeMessage = "TokTickIT could not complete the request. Please try again.";
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...developmentRequesterHeaders(requesterId),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(safeMessage);
  }

  let body: CreateTicketResult & ErrorResponse;
  try {
    body = (await response.json()) as CreateTicketResult & ErrorResponse;
  } catch {
    throw new Error(safeMessage);
  }

  if (!response.ok) {
    throw new Error(body.error?.message ?? safeMessage);
  }

  return body;
}

export async function fetchMyTickets(
  requesterId: number,
  query: TicketListQuery = {},
): Promise<TicketListResult> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const safeMessage = "TokTickIT could not load Tickets. Please try again.";
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/tickets${suffix}`, {
      headers: developmentRequesterHeaders(requesterId),
    });
  } catch {
    throw new Error(safeMessage);
  }

  let body: TicketListResult & ErrorResponse;
  try {
    body = (await response.json()) as TicketListResult & ErrorResponse;
  } catch {
    throw new Error(safeMessage);
  }
  if (!response.ok) throw new Error(body.error?.message ?? safeMessage);
  return body;
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthResponse = await fetch(`${API_URL}/api/health`);
  if (!healthResponse.ok) {
    throw new Error("System is offline");
  }

  const categories = await fetchCategories();

  return { online: true, categories };
}
