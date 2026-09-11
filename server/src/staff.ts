import { RequestHandler } from "express";
import { Prisma, RequestedPriority, TicketStatus, UserRole } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { serializeAttachment } from "./attachments.js";

const statuses = new Set<string>(Object.values(TicketStatus));
const priorities = new Set<string>(Object.values(RequestedPriority));
export const listAssignableStaff: RequestHandler = async (_req, res) => {
  try {
    const users = await getPrisma().requesterUser.findMany({ where: { isActive: true, role: { in: [UserRole.IT_STAFF, UserRole.ADMINISTRATOR] } }, select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true }, orderBy: [{ name: "asc" }, { id: "asc" }] });
    res.status(200).json({ data: users });
  } catch (e) { console.error("Unable to load assignable staff:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load Ticket owners. Please try again."); }
};
const staffInclude = {
  requester: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true } },
  relatedSystem: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true, email: true, role: true } },
  attachments: { select: { id: true, originalFilename: true, mimeType: true, sizeBytes: true, uploadedAt: true, removedAt: true, removalReason: true }, orderBy: [{ uploadedAt: "asc" }, { id: "asc" }] },
  publicComments: { include: { author: { select: { id: true, name: true, role: true } } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
  internalNotes: { include: { author: { select: { id: true, name: true, role: true } } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
} satisfies Prisma.TicketInclude;

function parseId(value: string) { if (!/^[1-9]\d*$/.test(value)) return null; const id = Number(value); return Number.isSafeInteger(id) ? id : null; }
function error(res: Parameters<RequestHandler>[1], status: number, code: string, message: string, fields?: Record<string, string>) { res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } }); }
function ticketNotFound(res: Parameters<RequestHandler>[1]) { error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found."); }
function serializeTicket(ticket: Prisma.TicketGetPayload<{ include: typeof staffInclude }>) {
  return { id: ticket.id, ticketNumber: ticket.ticketNumber, ticketDate: ticket.createdAt.toISOString(), requester: ticket.requester, category: ticket.category, relatedSystem: ticket.relatedSystem, summary: ticket.summary, description: ticket.description, requestedPriority: ticket.requestedPriority, itPriority: ticket.itPriority, currentStatus: ticket.currentStatus, owner: ticket.owner, requesterResolvedAt: ticket.requesterResolvedAt?.toISOString() ?? null, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString(), attachments: ticket.attachments.map(serializeAttachment), publicComments: ticket.publicComments.map((row) => ({ id: row.id, content: row.content, createdAt: row.createdAt.toISOString(), author: row.author })), internalNotes: ticket.internalNotes.map((row) => ({ id: row.id, content: row.content, createdAt: row.createdAt.toISOString(), author: row.author })) };
}

export const listStaffTickets: RequestHandler = async (req, res) => {
  const q = req.query;
  const allowedQueryKeys = new Set(["search", "status", "requestedPriority", "itPriority", "ownerId", "sortBy", "sortOrder", "page", "pageSize"]);
  if (Object.keys(q).some((key) => !allowedQueryKeys.has(key))) { error(res, 400, "INVALID_QUERY", "Review the Ticket queue filters and try again."); return; }
  if (Object.values(q).some((value) => typeof value !== "string")) { error(res, 400, "INVALID_QUERY", "Review the Ticket queue filters and try again."); return; }
  const search = q.search === undefined ? "" : typeof q.search === "string" ? q.search.trim() : null;
  const page = q.page === undefined ? 1 : typeof q.page === "string" ? Number(q.page) : NaN;
  const pageSize = q.pageSize === undefined ? 10 : typeof q.pageSize === "string" ? Number(q.pageSize) : NaN;
  const sortBy = q.sortBy === undefined ? "updatedAt" : typeof q.sortBy === "string" ? q.sortBy : null;
  const sortOrder = q.sortOrder === undefined ? "desc" : q.sortOrder === "asc" || q.sortOrder === "desc" ? q.sortOrder : null;
  const sortable = new Set(["ticketNumber", "summary", "createdAt", "updatedAt", "itPriority", "currentStatus"]);
  if (search === null || search.length > 100 || !Number.isSafeInteger(page) || page < 1 || ![10, 20, 50].includes(pageSize) || sortBy === null || !sortable.has(sortBy) || sortOrder === null) { error(res, 400, "INVALID_QUERY", "Review the Ticket queue filters and try again."); return; }
  const filters: Prisma.TicketWhereInput[] = [];
  if (search) filters.push({ OR: [{ ticketNumber: { contains: search, mode: "insensitive" } }, { summary: { contains: search, mode: "insensitive" } }] });
  if (typeof q.status === "string") { if (!statuses.has(q.status)) { error(res, 400, "INVALID_QUERY", "Status filter is invalid."); return; } filters.push({ currentStatus: q.status as TicketStatus }); }
  if (typeof q.requestedPriority === "string") { if (!priorities.has(q.requestedPriority)) { error(res, 400, "INVALID_QUERY", "Requested Priority filter is invalid."); return; } filters.push({ requestedPriority: q.requestedPriority as RequestedPriority }); }
  if (typeof q.itPriority === "string") { if (!priorities.has(q.itPriority)) { error(res, 400, "INVALID_QUERY", "IT Priority filter is invalid."); return; } filters.push({ itPriority: q.itPriority as RequestedPriority }); }
  if (q.ownerId !== undefined) { if (q.ownerId !== "unassigned" && parseId(String(q.ownerId)) === null) { error(res, 400, "INVALID_QUERY", "Owner filter is invalid."); return; } filters.push(q.ownerId === "unassigned" ? { ownerId: null } : { ownerId: Number(q.ownerId) }); }
  try {
    const prisma = getPrisma();
    const where: Prisma.TicketWhereInput = filters.length ? { AND: filters } : {};
    const [totalItems, rows] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({ where, include: { requester: { select: { id: true, name: true } }, category: { select: { id: true, name: true } }, relatedSystem: { select: { id: true, name: true } }, owner: { select: { id: true, name: true, role: true } } }, orderBy: [{ [sortBy]: sortOrder }, { id: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 0;
    if (totalItems > 0 && page > totalPages) { error(res, 400, "PAGE_OUT_OF_RANGE", "The requested page is not available.", { page: `Page must be between 1 and ${totalPages}.` }); return; }
    res.status(200).json({ data: { items: rows.map((ticket) => ({ id: ticket.id, ticketNumber: ticket.ticketNumber, requester: ticket.requester, category: ticket.category, relatedSystem: ticket.relatedSystem, summary: ticket.summary, requestedPriority: ticket.requestedPriority, itPriority: ticket.itPriority, currentStatus: ticket.currentStatus, owner: ticket.owner, requesterResolvedAt: ticket.requesterResolvedAt?.toISOString() ?? null, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString() })), pagination: { page, pageSize, totalItems, totalPages } } });
  } catch (e) { console.error("Unable to load staff Ticket queue:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load the Ticket queue. Please try again."); }
};

export const getStaffTicketDetail: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId); if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; }
  try { const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId }, include: staffInclude }); if (!ticket) { ticketNotFound(res); return; } res.status(200).json({ data: serializeTicket(ticket) }); }
  catch (e) { console.error("Unable to load staff Ticket detail:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load the Ticket. Please try again."); }
};

