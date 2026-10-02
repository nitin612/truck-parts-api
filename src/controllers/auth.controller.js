import crypto from "crypto";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token.js";
import env from "../config/env.js";
import sendEmail, { passwordResetEmail } from "../services/email.js";

const REFRESH_COOKIE = "aurex_refresh";

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function issue(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);
  return { accessToken, user: user.toSafeJSON() };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, company } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("An account with this email already exists. Please log in.");
  const user = await User.create({ name, email, password, phone, company, role: "customer" });
  res.status(201).json({ ok: true, ...issue(res, user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Email or password did not match. Try again or create an account.");
  }
  res.json({ ok: true, ...issue(res, user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized("No refresh session.");
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Refresh session expired. Please log in again.");
  }
  const user = await User.findById(payload.sub);
  if (!user || (user.tokenVersion || 0) !== (payload.tv || 0)) {
    throw ApiError.unauthorized("Session is no longer valid.");
  }
  res.json({ ok: true, ...issue(res, user) });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ ok: true, message: "Logged out." });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ ok: true, user: (await User.findById(req.user.id)).toSafeJSON() });
});

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

/**
 * POST /api/auth/forgot-password { email }
 * Always responds 200 (never reveals whether an account exists). If the
 * account exists, stores a hashed, 1-hour reset token and emails the link.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const raw = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = hashToken(raw);
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const url = `${env.appUrl}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
    sendEmail({ to: email, ...passwordResetEmail(url) }).catch(() => {});
  }
  res.json({ ok: true, message: "If that email has an account, a reset link is on its way." });
});

/**
 * POST /api/auth/reset-password { email, token, password }
 * Validates the hashed token + expiry, sets the new password, and bumps
 * tokenVersion to invalidate existing refresh sessions.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({ email }).select("+resetTokenHash +resetTokenExpiry");
  if (!user || !user.resetTokenHash || !user.resetTokenExpiry) {
    throw ApiError.badRequest("This reset link is invalid or has expired.");
  }
  if (user.resetTokenExpiry.getTime() < Date.now() || user.resetTokenHash !== hashToken(token)) {
    throw ApiError.badRequest("This reset link is invalid or has expired.");
  }
  user.password = password; // re-hashed by pre-save hook
  user.resetTokenHash = null;
  user.resetTokenExpiry = null;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  res.json({ ok: true, message: "Password updated. You can now log in." });
});
