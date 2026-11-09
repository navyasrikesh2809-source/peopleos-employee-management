import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { AuthenticationError, TenantAccessError, type TenantContext } from "./types";

export async function requireTenant(slug: string): Promise<TenantContext> {
  const user = await getSessionUser();
  if (!user) throw new AuthenticationError();

  // Bootstrap lookup: the requested slug is only a selector.
  // The authenticated user's active membership is the authorization proof.
  const membership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      organization: { slug, status: "ACTIVE" }
    },
    select: {
      id: true,
      role: true,
      organization: { select: { id: true, slug: true } }
    }
  });

  if (!membership) throw new TenantAccessError();

  return {
    user,
    organization: membership.organization,
    membership: { id: membership.id, role: membership.role }
  };
}
