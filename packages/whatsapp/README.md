
# @maasters/whatsapp

Production WhatsApp Cloud API client.

## Setup

1. Get from Meta Business:
- Phone Number ID
- Access Token
- App Secret (for webhook verify)

2. Env:
```
WHATSAPP_PHONE_NUMBER_ID=123...
WHATSAPP_ACCESS_TOKEN=EAA...
WHATSAPP_VERIFY_TOKEN=my_verify_token
WHATSAPP_APP_SECRET=...
```

3. Usage:

```ts
import { createWhatsAppClient, sendOTP } from '@maasters/whatsapp';

const client = createWhatsAppClient({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
});

// Send OTP (template must be approved in Meta)
await sendOTP(client, '+919999999999', '123456');

// Plain text
await client.sendText('+919999999999', 'Hello!');

// Image
await client.sendImage('+919999999999', 'https://example.com/image.jpg', 'Check this');

// Webhook (Next.js)
import { verifyWebhook, parseWebhook } from '@maasters/whatsapp';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  return new Response(verifyWebhook(mode!, token!, challenge!, process.env.WHATSAPP_VERIFY_TOKEN!));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages } = parseWebhook(body);
  // handle incoming messages
  return Response.json({ ok: true });
}
```

## Integration with Auth

Auth OTP already logs OTP in dev. In production:

```ts
import { phoneProvider } from '@maasters/auth';
import { createWhatsAppOTPService } from '@maasters/whatsapp';

const wa = createWhatsAppOTPService({ phoneNumberId, accessToken });

// Override sendOTP
const result = await phoneProvider.sendOTP(prisma, redis, phone);
// Instead of console.log, send via WhatsApp:
await wa.sendOTP(phone, result.devOtp);
```

Templates to create in Meta Business Manager:
- otp_login: "Your OTP is {{1}}. Valid for 5 minutes. Do not share."
- order_confirmed: "Order {{1}} confirmed for {{2}}"
