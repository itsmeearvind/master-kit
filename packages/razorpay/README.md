
# @maasters/razorpay

Full Razorpay - Card, UPI, Netbanking, Wallet, Bank Verification, Payouts.

## Setup
Env:
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAYX_ACCOUNT_NUMBER=...
```

## Create Order (Backend)
```ts
import { createRazorpayClient, getCheckoutOptions } from '@maasters/razorpay';

const rzp = createRazorpayClient({ keyId, keySecret });

const order = await rzp.createOrder({
  amount: 50000, // 500 INR in paise
  receipt: `receipt_${Date.now()}`,
  notes: { userId: '123' }
});

// Send to frontend
const checkoutOptions = getCheckoutOptions(order, keyId, {
  name: 'Maasters Store',
  description: 'Order #123',
  themeColor: '#3399cc',
  prefill: { name: 'Arvind', email: 'a@b.com', contact: '9999999999' }
});
```

## Verify Payment (Backend - after checkout)
```ts
import { verifyPaymentSignature } from '@maasters/razorpay';

const isValid = verifyPaymentSignature({
  orderId: req.body.razorpay_order_id,
  paymentId: req.body.razorpay_payment_id,
  signature: req.body.razorpay_signature
}, process.env.RAZORPAY_KEY_SECRET!);

if (!isValid) throw new Error('Payment verification failed');
// Update order as paid in DB
```

## Bank Account Verification (Penny Drop)
```ts
const result = await rzp.verifyBankAccount({
  account_number: '1234567890',
  ifsc: 'HDFC0001234',
  name: 'Arvind Kumar'
});
// Check result.result.active
```

## UPI Verification
```ts
const result = await rzp.verifyUPI('arvind@okhdfcbank');
```

## Payouts (RazorpayX)
```ts
// 1. Create fund account
const fundAccount = await rzp.createFundAccount({
  account_type: 'bank_account',
  bank_account: { name: 'Arvind', ifsc: 'HDFC0001234', account_number: '1234567890' }
});

// 2. Create payout
await rzp.createPayout({
  account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER!,
  fund_account_id: fundAccount.id,
  amount: 10000, // 100 INR
  mode: 'IMPS',
  purpose: 'payout'
});
```

## Webhooks
```ts
import { createWebhookHandler } from '@maasters/razorpay';

const handler = createWebhookHandler(process.env.RAZORPAY_WEBHOOK_SECRET!, {
  'payment.captured': async ({ payload }) => {
    await prisma.order.update({ where: { razorpayOrderId: payload.payment.entity.order_id }, data: { status: 'PAID' } });
  },
  'order.paid': async ({ payload }) => {
    // fulfill
  }
});

// Next.js route
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature')!;
  return Response.json(await handler(body, signature));
}
```

## Frontend (Next.js)
```tsx
'use client';
import { useEffect } from 'react';

export default function Checkout({ orderOptions }: { orderOptions: any }) {
  const pay = () => {
    const rzp = new (window as any).Razorpay(orderOptions);
    rzp.open();
  };
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);
  return <button onClick={pay}>Pay {orderOptions.amount/100} INR</button>;
}
```
