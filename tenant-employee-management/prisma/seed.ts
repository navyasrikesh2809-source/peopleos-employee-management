import { PrismaClient, MembershipRole, MembershipStatus, EmployeeStatus, EmploymentType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const organizations = [
  { name: "Northstar Digital Labs", slug: "northstar-digital", departments: ["Engineering", "Product", "People", "Operations"] },
  { name: "Bluepeak Systems", slug: "bluepeak-systems", departments: ["Technology", "Finance", "Customer Success", "Design"] }
];

const people = [
  { role: MembershipRole.OWNER, first: "Aarav", last: "Menon", title: "Founder" },
  { role: MembershipRole.ADMIN, first: "Meera", last: "Iyer", title: "HR Administrator" },
  { role: MembershipRole.MANAGER, first: "Kabir", last: "Shah", title: "Engineering Manager" },
  { role: MembershipRole.MANAGER, first: "Ananya", last: "Rao", title: "Operations Manager" },
  { role: MembershipRole.EMPLOYEE, first: "Rohan", last: "Das", title: "Software Engineer" },
  { role: MembershipRole.EMPLOYEE, first: "Ishita", last: "Nair", title: "QA Analyst" },
  { role: MembershipRole.EMPLOYEE, first: "Dev", last: "Kapoor", title: "Product Associate" },
  { role: MembershipRole.EMPLOYEE, first: "Tara", last: "Pillai", title: "UI Designer" },
  { role: MembershipRole.EMPLOYEE, first: "Vihaan", last: "Reddy", title: "Support Specialist" }
];

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error("Set SEED_PASSWORD to a value of at least 12 characters before seeding.");
  }
  const passwordHash = await hash(password, 12);

  for (const [orgIndex, orgData] of organizations.entries()) {
    const org = await prisma.organization.upsert({
      where: { slug: orgData.slug },
      update: { name: orgData.name },
      create: { name: orgData.name, slug: orgData.slug, currency: "INR", timezone: "Asia/Kolkata" }
    });

    const departments = await Promise.all(orgData.departments.map((name) =>
      prisma.department.upsert({
        where: { organizationId_name: { organizationId: org.id, name } },
        update: {},
        create: { organizationId: org.id, name }
      })
    ));

    const employeeIds: string[] = [];

    for (const [index, person] of people.entries()) {
      const email = `${person.first.toLowerCase()}.${person.last.toLowerCase()}@${org.slug}.example`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { firstName: person.first, lastName: person.last, passwordHash },
        create: { email, firstName: person.first, lastName: person.last, passwordHash, emailVerified: new Date() }
      });

      await prisma.membership.upsert({
        where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
        update: { role: person.role, status: MembershipStatus.ACTIVE },
        create: { organizationId: org.id, userId: user.id, role: person.role, status: MembershipStatus.ACTIVE }
      });

      const department = departments[index % departments.length];
      const managerId = index >= 4 ? employeeIds[2 + ((index - 4) % 2)] : null;
      const employee = await prisma.employee.upsert({
        where: { organizationId_employeeCode: { organizationId: org.id, employeeCode: `EMP-${orgIndex + 1}-${String(index + 1).padStart(3, "0")}` } },
        update: { firstName: person.first, lastName: person.last, designation: person.title, departmentId: department.id },
        create: {
          organizationId: org.id,
          userId: user.id,
          employeeCode: `EMP-${orgIndex + 1}-${String(index + 1).padStart(3, "0")}`,
          firstName: person.first,
          lastName: person.last,
          email,
          phone: `+91 9${String(700000000 + orgIndex * 10000000 + index * 1234567).slice(0, 9)}`,
          designation: person.title,
          employmentType: index === 8 ? EmploymentType.INTERN : EmploymentType.FULL_TIME,
          status: index === 8 ? EmployeeStatus.PROBATION : EmployeeStatus.ACTIVE,
          departmentId: department.id,
          managerId,
          joiningDate: new Date(Date.UTC(2023 + (index % 3), (index * 2) % 12, 1 + index)),
          salary: 30000 + index * 12500 + orgIndex * 7000,
          salaryCurrency: "INR"
        }
      });
      employeeIds[index] = employee.id;
    }
  }

  console.log("Seed complete: 2 organizations, 18 users, 18 employees.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
