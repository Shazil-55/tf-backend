import { Db } from '../../../../database/db';
import { AppError, BadRequest } from '../../../../helpers/errors';
import { Logger } from '../../../../helpers/logger';
import { Entities, Hash } from '../../../../helpers';
import * as PostModel from '../models/post.model';
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
        tags: user.tags,
        categoryId: user.categoryId,
      };
    }

    return response;
  }

  public async UpdateUser(userId: string, updateData: Partial<User>): Promise<void> {
    Logger.info('UserService.UpdateUser', { userId, updateData });

    const {socialLinks} = updateData;
    if (socialLinks) {
      updateData.socialLinks = JSON.stringify(socialLinks);
    }

    const updatedUser = await this.db.v1.User.UpdateUser(userId, updateData);

    if (!updatedUser) throw new BadRequest('User not found or update failed');

  }

  public async GetAllCreators(currentUserId?: string): Promise<UserModels.CreatorProfile[] |any > {
    Logger.info('UserService.GetAllCreators', { currentUserId });

    const creators = await this.db.v1.User.GetAllCreatorsWithFollowStatus(currentUserId);

    if (!creators) return [];

    return creators.map((creator: any) => ({
      id: creator.id,
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
      tags: creator.tags || ['music', 'videos', 'entertainment'],
      category: creator.category || 'music',
      subscribersCount: parseInt(creator.subscribersCount) || 17,
    }));
  }

  public async GetCreatorById(creatorId: string, currentUserId?: string): Promise<UserModels.CreatorProfile | null | any> {
    Logger.info('UserService.GetCreatorById', { creatorId, currentUserId });

    const creator = await this.db.v1.User.GetCreatorByIdWithFollowStatus(creatorId, currentUserId);

    return {
      id: creator.id,
      pageName: creator.pageName,
      creatorName: creator.creatorName,
      is18Plus: creator.is18Plus || false,
      profilePhoto: creator.profilePhoto,
      bio: creator.bio,
      coverPhoto: creator.coverPhoto,
      introVideo: creator.introVideo,
      themeColor: creator.themeColor,
      socialLinks: creator.socialLinks,
      tags: creator.tags,
      categoryId: creator.categoryId,
      isFollowing: creator.isfollowing,
      createdAt: creator.createdAt,
      updatedAt: creator.updatedAt,
      followersCount: parseInt(creator.followersCount) || 0,
      subscribersCount: parseInt(creator.subscribersCount) || 17,
      category: creator.category || 'music',
      totalPosts: parseInt(creator.totalPosts) || 0,
      memberships:[
        {
          id: '1',
          name: 'Free',
          price: 0,
          currency: 'NGN',
        },
        {
          id: '2',
          name: 'Subscription',
          price: 9.99,
          currency: 'NGN',
        },
      ],
      recentPosts: [
        {
          id:  '1',
          title:  'Title 1',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '2',
          title: 'Title 2',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
        {
          id:  '3',
          title:  'Title 3',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '4',
          title: 'Title 4',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
      
      ],
      exploreOthers: [
        {
          id:  '1',
          title:  'Title 1',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '2',
          title: 'Title 2',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
        {
          id:  '3',
          title:  'Title 3',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '4',
          title: 'Title 4',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
      
      ]
    }
  }

  public async GetCreatorByPageName(pageName: string, currentUserId?: string): Promise<UserModels.CreatorProfile | null | any> {
    Logger.info('UserService.GetCreatorByPageName', { pageName, currentUserId });

    const creator = await this.db.v1.User.GetCreatorByPageNameWithFollowStatus(pageName, currentUserId);

    if (!creator) {
      throw new BadRequest('Creator not found');
    }

    return {
      id: creator.id,
      pageName: creator.pageName,
      creatorName: creator.creatorName,
      is18Plus: creator.is18Plus || false,
      profilePhoto: creator.profilePhoto,
      bio: creator.bio,
      coverPhoto: creator.coverPhoto,
      introVideo: creator.introVideo,
      themeColor: creator.themeColor,
      socialLinks: creator.socialLinks,
      tags: creator.tags,
      categoryId: creator.categoryId,
      isFollowing: creator.isFollowing,
      createdAt: creator.createdAt,
      updatedAt: creator.updatedAt,
      followersCount: parseInt(creator.followersCount) || 0,
      subscribersCount: parseInt(creator.subscribersCount) || 17,
      category: creator.category || 'music',
      totalPosts: parseInt(creator.totalPosts) || 0,
      memberships:[
        {
          id: '1',
          name: 'Free',
          price: 0,
          currency: 'NGN',
        },
        {
          id: '2',
          name: 'Subscription',
          price: 9.99,
          currency: 'NGN',
        },
      ],
      recentPosts: [
        {
          id:  '1',
          title:  'Title 1',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '2',
          title: 'Title 2',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
        {
          id:  '3',
          title:  'Title 3',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '4',
          title: 'Title 4',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
      
      ],
      exploreOthers: [
        {
          id:  '1',
          title:  'Title 1',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '2',
          title: 'Title 2',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
        {
          id:  '3',
          title:  'Title 3',
          createdAt: new Date().toISOString(),
          public:  true,
          totalLikes:  10,
          totalComments: 10,
        },
        {
          id: '4',
          title: 'Title 4',
          public:  false,
          createdAt:  new Date().toISOString(),
          totalLikes:  15,
          totalComments:  15,
        },
      
      ]
    }
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

  // Posts CRUD
  public async CreatePost(creatorId: string, body: PostModel.CreatePostBody): Promise<string> {
    Logger.info('UserService.CreatePost', { creatorId, body: { ...body, content: '[omitted]' } });
    const post: Partial<Entities.Post> = {
      creatorId,
      title: body.title,
      content: body.content,
      accessType: body.accessType ?? 'free',
      tags: body.tags,
    };
    const mediaFiles = body.mediaFiles?.map((m) => ({
      type: m.type,
      url: m.url,
      name: m.name,
      size: m.size,
    }));
    const id = await this.db.v1.User.CreatePost(post, mediaFiles);
    return id;
  }

  public async UpdatePost(postId: string, body: PostModel.UpdatePostBody): Promise<Entities.Post | null> {
    Logger.info('UserService.UpdatePost', { postId, body: { ...body, content: '[omitted]' } });
    const updated = await this.db.v1.User.UpdatePost(postId, body as Partial<Entities.Post>);
    if (body.mediaFiles) {
      const mediaFiles = body.mediaFiles.map((m) => ({ type: m.type, url: m.url, name: m.name, size: m.size }));
      await this.db.v1.User.ReplacePostMedia(postId, mediaFiles);
    }
    return updated;
  }

  public async DeletePost(postId: string): Promise<void> {
    Logger.info('UserService.DeletePost', { postId });
    await this.db.v1.User.DeletePost(postId);
  }

  public async GetAllPosts(creatorId: string): Promise<PostModel.PostListItem[]> {
    Logger.info('UserService.GetAllPosts', { creatorId });
    const rows = await this.db.v1.User.GetAllPostsByCreator(creatorId);
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      createdAt: r.createdAt,
      public: (r.accessType || 'free') === 'free',
      totalLikes: parseInt(r.totalLikes) || 0,
      totalComments: parseInt(r.totalComments) || 0,
    }));
  }

  public async GetPostById(postId: string): Promise<PostModel.PostDetail | null> {
    Logger.info('UserService.GetPostById', { postId });
    const row = await this.db.v1.User.GetPostById(postId);
    if (!row) return null;
    return {
      id: row.id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      creatorId: row.creatorId,
      title: row.title,
      content: row.content,
      accessType: row.accessType,
      tags: row.tags,
      totalLikes: parseInt(row.totalLikes) || 0,
      mediaFiles: (row.mediaFiles || []).map((m: any) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        name: m.name,
        size: m.size,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    };
  }
}
