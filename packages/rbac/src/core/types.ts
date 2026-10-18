
export type Permission = string; // format: resource:action or resource:action:scope -> e.g. user:read, order:*:own, product:delete:*

export type RoleData = {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  inherits?: string[]; // parent role names
  isSystem?: boolean;
};

export type UserWithRoles = {
  userId: string;
  roles: string[];
  permissions?: Permission[]; // direct permissions
};

export type CheckOptions = {
  useCache?: boolean;
  cacheTTL?: number;
};
