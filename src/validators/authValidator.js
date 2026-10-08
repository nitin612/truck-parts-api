const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().optional(),
  fullName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
  companyName: z.string().optional(),
  abnOrTaxId: z.string().optional(),
  fleetTruckModels: z.array(z.string()).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const adminLoginSchema = z.object({
  email: z.string().email('Invalid admin email'),
  password: z.string().min(1, 'Password is required')
});

const validate = (schema) => (request, reply, done) => {
  try {
    request.body = schema.parse(request.body);
    done();
  } catch (error) {
    done(error);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  adminLoginSchema,
  validate
};
