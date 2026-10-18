
export type RolesConfig = Record<string, string[]>;
export const hasPermission = (userRoles: string[], required: string, config: RolesConfig) => {
  for(const role of userRoles){
    const perms = config[role] || [];
    if(perms.includes('*') || perms.includes(required) || perms.includes(required.split(':')[0]+':*')) return true;
  }
  return false;
};
export const rbacMiddleware = (perm: string, getConfig: () => RolesConfig) => {
  return (user: { roles: string[] }) => {
    if(!hasPermission(user.roles, perm, getConfig())) throw new Error('Forbidden: '+perm);
  };
};
// model Role { id String @id; name String @unique; permissions Json }
// model UserRole { userId String; roleId String; @@id([userId, roleId]) }
