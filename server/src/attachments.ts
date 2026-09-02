import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import { getPrisma } from "./prisma.js";
import { DevelopmentRequesterRequest } from "./requester-context.js";
import {
  MAX_ACTIVE_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  MAX_REMOVAL_REASON_LENGTH,
  MIN_REMOVAL_REASON_LENGTH,
  sanitizeOriginalFilename,
  validateAttachment,
  validateRemovalReason,
} from "./attachment-policy.js";

const storageDirectory = path.resolve(
  process.env.ATTACHMENT_STORAGE_DIR ?? path.join(process.cwd(), "storage", "attachments"),
);

export const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: MAX_ACTIVE_ATTACHMENTS, fileSize: MAX_ATTACHMENT_BYTES },
});

const publicAttachmentFields = {
  id: true,
  originalFilename: true,
  mimeType: true,
  sizeBytes: true,
  uploadedAt: true,
  removedAt: true,
  removalReason: true,
} satisfies Prisma.AttachmentSelect;

const publicTicketDetailRelations = {
  requester: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  relatedSystem: { select: { id: true, name: true } },
  attachments: {
    select: publicAttachmentFields,
    orderBy: [{ uploadedAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.TicketInclude;

type PublicTicketDetail = Prisma.TicketGetPayload<{
  include: typeof publicTicketDetailRelations;
}>;

type PublicAttachment = Prisma.AttachmentGetPayload<{
  select: typeof publicAttachmentFields;
}>;

function parseTicketId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function parseAttachmentId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function attachmentState(attachment: { removedAt: Date | null }) {
  return attachment.removedAt ? "REMOVED" : "ACTIVE";
}

export function serializeAttachment(attachment: PublicAttachment) {
  return {
    id: attachment.id,
    originalFilename: attachment.originalFilename,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    uploadedAt: attachment.uploadedAt.toISOString(),
    removedAt: attachment.removedAt?.toISOString() ?? null,
    removalReason: attachment.removalReason,
    state: attachmentState(attachment),
  };
}

export function serializeTicketDetail(ticket: PublicTicketDetail) {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    ticketDate: ticket.createdAt.toISOString(),
    requester: ticket.requester,
    category: ticket.category,
    relatedSystem: ticket.relatedSystem,
    summary: ticket.summary,
    requestedPriority: ticket.requestedPriority,
    description: ticket.description,
    currentStatus: ticket.currentStatus,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    attachments: ticket.attachments.map(serializeAttachment),
  };
}

function ticketNotFound(res: Response) {
  res.status(404).json({
    error: {
      code: "TICKET_NOT_FOUND",
      message: "Ticket was not found.",
    },
  });
}

function attachmentNotFound(res: Response) {
  res.status(404).json({
    error: {
      code: "ATTACHMENT_NOT_FOUND",
      message: "Attachment was not found.",
    },
  });
}

export const getTicketDetail: RequestHandler = async (req, res) => {
  const ticketId = parseTicketId(req.params.ticketId);
  if (ticketId === null) {
    res.status(400).json({
      error: { code: "INVALID_TICKET_ID", message: "Ticket ID must be a positive integer." },
    });
    return;
  }

  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  try {
    const ticket = await getPrisma().ticket.findFirst({
      where: { id: ticketId, requesterId: requester.id },
      include: publicTicketDetailRelations,
    });
    if (!ticket) {
      ticketNotFound(res);
      return;
    }
    res.status(200).json({ data: serializeTicketDetail(ticket) });
  } catch (error) {
    console.error("Unable to load Ticket detail:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "TokTickIT could not load the Ticket. Please try again.",
      },
    });
  }
};

export const listTicketAttachments: RequestHandler = async (req, res) => {
  const ticketId = parseTicketId(req.params.ticketId);
  if (ticketId === null) {
    res.status(400).json({
      error: { code: "INVALID_TICKET_ID", message: "Ticket ID must be a positive integer." },
    });
    return;
  }

  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  try {
    const ticket = await getPrisma().ticket.findFirst({
      where: { id: ticketId, requesterId: requester.id },
      select: { id: true },
    });
    if (!ticket) {
      ticketNotFound(res);
      return;
    }
    const attachments = await getPrisma().attachment.findMany({
      where: { ticketId },
      select: publicAttachmentFields,
      orderBy: [{ uploadedAt: "asc" }, { id: "asc" }],
    });
    res.status(200).json({ data: attachments.map(serializeAttachment) });
  } catch (error) {
    console.error("Unable to load Ticket attachments:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "TokTickIT could not load Attachments. Please try again.",
      },
    });
  }
};

function sendUploadError(res: Response, status: number, code: string, message: string, fields?: Record<string, string>) {
  res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } });
}

