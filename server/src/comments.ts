import { RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { AuthenticatedRequest } from "./auth.js";
import { DevelopmentRequesterRequest } from "./requester-context.js";

const MAX_CONTENT_LENGTH = 5000;

function contentFromBody(body: unknown) {
  const content = typeof (body as { content?: unknown })?.content === "string" ? (body as { content: string }).content.trim() : "";
  return content.length > 0 && content.length <= MAX_CONTENT_LENGTH ? content : null;
}

function invalidContent(res: Parameters<RequestHandler>[1]) {
  res.status(400).json({ error: { code: "INVALID_CONTENT", message: "Content must contain between 1 and 5,000 characters.", fields: { content: "Enter a non-empty comment or note." } } });
}

function parseId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function serialize(entry: { id: number; content: string; createdAt: Date; author: { id: number; name: string; role: string } }) {
  return { id: entry.id, content: entry.content, createdAt: entry.createdAt.toISOString(), author: entry.author };
}

export const listRequesterComments: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (ticketId === null) { res.status(400).json({ error: { code: "INVALID_TICKET_ID", message: "Ticket ID must be a positive integer." } }); return; }
  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  try {
    const ticket = await getPrisma().ticket.findFirst({ where: { id: ticketId, requesterId: requester.id }, select: { id: true } });
    if (!ticket) { res.status(404).json({ error: { code: "TICKET_NOT_FOUND", message: "Ticket was not found." } }); return; }
    const rows = await getPrisma().publicComment.findMany({ where: { ticketId, ticket: { requesterId: requester.id } }, include: { author: { select: { id: true, name: true, role: true } } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
    res.status(200).json({ data: { items: rows.map(serialize) } });
  } catch (error) { console.error("Unable to load Public Comments:", error); res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "TokTickIT could not load Public Comments. Please try again." } }); }
};

export const createRequesterComment: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId); const content = contentFromBody(req.body);
  if (ticketId === null) { res.status(400).json({ error: { code: "INVALID_TICKET_ID", message: "Ticket ID must be a positive integer." } }); return; }
  if (!content) { invalidContent(res); return; }
  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  try {
    const ticket = await getPrisma().ticket.findFirst({ where: { id: ticketId, requesterId: requester.id }, select: { id: true } });
    if (!ticket) { res.status(404).json({ error: { code: "TICKET_NOT_FOUND", message: "Ticket was not found." } }); return; }
    const row = await getPrisma().publicComment.create({ data: { ticketId, authorId: requester.id, content }, include: { author: { select: { id: true, name: true, role: true } } } });
    res.status(201).json({ data: { comment: serialize(row) } });
  } catch (error) { console.error("Unable to create Public Comment:", error); res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "TokTickIT could not save the Public Comment. Please try again." } }); }
};

export const markRequesterResolved: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId); if (ticketId === null) { res.status(400).json({ error: { code: "INVALID_TICKET_ID", message: "Ticket ID must be a positive integer." } }); return; }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).length > 0) { res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "The resolved indication body must be empty." } }); return; }
  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  try {
    const ticket = await getPrisma().ticket.findFirst({ where: { id: ticketId, requesterId: requester.id }, select: { id: true, requesterResolvedAt: true, currentStatus: true } });
    if (!ticket) { res.status(404).json({ error: { code: "TICKET_NOT_FOUND", message: "Ticket was not found." } }); return; }
    const updated = ticket.requesterResolvedAt ? ticket : await getPrisma().ticket.update({ where: { id: ticket.id }, data: { requesterResolvedAt: new Date() }, select: { id: true, requesterResolvedAt: true, currentStatus: true } });
    res.status(200).json({ data: { ticketId: updated.id, requesterResolvedAt: updated.requesterResolvedAt?.toISOString() ?? null, currentStatus: updated.currentStatus } });
  } catch (error) { console.error("Unable to save requester resolution indication:", error); res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "TokTickIT could not save the resolution indication. Please try again." } }); }
};

export const listRequesterCommentsOnly = listRequesterComments;

export function serializeCommentForStaff(entry: Prisma.PublicCommentGetPayload<{ include: { author: { select: { id: true; name: true; role: true } } } }>) { return serialize(entry); }
export function serializeNote(entry: Prisma.InternalNoteGetPayload<{ include: { author: { select: { id: true; name: true; role: true } } } }>) { return serialize(entry); }
