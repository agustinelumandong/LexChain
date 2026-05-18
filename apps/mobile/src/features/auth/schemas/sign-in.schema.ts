import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .trim()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
