
import { EmailChannel } from '../channels/email.js';
import { WhatsAppChannel } from '../channels/whatsapp.js';
import { PushChannel } from '../channels/push.js';
export type NotificationPreferences = { email?: boolean; whatsapp?: boolean; push?: boolean; };
export type UserContact = { email?: string; phone?: string; fcmToken?: string; preferences?: NotificationPreferences; };
export class NotificationDispatcher {
  constructor(private email?: EmailChannel, private whatsapp?: WhatsAppChannel, private push?: PushChannel) {}
  async sendOTP(user: UserContact, otp: string) {
    const results = [];
    if (user.email && user.preferences?.email !== false && this.email) {
      results.push(await this.email.sendOTP(user.email, otp).catch(e => ({ error: e.message })));
    }
    if (user.phone && user.preferences?.whatsapp !== false && this.whatsapp) {
      results.push(await this.whatsapp.sendOTP(user.phone, otp).catch(e => ({ error: e.message })));
    }
    return results;
  }
  async sendWelcome(user: UserContact, name: string) {
    if (user.email && this.email) await this.email.sendWelcome(user.email, name);
    if (user.phone && this.whatsapp) await this.whatsapp.send(user.phone, `Hi ${name}! Welcome`);
  }
  async sendOrderNotification(user: UserContact, orderId: string, status: string) {
    if (user.email && this.email) await this.email.send(user.email, `Order ${orderId}`, `<p>Your order ${orderId} is ${status}</p>`);
    if (user.phone && this.whatsapp) await this.whatsapp.sendOrderUpdate(user.phone, orderId, status);
  }
}
export const createDispatcher = (email?: EmailChannel, whatsapp?: WhatsAppChannel, push?: PushChannel) => new NotificationDispatcher(email, whatsapp, push);
