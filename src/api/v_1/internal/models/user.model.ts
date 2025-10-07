import { z } from 'zod';

export const CreateUserBodySchema = z.object({
  userName: z.string(),
  email: z.string().email(),
  companyId: z.string().optional(),
  profilePhoto: z.string(),
});

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;

export const UpdateTempPasswordBodySchema = z.object({
  newPassword: z.string(),
});

export type UpdateTempPasswordBody = z.infer<typeof UpdateTempPasswordBodySchema>;

export const UpdateUserBodySchema = z.object({
  pageName: z.string().optional(),
  creatorName: z.string().optional(),
  is18Plus: z.boolean().optional(),
  profilePhoto: z.string().optional(),
});

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
