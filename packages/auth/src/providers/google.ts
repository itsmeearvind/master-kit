
import { z } from 'zod';

export const googleConfig = {
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  scope: 'openid email profile',
};

export const googleProvider = {
  // Step 1: Get login URL - client calls this
  getAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: 'code',
      scope: googleConfig.scope,
      state, // CSRF protection - must verify on callback
      access_type: 'offline',
      prompt: 'consent',
    });
    return `${googleConfig.authUrl}?${params.toString()}`;
  },

  // Step 2: Callback - exchange code for tokens
  async handleCallback(prisma: any, code: string, state: string, expectedState: string) {
    if (state !== expectedState) throw new Error('Invalid state - CSRF attack?');

    // Exchange code
    const tokenRes = await fetch(googleConfig.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      })
    });

    if (!tokenRes.ok) throw new Error('Failed to get tokens from Google');
    const tokens = await tokenRes.json() as any;

    // Get user info
    const userRes = await fetch(googleConfig.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await userRes.json() as any;

    // Find or create
    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: 'google', providerAccountId: profile.id } },
      include: { user: true }
    });

    if (existingAccount) {
      return existingAccount.user;
    }

    // Check if email exists
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          emailVerified: new Date(),
        }
      });
    }

    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: profile.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    });

    return user;
  }
};
