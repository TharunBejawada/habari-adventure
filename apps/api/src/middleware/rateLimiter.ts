// apps/api/src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

// Global Limiter: Max 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth Limiter: Stricter limits for login (Max 5 attempts)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: "error",
    message: "Too many login attempts, please try again later.",
  },
});