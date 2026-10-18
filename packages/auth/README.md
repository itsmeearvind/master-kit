
# @maasters/auth

Full production auth - Client DB only.

## Setup in Client Project

1. Copy prisma/schema.prisma models to your schema
2. Add env:
```
JWT_SECRET=32-char-secret
REFRESH_SECRET=another-32-char
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=
FACEBOOK_CLIENT_ID=
...
REDIS_URL=
```

3. API Routes (Next.js example):

```ts
// app/api/auth/email/signup/route.ts
import { emailProvider } from '@maasters/auth';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  const body = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const result = await emailProvider.signup(prisma, redis, body, ip);
  // Send verification email with result.verificationToken
  return Response.json(result);
}
```

4. Phone OTP via WhatsApp:
```ts
import { phoneProvider } from '@maasters/auth';
await phoneProvider.sendOTP(prisma, redis, '+919999999999');
// Then verify
await phoneProvider.verifyOTP(prisma, '+919999999999', '123456', ip);
```

5. OAuth:
```ts
// GET /api/auth/google
import { googleProvider } from '@maasters/auth';
const state = crypto.randomUUID(); // save to cookie
return Response.redirect(googleProvider.getAuthUrl(state));

// GET /api/auth/google/callback?code=xxx&state=yyy
const user = await googleProvider.handleCallback(prisma, code, state, cookieState);
```

Security: rate limit 5 login/15min, OTP 3/5min, bcrypt 12, JWT 15m expiry.
