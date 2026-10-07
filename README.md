# Aurex Truck Parts & Heavy Equipment — Enterprise REST API

High-performance, enterprise-grade backend REST API & Realtime WebSockets for **Commercial Truck & Heavy Trailer Parts E-Commerce and B2B Fleet Trade**.

Built on **Fastify v5**, **MongoDB (Mongoose)**, **JWT Authentication**, and **OpenAPI (Swagger)**.

---

## 🚀 Key Technologies & Stack
- **Framework**: Fastify v5 (Ultra-fast, low-overhead HTTP & WebSocket server)
- **Database**: MongoDB via Mongoose ORM (with schemas, indexes, hooks & auto-reconnect)
- **Authentication**: JWT (Access Token in Authorization Header + HttpOnly Refresh Cookie) + Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `SALES_REP`, `WAREHOUSE_MANAGER`, `TRADE_CUSTOMER`, `CUSTOMER`)
- **API Documentation**: Interactive Swagger UI at `/api/docs`
- **Realtime WebSockets**: Live order notifications, quote submissions, and stock alerts via `ws`
- **Security**: Fastify Helmet, CORS origin filtering, and IP rate limiting
- **File & Media Storage**: Cloudinary integration with local fallback for part photos, diagrams, and spec PDFs
- **Validation**: Zod schema validation
- **Zero Third-Party Vendor Locks**: Clean B2B Direct Wire (EFT), 30-Day Commercial Trade Invoicing, and Depot COD payment workflows (No Razorpay).

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values (MongoDB URI, JWT secrets, etc.):
```bash
cp .env.example .env
```

### 3. Seed Database
Seeds default Super Admin (`admin@truckparts.com`), commercial truck brands (Kenworth, Mack, Volvo, Cummins, Meritor, Eaton, etc.), parts categories, realistic heavy truck parts with fitment specifications, promo codes, and settings:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Server will start on `http://localhost:5000`.
- **Interactive Swagger Documentation**: `http://localhost:5000/api/docs`
- **Health Check**: `GET http://localhost:5000/api/health`

---

## 📦 Project Architecture

```
truck-parts-api/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── index.js                  # Fastify server entry point & WebSocket setup
├── package.json              # Project dependencies & scripts
├── seedAdmin.js              # Initial Super Admin seed script
├── vercel.json               # Serverless deployment configuration
└── src/
    ├── config/
    │   ├── database.js       # MongoDB Mongoose connection
    │   └── swagger.js        # OpenAPI / Swagger 3.0 configuration
    ├── controllers/          # 23 domain controllers
    ├── middleware/
    │   ├── auth.js           # JWT authentication & role authorization
    │   ├── errorHandler.js   # Centralized error handler
    │   └── uploadMiddleware.js # Multipart upload handler
    ├── models/               # 23 Mongoose models
    │   ├── Product.js        # Truck parts, OEM cross-references, fitments, core deposits
    │   ├── Brand.js          # Truck makes & component manufacturers
    │   ├── Category.js       # Hierarchical component categories
    │   ├── Order.js          # Orders with weight-based freight & B2B payment terms
    │   ├── Enquiry.js        # Part RFQs, VIN lookups & Price on Application quotes
    │   ├── User.js           # Customers & B2B Trade fleet accounts
    │   ├── PaymentSettings.js # Bank EFT, 30-Day Trade Account, Depot COD
    │   └── ...
    ├── routes/               # Modular public & admin route handlers
    ├── scripts/
    │   ├── seedAll.js        # Master seeding runner
    │   └── seedTruckData.js  # Heavy truck domain catalog seeder
    ├── services/
    │   ├── aiChatService.js  # AI-assisted part finder & VIN assistant
    │   ├── auditLogger.js    # Automatic admin action audit logging
    │   ├── cloudinaryService.js # Image & PDF upload service
    │   ├── notificationService.js # Nodemailer transactional emails
    │   ├── shippingService.js # Heavy freight & courier rate calculator
    │   └── socketService.js  # WebSocket broadcasting
    ├── utils/
    │   ├── CustomError.js    # Standard error format
    │   ├── pricing.js        # Server-side pricing, core deposits, freight & GST
    │   └── token.js          # JWT signing and validation
    └── validators/           # Zod schema validators
```

---

## 🚛 Truck Parts Domain Highlights

1. **Vehicle Fitment Filtering**: Filter parts by Truck Make (Kenworth, Mack, Volvo, Scania, Freightliner, Isuzu), Model, and Year Range.
2. **OEM & Cross-Reference Part Search**: Fast lookup across OEM numbers (e.g. `4309437`) and aftermarket cross-reference codes (`4309437RX`, `2881997`).
3. **Core Deposit Surcharge Management**: Surcharge calculation and refund tracking for remanufactured exchange units (turbos, injectors, engines).
4. **Heavy Road Freight Calculator**: Dynamic shipping calculations based on total order weight in KG, bulky dimensions, pallet criteria, and tail-lift requirements.
5. **Part Inquiries / RFQ (Request for Quote)**: Emergency "Truck Off Road" (VOR) and POA quote request workflows with VIN/chassis details and diagram attachments.
6. **B2B Trade & Fleet Accounts**: Trade discount rates, 30-day invoice billing, credit limits, and purchase order tracking.
7. **Automated Admin Audit Trail**: Every mutating admin action (product updates, price changes, order status overrides) is automatically recorded with user, IP, and timestamp.
