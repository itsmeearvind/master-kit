
import { verifyAccessToken } from './core/tokens.js';

export const authMiddleware = async (req: any) => {
  const authHeader = req.headers?.authorization || req.headers?.get?.('authorization');
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;
  
  if (!token) throw new Error('Unauthorized - No token');

  try {
    const payload = await verifyAccessToken(token);
    return payload; // { userId, email, roles }
  } catch {
    throw new Error('Unauthorized - Invalid token');
  }
};

// For Next.js middleware
export const withAuth = (handler: any) => {
  return async (req: any, res: any) => {
    try {
      const user = await authMiddleware(req);
      req.user = user;
      return handler(req, res);
    } catch (e: any) {
      return res.status(401).json({ error: e.message });
    }
  };
};
