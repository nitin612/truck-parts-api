import ApiError from "../utils/ApiError.js";

/**
 * POST /api/uploads  (admin, multipart/form-data, field "image")
 * Returns the public URL + path of the stored image.
 */
export const uploadHandler = (req, res, next) => {
  if (!req.file) return next(ApiError.badRequest("No image file received (field name must be 'image')."));
  const urlPath = `/uploads/${req.file.filename}`;
  const absolute = `${req.protocol}://${req.get("host")}${urlPath}`;
  res.status(201).json({ ok: true, path: urlPath, url: absolute, filename: req.file.filename });
};