export const assignStaffTicket: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId); if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; }
  const ownerId = req.body?.ownerId === null ? null : parseId(String(req.body?.ownerId ?? ""));
  if (req.body?.ownerId !== null && ownerId === null) { error(res, 400, "VALIDATION_ERROR", "Choose an active IT Staff or Administrator owner.", { ownerId: "Owner is invalid." }); return; }
  try {
    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId }, select: { id: true } }); if (!ticket) { ticketNotFound(res); return; }
    if (ownerId !== null) { const owner = await getPrisma().requesterUser.findFirst({ where: { id: ownerId, isActive: true, role: { in: [UserRole.IT_STAFF, UserRole.ADMINISTRATOR] } }, select: { id: true } }); if (!owner) { error(res, 400, "INVALID_OWNER", "Owner must be an active IT Staff or Administrator."); return; } }
    const updated = await getPrisma().ticket.update({ where: { id: ticketId }, data: { ownerId }, include: staffInclude }); res.status(200).json({ data: serializeTicket(updated) });
  } catch (e) { console.error("Unable to assign staff Ticket:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not update Ticket ownership. Please try again."); }
};

export const updateStaffPriority: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId); const value = req.body?.itPriority;
  if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; }
  if (!priorities.has(value)) { error(res, 400, "VALIDATION_ERROR", "Choose Low, Medium, or High IT Priority.", { itPriority: "IT Priority is invalid." }); return; }
  try { const updated = await getPrisma().ticket.update({ where: { id: ticketId }, data: { itPriority: value as RequestedPriority }, include: staffInclude }); res.status(200).json({ data: serializeTicket(updated) }); }
  catch (e) { if ((e as { code?: string }).code === "P2025") { ticketNotFound(res); return; } console.error("Unable to update IT Priority:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not update IT Priority. Please try again."); }
};

