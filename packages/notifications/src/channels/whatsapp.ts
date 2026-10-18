
type WhatsAppSender = { sendText: (to: string, text: string) => Promise<any>; sendTemplate: (to: string, template: string, lang: string, comps: any[]) => Promise<any> };
export class WhatsAppChannel {
  constructor(private client: WhatsAppSender) {}
  async send(to: string, text: string) { return this.client.sendText(to, text); }
  async sendOTP(to: string, otp: string) {
    return this.client.sendTemplate(to, 'otp_login', 'en', [{ type: 'body', parameters: [{ type: 'text', text: otp }] }]);
  }
  async sendOrderUpdate(to: string, orderId: string, status: string) {
    return this.client.sendText(to, `Your order ${orderId} is now ${status}`);
  }
}
