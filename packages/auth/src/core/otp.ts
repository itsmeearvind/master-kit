
import crypto from 'crypto';

export const generateOTP = (length = 6) => {
  // Secure 6-digit OTP
  const min = Math.pow(10, length-1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max).toString();
};

export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const hashOTP = (otp: string) => {
  // Hash OTP before storing in DB (like password)
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const isOTPExpired = (expiresAt: Date) => {
  return new Date() > expiresAt;
};
