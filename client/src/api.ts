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
export type UserRole = "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";
export type TicketStatus = "NEW" | "OPEN" | "IN_PROGRESS" | "WAITING_FOR_REQUESTER" | "RESOLVED" | "CLOSED" | "REOPENED" | "CANCELLED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
}

export interface CommentEntry { id: number; content: string; createdAt: string; author: { id: number; name: string; role: UserRole | string } }

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
  currentStatus: TicketStatus;
  itPriority?: RequestedPriority;
  requesterResolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export type AttachmentState = "ACTIVE" | "REMOVED";

export interface Attachment {
  id: number;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  removedAt: string | null;
  removalReason: string | null;
  state: AttachmentState;
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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly fields?: Record<string, string>,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchData<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include" });
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
      credentials: "include",
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
    throw new ApiError(
      body.error?.message ?? safeMessage,
      body.error?.fields,
      body.error?.code,
    );
  }

  return body;
}

export interface AttachmentDownload {
  blob: Blob;
  filename: string;
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
      credentials: "include",
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

export async function fetchTicketDetail(
  requesterId: number,
  ticketId: number,
): Promise<Ticket> {
  const safeMessage = "TokTickIT could not load the Ticket. Please try again.";
  let response: Response;
  try {
    response = await fetch(API_URL + "/api/tickets/" + ticketId, {
      headers: developmentRequesterHeaders(requesterId),
      credentials: "include",
    });
  } catch {
    throw new Error(safeMessage);
  }
  let body: { data?: Ticket; error?: { message?: string } };
  try {
    body = await response.json();
  } catch {
    throw new Error(safeMessage);
  }
  if (!response.ok || !body.data) throw new Error(body.error?.message ?? safeMessage);
  return body.data;
}

export async function uploadTicketAttachments(
  requesterId: number,
  ticketId: number,
  files: File[],
): Promise<Attachment[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const safeMessage = "TokTickIT could not save Attachments. Please try again.";
  let response: Response;
  try {
    response = await fetch(API_URL + "/api/tickets/" + ticketId + "/attachments", {
      method: "POST",
      headers: developmentRequesterHeaders(requesterId),
      credentials: "include",
      body: formData,
    });
  } catch {
    throw new Error(safeMessage);
  }
  let body: { data?: Attachment[]; error?: { message?: string } };
  try {
    body = await response.json();
  } catch {
    throw new Error(safeMessage);
  }
  if (!response.ok || !body.data) throw new Error(body.error?.message ?? safeMessage);
  return body.data;
}

export async function removeAttachment(
  requesterId: number,
  attachmentId: number,
  reason: string,
): Promise<Attachment> {
  const safeMessage = "TokTickIT could not remove the Attachment. Please try again.";
  let response: Response;
  try {
    response = await fetch(API_URL + "/api/attachments/" + attachmentId, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...developmentRequesterHeaders(requesterId) },
      body: JSON.stringify({ reason }),
      credentials: "include",
    });
  } catch {
    throw new Error(safeMessage);
  }
  let body: { data?: Attachment; error?: { message?: string } };
  try {
    body = await response.json();
  } catch {
    throw new Error(safeMessage);
  }
  if (!response.ok || !body.data) throw new Error(body.error?.message ?? safeMessage);
  return body.data;
}

