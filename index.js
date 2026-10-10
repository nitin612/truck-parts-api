require('dotenv').config();
const fastify = require('fastify')({
  // Vercel terminates the connection: without this every visitor shares one rate-limit bucket.
  trustProxy: true,
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.newPassword',
      'req.body.oldPassword',
      'req.body.confirmPassword',
      'req.body.twoFactorSecret',
      'req.body.twoFactorCode',
      'req.body.cardNumber',
      'req.body.cvv',
      'req.body.expiry',
      'req.body.token',
      'req.body.refreshToken'
    ]
  }
});
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const { getAccessSecret } = require('./src/utils/token');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Ensure uploads directory exists (use /tmp on serverless environments)
const uploadsDir = path.join(os.tmpdir(), 'truck-parts-uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Ignore filesystem race conditions
}

// 1. Strict Origin Allowlist
const rawOrigins = [
  process.env.CLIENT_ORIGINS,
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
]
  .filter(Boolean)
  .flatMap((v) => (typeof v === 'string' ? v.split(',') : []))
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set(rawOrigins));

const isDev = process.env.NODE_ENV !== 'production';
const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isOriginAllowed(origin) {
  if (!origin) return true;
  const clean = origin.trim().replace(/\/$/, '');
  if (allowedOrigins.includes(clean)) return true;
  if (isDev && LOCAL_ORIGIN_REGEX.test(clean)) return true;
  if (/^https:\/\/([a-zA-Z0-9-]+\.)?aurextruckparts\.com\.au$/.test(clean)) return true;
  if (/^https:\/\/truck-parts-[a-zA-Z0-9-]+\.vercel\.app$/.test(clean)) return true;
  return false;
}

