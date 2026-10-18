
// CLIENT DB TABLES - ye unke prisma me jayega
// model User { id String @id @default(cuid()); email String @unique; phone String? @unique; password String?; emailVerified DateTime?; createdAt DateTime @default(now()); accounts Account[]; sessions Session[] }
// model Account { id String @id; userId String; provider String; providerAccountId String; @@unique([provider, providerAccountId]) }
// model Session { id String @id; userId String; token String @unique; expires DateTime; ip String? }
// model VerificationToken { identifier String; token String @unique; expires DateTime; @@unique([identifier, token]) }

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const getSecret = (key: string) => new TextEncoder().encode(process.env[key] || 'change-me');

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

// Redis rate limit - 5 attempts per 15 min
export const checkRateLimit = async (redis: any, key: string, limit=5, windowSec=900) => {
  const c = await redis.incr(key);
  if(c===1) await redis.expire(key, windowSec);
  if(c>limit) throw new Error('Too many attempts');
};

export const createTokens = async (userId: string) => {
  const access = await new SignJWT({ userId }).setProtectedHeader({alg:'HS256'}).setExpirationTime('15m').sign(getSecret('JWT_SECRET'));
  const refresh = await new SignJWT({ userId }).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(getSecret('REFRESH_SECRET'));
  return { accessToken: access, refreshToken: refresh };
};

export const socialProviders = {
  google: { clientId: process.env.GOOGLE_CLIENT_ID },
  github: { clientId: process.env.GITHUB_CLIENT_ID },
  facebook: { clientId: process.env.FACEBOOK_CLIENT_ID },
};

export const authMiddleware = async (req: any) => {
  const token = req.headers.authorization?.replace('Bearer ','');
  if(!token) throw new Error('Unauthorized');
  const { payload } = await jwtVerify(token, getSecret('JWT_SECRET'));
  return payload as { userId: string };
};
