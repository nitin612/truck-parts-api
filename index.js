require('dotenv').config();
const fastify = require('fastify')({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.newPassword',
      'req.body.oldPassword',
      'req.body.twoFactorSecret',
      'req.body.twoFactorCode'
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
const allowedOrigins = [
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
  .map((url) => url.replace(/\/$/, ''));

// Register CORS with origin validation
fastify.register(require('@fastify/cors'), {
  origin: (origin, cb) => {
    // Allow non-browser requests (mobile, server-to-server)
    if (!origin) return cb(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1')
    ) {
      return cb(null, true);
    }

    return cb(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
});

// 2. Register Security & Rate Limit Headers
fastify.register(require('@fastify/helmet'), { global: true });

fastify.register(require('@fastify/rate-limit'), {
  max: 150,
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
    const originHeader = request.headers.origin;
    if (originHeader) {
      const cleanOrigin = originHeader.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1');
      if (!isAllowed) {
        reply.code(403);
        throw new Error('CSRF origin validation failed: untrusted origin');
      }
    }
  }
});

// 8. Custom Centralized Error Handler
fastify.setErrorHandler(errorHandler);

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

if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
        await connectDB();
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
