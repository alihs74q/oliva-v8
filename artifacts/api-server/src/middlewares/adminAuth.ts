import type { Request, Response, NextFunction } from "express";
import type { Session } from "express-session";
import { db } from "@workspace/db";
import { adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isApprovedAdminEmail } from "../lib/adminAllowlist.js";

export interface AdminSession extends Session {
  adminEmail?: string;
}

/**
 * requireAdminAuth
 * ────────────────
 * Guards all admin API routes. Requires a valid session cookie containing
 * adminEmail AND verifies that email still has a row in admin_users with a
 * password hash set. This means:
 *
 *  - Accounts removed from admin_users are denied immediately (no env var reload
 *    needed).
 *  - Accounts that had their password cleared are denied until reset.
 *  - No external env var (ADMIN_EMAILS) is required at runtime — the DB table
 *    IS the allowlist.
 *
 * Session cookies are SameSite=Strict (set in app.ts), which prevents
 * cross-site requests from carrying them, providing CSRF protection.
 */
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = req.session as AdminSession;
  if (!session?.adminEmail || !isApprovedAdminEmail(session.adminEmail)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Verify the session email still maps to a valid, fully-provisioned admin account.
  const [user] = await db
    .select({ id: adminUsersTable.id, passwordHash: adminUsersTable.passwordHash })
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, session.adminEmail.toLowerCase()));

  if (!user || !user.passwordHash || !isApprovedAdminEmail(session.adminEmail)) {
    // Account removed or password not yet set — invalidate the session.
    session.destroy(() => {});
    res.status(401).json({ error: "Account not authorized" });
    return;
  }

  next();
}
