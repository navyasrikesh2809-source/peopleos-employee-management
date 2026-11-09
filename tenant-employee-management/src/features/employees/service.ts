import "server-only";
import { Prisma } from "@prisma/client";
import { withTenant } from "@/lib/db/tenant-db";
import { assertPermission } from "@/lib/auth/permissions";
import { employeeSchema, type EmployeeInput } from "@/lib/validation/employee";
import { writeAudit } from "@/lib/audit";
import type { TenantContext } from "@/lib/auth/types";

export async function listEmployees(
  context: TenantContext,
  filters: { search?: string; departmentId?: string; status?: "ACTIVE" | "PROBATION" | "ON_LEAVE"; page?: number; pageSize?: number }
) {
  assertPermission(context, "employee:read");
  const page = Math.max(1, filters.page ?? 1);
  const take = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.EmployeeWhereInput = {
    organizationId: context.organization.id,
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? {
      OR: [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { employeeCode: { contains: filters.search, mode: "insensitive" } }
      ]
    } : {})
  };

  return withTenant(context, async (tx) => {
    const [items, total] = await Promise.all([
      tx.employee.findMany({
        where,
        select: {
          id: true, employeeCode: true, firstName: true, lastName: true,
          email: true, designation: true, status: true, employmentType: true,
          department: { select: { name: true } }
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        skip: (page - 1) * take,
        take
      }),
      tx.employee.count({ where })
    ]);
    return { items, pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) } };
  });
}

export async function createEmployee(context: TenantContext, input: unknown) {
  assertPermission(context, "employee:create");
  const data: EmployeeInput = employeeSchema.parse(input);

  return withTenant(context, async (tx) => {
    const employee = await tx.employee.create({
      data: {
        organizationId: context.organization.id,
        ...data,
        joiningDate: new Date(`${data.joiningDate}T00:00:00.000Z`),
        salary: new Prisma.Decimal(data.salary),
        departmentId: data.departmentId ?? null,
        managerId: data.managerId ?? null,
        phone: data.phone ?? null
      },
      select: { id: true, employeeCode: true, firstName: true, lastName: true, email: true }
    });
    await writeAudit(tx, context, {
      action: "CREATE",
      entityType: "Employee",
      entityId: employee.id,
      newValues: { employeeCode: employee.employeeCode, email: employee.email }
    });
    return employee;
  });
}
