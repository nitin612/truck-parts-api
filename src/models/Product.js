import mongoose from "mongoose";

/**
 * Mirrors the storefront product shape (src/data/products.js). `price`
 * is nullable on purpose — "enquiry only" lines (most trailer parts)
 * have price: null and are quote/POA rather than buy-now.
 */
const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: "text" },
    category: { type: String, required: true, index: true }, // category slug
    sub: { type: String, default: "" },
    price: { type: Number, default: null, min: 0 }, // null = POA / enquiry only
    brand: { type: String, default: "", index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    badge: { type: String, default: "" },
    fit: { type: String, default: "" },
    oem: { type: String, default: "" },
    status: { type: String, default: "In stock VIC" }, // e.g. "Built to order", "Enquiry"
    lead: { type: String, default: "" },
    desc: { type: String, default: "" },
    specs: { type: Map, of: String, default: {} },
    images: { type: [String], default: [] },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", desc: "text", oem: "text", brand: "text" });

/** True when the product can be bought online (has a price). */
productSchema.virtual("buyable").get(function buyable() {
  return this.price !== null && this.price !== undefined;
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
