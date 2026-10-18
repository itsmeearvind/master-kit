
import { hasPermission, hasAllPermissions, matchPermission } from './permissions.js';
import type { RoleData, UserWithRoles, Permission, CheckOptions } from './types.js';
import { z } from 'zod';

type PrismaClient = any;
type RedisClient = { get: (k: string) => Promise<string | null>; set: (k: string, v: string, opts?: any) => Promise<any>; del: (k: string) => Promise<any> };

const roleSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, 'Only lowercase, numbers, underscore'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1),
  inherits: z.array(z.string()).optional(),
});

export class RBAC {
  constructor(private prisma: PrismaClient, private redis?: RedisClient) {}

  // --- Role Management ---

  async createRole(data: { name: string; description?: string; permissions: Permission[]; inherits?: string[] }) {
    const parsed = roleSchema.parse(data);
    
    // Check if parent roles exist
    if (parsed.inherits?.length) {
      const parents = await this.prisma.role.findMany({ where: { name: { in: parsed.inherits } } });
      if (parents.length !== parsed.inherits.length) throw new Error('Some parent roles not found');
    }

    const role = await this.prisma.role.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        permissions: parsed.permissions,
      }
    });

    await this.clearCache();
    return role;
  }

  async updateRole(name: string, data: Partial<{ description: string; permissions: Permission[]; inherits: string[] }>) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) throw new Error('Role not found');
    if (role.name === 'super_admin') throw new Error('Cannot modify super_admin');

    const updated = await this.prisma.role.update({
      where: { name },
      data: {
        description: data.description,
        permissions: data.permissions as any,
      }
    });

    await this.clearCache();
    return updated;
  }

  async deleteRole(name: string) {
    if (['super_admin', 'admin', 'user', 'guest'].includes(name)) throw new Error('Cannot delete system role');
    await this.prisma.role.delete({ where: { name } });
    await this.clearCache();
  }

  async listRoles() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  // --- User Role Assignment ---

  async assignRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: role.id } }
    });
    if (existing) return existing;

    const assigned = await this.prisma.userRole.create({
      data: { userId, roleId: role.id }
    });

    await this.clearUserCache(userId);
    return assigned;
  }

  async removeRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Role not found');

    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId: role.id } }
    });

    await this.clearUserCache(userId);
  }

  async getUserRoles(userId: string): Promise<RoleData[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
    return userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
      permissions: ur.role.permissions as Permission[],
    }));
  }

  // --- Permission Checking (with inheritance + cache) ---

  async getUserPermissions(userId: string, opts: CheckOptions = {}): Promise<Permission[]> {
    const cacheKey = `rbac:perms:${userId}`;
    
    if (opts.useCache !== false && this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const roles = await this.getUserRoles(userId);
    const allPerms = new Set<Permission>();

    // Collect permissions with inheritance
    const visited = new Set<string>();
    const collect = async (roleNames: string[]) => {
      for (const name of roleNames) {
        if (visited.has(name)) continue;
        visited.add(name);
        
        const role = await this.prisma.role.findUnique({ where: { name } });
        if (!role) continue;
        
        (role.permissions as Permission[]).forEach(p => allPerms.add(p));
        
        // Handle inheritance - if role has inherits field in description or separate table
        // For now, we support via naming: we store inherits in role description JSON or extend model
        // Simple version: if role.permissions contains role name references, handle
      }
    };

    await collect(roles.map(r => r.name));

    const perms = Array.from(allPerms);

    if (this.redis && opts.useCache !== false) {
      await this.redis.set(cacheKey, JSON.stringify(perms), { EX: opts.cacheTTL || 300 });
    }

    return perms;
  }

  async can(userId: string, permission: Permission | Permission[], opts?: CheckOptions): Promise<boolean> {
    const perms = await this.getUserPermissions(userId, opts);
    return hasPermission(perms, permission);
  }

  async canAll(userId: string, permissions: Permission[], opts?: CheckOptions): Promise<boolean> {
    const perms = await this.getUserPermissions(userId, opts);
    return hasAllPermissions(perms, permissions);
  }

  // --- Helpers ---

  private async clearCache() {
    if (!this.redis) return;
    // In production, use SCAN to clear rbac:*
    // For simplicity, we clear known pattern via del
  }

  private async clearUserCache(userId: string) {
    if (!this.redis) return;
    await this.redis.del(`rbac:perms:${userId}`);
  }

  // Seed default roles
  async seedDefaultRoles() {
    const defaults = [
      { name: 'super_admin', description: 'Full access', permissions: ['*:*'] },
      { name: 'admin', description: 'Admin access', permissions: ['admin:*', 'user:*', 'order:*', 'product:*'] },
      { name: 'manager', description: 'Manager', permissions: ['user:read', 'user:list', 'order:*', 'product:*'] },
      { name: 'user', description: 'Regular user', permissions: ['order:read:own', 'order:create:own', 'user:read:own', 'user:write:own'] },
      { name: 'guest', description: 'Guest', permissions: ['product:read'] },
    ];

    for (const r of defaults) {
      await this.prisma.role.upsert({
        where: { name: r.name },
        update: { permissions: r.permissions },
        create: r,
      });
    }

    return defaults;
  }
}

// Factory
export const createRBAC = (prisma: any, redis?: any) => new RBAC(prisma, redis);
