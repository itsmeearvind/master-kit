
import type { WhatsAppClient } from '../core/client.js';

export const sendOrderConfirmed = async (client: WhatsAppClient, to: string, orderId: string, amount: string) => {
  return client.sendTemplate(to, 'order_confirmed', 'en', [
    { type: 'body', parameters: [{ type: 'text', text: orderId }, { type: 'text', text: amount }] }
  ]);
};

export const sendOrderShipped = async (client: WhatsAppClient, to: string, orderId: string, trackingUrl: string) => {
  return client.sendTemplate(to, 'order_shipped', 'en', [
    { type: 'body', parameters: [{ type: 'text', text: orderId }] },
    { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: trackingUrl }] }
  ]);
};

export const sendWelcome = async (client: WhatsAppClient, to: string, name: string) => {
  return client.sendText(to, `Hi ${name}! 👋 Welcome to our platform. Your account is now active.`);
};
