import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";

export const app = express();

app.use(cors());
app.use(express.json());

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
