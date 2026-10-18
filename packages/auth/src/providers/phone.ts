
import { z } from 'zod';
import { generateOTP, hashOTP, isOTPExpired } from '../core/otp.js';
import { createTokens } from '../core/tokens.js';
import { authRateLimiters } from '../core/ratelimit.js';

export const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone'),
});

export const otpVerifySchema = z.object({
  phone: z.string(),
  otp: z.string().length(6),
});

export const phoneProvider = {
  // Step 1: Send OTP
  async sendOTP(prisma: any, redis: any, phone: string) {
    phoneSchema.parse({ phone });
    await authRateLimiters.otp(redis, phone);

    const otp = generateOTP(6);
    const hashed = hashOTP(otp);

    // Delete old OTPs
    await prisma.verificationToken.deleteMany({
      where: { identifier: phone, type: 'phone_otp' }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: phone,
        token: hashed, // store hashed
        type: 'phone_otp',
        expires: new Date(Date.now() + 1000 * 60 * 5), // 5 min
      }
    });

    // TODO: In client project, call WhatsApp API here
    // await sendWhatsApp(phone, 'otp_template', [otp])
    // For dev, return OTP (remove in prod)
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    
    return { success: true, message: 'OTP sent', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined };
  },

  // Step 2: Verify OTP & Login/Signup
  async verifyOTP(prisma: any, phone: string, otp: string, ip: string) {
    otpVerifySchema.parse({ phone, otp });

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: phone, type: 'phone_otp' },
      orderBy: { expires: 'desc' }
    });

    if (!record) throw new Error('OTP not found, request new');
    if (isOTPExpired(record.expires)) throw new Error('OTP expired');
    if (record.attempts >= 5) throw new Error('Too many attempts, request new OTP');

    const hashedInput = hashOTP(otp);
    if (hashedInput !== record.token) {
      await prisma.verificationToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });
      throw new Error('Invalid OTP');
    }

    // OTP valid - delete it
    await prisma.verificationToken.delete({ where: { id: record.id } });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, phoneVerified: true, email: `${phone}@phone.local` } // placeholder email
      });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    }

    const tokens = await createTokens({ userId: user.id });

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
