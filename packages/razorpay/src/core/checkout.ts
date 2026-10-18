
import { z } from 'zod';

export const createOrderSchema = z.object({
  amount: z.number().min(100, 'Min 1 INR (100 paise)'), // in paise
  currency: z.string().default('INR'),
  receipt: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    contact: z.string(),
  }).optional(),
  notes: z.record(z.string()).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const getCheckoutOptions = (order: any, keyId: string, opts: { name: string; description?: string; image?: string; prefill?: any; themeColor?: string }) => {
  // For frontend Razorpay Checkout.js
  return {
    key: keyId,
    amount: order.amount,
    currency: order.currency,
    name: opts.name,
    description: opts.description,
    image: opts.image,
    order_id: order.id,
    prefill: opts.prefill,
    theme: { color: opts.themeColor || '#3399cc' },
    // Enable all methods - Card, UPI, Netbanking, Wallet, etc
    method: {
      netbanking: true,
      wallet: true,
      upi: true,
      card: true,
      emi: true,
      paylater: true,
    },
  };
};
