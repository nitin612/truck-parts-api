import ApiError from "../utils/ApiError.js";

/**
 * Validates req[part] against a zod schema and replaces it with the
 * parsed (coerced, stripped) value. On failure returns a 400 with a
 * flat field→message map.
 */
export const validate = (schema, part = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[part]);
  if (!result.success) {
    const details = {};
    for (const issue of result.error.issues) {
      details[issue.path.join(".") || "_"] = issue.message;
    }
    return next(ApiError.badRequest("Validation failed.", details));
  }
  req[part] = result.data;
  next();
};

export default validate;
