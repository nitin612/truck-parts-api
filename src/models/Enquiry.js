import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true, uppercase: true, index: true }, // "ENQ-1234"
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, lowercase: true, trim: true },
    topic: { type: String, default: "General" },
    message: { type: String, required: true, maxlength: 2000 },
    sku: { type: String, default: null }, // set when raised from a POA product
    status: { type: String, enum: ["New", "Replied", "Closed"], default: "New", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
