import { z } from "zod";

export const registerSchema = z.object({
  role: z.enum(["jobseeker", "recruiter"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  resume: z.any().optional(),
  bio: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "jobseeker") {
    if (!data.resume) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Resume is required for jobseekers",
        path: ["resume"],
      });
    } else if (data.resume instanceof File) {
      if (data.resume.type !== "application/pdf") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only PDF files are allowed",
          path: ["resume"],
        });
      }
      if (data.resume.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File size must be less than 5MB",
          path: ["resume"],
        });
      }
    }
  }
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
