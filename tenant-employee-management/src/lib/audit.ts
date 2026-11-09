import "server-only";
import type { Prisma, AuditAction } from "@prisma/client";
import type { TenantContext } from "@/lib/auth/types";

const REDACTED_KEYS = new Set([
  "password", "passwordHash", "token", "tokenHash",
  "accountNumber", "encryptedAccountNumber", "ifsc", "encryptedIfsc"
]);

function redact(value: unknown): Prisma.InputJsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => JSON.parse(JSON.stringify(item))) as Prisma.InputJsonValue;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = REDACTED_KEYS.has(key) ? "[REDACTED]" : item;
    }
    return JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;
  }
  return value as Prisma.InputJsonValue;
}

export async function writeAudit(
  tx: Prisma.TransactionClient,
  context: TenantContext,
  event: {
    action: AuditAction;
    entityType: string;
    entityId: string;
    oldValues?: unknown;
    newValues?: unknown;
  }
): Promise<void> {
  await tx.auditLog.create({
    data: {
      organizationId: context.organization.id,
      actorId: context.user.id,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      oldValues: event.oldValues === undefined ? undefined : redact(event.oldValues),
      newValues: event.newValues === undefined ? undefined : redact(event.newValues)
    }
  });
}
