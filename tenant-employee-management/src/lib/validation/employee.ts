import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.email().max(255),
  phone: z.string().trim().max(30).optional(),
  employeeCode: z.string().trim().min(1).max(50),
  designation: z.string().trim().min(1).max(150),
  departmentId: z.uuid().optional(),
  managerId: z.uuid().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]),
  joiningDate: z.iso.date(),
  salary: z.coerce.number().finite().min(0).max(1_000_000_000),
  salaryCurrency: z.string().length(3).default("INR")
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
