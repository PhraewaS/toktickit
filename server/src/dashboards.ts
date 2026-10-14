import { Prisma, RequestedPriority, TicketStatus } from "@prisma/client";
import { RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "./auth.js";
import { getPrisma } from "./prisma.js";

const ACTIVE_STATUSES: TicketStatus[] = [
  TicketStatus.NEW,
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.WAITING_FOR_REQUESTER,
  TicketStatus.REOPENED,
];
const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const LIST_LIMIT = 10;

function error(res: Response, message: string) {
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message } });
}

function user(req: Parameters<RequestHandler>[0]) {
  return (req as AuthenticatedRequest).authUser;
}

const requesterTicketSelect = {
  id: true,
  ticketNumber: true,
  summary: true,
  currentStatus: true,
  updatedAt: true,
} satisfies Prisma.TicketSelect;

const staffTicketSelect = {
  ...requesterTicketSelect,
  itPriority: true,
  requester: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true } },
} satisfies Prisma.TicketSelect;

function requesterTicketSummary(ticket: Prisma.TicketGetPayload<{ select: typeof requesterTicketSelect }>) {
  return { ...ticket, updatedAt: ticket.updatedAt.toISOString() };
}

function staffTicketSummary(ticket: Prisma.TicketGetPayload<{ select: typeof staffTicketSelect }>) {
  return { ...ticket, updatedAt: ticket.updatedAt.toISOString() };
}

export const requesterDashboard: RequestHandler = async (req, res) => {
  const requesterId = user(req).id;
  const now = new Date();
  const recentCutoff = new Date(now.getTime() - RECENT_WINDOW_MS);
  const ownedTickets = { requesterId };
  const recentlyUpdatedWhere = { ...ownedTickets, updatedAt: { gte: recentCutoff } };
  const recentlyResolvedWhere = {
    ...recentlyUpdatedWhere,
    currentStatus: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
  };

  try {
    const prisma = getPrisma();
    const [openTickets, waitingForRequester, recentlyUpdatedCount, recentlyResolvedCount, recentlyUpdated, recentlyResolved] = await Promise.all([
      prisma.ticket.count({ where: { ...ownedTickets, currentStatus: { in: ACTIVE_STATUSES } } }),
      prisma.ticket.count({ where: { ...ownedTickets, currentStatus: TicketStatus.WAITING_FOR_REQUESTER } }),
      prisma.ticket.count({ where: recentlyUpdatedWhere }),
      prisma.ticket.count({ where: recentlyResolvedWhere }),
      prisma.ticket.findMany({ where: recentlyUpdatedWhere, select: requesterTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: LIST_LIMIT }),
      prisma.ticket.findMany({ where: recentlyResolvedWhere, select: requesterTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: LIST_LIMIT }),
    ]);

    res.status(200).json({
      data: {
        metrics: { openTickets, waitingForRequester, recentlyUpdated: recentlyUpdatedCount, recentlyResolved: recentlyResolvedCount },
        recentlyUpdated: recentlyUpdated.map(requesterTicketSummary),
        recentlyResolved: recentlyResolved.map(requesterTicketSummary),
      },
    });
  } catch (caught) {
    console.error("Unable to load Requester dashboard:", caught);
    error(res, "TokTickIT could not load the Requester dashboard. Please try again.");
  }
};

export const staffDashboard: RequestHandler = async (req, res) => {
  const currentUserId = user(req).id;
  const now = new Date();
  const recentCutoff = new Date(now.getTime() - RECENT_WINDOW_MS);
  const activeTickets = { currentStatus: { in: ACTIVE_STATUSES } };
  const urgentTicketsWhere = { ...activeTickets, itPriority: RequestedPriority.HIGH };

  try {
    const prisma = getPrisma();
    const [unassignedActive, myActive, myActionsTaken, urgentCount, statusRows, priorityRows, recentlyUpdated, urgentTickets, recentActions] = await Promise.all([
      prisma.ticket.count({ where: { ...activeTickets, ownerId: null } }),
      prisma.ticket.count({ where: { ...activeTickets, ownerId: currentUserId } }),
      prisma.actionTaken.count({ where: { performedById: currentUserId } }),
      prisma.ticket.count({ where: urgentTicketsWhere }),
      prisma.ticket.groupBy({ by: ["currentStatus"], _count: { _all: true } }),
      prisma.ticket.groupBy({ by: ["itPriority"], _count: { _all: true } }),
      prisma.ticket.findMany({ where: { updatedAt: { gte: recentCutoff } }, select: staffTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: LIST_LIMIT }),
      prisma.ticket.findMany({ where: urgentTicketsWhere, select: staffTicketSelect, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: LIST_LIMIT }),
      prisma.actionTaken.findMany({
        where: { performedById: currentUserId, actionDateTime: { gte: recentCutoff } },
        include: { ticket: { select: { id: true, ticketNumber: true, summary: true } } },
        orderBy: [{ actionDateTime: "desc" }, { id: "desc" }],
        take: LIST_LIMIT,
      }),
    ]);

    const byStatus: Record<TicketStatus, number> = Object.fromEntries(Object.values(TicketStatus).map((status) => [status, 0])) as Record<TicketStatus, number>;
    for (const row of statusRows) byStatus[row.currentStatus] = row._count._all;

    const byPriority: Record<RequestedPriority, number> = Object.fromEntries(Object.values(RequestedPriority).map((priority) => [priority, 0])) as Record<RequestedPriority, number>;
    for (const row of priorityRows) byPriority[row.itPriority] = row._count._all;

    res.status(200).json({
      data: {
        metrics: { unassignedActive, myActive, myActionsTaken, urgentTickets: urgentCount },
        byStatus,
        byPriority,
        recentlyUpdated: recentlyUpdated.map(staffTicketSummary),
        urgentTickets: urgentTickets.map(staffTicketSummary),
        recentActions: recentActions.map((action) => ({
          id: action.id,
          ticketId: action.ticket.id,
          ticketNumber: action.ticket.ticketNumber,
          summary: action.ticket.summary,
          actionDateTime: action.actionDateTime.toISOString(),
          description: action.description,
          result: action.result,
        })),
      },
    });
  } catch (caught) {
    console.error("Unable to load IT Staff dashboard:", caught);
    error(res, "TokTickIT could not load the IT Staff dashboard. Please try again.");
  }
};