// Register CORS with strict origin validation
fastify.register(require('@fastify/cors'), {
  origin: (origin, cb) => {
    // Non-browser or server-to-server requests have no origin header
    if (!origin) return cb(null, true);

    if (isOriginAllowed(origin)) {
      return cb(null, true);
    }

    return cb(new Error(`CORS blocked for untrusted origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-session-id',
    'X-Session-Id',
    'x-cart-session',
    'X-Cart-Session'
  ]
});

// 2. Register Security & Rate Limit Headers
fastify.register(require('@fastify/helmet'), { global: true });

fastify.register(require('@fastify/rate-limit'), {
  max: isDev ? 5000 : 150,
  timeWindow: '1 minute'
});

// 3. Register Swagger API Documentation (Safely handled on serverless)
try {
  const { swaggerConfig, swaggerUiConfig } = require('./src/config/swagger');
  fastify.register(require('@fastify/swagger'), swaggerConfig);
  if (!process.env.VERCEL) {
    fastify.register(require('@fastify/swagger-ui'), swaggerUiConfig);
  }
} catch (swaggerErr) {
  console.warn('Swagger UI skipped on serverless:', swaggerErr.message);
}

// 4. Multipart FormData parser for file uploads
const multer = require('fastify-multer');
fastify.addContentTypeParser('multipart/form-data', (request, payload, done) => done(null));

// 5. Cookie Support with validated secret
fastify.register(require('@fastify/cookie'), {
  secret: getAccessSecret()
});

// 6. Global NoSQL Injection Sanitizer
function sanitizeMongoInput(target) {
  if (!target || typeof target !== 'object') return target;
  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      target[i] = sanitizeMongoInput(target[i]);
    }
    return target;
  }
  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
    } else {
      target[key] = sanitizeMongoInput(target[key]);
    }
  }
  return target;
}

fastify.addHook('preValidation', async (request) => {
  if (request.body && typeof request.body === 'object') {
    sanitizeMongoInput(request.body);
  }
  if (request.query && typeof request.query === 'object') {
    sanitizeMongoInput(request.query);
  }
  if (request.params && typeof request.params === 'object') {
    sanitizeMongoInput(request.params);
  }
});

// 7. CSRF Origin Defense Hook for State-Changing Requests
fastify.addHook('preHandler', async (request, reply) => {
  const method = request.method;
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const originHeader = request.headers.origin || request.headers.referer;
    if (originHeader) {
      let originToCheck = originHeader;
      try {
        const u = new URL(originHeader);
        originToCheck = u.origin;
      } catch (e) {}

      if (!isOriginAllowed(originToCheck)) {
        return reply.code(403).send({
          success: false,
          error: 'CSRF validation blocked: untrusted origin'
        });
      }
    }
  }
});

// 8. Custom Centralized Error Handler
fastify.setErrorHandler(errorHandler);

// Public catalogue responses are the same for every visitor, so let the CDN answer them.
// Anything carrying credentials (staff see drafts and full documents) is never cached.
const CACHEABLE_GET = /^\/api(\/v1)?\/(products|categories|brands|carousel|blogs|settings|promos\/active|payments\/config|welcome-offer|cms)(\/|\?|$)/;
fastify.addHook('onSend', async (request, reply, payload) => {
  const hasCredentials = request.headers.authorization || /(?:^|;\s*)accessToken=/.test(request.headers.cookie || '');
  if (
    request.method === 'GET' &&
    reply.statusCode === 200 &&
    !hasCredentials &&
    !reply.getHeader('cache-control') &&
    CACHEABLE_GET.test(request.url)
  ) {
    reply.header('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
  }
  return payload;
});

// 7. Dynamic Swagger Tagging & Bearer Security Hook
fastify.addHook('onRoute', (routeOptions) => {
  if (!routeOptions.schema) routeOptions.schema = {};
  if (!routeOptions.schema.tags) routeOptions.schema.tags = [];

  const url = routeOptions.url;
  const method = routeOptions.method;

  if (url.includes('/admin/auth')) routeOptions.schema.tags.push('Admin Auth');
  else if (url.includes('/admin/logs')) routeOptions.schema.tags.push('Audit Logs');
  else if (url.includes('/admin/customers')) routeOptions.schema.tags.push('Customers');
  else if (url.includes('/admin/dashboard')) routeOptions.schema.tags.push('Dashboard');
  else if (url.includes('/auth')) routeOptions.schema.tags.push('Auth');
  else if (url.includes('/products')) routeOptions.schema.tags.push('Products');
  else if (url.includes('/categories')) routeOptions.schema.tags.push('Categories');
  else if (url.includes('/brands')) routeOptions.schema.tags.push('Brands');
  else if (url.includes('/enquiries')) routeOptions.schema.tags.push('Enquiries');
  else if (url.includes('/cart')) routeOptions.schema.tags.push('Cart');
  else if (url.includes('/orders')) routeOptions.schema.tags.push('Orders');
  else if (url.includes('/payments')) routeOptions.schema.tags.push('Payments');
  else if (url.includes('/shipping')) routeOptions.schema.tags.push('Shipping');
  else if (url.includes('/coupons')) routeOptions.schema.tags.push('Coupons');
  else if (url.includes('/campaigns')) routeOptions.schema.tags.push('Campaigns');
  else if (url.includes('/reviews')) routeOptions.schema.tags.push('Reviews');
  else if (url.includes('/carousel')) routeOptions.schema.tags.push('CMS');
  else if (url.includes('/cms')) routeOptions.schema.tags.push('CMS');
  else if (url.includes('/blogs')) routeOptions.schema.tags.push('Blogs');
  else if (url.includes('/welcome-offer')) routeOptions.schema.tags.push('Welcome Offer');
  else if (url.includes('/chat')) routeOptions.schema.tags.push('AI Assistant');

  let isPublic = false;
  if (url.includes('/login') || url.includes('/register') || url.includes('/rates') || url.includes('/track')) {
    isPublic = true;
  } else if (method === 'GET' || (Array.isArray(method) && method.includes('GET'))) {
    if (
      url.match(/^\/api\/v1\/(products|categories|brands|carousel|cms|blogs|welcome-offer|payments\/config|shipping|settings)/)
    ) {
      if (!url.includes('/admin/')) isPublic = true;
    }
  }

  if (!isPublic && !routeOptions.schema.security) {
    routeOptions.schema.security = [{ bearerAuth: [] }];
  }
});

// 8. Register API Routes
// Authentication & Identity
fastify.register(require('./src/routes/adminAuthRoutes'), { prefix: '/api/v1/admin/auth' });
fastify.register(require('./src/routes/authRoutes'), { prefix: '/api/v1/auth' });

// Truck Parts & Fitment Catalog
const { brandRoutes, adminBrandRoutes } = require('./src/routes/brandRoutes');
fastify.register(brandRoutes, { prefix: '/api/v1/brands' });
fastify.register(adminBrandRoutes, { prefix: '/api/v1/admin/brands' });

const { categoryRoutes, adminCategoryRoutes } = require('./src/routes/categoryRoutes');
fastify.register(categoryRoutes, { prefix: '/api/v1/categories' });
fastify.register(categoryRoutes, { prefix: '/api/categories' });
fastify.register(adminCategoryRoutes, { prefix: '/api/v1/admin/categories' });

const { productRoutes, adminProductRoutes } = require('./src/routes/productRoutes');
fastify.register(productRoutes, { prefix: '/api/v1/products' });
fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(adminProductRoutes, { prefix: '/api/v1/admin/products' });

// Quote Requests & VIN Lookups
const { enquiryRoutes, adminEnquiryRoutes } = require('./src/routes/enquiryRoutes');
fastify.register(enquiryRoutes, { prefix: '/api/v1/enquiries' });
fastify.register(adminEnquiryRoutes, { prefix: '/api/v1/admin/enquiries' });

// Cart, Addresses & Saved Parts
fastify.register(require('./src/routes/cartRoutes'), { prefix: '/api/v1/cart' });
fastify.register(require('./src/routes/wishlistRoutes'), { prefix: '/api/v1/wishlist' });
fastify.register(require('./src/routes/addressRoutes'), { prefix: '/api/v1/addresses' });

// Orders & Payments (No Razorpay)
const { orderRoutes, adminOrderRoutes } = require('./src/routes/orderRoutes');
fastify.register(orderRoutes, { prefix: '/api/v1/orders' });
fastify.register(adminOrderRoutes, { prefix: '/api/v1/admin/orders' });

fastify.register(require('./src/routes/paymentRoutes'), { prefix: '/api/v1/payments' });

// Freight & Logistics
fastify.register(require('./src/routes/shippingRoutes'), { prefix: '/api/v1/shipping' });

// Promotions & Discounts
const { couponRoutes, adminCouponRoutes } = require('./src/routes/couponRoutes');
fastify.register(couponRoutes, { prefix: '/api/v1/coupons' });
fastify.register(adminCouponRoutes, { prefix: '/api/v1/admin/coupons' });

// Storefront & Admin Promos
fastify.register(require('./src/routes/promoRoutes'), { prefix: '/api/v1/promos' });
fastify.register(require('./src/routes/promoRoutes'), { prefix: '/api/promos' });

// File Uploads
fastify.register(require('./src/routes/uploadRoutes'), { prefix: '/api/v1/uploads' });
fastify.register(require('./src/routes/uploadRoutes'), { prefix: '/uploads' });

const { campaignRoutes, adminCampaignRoutes } = require('./src/routes/campaignRoutes');
fastify.register(campaignRoutes, { prefix: '/api/v1/campaigns' });
fastify.register(adminCampaignRoutes, { prefix: '/api/v1/admin/campaigns' });

const { welcomeOfferRoutes, adminWelcomeOfferRoutes } = require('./src/routes/welcomeOfferRoutes');
fastify.register(welcomeOfferRoutes, { prefix: '/api/v1/welcome-offer' });
fastify.register(adminWelcomeOfferRoutes, { prefix: '/api/v1/admin/welcome-offer' });

// Storefront Content & Blogs
const { carouselRoutes, adminCarouselRoutes } = require('./src/routes/carouselRoutes');
fastify.register(carouselRoutes, { prefix: '/api/v1/carousel' });
fastify.register(carouselRoutes, { prefix: '/api/carousel' });
fastify.register(adminCarouselRoutes, { prefix: '/api/v1/admin/carousel' });

const { cmsRoutes, adminCmsRoutes } = require('./src/routes/cmsRoutes');
fastify.register(cmsRoutes, { prefix: '/api/v1/cms' });
fastify.register(adminCmsRoutes, { prefix: '/api/v1/admin/cms' });

const { blogRoutes, adminBlogRoutes } = require('./src/routes/blogRoutes');
fastify.register(blogRoutes, { prefix: '/api/v1/blogs' });
fastify.register(adminBlogRoutes, { prefix: '/api/v1/admin/blogs' });

// Site Settings & Configuration
const { settingRoutes, adminSettingRoutes } = require('./src/routes/settingRoutes');
fastify.register(settingRoutes, { prefix: '/api/v1/settings' });
fastify.register(adminSettingRoutes, { prefix: '/api/v1/admin/settings' });

// Customer Feedback & Reviews
const { reviewRoutes, adminReviewRoutes } = require('./src/routes/reviewRoutes');
fastify.register(reviewRoutes, { prefix: '/api/v1' });
fastify.register(adminReviewRoutes, { prefix: '/api/v1/admin/reviews' });

// Customer & Admin Activity Logs
const { activityRoutes, adminActivityRoutes } = require('./src/routes/activityRoutes');
fastify.register(activityRoutes, { prefix: '/api/v1/activity' });
fastify.register(adminActivityRoutes, { prefix: '/api/v1/admin/logs' });

fastify.register(require('./src/routes/adminLogRoutes'), { prefix: '/api/v1/admin/audit-trail' });
fastify.register(require('./src/routes/customerRoutes'), { prefix: '/api/v1/admin/customers' });
fastify.register(require('./src/routes/dashboardRoutes'), { prefix: '/api/v1/admin/dashboard' });
fastify.register(require('./src/routes/dashboardRoutes'), { prefix: '/api/v1/admin/stats' });

// AI Assistant
fastify.register(require('./src/routes/chatRoutes'), { prefix: '/api/v1/chat' });

// 9. Automated Admin Audit Hook
const { logAdminAction, inferActionAndDescription } = require('./src/services/auditLogger');
fastify.addHook('onResponse', async (request, reply) => {
  try {
    const url = request.raw.url || request.url || '';
    const method = request.method;

    if (
      url.includes('/api/v1/admin') &&
      !url.includes('/api/v1/admin/logs') &&
      !url.includes('/api/v1/admin/audit-trail') &&
      !url.includes('/api/v1/admin/auth/login') &&
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) &&
      reply.statusCode >= 200 &&
      reply.statusCode < 300 &&
      request.user
    ) {
      const { action, module, description } = inferActionAndDescription(method, url, request.body);
      const ip = request.headers['x-forwarded-for'] || request.ip || '127.0.0.1';

      await logAdminAction({
        admin: request.user,
        action,
        module,
        description,
        method,
        path: url,
        statusCode: reply.statusCode,
        ipAddress: ip,
        userAgent: request.headers['user-agent'] || '',
        details: request.body
      });
    }
  } catch (err) {
    // Non-blocking
  }
});

// Root Health & Welcome endpoint
fastify.get('/', async () => {
  return {
    success: true,
    name: 'Aurex Truck Parts & Heavy Vehicle Equipment REST API',
    status: 'ONLINE',
    version: '1.0.0',
    docs: '/api/docs',
    timestamp: new Date().toISOString()
  };
});

fastify.get('/api/health', async () => {
  return {
    status: 'healthy',
    uptime: process.uptime(),
    dbState: require('mongoose').connection.readyState === 1 ? 'connected' : 'connecting'
  };
});

// Server Initialization
const socketService = require('./src/services/socketService');
const mongoose = require('mongoose');

let isFastifyReady = false;

// Static serving for local uploads directory with traversal defense
fastify.get('/uploads/:filename', async (request, reply) => {
  const rawParam = request.params.filename || '';
  const safeFilename = path.basename(rawParam);

  if (!safeFilename || safeFilename.startsWith('.') || safeFilename.includes('\0')) {
    return reply.code(400).send({ error: 'Invalid filename' });
  }

  const filePath = path.resolve(uploadsDir, safeFilename);
  if (!filePath.startsWith(path.resolve(uploadsDir))) {
    return reply.code(403).send({ error: 'Access denied: path traversal detected' });
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(safeFilename).toLowerCase();
    const MIME_MAP = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.pdf': 'application/pdf'
    };
    const mimeType = MIME_MAP[ext] || 'application/octet-stream';

    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Content-Security-Policy', "default-src 'none'; sandbox");
    reply.header('Cache-Control', 'public, max-age=86400');
    return reply.type(mimeType).send(fs.createReadStream(filePath));
  }
  return reply.code(404).send({ error: 'Image not found' });
});

async function ensureSeedData() {
  try {
    const Coupon = require('./src/models/Coupon');
    const SiteSetting = require('./src/models/SiteSetting');
    const Admin = require('./src/models/Admin');

    const welcome10 = await Coupon.findOne({ code: 'WELCOME10' });
    if (!welcome10) {
      await Coupon.create({
        code: 'WELCOME10',
        description: 'First order 10% off',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        startDate: new Date(Date.now() - 864e5),
        endDate: new Date(Date.now() + 365 * 864e5 * 5),
        isActive: true
      });
      console.log('✅ Seeded promo code WELCOME10 (10% off)');
    }

    const welcome5 = await Coupon.findOne({ code: 'WELCOME5' });
    if (!welcome5) {
      await Coupon.create({
        code: 'WELCOME5',
        description: '5% off order',
        discountType: 'PERCENTAGE',
        discountValue: 5,
        startDate: new Date(Date.now() - 864e5),
        endDate: new Date(Date.now() + 365 * 864e5 * 5),
        isActive: true
      });
    }

    const settings = await SiteSetting.findOne();
    if (!settings) {
      await SiteSetting.create({
        storeName: 'Aurex Truck Parts Australia',
        phone: '03 9000 0000',
        email: 'sales@aurextruckparts.com.au',
        address: '41 Halley Court, Campbellfield VIC 3061',
        hours: 'Mon to Fri 9am to 5pm. Sat 9am to 12pm.',
        freeFreightOver: 500,
        standardFee: 24,
        expressFee: 39,
        abn: 'ABN 12 345 678 901',
        announcement: 'Free road freight over $500. Order by 2pm for same day dispatch.'
      });
      console.log('✅ Initialized default SiteSettings');
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@aurex.com.au').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminUser = await Admin.findOne({ email: adminEmail });
    if (!adminUser) {
      await Admin.create({
        name: process.env.ADMIN_NAME || 'Store Admin',
        email: adminEmail,
        password: adminPass,
        role: 'SUPER_ADMIN',
        isActive: true
      });
      console.log(`✅ Seeded admin account: ${adminEmail}`);
    }
  } catch (err) {
    console.warn('Seed verification warning:', err.message);
  }
}

if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
        await connectDB();
        await ensureSeedData();
      }
      if (!isFastifyReady) {
        await fastify.ready();
        isFastifyReady = true;
      }
      fastify.server.emit('request', req, res);
    } catch (err) {
      console.error('Serverless Function Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Serverless Function Execution Failed',
          message: err.message,
          hint: !process.env.MONGO_URI
            ? 'Missing MONGO_URI in Vercel Project Settings -> Environment Variables.'
            : undefined
        })
      );
    }
  };
} else {
  const start = async () => {
    try {
      await connectDB();
      await ensureSeedData();
      const port = parseInt(process.env.PORT || '5001', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      socketService.initSocket(fastify.server);
      fastify.log.info(`Aurex Truck Parts API & Realtime WebSockets running on port ${port}`);
      console.log(`🚀 API Docs available at http://localhost:${port}/api/docs`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  start();
}
