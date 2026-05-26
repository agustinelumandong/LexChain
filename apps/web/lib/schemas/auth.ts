import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const signInResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().default("bearer"),
  expires_in: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string(),
  }).passthrough(),
});

export type SignInResponse = z.infer<typeof signInResponseSchema>;
