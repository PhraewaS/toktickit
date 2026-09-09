import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { UserRole } from "@prisma/client";
import { getPrisma } from "./prisma.js";

export const SESSION_COOKIE = "toktickit_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
}

export interface AuthenticatedRequest extends Request {
  authUser: SafeUser;
}

export function safeUser(user: SafeUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
  };
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return `scrypt$${salt}$${scryptSync(password, salt, 32).toString("hex")}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex || !/^[0-9a-f]{64}$/i.test(expectedHex)) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function validatePassword(value: unknown) {
  if (typeof value !== "string" || value.length < 12 || value.length > 128) return "Password must be between 12 and 128 characters.";
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "Password must include upper-case, lower-case, number, and symbol characters.";
  }
  return undefined;
}

function tokenFromRequest(req: Request) {
  const cookie = req.get("Cookie") ?? "";
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
  } catch {
    return undefined;
  }
}

export function hasSessionCookie(req: Request) {
  const cookie = req.get("Cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).some((part) => part.startsWith(`${SESSION_COOKIE}=`));
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getSessionUser(req: Request): Promise<SafeUser | null> {
  const token = tokenFromRequest(req);
  if (!token) return null;
  const session = await getPrisma().session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true },
      },
    },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) return null;
  return session.user;
}

export const requireAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in to continue." } });
      return;
    }
    if (user.mustChangePassword && !req.originalUrl.startsWith("/api/auth/change-password") && !req.originalUrl.startsWith("/api/auth/me")) {
      res.status(403).json({ error: { code: "PASSWORD_CHANGE_REQUIRED", message: "Change your initial password before continuing." } });
      return;
    }
    (req as AuthenticatedRequest).authUser = safeUser(user);
    next();
  } catch (error) {
    console.error("Unable to validate authenticated session:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "TokTickIT could not complete the request. Please try again." } });
  }
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    const user = (req as Partial<AuthenticatedRequest>).authUser;
    if (!user) {
      res.status(401).json({ error: { code: "AUTHENTICATION_REQUIRED", message: "Sign in to continue." } });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "You are not permitted to perform this action." } });
      return;
    }
    next();
  };
}

function setSessionCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${SESSION_TTL_MS / 1000}; Path=/; HttpOnly; SameSite=Lax${secure}`);
}

function clearSessionCookie(res: Response) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
}

export const login: RequestHandler = async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password || email.length > 254) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Enter a valid email address and password." } });
    return;
  }
  try {
    const user = await getPrisma().requesterUser.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true, passwordHash: true },
    });
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: { code: "AUTHENTICATION_FAILED", message: "Email or password is incorrect." } });
      return;
    }
    const token = randomBytes(32).toString("base64url");
    await getPrisma().session.create({ data: { tokenHash: tokenHash(token), userId: user.id, expiresAt: new Date(Date.now() + SESSION_TTL_MS) } });
    await getPrisma().requesterUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    setSessionCookie(res, token);
    const { passwordHash: _passwordHash, ...publicUser } = user;
    res.status(200).json({ data: { user: safeUser(publicUser) } });
  } catch (error) {
    console.error("Unable to authenticate user:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "TokTickIT could not complete the request. Please try again." } });
  }
};

export const currentUser: RequestHandler = (req, res) => {
  res.status(200).json({ data: { user: (req as AuthenticatedRequest).authUser } });
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const token = tokenFromRequest(req);
    if (token) await getPrisma().session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  } catch (error) {
    console.error("Unable to invalidate session:", error);
  }
  clearSessionCookie(res);
  res.status(200).json({ data: { loggedOut: true } });
};

export const changePassword: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).authUser;
  const newPassword = req.body?.newPassword;
  const confirmPassword = req.body?.confirmPassword;
  const passwordError = validatePassword(newPassword);
  if (passwordError || newPassword !== confirmPassword) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Review the password fields and try again.", fields: { newPassword: passwordError ?? "Passwords must match." } } });
    return;
  }
  try {
    const updated = await getPrisma().requesterUser.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword), mustChangePassword: false },
      select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true },
    });
    res.status(200).json({ data: { user: safeUser(updated) } });
  } catch (error) {
    console.error("Unable to change password:", error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "TokTickIT could not change the password. Please try again." } });
  }
};

export function sessionTokenHashForTests(token: string) {
  return tokenHash(token);
}
