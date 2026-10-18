
import { z } from 'zod';
type EmailConfig = { provider: 'resend' | 'smtp' | 'sendgrid'; apiKey?: string; from: string; };
export class EmailChannel {
  constructor(private config: EmailConfig) {}
  async send(to: string, subject: string, html: string, text?: string) {
    if (this.config.provider === 'resend') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.config.from, to, subject, html, text })
      });
      if (!res.ok) throw new Error('Resend failed');
      return res.json();
    }
    console.log(`[EMAIL] To:${to} Subject:${subject}`);
    return { ok: true, dev: true };
  }
  async sendOTP(to: string, otp: string) {
    return this.send(to, 'Your OTP Code', `<h1>Your OTP is ${otp}</h1><p>Valid for 5 minutes</p>`, `Your OTP is ${otp}`);
  }
  async sendWelcome(to: string, name: string) {
    return this.send(to, 'Welcome!', `<h1>Hi ${name}!</h1><p>Welcome to our platform</p>`);
  }
}
