import type { Request, Response, NextFunction } from "express";
import type { Session } from "express-session";
import { getAdminCredentials } from "../lib/adminCredentials.js";

export interface AdminSession extends Session {
  adminEmail?: string;
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const session = req.session as AdminSession;
  const configured = getAdminCredentials();
  if (!session?.adminEmail || session.adminEmail.trim().toLowerCase() !== configured.email) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}