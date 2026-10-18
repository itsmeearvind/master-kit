
# @maasters/rbac

Full RBAC with wildcard permissions, inheritance, Redis cache.

## Features
- Wildcard: `user:*` matches `user:read`, `order:*:own` matches `order:delete:own`
- Roles: super_admin, admin, manager, user, guest
- Inheritance support
- Redis cache 5min
- Middleware for Express, Fastify, Next.js
- Themeable Admin UI helper

## Setup

```ts
import { createRBAC } from '@maasters/rbac';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

const rbac = createRBAC(prisma, redis);

// Seed defaults
await rbac.seedDefaultRoles();

// Assign role
await rbac.assignRole(userId, 'admin');

// Check
const can = await rbac.can(userId, 'user:delete');
const canAll = await rbac.canAll(userId, ['order:read', 'order:write']);
```

## Middleware

Express/Fastify:
```ts
app.get('/admin/users', authMiddleware, requirePermission(rbac, 'user:list'), handler);
app.delete('/admin/users/:id', authMiddleware, requirePermission(rbac, 'user:delete'), handler);
```

Next.js:
```ts
export const GET = withPermission(rbac, 'user:list', async (req) => {
  const users = await prisma.user.findMany();
  return Response.json(users);
});
```

## Admin UI Theming
```ts
const access = await getUIAccess(rbac, userId);
// access.canViewUsers, access.isAdmin etc - use to show/hide UI
```

## Permission Format
`resource:action:scope`
- `user:read` - read any user
- `user:read:own` - read own profile only
- `order:*` - all order actions
- `*:*` - super admin
