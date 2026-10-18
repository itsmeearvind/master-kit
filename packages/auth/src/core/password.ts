
import bcrypt from 'bcryptjs';

export const hashPassword = async (plain: string) => {
  if(plain.length < 8) throw new Error('Password must be 8+ chars');
  return bcrypt.hash(plain, 12);
};

export const verifyPassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};
