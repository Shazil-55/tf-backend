import { z } from 'zod';
import { DefaultTable } from '../../../../helpers/entities';

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
  bio: z.string().optional(),
  coverPhoto: z.string().optional(),
  introVideo: z.string().optional(),
  themeColor: z.string().optional(),
  socialLinks: z.any().optional(),
});

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;

// Response interfaces
export interface CreatorProfile {
  pageName: string;
  creatorName: string;
  is18Plus: boolean;
  profilePhoto?: string;
  bio?: string;
  coverPhoto?: string;
  introVideo?: string;
  themeColor?: string;
  socialLinks?: any;
  isFollowing?: boolean;
  followersCount?: number;
}

export interface UserResponse extends DefaultTable {
  name: string;
  email: string;
  creator: CreatorProfile | null;
}
