import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints.
 * Allows 10 requests per IP per 15 minutes.
 * Skipped in test environments to allow rapid testing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
  skip: () => process.env.NODE_ENV === "test",
});
