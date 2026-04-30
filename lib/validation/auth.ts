import { z } from "zod";

export const authFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupFormSchema = authFormSchema.extend({
  name: z.string().trim().optional(),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
