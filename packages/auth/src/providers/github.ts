
export const githubProvider = {
  getAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: process.env.GITHUB_REDIRECT_URI!,
      scope: 'user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  },

  async handleCallback(prisma: any, code: string, state: string, expectedState: string) {
    if (state !== expectedState) throw new Error('Invalid state');

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      })
    });
    const tokens = await tokenRes.json() as any;
    if (tokens.error) throw new Error(tokens.error_description);

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await userRes.json() as any;

    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const emails = await emailRes.json() as any[];
    const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

    let user = await prisma.user.findUnique({ where: { email: primaryEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: primaryEmail, name: profile.name || profile.login, image: profile.avatar_url, emailVerified: new Date() }
      });
    }

    const existing = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: 'github', providerAccountId: profile.id.toString() } }
    });

    if (!existing) {
      await prisma.account.create({
        data: { userId: user.id, type: 'oauth', provider: 'github', providerAccountId: profile.id.toString(), access_token: tokens.access_token }
      });
    }

    return user;
  }
};
