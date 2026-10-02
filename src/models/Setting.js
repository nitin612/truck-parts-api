import mongoose from "mongoose";

/** Single-document store settings (matches storefront DEFAULT_SETTINGS). */
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "store", unique: true, index: true },
    storeName: { type: String, default: "Aurex Truck Parts Australia" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    hours: { type: String, default: "" },
    freeFreightOver: { type: Number, default: 500 },
    standardFee: { type: Number, default: 24 },
    expressFee: { type: Number, default: 39 },
    abn: { type: String, default: "ABN 12 345 678 901" },
    announcement: { type: String, default: "Free road freight over $500. Order by 2pm for same day dispatch." },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
