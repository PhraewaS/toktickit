import { Prisma, TicketStatus, UserRole } from "@prisma/client";
import { RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "./auth.js";
import { getPrisma } from "./prisma.js";

const OPEN_STATUSES: TicketStatus[] = [TicketStatus.NEW, TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.REOPENED];
const ACTIVE_STAFF_STATUSES: TicketStatus[] = [...OPEN_STATUSES];

function error(res: Response, message: string) {
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message } });
}

function user(req: Parameters<RequestHandler>[0]) {
  return (req as AuthenticatedRequest).authUser;
}

function ticketSummary(ticket: { id: number; ticketNumber: string; summary: string; currentStatus: TicketStatus; itPriority: string; updatedAt: Date; requester?: { id: number; name: string } | null; owner?: { id: number; name: string } | null }) {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    summary: ticket.summary,
    currentStatus: ticket.currentStatus,
    itPriority: ticket.itPriority,
    updatedAt: ticket.updatedAt.toISOString(),
    ...(ticket.requester ? { requester: ticket.requester } : {}),
    ...(ticket.owner ? { owner: ticket.owner } : {}),
  };
}

const requesterTicketSelect = {
  id: true,
  ticketNumber: true,
  summary: true,
  currentStatus: true,
  itPriority: true,
  updatedAt: true,
} satisfies Prisma.TicketSelect;

const staffTicketSelect = {
  id: true,
  ticketNumber: true,
  summary: true,
  currentStatus: true,
  itPriority: true,
  updatedAt: true,
  requester: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true } },
} satisfies Prisma.TicketSelect;

export const requesterDashboard: RequestHandler = async (req, res) => {
  const currentUser = user(req);
  const recentSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const prisma = getPrisma();
    const where = { requesterId: currentUser.id };
    const [openTickets, waitingForRequester, recentlyUpdated, recentlyResolved] = await Promise.all([
      prisma.ticket.count({ where: { ...where, currentStatus: { in: OPEN_STATUSES } } }),
      prisma.ticket.count({ where: { ...where, currentStatus: TicketStatus.WAITING_FOR_REQUESTER } }),
      prisma.ticket.findMany({ where: { ...where, updatedAt: { gte: recentSince } }, select: requesterTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 5 }),
      prisma.ticket.findMany({ where: { ...where, currentStatus: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }, updatedAt: { gte: recentSince } }, select: requesterTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 5 }),
    ]);
    res.status(200).json({ data: { metrics: { openTickets, waitingForRequester, recentlyUpdated: recentlyUpdated.length, recentlyResolved: recentlyResolved.length }, recentlyUpdated: recentlyUpdated.map((ticket) => ticketSummary(ticket)), recentlyResolved: recentlyResolved.map((ticket) => ticketSummary(ticket)) } });
  } catch (caught) { console.error("Unable to load Requester dashboard:", caught); error(res, "TokTickIT could not load the Requester dashboard. Please try again."); }
};

export const staffDashboard: RequestHandler = async (req, res) => {
  const currentUser = user(req);
  const recentSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const prisma = getPrisma();
    const [unassignedTickets, ownedTickets, recentlyUpdated, urgentTickets, statusRows, priorityRows, actionCount, recentActions] = await Promise.all([
      prisma.ticket.count({ where: { ownerId: null, currentStatus: { in: ACTIVE_STAFF_STATUSES } } }),
      prisma.ticket.count({ where: { ownerId: currentUser.id, currentStatus: { in: ACTIVE_STAFF_STATUSES } } }),
      prisma.ticket.findMany({ where: { updatedAt: { gte: recentSince } }, select: staffTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 5 }),
      prisma.ticket.findMany({ where: { itPriority: "HIGH", currentStatus: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] } }, select: staffTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 5 }),
      prisma.ticket.groupBy({ by: ["currentStatus"], _count: { _all: true }, where: { currentStatus: { in: ACTIVE_STAFF_STATUSES } } }),
      prisma.ticket.groupBy({ by: ["itPriority"], _count: { _all: true }, where: { currentStatus: { notIn: [TicketStatus.CLOSED, TicketStatus.CANCELLED] } } }),
      prisma.actionTaken.count({ where: { performedById: currentUser.id } }),
      prisma.actionTaken.findMany({ where: { performedById: currentUser.id }, include: { ticket: { select: { id: true, ticketNumber: true, summary: true } } }, orderBy: [{ actionDateTime: "desc" }, { id: "desc" }], take: 5 }),
    ]);
    const byStatus = Object.fromEntries(statusRows.map((row) => [row.currentStatus, row._count._all]));
    const byPriority = Object.fromEntries(priorityRows.map((row) => [row.itPriority, row._count._all]));
    res.status(200).json({ data: { metrics: { unassignedTickets, ownedTickets, actionsTakenByCurrentUser: actionCount, recentlyUpdated: recentlyUpdated.length, urgentTickets: urgentTickets.length }, byStatus, byPriority, recentlyUpdated: recentlyUpdated.map((ticket) => ticketSummary(ticket)), urgentTickets: urgentTickets.map((ticket) => ticketSummary(ticket)), recentActions: recentActions.map((action) => ({ id: action.id, ticketId: action.ticket.id, ticketNumber: action.ticket.ticketNumber, summary: action.ticket.summary, actionDateTime: action.actionDateTime.toISOString(), description: action.description, result: action.result })) } });
  } catch (caught) { console.error("Unable to load IT Staff dashboard:", caught); error(res, "TokTickIT could not load the IT Staff dashboard. Please try again."); }
};

export function canViewStaffDashboard(role: UserRole) {
  return role === UserRole.IT_STAFF || role === UserRole.ADMINISTRATOR;
}
