import dotenv from "dotenv";
dotenv.config();

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

/**
 * Centralised, validated config. We fail fast at boot if a required
 * secret is missing in production (in dev we warn and fall back so the
 * app can still start against an in-memory Mongo for smoke tests).
 */
const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "30d",
  },
  clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  admin: {
    email: (process.env.ADMIN_EMAIL || "admin@aurex.com.au").toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "Admin123!",
    name: process.env.ADMIN_NAME || "Store Admin",
  },
  cookieSecure: String(process.env.COOKIE_SECURE || "false") === "true",

  // Public storefront URL (used in emails: tracking + reset links)
  appUrl: process.env.APP_URL || "http://localhost:5173",

  // Transactional email via Resend (feature-flagged: no key → emails are skipped, logged only)
  email: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "Aurex Truck Parts <onboarding@resend.dev>",
    storeInbox: (process.env.STORE_INBOX_EMAIL || process.env.ADMIN_EMAIL || "admin@aurex.com.au").toLowerCase(),
    get enabled() { return Boolean(this.apiKey); },
  },

  // Stripe payments (feature-flagged: no key → card orders fall back to "pending")
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    get enabled() { return Boolean(this.secretKey); },
  },
};

export function assertProductionSecrets() {
  if (env.nodeEnv !== "production") return;
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`[env] Missing required env vars in production: ${missing.join(", ")}`);
    process.exit(1);
  }
}

export default env;
