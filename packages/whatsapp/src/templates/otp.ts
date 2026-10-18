
import type { WhatsAppClient } from '../core/client.js';

export const OTPTemplates = {
  // You need to create these templates in Meta Business Manager first
  otp_login: 'otp_login', // {{1}} = OTP
  otp_verify: 'otp_verify',
};

export const sendOTP = async (client: WhatsAppClient, to: string, otp: string, templateName: string = OTPTemplates.otp_login) => {
  // Template should have 1 variable: OTP
  // Example template body: "Your OTP is {{1}}. Valid for 5 minutes."
  return client.sendTemplate(to, templateName, 'en', [
    {
      type: 'body',
      parameters: [{ type: 'text', text: otp }]
    }
  ]);
};

export const sendOTPWithExpiry = async (client: WhatsAppClient, to: string, otp: string, expiryMinutes: number = 5) => {
  return client.sendTemplate(to, OTPTemplates.otp_login, 'en', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: otp },
        { type: 'text', text: `${expiryMinutes}` }
      ]
    }
  ]);
};
