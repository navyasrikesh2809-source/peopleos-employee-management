import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type { TenantContext } from "@/lib/auth/types";

export async function withTenant<T>(
  context: TenantContext,
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  if (!context.organization.id || !context.user.id) {
    throw new Error("Invalid tenant context");
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT
        set_config('app.current_organization_id', ${context.organization.id}, true),
        set_config('app.current_user_id', ${context.user.id}, true)
    `;
    return callback(tx);
  }, { maxWait: 5000, timeout: 15000 });
}
