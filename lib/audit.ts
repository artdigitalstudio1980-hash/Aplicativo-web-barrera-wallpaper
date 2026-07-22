import { prisma } from './prisma';

interface AuditEntry {
  action: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  email?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

export async function logAudit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({ data: entry });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
