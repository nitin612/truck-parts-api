import { verifyAccessToken } from "../utils/token.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

/** Pull a bearer token from the Authorization header. */
function bearer(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

/** Populates req.user if a valid token is present; otherwise continues
 *  as a guest. Used on routes that work for both (e.g. order create). */
export const optionalAuth = async (req, _res, next) => {
  const token = bearer(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (user) req.user = { ...user, id: String(user._id) };
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
};

/** Hard gate: a valid access token is required. */
export const requireAuth = async (req, _res, next) => {
  const token = bearer(req);
  if (!token) return next(ApiError.unauthorized("Authentication required."));
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) return next(ApiError.unauthorized("Account no longer exists."));
    req.user = { ...user, id: String(user._id) };
    next();
  } catch {
    next(ApiError.unauthorized("Session expired. Please log in again."));
  }
};

/** Must be authenticated AND an admin. Stack after requireAuth or alone. */
export const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized("Authentication required."));
  if (req.user.role !== "admin") return next(ApiError.forbidden("Staff access only."));
  next();
};
