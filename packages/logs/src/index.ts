
export const auditLog = async (prisma: any, data: { userId?: string; action: string; entity: string; entityId?: string; ip?: string; metadata?: any }) => {
  return prisma.auditLog.create({ data: { ...data, createdAt: new Date() } });
};
// model AuditLog { id String @id @default(cuid()); userId String?; action String; entity String; entityId String?; ip String?; metadata Json?; createdAt DateTime @default(now()); @@index([entity, entityId]) }
