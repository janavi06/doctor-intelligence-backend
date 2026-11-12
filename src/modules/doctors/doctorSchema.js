
import { z } from "zod";

export const doctorSchema = z.object({
  doctor_id: z.string().trim().min(1),
  "S.No": z.string().optional().default(""),
  "Doctor Name": z.string().trim().min(1),
  "Profile Page": z.string().optional().default(""),
  Designation: z.string().optional().default(""),
  Speciality: z.string().trim().optional().default(""),
  "Educational Qualification": z.string().optional().default(""),
  "Exp (In Yrs)": z.string().optional().default(""),
  "Working at": z.string().optional().default(""),
  City: z.string().trim().optional().default(""),
  Branch: z.string().optional().default(""),
  State: z.string().optional().default(""),
  Source: z.string().optional().default(""),
  "Last Verified": z.string().optional().default(""),
  "Reg. ID": z.string().optional().default(""),
});

export function normalizeDoctor(doctor) {
  return {
    ...doctor,
    doctor_id: doctor.doctor_id.trim(),
    "Doctor Name": doctor["Doctor Name"].trim(),
    Speciality: doctor.Speciality.trim(),
    City: doctor.City.trim(),
  };
}
