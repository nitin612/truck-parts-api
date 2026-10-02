import rateLimit from "express-rate-limit";

/** Generous global limiter to blunt abuse without hurting normal browsing. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests. Please slow down." },
});

/** Tight limiter for auth endpoints — mirrors the storefront's 5-try lockout. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many attempts. Try again later." },
});