export const allowedStaffStatusTransitions: Readonly<Record<TicketStatus, readonly TicketStatus[]>> = { NEW: [TicketStatus.OPEN], OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.CANCELLED], IN_PROGRESS: [TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CANCELLED], WAITING_FOR_REQUESTER: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED], RESOLVED: [TicketStatus.CLOSED, TicketStatus.REOPENED], CLOSED: [TicketStatus.REOPENED], REOPENED: [], CANCELLED: [] };

export function isAllowedStaffStatusTransition(current: TicketStatus, next: TicketStatus) {
  return allowedStaffStatusTransitions[current].includes(next);
}

export const updateStaffStatus: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId); const nextStatus = req.body?.status as TicketStatus;
  if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; }
  if (!statuses.has(nextStatus)) { error(res, 400, "VALIDATION_ERROR", "Choose a permitted Ticket status.", { status: "Status is invalid." }); return; }
  try { const current = await getPrisma().ticket.findUnique({ where: { id: ticketId }, select: { currentStatus: true } }); if (!current) { ticketNotFound(res); return; } if (!isAllowedStaffStatusTransition(current.currentStatus, nextStatus)) { error(res, 409, "STATUS_TRANSITION_NOT_ALLOWED", `A Ticket cannot move from ${current.currentStatus} to ${nextStatus}.`); return; } const updated = await getPrisma().ticket.update({ where: { id: ticketId }, data: { currentStatus: nextStatus }, include: staffInclude }); res.status(200).json({ data: serializeTicket(updated) }); }
  catch (e) { console.error("Unable to update Ticket status:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not update Ticket status. Please try again."); }
};

export const listStaffNotes: RequestHandler = async (req, res) => { const ticketId = parseId(req.params.ticketId); if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; } try { const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId }, select: { id: true } }); if (!ticket) { ticketNotFound(res); return; } const notes = await getPrisma().internalNote.findMany({ where: { ticketId }, include: { author: { select: { id: true, name: true, role: true } } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }); res.status(200).json({ data: { items: notes.map((row) => ({ id: row.id, content: row.content, createdAt: row.createdAt.toISOString(), author: row.author })) } }); } catch (e) { console.error("Unable to load Internal Notes:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load Internal Notes. Please try again."); } };
export const createStaffNote: RequestHandler = async (req, res) => { const ticketId = parseId(req.params.ticketId); const content = typeof req.body?.content === "string" ? req.body.content.trim() : ""; if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; } if (!content || content.length > 5000) { error(res, 400, "INVALID_CONTENT", "Content must contain between 1 and 5,000 characters."); return; } try { const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId }, select: { id: true } }); if (!ticket) { ticketNotFound(res); return; } const authorId = (req as import("./auth.js").AuthenticatedRequest).authUser.id; const row = await getPrisma().internalNote.create({ data: { ticketId, authorId, content }, include: { author: { select: { id: true, name: true, role: true } } } }); res.status(201).json({ data: { note: { id: row.id, content: row.content, createdAt: row.createdAt.toISOString(), author: row.author } } }); } catch (e) { console.error("Unable to create Internal Note:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not save the Internal Note. Please try again."); } };

export const listStaffComments: RequestHandler = async (req, res) => { const ticketId = parseId(req.params.ticketId); if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; } try { const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId }, select: { id: true } }); if (!ticket) { ticketNotFound(res); return; } const rows = await getPrisma().publicComment.findMany({ where: { ticketId }, include: { author: { select: { id: true, name: true, role: true } } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }); res.status(200).json({ data: { items: rows.map((row) => ({ id: row.id, content: row.content, createdAt: row.createdAt.toISOString(), author: row.author })) } }); } catch (e) { console.error("Unable to load staff Public Comments:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load Public Comments. Please try again."); } };
export const createStaffComment: RequestHandler = async (req, res) => { const ticketId = parseId(req.params.ticketId); const content = typeof req.body?.content === "string" ? req.body.content.trim() : ""; if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; } if (!content || content.length > 5000) { error(res, 400, "INVALID_CONTENT", "Content must contain between 1 and 5,000 characters."); return; } try { const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId }, select: { id: true } }); if (!ticket) { ticketNotFound(res); return; } const authorId = (req as import("./auth.js").AuthenticatedRequest).authUser.id; const row = await getPrisma().publicComment.create({ data: { ticketId, authorId, content }, include: { author: { select: { id: true, name: true, role: true } } } }); res.status(201).json({ data: { comment: { id: row.id, content: row.content, createdAt: row.createdAt.toISOString(), author: row.author } } }); } catch (e) { console.error("Unable to create staff Public Comment:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not save the Public Comment. Please try again."); } };
