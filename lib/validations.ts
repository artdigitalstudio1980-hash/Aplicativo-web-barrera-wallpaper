import { z } from 'zod';

export const emailSchema = z.string().email().max(255).transform(e => e.toLowerCase());

export const passwordSchema = z.string().min(8).max(128).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
  'Password must contain uppercase, lowercase, number, and special character'
);

export const nameSchema = z.string().min(1).max(100);

export const phoneSchema = z.string().max(20).optional().nullable();

export const createUserSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema.optional().default(''),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: z.string().max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  password: passwordSchema.optional(),
});

export const checkoutItemSchema = z.object({
  wallpaperId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
  price: z.number().min(0).max(10000).optional(),
  name: z.string().max(200).optional(),
  imageUrl: z.string().max(500).optional(),
  measurements: z.any().optional(),
});

export const shippingDetailsSchema = z.object({
  name: z.string().min(1).max(200),
  email: emailSchema,
  phone: z.string().max(20).optional().default(''),
  address1: z.string().min(1).max(500),
  address2: z.string().max(500).optional().default(''),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  country: z.string().min(1).max(50),
  zip: z.string().min(1).max(20),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(50),
  shippingDetails: shippingDetailsSchema,
  needsInstallation: z.boolean().optional().default(false),
  installationAddress: z.string().max(500).optional().default(''),
  locale: z.enum(['en', 'es']).optional().default('en'),
  paymentMethod: z.enum(['stripe', 'paypal']).optional().default('paypal'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: z.string().max(100).optional().default(''),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  country: z.string().max(50).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  howDidYouHear: z.string().max(200).optional().nullable(),
  preferredPayment: z.string().max(50).optional().nullable(),
  newsletterOptIn: z.boolean().optional().default(false),
});

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().max(200).optional().default('General Inquiry'),
  message: z.string().min(1).max(2000),
  newsletter: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().min(1).max(2000),
});

export const installationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().min(1).max(20),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zip: z.string().min(1).max(20),
  preferredDate: z.string().min(1).optional(),
  rooms: z.any().optional(),
  notes: z.string().max(2000).optional(),
});
