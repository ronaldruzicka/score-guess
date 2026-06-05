import { z } from "zod";

const emailSchema = z
  .string()
  .min(1, { message: "Email is required." })
  .pipe(z.email({ message: "Enter a valid email address." }));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required." }),
});

export const signupSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1, { message: "Name is required." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
