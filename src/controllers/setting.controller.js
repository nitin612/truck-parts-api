import Setting from "../models/Setting.js";
import asyncHandler from "../utils/asyncHandler.js";

async function getOrCreate() {
  let doc = await Setting.findOne({ key: "store" });
  if (!doc) doc = await Setting.create({ key: "store" });
  return doc;
}

/** GET /api/settings — public store config used by the storefront. */
export const getSettings = asyncHandler(async (_req, res) => {
  const doc = await getOrCreate();
  res.json({ ok: true, settings: doc });
});

/** PUT /api/settings — admin. */
export const updateSettings = asyncHandler(async (req, res) => {
  const doc = await Setting.findOneAndUpdate({ key: "store" }, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  res.json({ ok: true, settings: doc });
});
