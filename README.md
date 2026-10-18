# 🚀 Master Kit

**One Private Repo → Build Any Project in 5 Minutes.**

Production-ready, secure, and scalable boilerplate for Full Stack Developers. No more rebuilding Auth, Payments, and WhatsApp for every client.

> **Core Principle:** Your client's data stays in their database, not mine. Secure by default, scalable by design.

### 📦 What's Inside?

**8 Plug-n-Play Packages:**
- **@maasters/auth** - Email, Mobile OTP, Google, GitHub, Facebook OAuth - JWT (15m) + Refresh Rotation (7d), bcrypt 12 rounds
- **@maasters/rbac** - Config-driven Roles & Permissions per project
- **@maasters/whatsapp** - WhatsApp Business Cloud API with Queue + Webhook Verify
- **@maasters/razorpay** - Card, UPI, NetBanking, Bank Account Payouts (RazorpayX) with Signature Verification
- **@maasters/admin-ui** - Themeable Admin Dashboard (logo, colors, menu via `admin.config.ts`)
- **@maasters/notifications** - Unified `notify()` for Email, WhatsApp, In-App
- **@maasters/logs** - Audit Logs with IP + UserAgent
- **@maasters/search-filter** - Sort, Filter, Full-text Search, Pagination (max 100 limit protection)

**3 Templates:**
- `nextjs-boilerplate` - For React / Next.js / Shopify (Remix)
- `wordpress-plugin` - Creates tables via $wpdb in client's WP DB
- `flutter-sdk` - For Mobile Apps (KaichiChalake etc.)

### 🔐 Security First
- Helmet, Zod Validation, CORS, Rate Limiting (Redis - 5 req/15min on Auth, 100 req/min on API)
- Razorpay & WhatsApp Webhook Signature Verification (No Fake Payments)
- Audit Logs, IP Blocking, No Secrets in Repo

### 🏗️ Tech Stack
Turborepo + pnpm + TypeScript + Fastify + Prisma (PostgreSQL) + Redis + shadcn/ui

### ⚡ Installation (npm & pnpm both work)
```bash
# Public packages
npm install @maasters/auth @maasters/rbac
# or
pnpm add @maasters/auth @maasters/rbac

# Private packages (needs GitHub token)
npm install @maasters/whatsapp @maasters/razorpay @maasters/admin-ui
