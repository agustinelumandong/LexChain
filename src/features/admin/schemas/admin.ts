import { z } from "zod";

export const dashboardResponseSchema = z.object({
  total_users: z.number().int().nonnegative(),
  total_lawyers: z.number().int().nonnegative(),
  total_documents: z.number().int().nonnegative(),
  total_processed: z.number().int().nonnegative(),
  total_failed: z.number().int().nonnegative(),
  total_on_chain: z.number().int().nonnegative(),
  pending_invitations: z.number().int().nonnegative(),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  f_name: z.string(),
  l_name: z.string(),
  role: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export const adminUserListResponseSchema = z.object({
  users: z.array(adminUserSchema),
  total: z.number(),
});

export type AdminUserListResponse = z.infer<typeof adminUserListResponseSchema>;

export const invitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
  magic_link: z.string().nullable().optional(),
});

export const invitationListResponseSchema = z.object({
  invitations: z.array(invitationSchema),
});

export type InvitationListResponse = z.infer<typeof invitationListResponseSchema>;
