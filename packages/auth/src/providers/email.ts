
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../core/password.js';
import { createTokens } from '../core/tokens.js';
import { authRateLimiters } from '../core/ratelimit.js';

export const emailSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const emailProvider = {
  // Called from client's API route: POST /api/auth/signup
  async signup(prisma: any, redis: any, input: z.infer<typeof emailSignupSchema>, ip: string) {
    const data = emailSignupSchema.parse(input);
    await authRateLimiters.signup(redis, ip);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already registered');

    const hashed = await hashPassword(data.password);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
      }
    });

    // Create verification token - send via email in client project
    const token = Math.random().toString(36).substring(2, 15);
    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        type: 'email_verify',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
        userId: user.id
      }
    });

    return { user, verificationToken: token };
  },

  async login(prisma: any, redis: any, input: z.infer<typeof emailLoginSchema>, ip: string) {
    const data = emailLoginSchema.parse(input);
    await authRateLimiters.login(redis, ip);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.password) throw new Error('Invalid credentials');

    const valid = await verifyPassword(data.password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const tokens = await createTokens({ userId: user.id, email: user.email });

    // Save session in DB
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        ip,
      }
    });

    return { user, ...tokens };
  }
};
