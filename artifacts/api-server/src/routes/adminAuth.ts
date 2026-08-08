import { Router, type IRouter } from "express";
import { requireAdminAuth } from "../middlewares/adminAuth.js";
import type { AdminSession } from "../middlewares/adminAuth.js";
import { authRateLimiter } from "../lib/rateLimiter.js";
import { getAdminCredentials, secureStringEqual } from "../lib/adminCredentials.js";
import { AdminLoginInput } from "../lib/validation.js";

const router: IRouter = Router();

router.post("/admin/auth/login", authRateLimiter, async (req, res): Promise<void> => {
  const parsed = AdminLoginInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const configured = getAdminCredentials();
  const email = parsed.data.email.trim().toLowerCase();
  if (email !== configured.email || !secureStringEqual(parsed.data.password, configured.password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  (req.session as AdminSession).adminEmail = configured.email;
  req.log.info({ email: configured.email }, "Admin login");
  res.json({ email: configured.email });
});

router.post("/admin/auth/logout", (req, res): void => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ error: "Could not log out" });
      return;
    }
    res.clearCookie("connect.sid", { path: "/" });
    res.sendStatus(204);
  });
});

router.get("/admin/auth/session", requireAdminAuth, (req, res): void => {
  const session = req.session as AdminSession;
  res.json({ email: session.adminEmail });
});

// The production credential is managed by the server environment, not by the
// browser or database. Keep this route for existing clients without implying
// that an API call can mutate ADMIN_PASSWORD.
router.post("/admin/auth/change-password", requireAdminAuth, (_req, res): void => {
  res.status(409).json({ error: "Password is managed by the server environment." });
});

export default router;