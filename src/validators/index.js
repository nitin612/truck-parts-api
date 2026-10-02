import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email.").max(120);
const password = z.string().min(8, "Password must be at least 8 characters.").max(128);
const phoneAU = z.string().trim().max(20).optional().or(z.literal(""));

/* ---------------- Auth ---------------- */
export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email,
  password,
  phone: phoneAU,
  company: z.string().trim().max(120).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required.").max(128),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
  email,
  token: z.string().min(1, "Reset token is required."),
  password,
});

/* ---------------- Products ---------------- */
export const productCreateSchema = z.object({
  sku: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1),
  sub: z.string().trim().optional().default(""),
  price: z.number().min(0).nullable().optional().default(null),
  brand: z.string().trim().optional().default(""),
  rating: z.number().min(0).max(5).optional().default(0),
  reviews: z.number().int().min(0).optional().default(0),
  badge: z.string().optional().default(""),
  fit: z.string().optional().default(""),
  oem: z.string().optional().default(""),
  status: z.string().optional().default("In stock VIC"),
  lead: z.string().optional().default(""),
  desc: z.string().optional().default(""),
  specs: z.record(z.string(), z.string()).optional().default({}),
  images: z.array(z.string()).optional().default([]),
  active: z.boolean().optional().default(true),
});
export const productUpdateSchema = productCreateSchema.partial().omit({ sku: true });

/* ---------------- Categories ---------------- */
export const categoryCreateSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  tag: z.string().optional().default(""),
  blurb: z.string().optional().default(""),
});
export const categoryUpdateSchema = categoryCreateSchema.partial().omit({ slug: true });

/* ---------------- Promos ---------------- */
export const promoCreateSchema = z.object({
  code: z.string().trim().min(1).max(16),
  label: z.string().optional().default("Custom"),
  pct: z.number().int().min(1, "Percent must be 1 to 90.").max(90, "Percent must be 1 to 90."),
  active: z.boolean().optional().default(true),
});
export const promoUpdateSchema = promoCreateSchema.partial().omit({ code: true });
export const promoValidateSchema = z.object({ code: z.string().trim().min(1).max(16) });

/* ---------------- Orders ---------------- */
export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().trim().min(1),
        qty: z.number().int().min(1).max(999),
      })
    )
    .min(1, "Your cart is empty."),
  promoCode: z.string().trim().max(16).nullable().optional(),
  shipping: z.string().min(1),
  payment: z.string().min(1),
  address: z.object({
    name: z.string().trim().min(1, "Name is required."),
    phone: z.string().trim().min(1, "Phone is required."),
    email,
    address: z.string().trim().optional().default(""),
    suburb: z.string().trim().optional().default(""),
    state: z.enum(["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"]).default("VIC"),
    postcode: z.string().trim().optional().default(""),
    notes: z.string().trim().max(300).optional().default(""),
  }),
});

export const orderStatusSchema = z.object({
  status: z.string().min(1),
  note: z.string().max(300).optional(),
});

/* ---------------- Enquiries ---------------- */
export const enquiryCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  phone: z.string().trim().max(20).optional().default(""),
  email,
  topic: z.string().trim().max(60).optional().default("General"),
  message: z.string().trim().min(1, "Message is required.").max(2000),
  sku: z.string().trim().max(60).nullable().optional(),
});
export const enquiryStatusSchema = z.object({ status: z.enum(["New", "Replied", "Closed"]) });

/* ---------------- Settings ---------------- */
export const settingUpdateSchema = z.object({
  storeName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  freeFreightOver: z.number().min(0).optional(),
  standardFee: z.number().min(0).optional(),
  expressFee: z.number().min(0).optional(),
  abn: z.string().optional(),
  announcement: z.string().optional(),
});
