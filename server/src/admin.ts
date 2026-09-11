import { RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { AuthenticatedRequest, hashPassword, safeUser, validatePassword } from "./auth.js";

const roles = new Set<string>(Object.values(UserRole));
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
} as const;
const updateFields = new Set(["name", "email", "role", "isActive"]);

function error(
  res: Parameters<RequestHandler>[1],
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } });
}

function parseId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validName(value: unknown) {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 150;
}

function validEmail(value: unknown) {
  return typeof value === "string" && value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function unknownFields(body: Record<string, unknown>, allowed: Set<string>) {
  return Object.keys(body).filter((key) => !allowed.has(key));
}

export const listUsers: RequestHandler = async (req, res) => {
  const query = req.query as Record<string, unknown>;
  const allowedQuery = new Set(["search", "role"]);
  const unknownQuery = Object.keys(query).filter((key) => !allowedQuery.has(key));
  const search = query.search;
  const role = query.role;
  if (
    unknownQuery.length > 0 ||
    (search !== undefined && typeof search !== "string") ||
    (role !== undefined && (typeof role !== "string" || !roles.has(role))) ||
    (typeof search === "string" && search.trim().length > 100)
  ) {
    error(res, 400, "INVALID_QUERY", "Review the user search and role filter.");
    return;
  }

  try {
    const users = await getPrisma().requesterUser.findMany({
      where: {
        ...(typeof search === "string" && search.trim()
          ? {
              OR: [
                { name: { contains: search.trim(), mode: "insensitive" } },
                { email: { contains: search.trim(), mode: "insensitive" } },
              ],
            }
          : {}),
        ...(typeof role === "string" ? { role: role as UserRole } : {}),
      },
      select: userSelect,
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    res.status(200).json({ data: users.map(safeUser) });
  } catch (e) {
    console.error("Unable to load users:", e);
    error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load users. Please try again.");
  }
};

async function emailExists(email: string, excludeId?: number) {
  return Boolean(
    await getPrisma().requesterUser.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    }),
  );
}

export const createUser: RequestHandler = async (req, res) => {
  const body = isObject(req.body) ? req.body : null;
  if (!body) {
    error(res, 400, "VALIDATION_ERROR", "Review the user fields.", { body: "Request body must be an object." });
    return;
  }

  const fields: Record<string, string> = {};
  for (const field of unknownFields(body, new Set(["name", "email", "role", "isActive", "initialPassword"]))) {
    fields[field] = "This field is not supported.";
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role;
  const initialPassword = body.initialPassword;
  const isActive: unknown = body.isActive === undefined ? true : body.isActive;
  const passwordError = validatePassword(initialPassword);
  if (!validName(name)) fields.name = "Name must be between 2 and 150 characters.";
  if (!validEmail(email)) fields.email = "Enter a valid email address.";
  if (typeof role !== "string" || !roles.has(role)) fields.role = "Choose one permitted role.";
  if (typeof isActive !== "boolean") fields.isActive = "Activation state is invalid.";
  if (passwordError) fields.initialPassword = passwordError;
  if (Object.keys(fields).length) {
    error(res, 400, "VALIDATION_ERROR", "Review the highlighted user fields.", fields);
    return;
  }

  try {
    if (await emailExists(email)) {
      error(res, 409, "DUPLICATE_EMAIL", "That email address is already in use.", { email: "Email must be unique." });
      return;
    }
    const user = await getPrisma().requesterUser.create({
      data: {
        name,
        email,
        role: role as UserRole,
        isActive: isActive as boolean,
        passwordHash: hashPassword(initialPassword as string),
        mustChangePassword: true,
      },
      select: userSelect,
    });
    res.status(201).json({ data: { user: safeUser(user) } });
  } catch (e) {
    console.error("Unable to create user:", e);
    error(res, 500, "INTERNAL_ERROR", "TokTickIT could not create the user. Please try again.");
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  const id = parseId(req.params.userId);
  if (id === null) {
    error(res, 400, "INVALID_USER_ID", "User ID must be a positive integer.");
    return;
  }
  const body = isObject(req.body) ? req.body : null;
  if (!body) {
    error(res, 400, "VALIDATION_ERROR", "Review the user fields.", { body: "Request body must be an object." });
    return;
  }

  const validationFields: Record<string, string> = {};
  const conflictFields: Record<string, string> = {};
  for (const field of unknownFields(body, updateFields)) validationFields[field] = "This field is not supported.";
  if (Object.keys(body).length === 0) validationFields.body = "At least one user field is required.";

  const data: { name?: string; email?: string; role?: UserRole; isActive?: boolean } = {};
  if (body.name !== undefined) {
    const name = body.name;
    if (!validName(name)) validationFields.name = "Name must be between 2 and 150 characters.";
    else data.name = (name as string).trim();
  }
  if (body.email !== undefined) {
    const email = body.email;
    if (!validEmail(email)) validationFields.email = "Enter a valid email address.";
    else data.email = (email as string).trim().toLowerCase();
  }
  if (body.role !== undefined) {
    if (typeof body.role !== "string" || !roles.has(body.role)) validationFields.role = "Choose one permitted role.";
    else data.role = body.role as UserRole;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") validationFields.isActive = "Activation state is invalid.";
    else data.isActive = body.isActive;
  }
  if (Object.keys(validationFields).length) {
    error(res, 400, "VALIDATION_ERROR", "Review the highlighted user fields.", validationFields);
    return;
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.requesterUser.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!existing) {
      error(res, 404, "USER_NOT_FOUND", "User was not found.");
      return;
    }

    const actor = (req as AuthenticatedRequest).authUser;
    if (actor.id === id && data.isActive === false) {
      conflictFields.isActive = "You cannot deactivate your own account.";
    }
    const resultingRole = data.role ?? existing.role;
    const resultingActive = data.isActive ?? existing.isActive;
    if (
      existing.role === UserRole.ADMINISTRATOR &&
      existing.isActive &&
      (resultingRole !== UserRole.ADMINISTRATOR || !resultingActive)
    ) {
      const count = await prisma.requesterUser.count({ where: { role: UserRole.ADMINISTRATOR, isActive: true } });
      if (count <= 1) conflictFields.role = "At least one active Administrator must remain.";
    }
    if (data.email && await emailExists(data.email, id)) {
      error(res, 409, "DUPLICATE_EMAIL", "That email address is already in use.", { email: "Email must be unique." });
      return;
    }
    if (Object.keys(conflictFields).length) {
      error(res, 409, "USER_UPDATE_CONFLICT", "The user could not be updated.", conflictFields);
      return;
    }

    const user = await prisma.requesterUser.update({ where: { id }, data, select: userSelect });
    if (existing.isActive && data.isActive === false) {
      await prisma.session.deleteMany({ where: { userId: id } });
    }
    res.status(200).json({ data: { user: safeUser(user) } });
  } catch (e) {
    console.error("Unable to update user:", e);
    error(res, 500, "INTERNAL_ERROR", "TokTickIT could not update the user. Please try again.");
  }
};

export const resetInitialPassword: RequestHandler = async (req, res) => {
  const id = parseId(req.params.userId);
  const body = isObject(req.body) ? req.body : null;
  const password = body?.initialPassword;
  const passwordError = validatePassword(password);
  if (id === null) {
    error(res, 400, "INVALID_USER_ID", "User ID must be a positive integer.");
    return;
  }
  if (!body || Object.keys(body).some((field) => field !== "initialPassword") || passwordError) {
    error(res, 400, "VALIDATION_ERROR", "Review the password field.", {
      initialPassword: passwordError ?? "Only initialPassword is allowed.",
    });
    return;
  }

  try {
    const prisma = getPrisma();
    const exists = await prisma.requesterUser.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      error(res, 404, "USER_NOT_FOUND", "User was not found.");
      return;
    }
    const user = await prisma.requesterUser.update({
      where: { id },
      data: { passwordHash: hashPassword(password as string), mustChangePassword: true },
      select: userSelect,
    });
    await prisma.session.deleteMany({ where: { userId: id } });
    res.status(200).json({ data: { user: safeUser(user) } });
  } catch (e) {
    console.error("Unable to reset initial password:", e);
    error(res, 500, "INTERNAL_ERROR", "TokTickIT could not set the initial password. Please try again.");
  }
};
