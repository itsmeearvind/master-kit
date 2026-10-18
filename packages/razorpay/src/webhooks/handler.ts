
import crypto from 'crypto';

export const verifyWebhookSignature = (body: string, signature: string, secret: string): boolean => {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
};

export type RazorpayWebhookEvent = 
  | 'payment.authorized'
  | 'payment.failed'
  | 'payment.captured'
  | 'order.paid'
  | 'refund.created'
  | 'payout.processed'
  | 'payout.failed'
  | 'fund_account.validation.completed';

export type WebhookHandler = (event: { event: RazorpayWebhookEvent; payload: any }) => Promise<void>;

export const createWebhookHandler = (secret: string, handlers: Partial<Record<RazorpayWebhookEvent, WebhookHandler>>) => {
  return async (reqBody: string, signature: string) => {
    if (!verifyWebhookSignature(reqBody, signature, secret)) {
      throw new Error('Invalid webhook signature');
    }

    const data = JSON.parse(reqBody);
    const event = data.event as RazorpayWebhookEvent;
    
    const handler = handlers[event];
    if (handler) {
      await handler({ event, payload: data.payload });
    }

    return { ok: true, event };
  };
};

// Example handlers for client to implement
export const exampleHandlers = {
  onPaymentCaptured: async (payload: any) => {
    const payment = payload.payment.entity;
    // Update order in DB: payment.captured
    console.log('Payment captured', payment.id);
  },
  onOrderPaid: async (payload: any) => {
    const order = payload.order.entity;
    // Fulfill order
    console.log('Order paid', order.id);
  },
  onPayoutProcessed: async (payload: any) => {
    const payout = payload.payout.entity;
    console.log('Payout processed', payout.id);
  },
};
