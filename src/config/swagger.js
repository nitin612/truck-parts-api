const swaggerConfig = {
  swagger: {
    info: {
      title: 'Aurex Truck Parts & Heavy Equipment API',
      description: 'Enterprise REST API documentation for Commercial Truck & Trailer Parts E-Commerce and B2B Trade Platform',
      version: '1.0.0'
    },
    host: process.env.SWAGGER_HOST || 'localhost:5000',
    schemes: ['http', 'https'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    tags: [
      { name: 'Admin Auth', description: 'Admin authentication and management' },
      { name: 'Auth', description: 'Customer & Fleet trade account authentication' },
      { name: 'Products', description: 'Heavy truck parts catalog, OEM lookup, and fitment' },
      { name: 'Categories', description: 'Truck component categories and assemblies' },
      { name: 'Brands', description: 'Truck manufacturers and component brands' },
      { name: 'Enquiries', description: 'Part quote requests, VIN fitment lookups, and POA inquiries' },
      { name: 'Cart', description: 'Shopping cart and core deposit calculation' },
      { name: 'Orders', description: 'Order processing and delivery tracking' },
      { name: 'Payments', description: 'Trade accounts, Bank transfer, COD, and Payment settings' },
      { name: 'Shipping', description: 'Heavy freight calculation and tracking' },
      { name: 'Coupons', description: 'Promotional and fleet discount coupons' },
      { name: 'Reviews', description: 'Product ratings and customer feedback' },
      { name: 'CMS', description: 'Storefront banners, dynamic sections, and policy pages' },
      { name: 'Blogs', description: 'Truck maintenance and technical guides' },
      { name: 'Dashboard', description: 'Admin sales, fleet metrics, and inventory analytics' },
      { name: 'Audit Logs', description: 'Admin activity and audit trail' },
      { name: 'AI Assistant', description: 'AI-assisted truck part finder and VIN lookup' }
    ],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your JWT token with "Bearer " prefix (e.g. "Bearer <token>")'
      }
    }
  }
};

const swaggerUiConfig = {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next(); },
    preHandler: function (request, reply, next) { next(); }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject) => swaggerObject,
  transformSpecificationClone: true
};

module.exports = {
  swaggerConfig,
  swaggerUiConfig
};
