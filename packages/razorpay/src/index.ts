
export * from './core/client.js';
export * from './core/checkout.js';
export * from './core/verification.js';
export * from './webhooks/handler.js';

import { createRazorpayClient } from './core/client.js';

export const Razorpay = {
  createClient: createRazorpayClient,
};

export const createRazorpayService = (config: { keyId: string; keySecret: string; webhookSecret?: string }) => {
  const client = createRazorpayClient({ keyId: config.keyId, keySecret: config.keySecret });
  
  return {
    client,
    createOrder: client.createOrder.bind(client),
    verifyPayment: (params: { orderId: string; paymentId: string; signature: string }) => {
      const { verifyPaymentSignature } = require('./core/verification.js');
      return verifyPaymentSignature(params, config.keySecret);
    },
  };
};
