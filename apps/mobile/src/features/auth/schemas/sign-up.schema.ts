import { z } from 'zod';

export const PASSWORD_RULES = [
  { key: 'length', label: '8+ characters', test: (value: string) => value.length >= 8 },
  { key: 'number', label: '1 number', test: (value: string) => /\d/.test(value) },
  { key: 'upper', label: '1 uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { key: 'lower', label: '1 lowercase', test: (value: string) => /[a-z]/.test(value) },
  { key: 'special', label: '1 special', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required.')
      .email('Enter a valid email address.'),
    password: z
      .string()
      .min(1, 'Password is required.')
      .refine(
        (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
        'Password must meet all strength requirements.',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
