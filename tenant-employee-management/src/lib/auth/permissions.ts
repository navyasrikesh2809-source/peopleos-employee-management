import "server-only";
import type { MembershipRole } from "@prisma/client";
import type { TenantContext } from "./types";
import { AuthorizationError } from "./types";

export type Permission =
  | "organization:delete" | "billing:manage"
  | "employee:create" | "employee:read" | "employee:update" | "employee:delete"
  | "salary:read" | "salary:update"
  | "membership:invite" | "membership:remove" | "membership:role:update"
  | "leave:request" | "leave:approve"
  | "attendance:record" | "attendance:read"
  | "review:create" | "review:read";

const grants: Record<MembershipRole, readonly Permission[]> = {
  OWNER: [
    "organization:delete", "billing:manage", "employee:create", "employee:read",
    "employee:update", "employee:delete", "salary:read", "salary:update",
    "membership:invite", "membership:remove", "membership:role:update",
    "leave:approve", "attendance:read", "review:create", "review:read"
  ],
  ADMIN: [
    "employee:create", "employee:read", "employee:update", "employee:delete",
    "salary:read", "salary:update", "membership:invite", "membership:remove",
    "membership:role:update", "leave:approve", "attendance:read",
    "review:create", "review:read"
  ],
  MANAGER: ["employee:read", "leave:approve", "attendance:read", "review:create", "review:read"],
  EMPLOYEE: ["leave:request", "attendance:record"]
};

export function assertPermission(context: TenantContext, permission: Permission): void {
  if (!grants[context.membership.role].includes(permission)) {
    throw new AuthorizationError(`Permission denied: ${permission}`);
  }
}
