import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import { pinoHttp } from "pino-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { PostgresSessionStore } from "./lib/postgresSessionStore.js";

const app: Express = express();
app.set("trust proxy", 1);

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
  const extra = process.env.ALLOWED_ORIGINS ?? "";
  for (const o of extra.split(",").map((s) => s.trim()).filter(Boolean)) {
    origins.add(o);
  }
  // Keep Replit Preview working without weakening production CORS.
  if (process.env.NODE_ENV !== "production") {
    const domains = process.env.REPLIT_DOMAINS ?? "";
    for (const d of domains.split(",").map((s) => s.trim()).filter(Boolean)) {
      origins.add(`https://${d}`);
    }
    const dev = process.env.REPLIT_DEV_DOMAIN;
    if (dev) origins.add(`https://${dev}`);
  }
  return origins;
}

const allowedOrigins = buildAllowedOrigins();
if (process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGINS) {
  throw new Error("ALLOWED_ORIGINS environment variable must be set in production");
}

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

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET environment variable must be set in production");
}

app.use(
  session({
    store: new PostgresSessionStore(),
    secret: process.env.SESSION_SECRET ?? "preview-only-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

app.use("/api", router);

export default app;
