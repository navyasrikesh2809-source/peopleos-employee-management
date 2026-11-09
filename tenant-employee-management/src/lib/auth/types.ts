import type { MembershipRole } from "@prisma/client";

export interface TenantContext {
  user: { id: string; email: string };
  organization: { id: string; slug: string };
  membership: { id: string; role: MembershipRole };
}

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class TenantAccessError extends Error {
  constructor() {
    super("Organization access denied");
    this.name = "TenantAccessError";
  }
}
