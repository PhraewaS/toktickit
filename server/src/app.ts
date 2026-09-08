import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import { requireAuthenticatedOrDevelopmentRequester } from "./requester-context.js";
import { changePassword, currentUser, login, logout, requireAuthenticated, requireRole } from "./auth.js";
import { UserRole } from "@prisma/client";
import { listRequesterComments, createRequesterComment, markRequesterResolved } from "./comments.js";
import { assignStaffTicket, createStaffComment, createStaffNote, getStaffTicketDetail, listAssignableStaff, listStaffComments, listStaffNotes, listStaffTickets, updateStaffPriority, updateStaffStatus } from "./staff.js";
import { createUser, listUsers, resetInitialPassword, updateUser } from "./admin.js";
import { createTicket, listTickets } from "./tickets.js";
import {
  attachmentUpload,
  downloadAttachment,
  getTicketDetail,
  handleMulterError,
  listTicketAttachments,
  removeAttachment,
  uploadTicketAttachments,
} from "./attachments.js";

export const app = express();

app.use(cors({ exposedHeaders: ["Content-Disposition"] }));
app.use(express.json());

app.use((req, res, next) => {
  if (["POST", "PATCH", "DELETE", "PUT"].includes(req.method)) {
    const origin = req.get("Origin");
    const allowed = new Set([process.env.APP_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean));
    if (origin && !allowed.has(origin)) {
      res.status(403).json({ error: { code: "CSRF_REJECTED", message: "The request origin is not permitted." } });
      return;
    }
  }
  next();
});

app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.get("/api/auth/me", requireAuthenticated, currentUser);
app.post("/api/auth/change-password", requireAuthenticated, changePassword);

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

app.get("/api/development-requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().requesterUser.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    res.status(200).json({ data: requesters });
  } catch (error) {
    console.error("Unable to load Development Requesters:", error);
    res.status(503).json({
      error: {
        code: "REQUESTER_LIST_UNAVAILABLE",
        message:
          "Development requesters are temporarily unavailable. Please try again.",
      },
    });
  }
});

app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    res.status(200).json({ data: categories });
  } catch (error) {
    sendReferenceDataUnavailable(res, error);
  }
});

app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const relatedSystems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    res.status(200).json({ data: relatedSystems });
  } catch (error) {
    sendReferenceDataUnavailable(res, error);
  }
});

app.post("/api/tickets", requireAuthenticatedOrDevelopmentRequester, createTicket);
app.get("/api/tickets", requireAuthenticatedOrDevelopmentRequester, listTickets);
app.get("/api/tickets/:ticketId", requireAuthenticatedOrDevelopmentRequester, getTicketDetail);
app.get("/api/tickets/:ticketId/attachments", requireAuthenticatedOrDevelopmentRequester, listTicketAttachments);
app.post(
  "/api/tickets/:ticketId/attachments",
  requireAuthenticatedOrDevelopmentRequester,
  (req, res, next) => {
    attachmentUpload.array("files", 5)(req, res, (error) => {
      if (error) {
        if (handleMulterError(error, res)) return;
        next(error);
        return;
      }
      next();
    });
  },
  uploadTicketAttachments,
);
app.get("/api/attachments/:attachmentId/download", requireAuthenticatedOrDevelopmentRequester, downloadAttachment);
app.delete("/api/attachments/:attachmentId", requireAuthenticatedOrDevelopmentRequester, removeAttachment);
app.get("/api/tickets/:ticketId/comments", requireAuthenticatedOrDevelopmentRequester, listRequesterComments);
app.post("/api/tickets/:ticketId/comments", requireAuthenticatedOrDevelopmentRequester, createRequesterComment);
app.post("/api/tickets/:ticketId/resolved", requireAuthenticatedOrDevelopmentRequester, markRequesterResolved);

app.get("/api/staff/tickets", requireAuthenticated, requireRole(UserRole.IT_STAFF), listStaffTickets);
app.get("/api/staff/assignees", requireAuthenticated, requireRole(UserRole.IT_STAFF), listAssignableStaff);
app.get("/api/staff/tickets/:ticketId", requireAuthenticated, requireRole(UserRole.IT_STAFF), getStaffTicketDetail);
app.post("/api/staff/tickets/:ticketId/assignment", requireAuthenticated, requireRole(UserRole.IT_STAFF), assignStaffTicket);
app.patch("/api/staff/tickets/:ticketId/priority", requireAuthenticated, requireRole(UserRole.IT_STAFF), updateStaffPriority);
app.patch("/api/staff/tickets/:ticketId/status", requireAuthenticated, requireRole(UserRole.IT_STAFF), updateStaffStatus);
app.get("/api/staff/tickets/:ticketId/comments", requireAuthenticated, requireRole(UserRole.IT_STAFF), listStaffComments);
app.post("/api/staff/tickets/:ticketId/comments", requireAuthenticated, requireRole(UserRole.IT_STAFF), createStaffComment);
app.get("/api/staff/tickets/:ticketId/notes", requireAuthenticated, requireRole(UserRole.IT_STAFF, UserRole.ADMINISTRATOR), listStaffNotes);
app.post("/api/staff/tickets/:ticketId/notes", requireAuthenticated, requireRole(UserRole.IT_STAFF, UserRole.ADMINISTRATOR), createStaffNote);

app.get("/api/admin/users", requireAuthenticated, requireRole(UserRole.ADMINISTRATOR), listUsers);
app.post("/api/admin/users", requireAuthenticated, requireRole(UserRole.ADMINISTRATOR), createUser);
app.patch("/api/admin/users/:userId", requireAuthenticated, requireRole(UserRole.ADMINISTRATOR), updateUser);
app.post("/api/admin/users/:userId/initial-password", requireAuthenticated, requireRole(UserRole.ADMINISTRATOR), resetInitialPassword);

function sendReferenceDataUnavailable(res: Response, error: unknown) {
  console.error("Unable to load reference data:", error);
  res.status(503).json({
    error: {
      code: "REFERENCE_DATA_UNAVAILABLE",
      message: "Reference data is temporarily unavailable. Please try again.",
    },
  });
}

export default app;
