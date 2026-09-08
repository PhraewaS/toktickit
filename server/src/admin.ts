import { RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { hashPassword, safeUser, validatePassword } from "./auth.js";
import { AuthenticatedRequest } from "./auth.js";

const roles = new Set<string>(Object.values(UserRole));
const userSelect = { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true } as const;
function error(res: Parameters<RequestHandler>[1], status: number, code: string, message: string, fields?: Record<string, string>) { res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } }); }
function parseId(value: string) { if (!/^[1-9]\d*$/.test(value)) return null; const id = Number(value); return Number.isSafeInteger(id) ? id : null; }
function validName(value: unknown) { return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 150; }
function validEmail(value: unknown) { return typeof value === "string" && value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }

export const listUsers: RequestHandler = async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : ""; const role = req.query.role;
  if (search.length > 100 || (role !== undefined && (typeof role !== "string" || !roles.has(role)))) { error(res, 400, "INVALID_QUERY", "Review the user search and role filter."); return; }
  try { const users = await getPrisma().requesterUser.findMany({ where: { ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {}), ...(role ? { role: role as UserRole } : {}) }, select: userSelect, orderBy: [{ name: "asc" }, { id: "asc" }] }); res.status(200).json({ data: users.map(safeUser) }); }
  catch (e) { console.error("Unable to load users:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not load users. Please try again."); }
};

async function emailExists(email: string, excludeId?: number) { return Boolean(await getPrisma().requesterUser.findFirst({ where: { email: { equals: email, mode: "insensitive" }, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })); }

export const createUser: RequestHandler = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : ""; const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""; const role = req.body?.role; const initialPassword = req.body?.initialPassword; const isActive = req.body?.isActive === undefined ? true : req.body.isActive;
  const passwordError = validatePassword(initialPassword); const fields: Record<string, string> = {};
  if (!validName(name)) fields.name = "Name must be between 2 and 150 characters."; if (!validEmail(email)) fields.email = "Enter a valid email address."; if (!roles.has(role)) fields.role = "Choose one permitted role."; if (typeof isActive !== "boolean") fields.isActive = "Activation state is invalid."; if (passwordError) fields.initialPassword = passwordError;
  if (Object.keys(fields).length) { error(res, 400, "VALIDATION_ERROR", "Review the highlighted user fields.", fields); return; }
  try { if (await emailExists(email)) { error(res, 409, "DUPLICATE_EMAIL", "That email address is already in use.", { email: "Email must be unique." }); return; } const user = await getPrisma().requesterUser.create({ data: { name, email, role: role as UserRole, isActive, passwordHash: hashPassword(initialPassword), mustChangePassword: true }, select: userSelect }); res.status(201).json({ data: { user: safeUser(user), initialPassword } }); }
  catch (e) { console.error("Unable to create user:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not create the user. Please try again."); }
};

export const updateUser: RequestHandler = async (req, res) => {
  const id = parseId(req.params.userId); if (id === null) { error(res, 400, "INVALID_USER_ID", "User ID must be a positive integer."); return; }
  const existing = await getPrisma().requesterUser.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } }); if (!existing) { error(res, 404, "USER_NOT_FOUND", "User was not found."); return; }
  const fields: Record<string, string> = {}; const data: { name?: string; email?: string; role?: UserRole; isActive?: boolean } = {};
  if (req.body?.name !== undefined) { if (!validName(req.body.name)) fields.name = "Name must be between 2 and 150 characters."; else data.name = req.body.name.trim(); }
  if (req.body?.email !== undefined) { if (!validEmail(req.body.email)) fields.email = "Enter a valid email address."; else data.email = req.body.email.trim().toLowerCase(); }
  if (req.body?.role !== undefined) { if (!roles.has(req.body.role)) fields.role = "Choose one permitted role."; else data.role = req.body.role as UserRole; }
  if (req.body?.isActive !== undefined) { if (typeof req.body.isActive !== "boolean") fields.isActive = "Activation state is invalid."; else data.isActive = req.body.isActive; }
  const actor = (req as AuthenticatedRequest).authUser;
  if (actor.id === id && data.isActive === false) fields.isActive = "You cannot deactivate your own account.";
  const resultingRole = data.role ?? existing.role; const resultingActive = data.isActive ?? existing.isActive;
  if (existing.role === UserRole.ADMINISTRATOR && existing.isActive && (resultingRole !== UserRole.ADMINISTRATOR || !resultingActive)) { const count = await getPrisma().requesterUser.count({ where: { role: UserRole.ADMINISTRATOR, isActive: true } }); if (count <= 1) fields.role = "At least one active Administrator must remain."; }
  if (data.email && await emailExists(data.email, id)) fields.email = "Email must be unique.";
  if (Object.keys(fields).length) { error(res, 409, "USER_UPDATE_CONFLICT", "The user could not be updated.", fields); return; }
  try { const user = await getPrisma().requesterUser.update({ where: { id }, data, select: userSelect }); res.status(200).json({ data: { user: safeUser(user) } }); }
  catch (e) { console.error("Unable to update user:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not update the user. Please try again."); }
};

export const resetInitialPassword: RequestHandler = async (req, res) => {
  const id = parseId(req.params.userId); const password = req.body?.initialPassword; const passwordError = validatePassword(password);
  if (id === null) { error(res, 400, "INVALID_USER_ID", "User ID must be a positive integer."); return; }
  if (passwordError) { error(res, 400, "VALIDATION_ERROR", "Review the password field.", { initialPassword: passwordError }); return; }
  try { const exists = await getPrisma().requesterUser.findUnique({ where: { id }, select: { id: true } }); if (!exists) { error(res, 404, "USER_NOT_FOUND", "User was not found."); return; } const user = await getPrisma().requesterUser.update({ where: { id }, data: { passwordHash: hashPassword(password), mustChangePassword: true }, select: userSelect }); await getPrisma().session.deleteMany({ where: { userId: id } }); res.status(200).json({ data: { user: safeUser(user), initialPassword: password } }); }
  catch (e) { console.error("Unable to reset initial password:", e); error(res, 500, "INTERNAL_ERROR", "TokTickIT could not set the initial password. Please try again."); }
};
