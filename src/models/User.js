import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 60 /* bcrypt hash */ , select: false },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    tokenVersion: { type: Number, default: 0 }, // bump to invalidate refresh tokens
    resetTokenHash: { type: String, default: null, select: false }, // sha256 of reset token
    resetTokenExpiry: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

/** Hash password on create/update when it is a plaintext (not already a hash). */
userSchema.pre("save", async function hash(next) {
  if (!this.isModified("password")) return next();
  // Skip if it already looks like a bcrypt hash (seeding may pass a hash)
  if (/^\$2[aby]\$/.test(this.password)) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function compare(plain) {
  return bcrypt.compare(plain, this.password);
};

/** Shape returned to clients — never leaks the hash. */
userSchema.methods.toSafeJSON = function safe() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    phone: this.phone,
    company: this.company,
    role: this.role,
    isAdmin: this.role === "admin",
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
