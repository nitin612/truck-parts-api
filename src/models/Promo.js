import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    label: { type: String, default: "Custom" },
    pct: { type: Number, required: true, min: 1, max: 90 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Promo", promoSchema);
