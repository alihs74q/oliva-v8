import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import { pinoHttp } from "pino-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { PostgresSessionStore } from "./lib/postgresSessionStore.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage) {
        return {
          id: (req as IncomingMessage & { id: unknown }).id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Build the exact allowed origin list from Replit's runtime-injected env vars.
// REPLIT_DOMAINS and REPLIT_DEV_DOMAIN are runtime-managed (not committed to
// .replit), so they never appear in source control and cannot be spoofed by an
// attacker who only has access to the repo.
//
// Wildcard patterns (*.replit.dev) are NOT used because SameSite=Strict alone
// is not sufficient isolation — other Replit-hosted pages on the same eTLD+1
// share the same SameSite boundary and could make credentialed cross-origin
// requests to this API if CORS were open to all *.replit.dev origins.
function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();
  // REPLIT_DOMAINS is a comma-separated list of domain names (no scheme).
  const domains = process.env.REPLIT_DOMAINS ?? "";
  for (const d of domains.split(",").map((s) => s.trim()).filter(Boolean)) {
    origins.add(`https://${d}`);
  }
  // REPLIT_DEV_DOMAIN is the single dev-preview domain.
  const dev = process.env.REPLIT_DEV_DOMAIN;
  if (dev) origins.add(`https://${dev}`);
  // Additional explicit origins (e.g. local dev, custom domains)
  const extra = process.env.ALLOWED_ORIGINS ?? "";
  for (const o of extra.split(",").map((s) => s.trim()).filter(Boolean)) {
    origins.add(o);
  }
  return origins;
}

const allowedOrigins = buildAllowedOrigins();
const crossSiteCookies = process.env.COOKIE_SAME_SITE === "none";

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and server-to-server calls (no Origin header) are allowed.
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET environment variable must be set in production");
}

// SameSite=Strict prevents cross-site requests from carrying the session cookie,
// providing CSRF protection for all admin mutations without explicit CSRF tokens.
app.use(
  session({
    store: new PostgresSessionStore(),
    secret: process.env.SESSION_SECRET ?? "dev-only-insecure-secret-DO-NOT-USE-IN-PROD",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: crossSiteCookies ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

app.use("/api", router);

export default app;
