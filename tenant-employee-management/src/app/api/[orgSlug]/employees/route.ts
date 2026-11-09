import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireTenant } from "@/lib/auth/tenant";
import { listEmployees, createEmployee } from "@/features/employees/service";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/lib/auth/types";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ orgSlug: string }> };

function failure(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
  }
  if (error instanceof AuthenticationError) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (error instanceof AuthorizationError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (error instanceof TenantAccessError) return NextResponse.json({ error: "Organization access denied" }, { status: 404 });
  console.error("Employee API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { orgSlug } = await params;
    const context = await requireTenant(orgSlug);
    const q = request.nextUrl.searchParams;
    const result = await listEmployees(context, {
      search: q.get("search")?.slice(0, 100) || undefined,
      departmentId: q.get("departmentId") || undefined,
      status: (q.get("status") as "ACTIVE" | "PROBATION" | "ON_LEAVE" | null) ?? undefined,
      page: Number(q.get("page") ?? 1),
      pageSize: Number(q.get("pageSize") ?? 20)
    });
    return NextResponse.json(result);
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { orgSlug } = await params;
    const context = await requireTenant(orgSlug);
    const body: unknown = await request.json();
    const employee = await createEmployee(context, body);
    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}
