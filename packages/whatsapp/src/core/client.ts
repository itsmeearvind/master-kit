
import { z } from 'zod';

type WhatsAppConfig = {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string; // default v18.0
};

export class WhatsAppClient {
  private baseUrl: string;
  
  constructor(private config: WhatsAppConfig) {
    const version = config.apiVersion || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${version}/${config.phoneNumberId}`;
  }

  async send(payload: any) {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as any;
    if (!res.ok) {
      throw new Error(`WhatsApp API Error: ${data.error?.message || JSON.stringify(data)}`);
    }
    return data;
  }

  // Send template - for OTP, order updates etc
  async sendTemplate(to: string, templateName: string, language: string = 'en', components?: any[]) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components,
      }
    });
  }

  // Send plain text
  async sendText(to: string, body: string, previewUrl: boolean = false) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: previewUrl, body }
    });
  }

  // Send image
  async sendImage(to: string, link: string, caption?: string) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link, caption }
    });
  }

  // Send document
  async sendDocument(to: string, link: string, filename?: string) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: { link, filename }
    });
  }
}

export const createWhatsAppClient = (config: WhatsAppConfig) => new WhatsAppClient(config);
