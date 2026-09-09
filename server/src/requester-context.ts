import { NextFunction, Request, RequestHandler, Response } from "express";
import { getPrisma } from "./prisma.js";
import { AuthenticatedRequest, getSessionUser, hasSessionCookie } from "./auth.js";

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
}

export interface DevelopmentRequesterRequest extends Request {
  developmentRequester: DevelopmentRequester;
  authUser?: AuthenticatedRequest["authUser"];
}

export function isLab2CompatibilityEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.LAB2_COMPATIBILITY_MODE === "true";
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

/**
 * Lab 2 regression tests and migration tooling may still use the old header,
 * but only when explicitly enabled outside production. A supplied but invalid
 * session cookie never falls back to the legacy requester header.
 */
export const requireAuthenticatedOrDevelopmentRequester: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const user = await getSessionUser(req);
    if (user) {
      if (user.mustChangePassword) {
        res.status(403).json({ error: { code: "PASSWORD_CHANGE_REQUIRED", message: "Change your initial password before continuing." } });
        return;
      }
      if (user.role !== "REQUESTER") {
        res.status(403).json({ error: { code: "FORBIDDEN", message: "This operation is available to Requesters only." } });
        return;
      }
      const typed = req as DevelopmentRequesterRequest;
      typed.authUser = user;
      typed.developmentRequester = { id: user.id, name: user.name, email: user.email };
      next();
      return;
    }

    if (hasSessionCookie(req)) {
      res.status(401).json({ error: { code: "SESSION_INVALID", message: "Your session is no longer valid. Sign in again." } });
      return;
    }

    if (!isLab2CompatibilityEnabled()) {
      res.status(401).json({ error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in to continue." } });
      return;
    }
  } catch (error) {
    console.error("Unable to validate authenticated requester:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "TokTickIT could not complete the request. Please try again." } });
    return;
  }

  // Compatibility path for Lab 2 API regression tests only.
  requireDevelopmentRequester(req, res, next);
};
