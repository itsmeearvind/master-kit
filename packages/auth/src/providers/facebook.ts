
export const facebookProvider = {
  getAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID!,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
      scope: 'email,public_profile',
      state,
    });
    return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
  },

  async handleCallback(prisma: any, code: string, state: string, expectedState: string) {
    if (state !== expectedState) throw new Error('Invalid state');

    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokens = await tokenRes.json() as any;
    if (tokens.error) throw new Error(tokens.error.message);

    const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.access_token}`);
    const profile = await userRes.json() as any;

    if (!profile.email) throw new Error('Facebook email permission required');

    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: profile.email, name: profile.name, image: profile.picture?.data?.url, emailVerified: new Date() }
      });
    }

    const existing = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: 'facebook', providerAccountId: profile.id } }
    });

    if (!existing) {
      await prisma.account.create({
        data: { userId: user.id, type: 'oauth', provider: 'facebook', providerAccountId: profile.id, access_token: tokens.access_token }
      });
    }

    return user;
  }
};
