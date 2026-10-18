
import type { Permission } from './core/types.js';

type AuthUser = { userId: string; email?: string; roles?: string[] };

// Express / Fastify style middleware factory
export const requirePermission = (rbac: any, permission: Permission | Permission[]) => {
  return async (req: any, res: any, next?: any) => {
    const user: AuthUser | undefined = req.user || req.auth?.user;
    
    if (!user?.userId) {
      if (res?.status) return res.status(401).json({ error: 'Unauthorized' });
      throw new Error('Unauthorized');
    }

    const allowed = await rbac.can(user.userId, permission);
    
    if (!allowed) {
      if (res?.status) return res.status(403).json({ error: 'Forbidden', required: permission });
      throw new Error(`Forbidden - requires ${Array.isArray(permission) ? permission.join(', ') : permission}`);
    }

    if (next) next();
  };
};

export const requireRole = (rbac: any, role: string | string[]) => {
  return async (req: any, res: any, next?: any) => {
    const user: AuthUser | undefined = req.user || req.auth?.user;
    if (!user?.userId) {
      if (res?.status) return res.status(401).json({ error: 'Unauthorized' });
      throw new Error('Unauthorized');
    }

    const roles = await rbac.getUserRoles(user.userId);
    const roleNames = roles.map((r: any) => r.name);
    const required = Array.isArray(role) ? role : [role];
    
    const hasRole = required.some(r => roleNames.includes(r));
    
    if (!hasRole) {
      if (res?.status) return res.status(403).json({ error: 'Forbidden - role required', required: role });
      throw new Error(`Forbidden - requires role ${required.join(', ')}`);
    }

    if (next) next();
  };
};

// Next.js App Router helper
export const withPermission = (rbac: any, permission: Permission | Permission[], handler: any) => {
  return async (req: Request, context?: any) => {
    // Expect userId from auth middleware / JWT
    const userId = (req as any).userId || (context?.params?.userId);
    
    // In Next.js, you would get user from auth() helper
    // This is a simplified version
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    
    const allowed = await rbac.can(userId, permission);
    if (!allowed) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    
    return handler(req, context);
  };
};

// For themeable Admin UI - returns what UI elements to show
export const getUIAccess = async (rbac: any, userId: string) => {
  const perms = await rbac.getUserPermissions(userId);
  
  return {
    canViewUsers: perms.some((p: string) => p.includes('user:read') || p.includes('user:*') || p === '*:*'),
    canEditUsers: perms.some((p: string) => p.includes('user:write') || p.includes('user:*') || p === '*:*'),
    canViewOrders: perms.some((p: string) => p.includes('order:read') || p.includes('order:*') || p === '*:*'),
    canManageOrders: perms.some((p: string) => p.includes('order:write') || p.includes('order:*') || p === '*:*'),
    canViewProducts: perms.some((p: string) => p.includes('product:read') || p.includes('product:*') || p === '*:*'),
    canManageProducts: perms.some((p: string) => p.includes('product:write') || p.includes('product:*') || p === '*:*'),
    isAdmin: perms.includes('*:*') || perms.includes('admin:*'),
    permissions: perms,
  };
};
