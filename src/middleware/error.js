import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

/** 404 for unmatched routes. */
export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Central error handler — the single place that shapes error responses. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong.";
  let details = err.details;

  // Mongoose: bad ObjectId
  if (err.name === "CastError") { status = 400; message = `Invalid ${err.path}.`; }
  // Mongoose: duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `That ${field} already exists.`;
  }
  // Mongoose: schema validation
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed.";
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  res.status(status).json({
    ok: false,
    error: message,
    ...(details ? { details } : {}),
    ...(env.nodeEnv !== "production" && status >= 500 ? { stack: err.stack } : {}),
  });
};
