import { NextFunction, Request, RequestHandler, Response } from "express";
import { getPrisma } from "./prisma.js";

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
}

export interface DevelopmentRequesterRequest extends Request {
  developmentRequester: DevelopmentRequester;
}

function requesterRequired(res: Response) {
  return res.status(400).json({
    error: {
      code: "REQUESTER_REQUIRED",
      message: "Select a Development Requester before continuing.",
    },
  });
}

export const requireDevelopmentRequester: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const headerValue = req.get("X-Development-Requester-Id");

  if (!headerValue || !/^[1-9]\d*$/.test(headerValue)) {
    requesterRequired(res);
    return;
  }

  const requesterId = Number(headerValue);
  if (!Number.isSafeInteger(requesterId)) {
    requesterRequired(res);
    return;
  }

  try {
    const requester = await getPrisma().requesterUser.findFirst({
      where: { id: requesterId, isActive: true },
      select: { id: true, name: true, email: true },
    });

    if (!requester) {
      res.status(400).json({
        error: {
          code: "REQUESTER_UNAVAILABLE",
          message:
            "The selected Development Requester is unavailable. Select another requester.",
        },
      });
      return;
    }

    (req as DevelopmentRequesterRequest).developmentRequester = requester;
    next();
  } catch (error) {
    console.error("Unable to validate Development Requester context:", error);
    res.status(503).json({
      error: {
        code: "REQUESTER_SERVICE_UNAVAILABLE",
        message: "Requester validation is temporarily unavailable. Please try again.",
      },
    });
  }
};
