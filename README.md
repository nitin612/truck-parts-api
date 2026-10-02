# Aurex Truck Parts — API

Backend REST API for the Aurex Truck Parts Australia storefront and admin console.
**Stack:** Node.js · Express · MongoDB (Mongoose) · JWT auth · Zod validation.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
#   edit .env → set MONGO_URI (local Mongo or Atlas) and the two JWT secrets
#   generate a secret:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Seed the database (36 products, 3 categories, promos, settings, admin user)
npm run seed

# 4. Run
npm run dev        # http://localhost:5000  (nodemon, auto-reload)
# or
npm start          # production mode
```

Health check: `GET http://localhost:5000/api/health`

Run the end-to-end test against a throwaway DB:
```bash
MONGO_URI="mongodb://127.0.0.1:27017/aurex_test" npm test
```

---

## Project structure

```
src/
  config/      env + mongoose connection
  models/      User, Product, Category, Order, Promo, Enquiry, Setting
  controllers/ request handlers per domain
  routes/      Express routers (public vs admin)
  middleware/  auth (JWT + roles), validation, errors, rate limiting
  utils/       JWT, pricing (server-side recompute), ApiError, asyncHandler
  validators/  Zod schemas
  seed/        catalogue data + seed runner
test/          end-to-end smoke test
```

---

## Environment variables

| Var | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | token signing secrets (required) |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | token lifetimes (default 15m / 30d) |
| `CLIENT_ORIGINS` | comma-separated allowed CORS origins (storefront + admin) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | seed admin account |
| `COOKIE_SECURE` | `true` in production (HTTPS) for the refresh cookie |
| `APP_URL` | storefront URL, used in email tracking + reset links |
| `RESEND_API_KEY` / `EMAIL_FROM` / `STORE_INBOX_EMAIL` | transactional email (optional — blank = email disabled) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | payments (optional — blank = card payments disabled) |

---

## API reference

Base path: `/api`. All responses are JSON `{ ok, ... }`; errors are `{ ok:false, error, details? }`.
Auth uses a **Bearer access token** (`Authorization: Bearer <token>`) plus an httpOnly refresh cookie.

### Auth
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | `{ name, email, password, phone?, company? }` → token |
| POST | `/auth/login` | public | `{ email, password }` → token |
| POST | `/auth/refresh` | cookie | rotates the access token |
| POST | `/auth/logout` | public | clears refresh cookie |
| POST | `/auth/forgot-password` | public | `{ email }` → always 200; emails a reset link if the account exists |
| POST | `/auth/reset-password` | public | `{ email, token, password }` → sets new password |
| GET | `/auth/me` | auth | current user |

### Payments (Stripe — feature-flagged)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/payments/create-intent` | guest/auth | `{ ref }` → `{ clientSecret }` for the storefront to confirm card/Afterpay |
| POST | `/payments/webhook` | Stripe | raw-body signature-verified; marks the order `paid` on `payment_intent.succeeded` |

If `STRIPE_SECRET_KEY` is unset, card orders are created as **Pending payment** and these endpoints no-op cleanly.

### Products
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/products` | public | filters: `category, q, brand, status, minPrice, maxPrice, buyable, sort, page, limit` |
| GET | `/products/:sku` | public | single product |
| POST | `/products` | admin | create |
| PUT | `/products/:sku` | admin | update |
| DELETE | `/products/:sku` | admin | delete |

### Categories
`GET /categories` (public, with live counts) · `POST/PUT/DELETE` (admin).

### Promos
`POST /promos/validate` (public — checkout) · `GET/POST/PUT/DELETE` (admin).

### Orders
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/orders` | guest/auth | client sends `{ items:[{sku,qty}], promoCode?, shipping, payment, address }`; **server recomputes all totals** from DB prices |
| GET | `/orders/mine` | auth | customer's own orders |
| GET | `/orders/track/:ref` | public | tracking by order ref (limited public view) |
| GET | `/orders` | admin | all orders (filter `status`, `q`) |
| GET | `/orders/:ref` | admin | full order |
| PATCH | `/orders/:ref/status` | admin | `{ status, note? }` |

### Enquiries
`POST /enquiries` (public — contact / POA product) · `GET` + `PATCH /:ref/status` (admin).

### Settings
`GET /settings` (public store config) · `PUT /settings` (admin).

### Admin
`GET /admin/stats` (dashboard tiles) · `GET /admin/customers`.

---

## Key design decisions

- **Server-trusted pricing.** The storefront never dictates totals. On order creation the
  server looks up each SKU's price in the DB, rejects POA/enquiry-only lines, validates the
  promo, and recomputes subtotal, discount, freight, GST and grand total (`src/utils/pricing.js`).
- **Real auth.** Passwords are bcrypt-hashed; access tokens are short-lived JWTs; refresh is an
  httpOnly cookie. Admin is a real DB role (`role: "admin"`), enforced by middleware — not a
  client flag.
- **Data parity with the storefront.** Models mirror the existing frontend shapes (products,
  orders, promos, categories, enquiries, settings) so the React app can swap its localStorage
  stores for API calls with minimal change. Order statuses match `utils/orders.js`.

## Deployment notes
- Host on Render / Railway / Fly.io / a VPS. Use **MongoDB Atlas** for the database.
- Set all env vars; `COOKIE_SECURE=true`; put the real storefront + admin URLs in `CLIENT_ORIGINS`.
- Run `npm run seed` once against the production DB (or import your real catalogue).

## Payments & email (built, feature-flagged)
- **Stripe**: `POST /payments/create-intent` creates a PaymentIntent (card + Afterpay) for an order;
  `POST /payments/webhook` verifies the signature and marks the order `paid`. Enable by setting
  `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.
- **Email (Resend)**: order confirmation, status-change, enquiry alert and password-reset emails are
  sent automatically. Enable by setting `RESEND_API_KEY` (+ verified domain). Without a key, sends are
  logged and skipped so nothing breaks.

## Roadmap (next)
- Image uploads for products (S3 / Cloudinary / GridFS).
- Realtime order status to the storefront `/track` page (WebSocket / SSE).
- Admin product/category create-edit forms in `truck-parts-admin`.
# truck-parts-api
