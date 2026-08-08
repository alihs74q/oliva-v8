import { Router, type IRouter } from "express";
import { randomBytes, timingSafeEqual as cryptoTimingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminUsersTable, cmsAuditLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth.js";
import type { AdminSession } from "../middlewares/adminAuth.js";
import { authRateLimiter } from "../lib/rateLimiter.js";
import { isApprovedAdminEmail } from "../lib/adminAllowlist.js";
import {
  AdminLoginInput,
  ChangePasswordInput,
  SetInitialPasswordInput,
} from "../lib/validation.js";

const router: IRouter = Router();

// POST /admin/auth/login
// Rate-limited: 10 requests per IP per 15 min.
// The admin_users table is the sole allowlist. If an email has no row here,
// access is denied with the same generic message as wrong-password.
router.post("/admin/auth/login", authRateLimiter, async (req, res): Promise<void> => {
  const parsed = AdminLoginInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { email, password } = parsed.data;
  if (!isApprovedAdminEmail(email)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase()));

  // No account with this email → same message as wrong password (no enumeration).
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Account exists but password has not been set yet.
  if (!user.passwordHash) {
    res.status(403).json({ error: "PASSWORD_NOT_SET", message: "Use your setup token to set your initial password." });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  (req.session as AdminSession).adminEmail = user.email;
  req.log.info({ email: user.email }, "Admin login");
  res.json({ email: user.email });
});

// POST /admin/auth/set-initial-password
// Rate-limited: same 10/15-min limiter as login.
// Only works when: (a) account exists in admin_users (DB allowlist),
// (b) passwordHash IS NULL (first time only), (c) setupToken matches.
// The setup token is generated at account creation and stored in the DB.
// The server operator retrieves it via:
//   psql "$DATABASE_URL" -c "SELECT email, setup_token FROM admin_users WHERE password_hash IS NULL;"
// The token is single-use — cleared immediately after a successful password set.
router.post("/admin/auth/set-initial-password", authRateLimiter, async (req, res): Promise<void> => {
  const parsed = SetInitialPasswordInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  if (!isApprovedAdminEmail(email)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email));

  // No user with that email → deny (same message as bad token, no enumeration).
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Password already set → use change-password endpoint instead.
  if (user.passwordHash) {
    res.status(409).json({ error: "Password already set. Use change-password instead." });
    return;
  }

  // Must have a valid single-use setup token.
  if (!user.setupToken) {
    res.status(401).json({ error: "No setup token on file. Contact the server administrator." });
    return;
  }

  // Constant-time comparison to resist timing attacks.
  const tokenBuf = Buffer.from(parsed.data.setupToken);
  const storedBuf = Buffer.from(user.setupToken);
  const tokenMatch =
    tokenBuf.length === storedBuf.length &&
    cryptoTimingSafeEqual(tokenBuf, storedBuf);

  if (!tokenMatch) {
    req.log.warn({ email }, "Invalid setup token attempt");
    res.status(401).json({ error: "Invalid setup token" });
    return;
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);
  // Clear the setup token atomically with setting the password (single-use).
  await db
    .update(adminUsersTable)
    .set({ passwordHash: hash, setupToken: null })
    .where(eq(adminUsersTable.id, user.id));

  await db.insert(cmsAuditLogTable).values({
    userEmail: email,
    action: "set_initial_password",
    entityType: "admin_user",
    entityId: String(user.id),
    details: {},
  });

  // Auto-login after password set.
  (req.session as AdminSession).adminEmail = user.email;
  req.log.info({ email }, "Admin set initial password");
  res.json({ email: user.email });
});

// POST /admin/auth/logout
router.post("/admin/auth/logout", (req, res): void => {
  req.session.destroy(() => {});
  res.sendStatus(204);
});

// GET /admin/auth/session
router.get("/admin/auth/session", requireAdminAuth, (req, res): void => {
  const session = req.session as AdminSession;
  res.json({ email: session.adminEmail });
});

// POST /admin/auth/change-password
router.post("/admin/auth/change-password", requireAdminAuth, async (req, res): Promise<void> => {
  const parsed = ChangePasswordInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const session = req.session as AdminSession;
  const email = session.adminEmail!;

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "User not found or password not set" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db
    .update(adminUsersTable)
    .set({ passwordHash: newHash })
    .where(eq(adminUsersTable.id, user.id));

  await db.insert(cmsAuditLogTable).values({
    userEmail: email,
    action: "change_password",
    entityType: "admin_user",
    entityId: String(user.id),
    details: {},
  });

  req.log.info({ email }, "Admin changed password");
  res.sendStatus(204);
});

/** Generate a cryptographically random setup token for one-time account setup. */
export function generateSetupToken(): string {
  return randomBytes(32).toString("hex");
}

export default router;
