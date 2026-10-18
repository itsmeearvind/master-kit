
import crypto from 'crypto';

// Verify webhook from Meta
export const verifyWebhook = (mode: string, token: string, challenge: string, expectedVerifyToken: string) => {
  if (mode === 'subscribe' && token === expectedVerifyToken) {
    return challenge;
  }
  throw new Error('Webhook verification failed');
};

// Verify X-Hub-Signature for incoming messages
export const verifySignature = (payload: string, signature: string, appSecret: string): boolean => {
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

export type WhatsAppWebhookPayload = {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: 'text' | 'image' | 'button' | 'interactive';
          text?: { body: string };
        }>;
        statuses?: Array<{ id: string; status: 'sent' | 'delivered' | 'read' | 'failed'; timestamp: string; recipient_id: string }>;
      };
      field: string;
    }>;
  }>;
};

export const parseWebhook = (payload: WhatsAppWebhookPayload) => {
  const messages: Array<{ from: string; text: string; name?: string; messageId: string }> = [];
  const statuses: Array<{ id: string; status: string; to: string }> = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;
      if (value.messages) {
        for (const msg of value.messages) {
          const contact = value.contacts?.find(c => c.wa_id === msg.from);
          messages.push({
            from: msg.from,
            text: msg.text?.body || '',
            name: contact?.profile.name,
            messageId: msg.id,
          });
        }
      }
      if (value.statuses) {
        for (const s of value.statuses) {
          statuses.push({ id: s.id, status: s.status, to: s.recipient_id });
        }
      }
    }
  }

  return { messages, statuses };
};
