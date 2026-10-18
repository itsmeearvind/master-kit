
export * from './core/password.js';
export * from './core/tokens.js';
export * from './core/otp.js';
export * from './core/ratelimit.js';
export * from './providers/email.js';
export * from './providers/phone.js';
export * from './providers/google.js';
export * from './providers/github.js';
export * from './providers/facebook.js';
export * from './middleware.js';

// Re-export for client convenience
export const AuthProviders = {
  email: 'email',
  phone: 'phone',
  google: 'google',
  github: 'github',
  facebook: 'facebook',
} as const;
