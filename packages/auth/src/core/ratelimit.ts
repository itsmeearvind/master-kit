
type RedisClient = { incr: (k: string) => Promise<number>; expire: (k: string, s: number) => Promise<any>; ttl: (k: string) => Promise<number> };

export const checkRateLimit = async (
  redis: RedisClient,
  key: string,
  limit = 5,
  windowSec = 900 // 15 min
) => {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSec);
  
  if (count > limit) {
    const ttl = await redis.ttl(key);
    throw new Error(`Too many attempts. Try after ${ttl}s`);
  }
  return { remaining: limit - count };
};

// Specific limiters
export const authRateLimiters = {
  login: (redis: RedisClient, ip: string) => checkRateLimit(redis, `login:${ip}`, 5, 900),
  otp: (redis: RedisClient, identifier: string) => checkRateLimit(redis, `otp:${identifier}`, 3, 300), // 3 OTP per 5 min
  signup: (redis: RedisClient, ip: string) => checkRateLimit(redis, `signup:${ip}`, 3, 3600), // 3 signups per hour per IP
};
