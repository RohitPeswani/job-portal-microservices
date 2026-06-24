import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
