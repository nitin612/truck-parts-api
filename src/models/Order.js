import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // trusted DB price at time of order
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    address: String,
    suburb: String,
    state: { type: String, enum: ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"], default: "VIC" },
    postcode: String,
    notes: String,
  },
  { _id: false }
);

// Must stay in sync with the storefront's ORDER_STATUSES (utils/orders.js)
export const ORDER_STATUSES = [
  "Pending payment",
  "Packed in Campbellfield VIC",
  "Courier booked",
  "In transit",
  "Delivered",
  "Cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true, uppercase: true, index: true }, // "AUX-1234"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    promoCode: { type: String, default: null },
    shipping: { type: String, required: true },
    shippingFee: { type: Number, required: true, min: 0 },
    payment: { type: String, required: true },
    gst: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    address: { type: addressSchema, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "Packed in Campbellfield VIC", index: true },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid", index: true },
    statusHistory: {
      type: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
      default: [],
    },
    placedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
