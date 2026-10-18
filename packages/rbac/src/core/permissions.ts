
import type { Permission } from './types.js';

// Permission matching with wildcard support
// Examples:
// hasPermission(['user:read'], 'user:read') => true
// hasPermission(['user:*'], 'user:read') => true
// hasPermission(['order:*:own'], 'order:delete:own') => true
// hasPermission(['*:*'], 'anything:anything') => true

export const matchPermission = (granted: Permission, requested: Permission): boolean => {
  const grantedParts = granted.split(':');
  const requestedParts = requested.split(':');

  if (grantedParts.length > requestedParts.length) return false;

  for (let i = 0; i < grantedParts.length; i++) {
    const g = grantedParts[i];
    const r = requestedParts[i];
    if (g === '*') continue;
    if (g !== r) return false;
  }

  // If granted is shorter, it implies wildcard for rest
  // e.g. 'user' matches 'user:read'
  if (grantedParts.length < requestedParts.length) {
    const lastGranted = grantedParts[grantedParts.length - 1];
    if (lastGranted === '*' || grantedParts.length === 1) return true;
    // 'user:read' should NOT match 'user:read:own' unless explicit
    return false;
  }

  return true;
};

export const hasPermission = (grantedPermissions: Permission[], requested: Permission | Permission[]): boolean => {
  const requestedList = Array.isArray(requested) ? requested : [requested];
  
  for (const req of requestedList) {
    for (const grant of grantedPermissions) {
      if (matchPermission(grant, req)) return true;
    }
  }
  return false;
};

export const hasAllPermissions = (granted: Permission[], requested: Permission[]): boolean => {
  return requested.every(req => hasPermission(granted, req));
};

export const hasAnyPermission = hasPermission;

// Permission helpers for client code
export const Permissions = {
  // User management
  userRead: 'user:read',
  userWrite: 'user:write',
  userDelete: 'user:delete',
  userCreate: 'user:create',
  userList: 'user:list',

  // Order
  orderRead: 'order:read',
  orderWrite: 'order:write',
  orderDelete: 'order:delete',
  orderAll: 'order:*',

  // Product
  productRead: 'product:read',
  productWrite: 'product:write',
  productDelete: 'product:delete',
  productAll: 'product:*',

  // Admin
  adminAll: 'admin:*',
  superAdmin: '*:*',
} as const;

// Role presets
export const DefaultRoles = {
  SUPER_ADMIN: {
    name: 'super_admin',
    description: 'Full access',
    permissions: ['*:*'],
  },
  ADMIN: {
    name: 'admin',
    description: 'Admin access',
    permissions: ['admin:*', 'user:*', 'order:*', 'product:*'],
  },
  MANAGER: {
    name: 'manager',
    description: 'Manager - can manage orders and products',
    permissions: ['user:read', 'user:list', 'order:*', 'product:*'],
  },
  USER: {
    name: 'user',
    description: 'Regular user',
    permissions: ['order:read:own', 'order:create:own', 'user:read:own', 'user:write:own'],
  },
  GUEST: {
    name: 'guest',
    description: 'Guest - read only',
    permissions: ['product:read'],
  },
} as const;
