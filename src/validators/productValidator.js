const { z } = require('zod');

const productCreateSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  oemPartNumber: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(['NEW', 'REMAN_EXCHANGE', 'AFTERMARKET_OEM_SPEC', 'USED_TESTED']).optional(),
  pricing: z.object({
    mrp: z.number().min(0),
    sellingPrice: z.number().min(0),
    tradePrice: z.number().optional(),
    isPOA: z.boolean().optional()
  }).optional(),
  inventory: z.object({
    stock: z.number().min(0),
    lowStockThreshold: z.number().optional()
  }).optional(),
  dimensions: z.object({
    weightKg: z.number().optional(),
    lengthCm: z.number().optional(),
    widthCm: z.number().optional(),
    heightCm: z.number().optional()
  }).optional()
});

const orderCreateSchema = z.object({
  addressId: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['DIRECT_BANK_TRANSFER', 'TRADE_ACCOUNT_30_DAYS', 'COD_DEPOT_PICKUP', 'CREDIT_CARD_DIRECT', 'PURCHASE_ORDER']).optional(),
  shippingMethod: z.enum(['STANDARD', 'EXPRESS_COURIER', 'HEAVY_FREIGHT_PALLET', 'DEPOT_PICKUP']).optional(),
  purchaseOrderNumber: z.string().optional(),
  customerNotes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1)
  })).optional()
});

const enquiryCreateSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(6, 'Contact phone is required'),
  companyName: z.string().optional(),
  message: z.string().min(5, 'Please provide details of your truck or part request')
});

module.exports = {
  productCreateSchema,
  orderCreateSchema,
  enquiryCreateSchema
};
