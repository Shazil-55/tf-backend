import { Db } from '../../../../database/db';
import { AppError, BadRequest } from '../../../../helpers/errors';
import { Logger } from '../../../../helpers/logger';
import { Entities, Hash } from '../../../../helpers';
import * as UserModels from '../models/user.model';
import * as AuthModel from '../models/auth.model';
import { User } from '../../../../helpers/entities';
import * as Token from '../../../../helpers/token';
import { generatePassword } from '../../../../helpers/generateRandomPassword';
import { hashPassword } from '../../../../helpers/hash';
import { generateRandomOTP } from '../../../../helpers/generateRandomOTP';
import moment from 'moment';
import { EmailService } from '../../../../helpers/email';

export class UserService {
  private db: Db;
  private emailService: EmailService;

  constructor(args: { db: Db }) {
    Logger.info('UserService initialized...');
    this.db = args.db;
    this.emailService = new EmailService();
  }

  public async GetUserById(userId: string): Promise<UserModels.UserResponse> {
    Logger.info('UserService.GetUserById', { userId });

    const user = await this.db.v1.User.GetUser({ id: userId });

    if (!user) throw new BadRequest('User not found');

    // Structure the response
    const response: UserModels.UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      creator: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // If user has creator fields, add them to the creator object
    if (user.pageName) {
      response.creator = {
        pageName: user.pageName,
        creatorName: user.creatorName!,
        is18Plus: user.is18Plus || false,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        coverPhoto: user.coverPhoto,
        introVideo: user.introVideo,
        themeColor: user.themeColor,
        socialLinks: user.socialLinks,
      };
    }

    return response;
  }

  public async UpdateUser(userId: string, updateData: Partial<User>): Promise<void> {
    Logger.info('UserService.UpdateUser', { userId, updateData });

    const updatedUser = await this.db.v1.User.UpdateUser(userId, updateData);

    if (!updatedUser) throw new BadRequest('User not found or update failed');

  }

  public async GetAllCreators(currentUserId?: string): Promise<UserModels.CreatorProfile[]> {
    Logger.info('UserService.GetAllCreators', { currentUserId });

    const creators = await this.db.v1.User.GetAllCreatorsWithFollowStatus(currentUserId);

    if (!creators) return [];

    return creators.map((creator: any) => ({
      pageName: creator.pageName!,
      creatorName: creator.creatorName!,
      is18Plus: creator.is18Plus || false,
      profilePhoto: creator.profilePhoto,
      bio: creator.bio,
      coverPhoto: creator.coverPhoto,
      introVideo: creator.introVideo,
      themeColor: creator.themeColor,
      socialLinks: creator.socialLinks,
      isFollowing: creator.isFollowing,
      followersCount: parseInt(creator.followersCount) || 0,
    }));
  }

  public async GetCreatorById(creatorId: string, currentUserId?: string): Promise<UserModels.CreatorProfile | null> {
    Logger.info('UserService.GetCreatorById', { creatorId, currentUserId });

    const creator = await this.db.v1.User.GetCreatorByIdWithFollowStatus(creatorId, currentUserId);

    if (!creator || !creator.pageName) {
      throw new BadRequest('Creator not found');
    }

    return {
      pageName: creator.pageName,
      creatorName: creator.creatorName!,
      is18Plus: creator.is18Plus || false,
      profilePhoto: creator.profilePhoto,
      bio: creator.bio,
      coverPhoto: creator.coverPhoto,
      introVideo: creator.introVideo,
      themeColor: creator.themeColor,
      socialLinks: creator.socialLinks,
      isFollowing: creator.isFollowing,
      followersCount: parseInt(creator.followersCount) || 0,
    };
  }

  public async ToggleFollowCreator(userId: string, followerId: string): Promise<{ action: 'followed' | 'unfollowed'; isFollowing: boolean }> {
    Logger.info('UserService.ToggleFollowCreator', { userId, followerId });

    // Check if the user to follow exists and is a creator
    const creator = await this.db.v1.User.GetUser({ id: userId });
    if (!creator || !creator.pageName) {
      throw new BadRequest('Creator not found');
    }

    // Cannot follow yourself
    if (userId === followerId) {
      throw new BadRequest('Cannot follow yourself');
    }

    return await this.db.v1.User.ToggleFollowUser(userId, followerId);
  }
}
