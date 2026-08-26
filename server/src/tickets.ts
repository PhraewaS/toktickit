import { Prisma, RequestedPriority, TicketStatus } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import { getPrisma } from "./prisma.js";
import { DevelopmentRequesterRequest } from "./requester-context.js";
import { generateTicketNumber } from "./ticket-number.js";
import {
  CreateTicketInput,
  validateCreateTicketInput,
} from "./ticket-validation.js";

const publicTicketRelations = {
  requester: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  relatedSystem: { select: { id: true, name: true } },
} satisfies Prisma.TicketInclude;

type PublicTicketRecord = Prisma.TicketGetPayload<{
  include: typeof publicTicketRelations;
}>;

class ReferenceDataError extends Error {
  constructor(readonly fields: Record<string, string>) {
    super("Ticket reference data is unavailable.");
  }
}

function serializeTicket(ticket: PublicTicketRecord) {
  const createdAt = ticket.createdAt.toISOString();
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    ticketDate: createdAt,
    requester: ticket.requester,
    category: ticket.category,
    relatedSystem: ticket.relatedSystem,
    summary: ticket.summary,
    requestedPriority: ticket.requestedPriority,
    description: ticket.description,
    currentStatus: ticket.currentStatus,
    createdAt,
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function createTicketAttempt(
  input: CreateTicketInput,
  requesterId: number,
) {
  const prisma = getPrisma();
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.ticket.findUnique({
      where: {
        requesterId_submissionKey: {
          requesterId,
          submissionKey: input.submissionKey,
        },
      },
      include: publicTicketRelations,
    });

    if (existing) {
      return { ticket: existing, replayed: true };
    }

    const [category, relatedSystem] = await Promise.all([
      transaction.category.findFirst({
        where: { id: input.categoryId, isActive: true },
        select: { id: true },
      }),
      transaction.relatedSystem.findFirst({
        where: { id: input.relatedSystemId, isActive: true },
        select: { id: true },
      }),
    ]);

    const referenceFields: Record<string, string> = {};
    if (!category) referenceFields.categoryId = "Select an active Category.";
    if (!relatedSystem) {
      referenceFields.relatedSystemId = "Select an active Related System.";
    }
    if (Object.keys(referenceFields).length > 0) {
      throw new ReferenceDataError(referenceFields);
    }

    const ticket = await transaction.ticket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        requesterId,
        categoryId: input.categoryId,
        relatedSystemId: input.relatedSystemId,
        summary: input.summary,
        requestedPriority: input.requestedPriority as RequestedPriority,
        description: input.description,
        currentStatus: TicketStatus.NEW,
        submissionKey: input.submissionKey,
      },
      include: publicTicketRelations,
    });

    return { ticket, replayed: false };
  });
}

async function createOrReplayTicket(input: CreateTicketInput, requesterId: number) {
  const prisma = getPrisma();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await createTicketAttempt(input, requesterId);
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;

      const existing = await prisma.ticket.findUnique({
        where: {
          requesterId_submissionKey: {
            requesterId,
            submissionKey: input.submissionKey,
          },
        },
        include: publicTicketRelations,
      });
      if (existing) return { ticket: existing, replayed: true };
      if (attempt === 2) throw error;
    }
  }

  throw new Error("Ticket creation retry limit reached.");
}

export const createTicket: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const validation = validateCreateTicketInput(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Review the highlighted fields and try again.",
        fields: validation.fields,
      },
    });
    return;
  }

  const requester = (req as DevelopmentRequesterRequest).developmentRequester;

  try {
    const result = await createOrReplayTicket(validation.data, requester.id);
    res.status(result.replayed ? 200 : 201).json({
      data: serializeTicket(result.ticket),
      replayed: result.replayed,
    });
  } catch (error) {
    if (error instanceof ReferenceDataError) {
      res.status(400).json({
        error: {
          code: "REFERENCE_DATA_UNAVAILABLE",
          message: "Select active Category and Related System values.",
          fields: error.fields,
        },
      });
      return;
    }

    console.error("Unable to create Ticket:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "TokTickIT could not complete the request. Please try again.",
      },
    });
  }
};
