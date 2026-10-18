
import { SignJWT, jwtVerify } from 'jose';

const getSecret = (key: string) => {
  const val = process.env[key];
  if(!val) throw new Error(`Missing env ${key}`);
  return new TextEncoder().encode(val);
};

export type TokenPayload = { userId: string; email?: string; roles?: string[] };

export const createAccessToken = async (payload: TokenPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret('JWT_SECRET'));
};

export const createRefreshToken = async (payload: TokenPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret('REFRESH_SECRET'));
};

export const createTokens = async (payload: TokenPayload) => {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(payload),
    createRefreshToken(payload)
  ]);
  return { accessToken, refreshToken };
};

export const verifyAccessToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getSecret('JWT_SECRET'));
  return payload as TokenPayload;
};

export const verifyRefreshToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getSecret('REFRESH_SECRET'));
  return payload as TokenPayload;
};

export const createEmailVerifyToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
