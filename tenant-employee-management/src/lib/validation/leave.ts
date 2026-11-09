import { z } from "zod";

export const leaveRequestSchema = z.object({
  leaveType: z.enum(["ANNUAL", "SICK", "CASUAL", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  reason: z.string().trim().min(5).max(2000)
}).refine((v) => v.endDate >= v.startDate, {
  path: ["endDate"],
  message: "End date must be on or after start date"
});