export async function downloadAttachment(
  requesterId: number,
  attachmentId: number,
): Promise<AttachmentDownload> {
  const safeMessage = "TokTickIT could not download the Attachment. Please try again.";
  let response: Response;
  try {
    response = await fetch(API_URL + "/api/attachments/" + attachmentId + "/download", {
      headers: developmentRequesterHeaders(requesterId),
      credentials: "include",
    });
  } catch {
    throw new Error(safeMessage);
  }
  if (!response.ok) {
    let message = safeMessage;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // Keep the safe fallback when the response is not JSON.
    }
    throw new Error(message);
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "attachment";
  return { blob: await response.blob(), filename };
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthResponse = await fetch(`${API_URL}/api/health`);
  if (!healthResponse.ok) {
    throw new Error("System is offline");
  }

  const categories = await fetchCategories();

  return { online: true, categories };
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const safeMessage = "TokTickIT could not complete the request. Please try again.";
  let response: Response;
  try { response = await fetch(`${API_URL}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } }); }
  catch { throw new ApiError(safeMessage); }
  let body: { data?: T; error?: { code?: string; message?: string; fields?: Record<string, string> } };
  try { body = await response.json(); } catch { throw new ApiError(safeMessage); }
  if (!response.ok || body.data === undefined) throw new ApiError(body.error?.message ?? safeMessage, body.error?.fields, body.error?.code);
  return body.data;
}

export async function loginUser(email: string, password: string) { return (await requestJson<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })).user; }
export async function fetchCurrentUser() { return (await requestJson<{ user: User }>("/api/auth/me")).user; }
export async function logoutUser() { await requestJson<{ loggedOut: boolean }>("/api/auth/logout", { method: "POST" }); }
export async function changePassword(newPassword: string, confirmPassword: string) { return (await requestJson<{ user: User }>("/api/auth/change-password", { method: "POST", body: JSON.stringify({ newPassword, confirmPassword }) })).user; }

export interface StaffTicket extends Ticket {
  requester: DevelopmentRequester;
  itPriority: RequestedPriority;
  owner: { id: number; name: string; email?: string; role?: UserRole } | null;
  requesterResolvedAt: string | null;
  publicComments?: CommentEntry[];
  internalNotes?: CommentEntry[];
}
export interface StaffTicketListResult { data: StaffTicket[]; pagination: { page: number; pageSize: 10 | 20 | 50; totalItems: number; totalPages: number } }
export interface StaffTicketQuery { search?: string; status?: TicketStatus; requestedPriority?: RequestedPriority; itPriority?: RequestedPriority; ownerId?: number | "unassigned"; sortBy?: "ticketNumber" | "summary" | "createdAt" | "updatedAt" | "itPriority" | "currentStatus"; sortOrder?: "asc" | "desc"; page?: number; pageSize?: 10 | 20 | 50 }

function queryString(query: object) { const params = new URLSearchParams(); for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== "") params.set(key, String(value)); return params.toString() ? `?${params.toString()}` : ""; }
export function fetchStaffTickets(query: StaffTicketQuery = {}) { return requestJson<StaffTicketListResult>(`/api/staff/tickets${queryString(query)}`); }
export function fetchStaffTicketDetail(ticketId: number) { return requestJson<StaffTicket>(`/api/staff/tickets/${ticketId}`); }
export function fetchAssignableStaff() { return requestJson<User[]>("/api/staff/assignees"); }
export function assignStaffTicket(ticketId: number, ownerId: number | null) { return requestJson<StaffTicket>(`/api/staff/tickets/${ticketId}/assignment`, { method: "POST", body: JSON.stringify({ ownerId }) }); }
export function updateStaffPriority(ticketId: number, itPriority: RequestedPriority) { return requestJson<StaffTicket>(`/api/staff/tickets/${ticketId}/priority`, { method: "PATCH", body: JSON.stringify({ itPriority }) }); }
export function updateStaffStatus(ticketId: number, status: TicketStatus) { return requestJson<StaffTicket>(`/api/staff/tickets/${ticketId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); }
export function createStaffComment(ticketId: number, content: string) { return requestJson<CommentEntry>(`/api/staff/tickets/${ticketId}/comments`, { method: "POST", body: JSON.stringify({ content }) }); }
export function createStaffNote(ticketId: number, content: string) { return requestJson<CommentEntry>(`/api/staff/tickets/${ticketId}/notes`, { method: "POST", body: JSON.stringify({ content }) }); }

export interface AdminUserPayload { name: string; email: string; role: UserRole; isActive: boolean; initialPassword: string }
export interface AdminUserQuery { search?: string; role?: UserRole }
export function fetchUsers(query: AdminUserQuery = {}) { return requestJson<User[]>(`/api/admin/users${queryString(query)}`); }
export async function createAdminUser(payload: AdminUserPayload) { return (await requestJson<{ user: User; initialPassword: string }>("/api/admin/users", { method: "POST", body: JSON.stringify(payload) })).user; }
export async function updateAdminUser(userId: number, payload: Partial<Pick<User, "name" | "email" | "role" | "isActive">>) { return (await requestJson<{ user: User }>(`/api/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(payload) })).user; }
export async function resetAdminPassword(userId: number, initialPassword: string) { return (await requestJson<{ user: User; initialPassword: string }>(`/api/admin/users/${userId}/initial-password`, { method: "POST", body: JSON.stringify({ initialPassword }) })).user; }
export function fetchRequesterComments(ticketId: number) { return requestJson<CommentEntry[]>(`/api/tickets/${ticketId}/comments`); }
export function createRequesterComment(ticketId: number, content: string) { return requestJson<CommentEntry>(`/api/tickets/${ticketId}/comments`, { method: "POST", body: JSON.stringify({ content }) }); }
export function markRequesterResolved(ticketId: number) { return requestJson<{ ticketId: number; requesterResolvedAt: string | null }>(`/api/tickets/${ticketId}/resolved`, { method: "POST", body: JSON.stringify({}) }); }
