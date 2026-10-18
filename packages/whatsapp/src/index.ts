
export * from './core/client.js';
export * from './core/webhook.js';
export * from './templates/otp.js';
export * from './templates/notifications.js';

import { createWhatsAppClient } from './core/client.js';
import { sendOTP } from './templates/otp.js';

// High-level helper for Auth integration
export const createWhatsAppOTPService = (config: { phoneNumberId: string; accessToken: string }) => {
  const client = createWhatsAppClient(config);
  
  return {
    client,
    sendOTP: (to: string, otp: string) => sendOTP(client, to, otp),
    sendText: (to: string, text: string) => client.sendText(to, text),
  };
};

export const WhatsApp = {
  createClient: createWhatsAppClient,
};