export const uploadTicketAttachments: RequestHandler = async (req, res) => {
  const ticketId = parseTicketId(req.params.ticketId);
  if (ticketId === null) {
    sendUploadError(res, 400, "INVALID_TICKET_ID", "Ticket ID must be a positive integer.");
    return;
  }
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    sendUploadError(res, 400, "ATTACHMENTS_REQUIRED", "Select at least one attachment.");
    return;
  }

  const validated = files.map((file) => ({ file, result: validateAttachment(file) }));
  const invalid = validated.find((item) => !item.result.ok);
  if (invalid && !invalid.result.ok) {
    const status = invalid.result.code === "ATTACHMENT_TOO_LARGE" ? 413 : 415;
    sendUploadError(res, status, invalid.result.code, invalid.result.message, {
      filename: sanitizeOriginalFilename(invalid.file.originalname),
    });
    return;
  }

  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  const writtenPaths: string[] = [];
  try {
    const result = await getPrisma().$transaction(async (transaction) => {
      const ticket = await transaction.ticket.findFirst({
        where: { id: ticketId, requesterId: requester.id },
        select: { id: true },
      });
      if (!ticket) return { kind: "ticket-not-found" as const };

      const activeCount = await transaction.attachment.count({
        where: { ticketId, removedAt: null },
      });
      if (activeCount + files.length > MAX_ACTIVE_ATTACHMENTS) {
        return { kind: "limit" as const, activeCount };
      }

      await mkdir(storageDirectory, { recursive: true });
      const created: PublicAttachment[] = [];
      for (const item of validated) {
        if (!item.result.ok) continue;
        const storedFilename = randomUUID();
        const storedPath = path.join(storageDirectory, storedFilename);
        await writeFile(storedPath, item.file.buffer, { flag: "wx" });
        writtenPaths.push(storedPath);
        const attachment = await transaction.attachment.create({
          data: {
            ticketId,
            originalFilename: item.result.originalFilename,
            storedFilename,
            mimeType: item.result.mimeType,
            sizeBytes: item.file.size,
          },
          select: publicAttachmentFields,
        });
        created.push(attachment);
      }
      return { kind: "created" as const, created };
    });

    if (result.kind === "ticket-not-found") {
      ticketNotFound(res);
      return;
    }
    if (result.kind === "limit") {
      sendUploadError(res, 409, "ATTACHMENT_LIMIT", "A Ticket can have at most five active Attachments.");
      return;
    }
    res.status(201).json({ data: result.created.map(serializeAttachment) });
  } catch (error) {
    await Promise.all(writtenPaths.map((filePath) => unlink(filePath).catch(() => undefined)));
    console.error("Unable to upload Ticket attachments:", error);
    sendUploadError(res, 500, "INTERNAL_ERROR", "TokTickIT could not save Attachments. Please try again.");
  }
};

export const downloadAttachment: RequestHandler = async (req, res) => {
  const attachmentId = parseAttachmentId(req.params.attachmentId);
  if (attachmentId === null) {
    attachmentNotFound(res);
    return;
  }
  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  try {
    const attachment = await getPrisma().attachment.findFirst({
      where: { id: attachmentId, removedAt: null, ticket: { requesterId: requester.id } },
      select: { originalFilename: true, storedFilename: true, mimeType: true },
    });
    if (!attachment) {
      attachmentNotFound(res);
      return;
    }
    const file = await readFile(path.join(storageDirectory, attachment.storedFilename));
    res.type(attachment.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizeOriginalFilename(attachment.originalFilename).replaceAll('"', "")}"`);
    res.send(file);
  } catch (error) {
    console.error("Unable to download Attachment:", error);
    sendUploadError(res, 500, "INTERNAL_ERROR", "TokTickIT could not download the Attachment. Please try again.");
  }
};

export const removeAttachment: RequestHandler = async (req, res) => {
  const attachmentId = parseAttachmentId(req.params.attachmentId);
  if (attachmentId === null) {
    attachmentNotFound(res);
    return;
  }
  const reason = validateRemovalReason(req.body?.reason);
  if (!reason) {
    res.status(400).json({
      error: {
        code: "INVALID_REMOVAL_REASON",
        message: `Removal reason must be between ${MIN_REMOVAL_REASON_LENGTH} and ${MAX_REMOVAL_REASON_LENGTH} characters.`,
        fields: { reason: `Enter a reason between ${MIN_REMOVAL_REASON_LENGTH} and ${MAX_REMOVAL_REASON_LENGTH} characters.` },
      },
    });
    return;
  }
  const requester = (req as DevelopmentRequesterRequest).developmentRequester;
  try {
    const attachment = await getPrisma().attachment.findFirst({
      where: { id: attachmentId, removedAt: null, ticket: { requesterId: requester.id } },
      select: { id: true },
    });
    if (!attachment) {
      attachmentNotFound(res);
      return;
    }
    const updated = await getPrisma().attachment.update({
      where: { id: attachmentId },
      data: { removedAt: new Date(), removalReason: reason },
      select: publicAttachmentFields,
    });
    res.status(200).json({ data: serializeAttachment(updated) });
  } catch (error) {
    console.error("Unable to remove Attachment:", error);
    sendUploadError(res, 500, "INTERNAL_ERROR", "TokTickIT could not remove the Attachment. Please try again.");
  }
};

export function handleMulterError(error: unknown, res: Response) {
  if (!(error instanceof multer.MulterError)) return false;
  if (error.code === "LIMIT_FILE_SIZE") {
    sendUploadError(res, 413, "ATTACHMENT_TOO_LARGE", "Each attachment must be no larger than 5 MiB.");
    return true;
  }
  if (error.code === "LIMIT_FILE_COUNT") {
    sendUploadError(res, 409, "ATTACHMENT_LIMIT", "A Ticket can have at most five active Attachments.");
    return true;
  }
  sendUploadError(res, 400, "ATTACHMENT_UPLOAD_INVALID", "Attachment upload could not be read.");
  return true;
}
