import { Prisma, UserRole } from "@prisma/client";
import { RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "./auth.js";
import { getPrisma } from "./prisma.js";

const MAX_TEXT = 5000;
const MAX_ATTACHMENT_NOTES = 2000;
const actionInclude = {
  performedBy: { select: { id: true, name: true } },
} satisfies Prisma.ActionTakenInclude;

type ActionRecord = Prisma.ActionTakenGetPayload<{ include: typeof actionInclude }>;

function error(res: Response, status: number, code: string, message: string, fields?: Record<string, string>) {
  res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } });
}

function parseId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function authUser(req: Parameters<RequestHandler>[0]) {
  return (req as AuthenticatedRequest).authUser;
}

function serializeAction(action: ActionRecord) {
  return {
    id: action.id,
    ticketId: action.ticketId,
    actionDateTime: action.actionDateTime.toISOString(),
    description: action.description,
    result: action.result,
    performedBy: { id: action.performedBy.id, name: action.performedBy.name },
    followUpRequired: action.followUpRequired,
    followUpNote: action.followUpNote,
    attachmentNotes: action.attachmentNotes,
    createdAt: action.createdAt.toISOString(),
    updatedAt: action.updatedAt.toISOString(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePayload(body: unknown, update: boolean) {
  if (!isObject(body)) return { error: { code: "VALIDATION_ERROR", message: "Review the Action Taken fields and try again." } } as const;
  const allowed = new Set(["actionDateTime", "description", "result", "followUpRequired", "followUpNote", "attachmentNotes", ...(update ? ["updatedAt"] : [])]);
  if (Object.keys(body).some((key) => !allowed.has(key))) return { error: { code: "VALIDATION_ERROR", message: "Only Action Taken fields may be submitted." } } as const;

  const fields: Record<string, string> = {};
  const actionDateTime = body.actionDateTime;
  if (typeof actionDateTime !== "string" || Number.isNaN(Date.parse(actionDateTime))) fields.actionDateTime = "Enter a valid Action Date/Time.";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description || description.length > MAX_TEXT) fields.description = "Description must contain between 1 and 5,000 characters.";
  const result = typeof body.result === "string" ? body.result.trim() : "";
  if (!result || result.length > MAX_TEXT) fields.result = "Result must contain between 1 and 5,000 characters.";
  const followUpRequired = body.followUpRequired === undefined ? false : body.followUpRequired;
  if (typeof followUpRequired !== "boolean") fields.followUpRequired = "Follow-Up Required must be true or false.";
  const followUpNote = typeof body.followUpNote === "string" ? body.followUpNote.trim() : "";
  if (followUpRequired === true && (!followUpNote || followUpNote.length > MAX_TEXT)) fields.followUpNote = "Follow-Up Note is required when Follow-Up Required is true.";
  if (followUpRequired === false && followUpNote.length > 0) fields.followUpNote = "Follow-Up Note is only allowed when Follow-Up Required is true.";
  const attachmentNotes = typeof body.attachmentNotes === "string" ? body.attachmentNotes.trim() : "";
  if (attachmentNotes.length > MAX_ATTACHMENT_NOTES) fields.attachmentNotes = "Attachment Notes must not exceed 2,000 characters.";
  const expectedUpdatedAt = body.updatedAt;
  if (update && (typeof expectedUpdatedAt !== "string" || Number.isNaN(Date.parse(expectedUpdatedAt)))) fields.updatedAt = "Submit the Action Taken updatedAt value returned by the latest read.";
  if (Object.keys(fields).length > 0) return { error: { code: "VALIDATION_ERROR", message: "Review the highlighted Action Taken fields and try again.", fields } } as const;
  return {
    value: {
      actionDateTime: new Date(actionDateTime as string),
      description,
      result,
      followUpRequired: followUpRequired as boolean,
      followUpNote: followUpRequired ? followUpNote : null,
      attachmentNotes: attachmentNotes || null,
      expectedUpdatedAt: typeof expectedUpdatedAt === "string" ? new Date(expectedUpdatedAt) : undefined,
    },
  } as const;
}

async function accessibleTicket(ticketId: number, req: Parameters<RequestHandler>[0]) {
  const user = authUser(req);
  return getPrisma().ticket.findFirst({
    where: { id: ticketId, ...(user.role === UserRole.REQUESTER ? { requesterId: user.id } : {}) },
    select: { id: true },
  });
}

export const listActions: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; }
  try {
    if (!await accessibleTicket(ticketId, req)) { error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found."); return; }
    const actions = await getPrisma().actionTaken.findMany({ where: { ticketId }, include: actionInclude, orderBy: [{ actionDateTime: "asc" }, { id: "asc" }] });
    res.status(200).json({ data: { items: actions.map(serializeAction) } });
  } catch (caught) { console.error("Unable to list Actions Taken:", caught); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load Actions Taken. Please try again."); }
};

export const createAction: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (ticketId === null) { error(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer."); return; }
  const parsed = parsePayload(req.body, false);
  if ("error" in parsed) { const issue = parsed.error!; error(res, 400, issue.code, issue.message, "fields" in issue ? issue.fields : undefined); return; }
  const user = authUser(req);
  try {
    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId }, select: { id: true } });
    if (!ticket) { error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found."); return; }
    const created = await getPrisma().actionTaken.create({ data: { ticketId, actionDateTime: parsed.value.actionDateTime, description: parsed.value.description, result: parsed.value.result, followUpRequired: parsed.value.followUpRequired, followUpNote: parsed.value.followUpNote, attachmentNotes: parsed.value.attachmentNotes, performedById: user.id }, include: actionInclude });
    res.status(201).json({ data: { item: serializeAction(created) } });
  } catch (caught) { console.error("Unable to create Action Taken:", caught); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not save the Action Taken. Please try again."); }
};

export const updateAction: RequestHandler = async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  const actionId = parseId(req.params.actionId);
  if (ticketId === null || actionId === null) { error(res, 400, "INVALID_ACTION_ID", "Ticket and Action IDs must be positive integers."); return; }
  const parsed = parsePayload(req.body, true);
  if ("error" in parsed) { const issue = parsed.error!; error(res, 400, issue.code, issue.message, "fields" in issue ? issue.fields : undefined); return; }
  try {
    const existing = await getPrisma().actionTaken.findFirst({ where: { id: actionId, ticketId }, select: { id: true, updatedAt: true } });
    if (!existing) { error(res, 404, "ACTION_NOT_FOUND", "Action Taken was not found for this Ticket."); return; }
    const data = { actionDateTime: parsed.value.actionDateTime, description: parsed.value.description, result: parsed.value.result, followUpRequired: parsed.value.followUpRequired, followUpNote: parsed.value.followUpNote, attachmentNotes: parsed.value.attachmentNotes };
    const updated = await getPrisma().actionTaken.updateMany({ where: { id: actionId, ticketId, updatedAt: parsed.value.expectedUpdatedAt! }, data });
    if (updated.count !== 1) { error(res, 409, "ACTION_UPDATE_CONFLICT", "This Action Taken changed after it was loaded. Refresh and try again."); return; }
    const saved = await getPrisma().actionTaken.findUniqueOrThrow({ where: { id: actionId }, include: actionInclude });
    res.status(200).json({ data: { item: serializeAction(saved) } });
  } catch (caught) { console.error("Unable to update Action Taken:", caught); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not update the Action Taken. Please try again."); }
};

export { serializeAction };
