/* eslint-disable @typescript-eslint/no-explicit-any */
//
import { Knex } from 'knex';
import { Entities } from '../../../helpers';
import { AppError } from '../../../helpers/errors';
import { Logger } from '../../../helpers/logger';
import * as UserModel from '../../../api/v_1/internal/models/auth.model';
import { DatabaseErrors } from '../../../helpers/contants';

export class UserDatabase {
  private logger: typeof Logger;

  private GetKnex: () => Knex;

  private RunQuery: (query: Knex.QueryBuilder) => Promise<{ res?: any[]; err: any }>;

  public constructor(args: {
    GetKnex: () => Knex;
    RunQuery: (query: Knex.QueryBuilder) => Promise<{ res?: any[]; err: any }>;
  }) {
    this.logger = Logger;
    this.GetKnex = args.GetKnex;
    this.RunQuery = args.RunQuery;
  }

  async CreateUser(user: Partial<Entities.User>): Promise<string> {
    this.logger.info('Db.CreateUser', { user });

    const knexdb = this.GetKnex();

    const query = knexdb('users').insert(user, 'id');

    const { res, err } = await this.RunQuery(query);

    if (err) {
      if (err.code === DatabaseErrors.DUPLICATE) {
        this.logger.error('Db.CreateUser failed due to duplicate key', err);

        throw new AppError(400, 'User with same email already exist');
      }
      throw new AppError(400, 'User not created');
    }

    if (!res || res.length !== 1) {
      this.logger.info('Db.CreateUser User not created', err);

      throw new AppError(400, `User not created `);
    }

    const { id } = res[0];
    return id;
  }

  async GetUserByEmail(email: string): Promise<Entities.User | null> {
    this.logger.info('Db.GetUserByEmail', { email });

    const knexdb = this.GetKnex();

    const query = knexdb('users').where({ email });

    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetUserByEmail failed', err);

      throw new AppError(400, 'User not found');
    }

    if (!res) {
      this.logger.info('Db.GetUser User not found', err);

      return null;
    }

    return res[0];
  }

  async GetUser(where: Partial<Entities.User>): Promise<Entities.User | null> {
    this.logger.info('Db.GetUser', { where });

    const knexdb = this.GetKnex();

    const query = knexdb('users').where(where);

    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetUserByEmail failed', err);

      throw new AppError(400, 'User not found');
    }

    if (!res) {
      this.logger.info('Db.GetUserByEmail User not found', err);

      return null;
    }
    return res[0];
  }

  async UpdateUser(userId: string, updateData: Partial<Entities.User>): Promise<Entities.User | null> {
    this.logger.info('Db.UpdateUser', { userId, updateData });

    const knexdb = this.GetKnex();

    const query = knexdb('users').where({ id: userId }).update(updateData).returning('*');

    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.UpdateUser failed', err);
      throw new AppError(400, 'User update failed');
    }

    if (!res || res.length !== 1) {
      this.logger.info('Db.UpdateUser User not found or not updated', err);
      return null;
    }

    return res[0];
  }

  async GetAllCreators(): Promise<Entities.User[]> {
    this.logger.info('Db.GetAllCreators');

    const knexdb = this.GetKnex();

    const query = knexdb('users').whereNotNull('pageName');

    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetAllCreators failed', err);
      throw new AppError(400, 'Failed to fetch creators');
    }

    if (!res) {
      this.logger.info('Db.GetAllCreators No creators found');
      return [];
    }

    return res;
  }

  async GetAllCreatorsWithFollowStatus(currentUserId?: string): Promise<any[]> {
    this.logger.info('Db.GetAllCreatorsWithFollowStatus', { currentUserId });

    const knexdb = this.GetKnex();

    const query = knexdb('users')
      .select([
        'users.*',
        knexdb.raw('COUNT(followers.id) as followersCount'),
        knexdb.raw(`
          bool_or(user_follows.id IS NOT NULL) as isFollowing
        `)
      ])
      .leftJoin('followers', 'users.id', 'followers.userId')
      .leftJoin('followers as user_follows', function () {
        this.on('users.id', '=', 'user_follows.userId')
            .andOn('user_follows.followerId', '=', knexdb.raw('?', [currentUserId]));
      })
      .whereNotNull('users.pageName')
      // .andWhereNot('users.id', knexdb.raw('?', [currentUserId]))
      .groupBy('users.id');



    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetAllCreatorsWithFollowStatus failed', err);
      throw new AppError(400, 'Failed to fetch creators');
    }

    if (!res) {
      this.logger.info('Db.GetAllCreatorsWithFollowStatus No creators found');
      return [];
    }

    

    return res;
  }

  async GetCreatorByIdWithFollowStatus(creatorId: string, currentUserId?: string): Promise<any> {
    this.logger.info('Db.GetCreatorByIdWithFollowStatus', { creatorId, currentUserId });

    const knexdb = this.GetKnex();

    const query = knexdb('users')
    .select([
      'users.*',
      knexdb.raw('COUNT(followers.id) as followersCount'),
      knexdb.raw(`
        bool_or(user_follows.id IS NOT NULL) as isFollowing
      `)
    ])
    .leftJoin('followers', 'users.id', 'followers.userId')
    .leftJoin('followers as user_follows', function () {
      this.on('users.id', '=', 'user_follows.userId')
          .andOn('user_follows.followerId', '=', knexdb.raw('?', [currentUserId]));
    })
    .where('users.id', creatorId)
    .whereNotNull('users.pageName')
    .groupBy('users.id')
    .first()

    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetCreatorByIdWithFollowStatus failed', err);
      throw new AppError(400, 'Failed to fetch creator');
    }

    Logger.info('Db.GetCreatorByIdWithFollowStatus res', { res });

    return res;
  }

  async GetCreatorByPageNameWithFollowStatus(pageName: string, currentUserId?: string): Promise<any> {
    this.logger.info('Db.GetCreatorByPageNameWithFollowStatus', { pageName, currentUserId });

    const knexdb = this.GetKnex();

    const query = knexdb('users')
    .select([
      'users.*',
      knexdb.raw('COUNT(followers.id) as followersCount'),
      knexdb.raw(`
        bool_or(user_follows.id IS NOT NULL) as isFollowing
      `)
    ])
    .leftJoin('followers', 'users.id', 'followers.userId')
    .leftJoin('followers as user_follows', function () {
      this.on('users.id', '=', 'user_follows.userId')
          .andOn('user_follows.followerId', '=', knexdb.raw('?', [currentUserId]));
    })
    .where('users.pageName', pageName)
    .whereNotNull('users.pageName')
    .groupBy('users.id')
    .first()

    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetCreatorByPageNameWithFollowStatus failed', err);
      throw new AppError(400, 'Failed to fetch creator');
    }

    Logger.info('Db.GetCreatorByPageNameWithFollowStatus res', { res });

    return res;
  }

  async ToggleFollowUser(userId: string, followerId: string): Promise<{ action: 'followed' | 'unfollowed'; isFollowing: boolean }> {
    this.logger.info('Db.ToggleFollowUser', { userId, followerId });

    const knexdb = this.GetKnex();

    // Check if already following
    const existingFollow = await knexdb('followers')
      .where({ userId, followerId })
      .first();

    if (existingFollow) {
      // Unfollow
      await knexdb('followers')
        .where({ userId, followerId })
        .del();
      
      return { action: 'unfollowed', isFollowing: false };
    } else {
      // Follow
      await knexdb('followers')
        .insert({ userId, followerId });
      
      return { action: 'followed', isFollowing: true };
    }
  }

  async GetCategories(): Promise<Entities.Category[]> {
    this.logger.info('Db.GetCategories');

    const knexdb = this.GetKnex();

    const query = knexdb('categories');

    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetCategories failed', err);
      throw new AppError(400, 'Failed to fetch categories');
    }

    if (!res) {
      this.logger.info('Db.GetCategories No categories found');
      return [];
    }

    return res;
  }

  async AddCategories(categories: Entities.Category[]): Promise<void> {
    this.logger.info('Db.AddCategories', { categories });

    const knexdb = this.GetKnex();

    await knexdb('categories').insert(categories);

    this.logger.info('Db.AddCategories completed');
    return;
  }
  
  // Posts
  async CreatePost(
    post: Partial<Entities.Post>,
    mediaFiles?: Array<Partial<Entities.PostMediaFile>>,
  ): Promise<string> {
    this.logger.info('Db.CreatePost', { post });
    const knexdb = this.GetKnex();

    return await knexdb.transaction(async (trx) => {
      const insertPost = trx('posts').insert(post, 'id');
      const { res: postRes, err: postErr } = await this.RunQuery(insertPost);
      if (postErr || !postRes || postRes.length !== 1) {
        throw new AppError(400, 'Post not created');
      }
      const { id: postId } = postRes[0];

      if (mediaFiles && mediaFiles.length > 0) {
        const rows = mediaFiles.map((m) => ({ ...m, postId }));
        const insertMedia = trx('postsMediaFiles').insert(rows);
        const { err: mediaErr } = await this.RunQuery(insertMedia);
        if (mediaErr) throw new AppError(400, 'Post media not created');
      }

      return postId as string;
    });
  }

  async ReplacePostMedia(postId: string, mediaFiles: Array<Partial<Entities.PostMediaFile>>): Promise<void> {
    const knexdb = this.GetKnex();
    await knexdb.transaction(async (trx) => {
      await trx('postsMediaFiles').where({ postId }).del();
      if (mediaFiles.length > 0) {
        const rows = mediaFiles.map((m) => ({ ...m, postId }));
        await trx('postsMediaFiles').insert(rows);
      }
    });
  }

  async UpdatePost(postId: string, updateData: Partial<Entities.Post>): Promise<Entities.Post | null> {
    this.logger.info('Db.UpdatePost', { postId, updateData });
    const knexdb = this.GetKnex();
    const query = knexdb('posts').where({ id: postId }).update(updateData).returning('*');
    const { res, err } = await this.RunQuery(query);
    if (err) throw new AppError(400, 'Post update failed');
    if (!res || res.length !== 1) return null;
    return res[0] as Entities.Post;
  }

  async DeletePost(postId: string): Promise<void> {
    this.logger.info('Db.DeletePost', { postId });
    const knexdb = this.GetKnex();
    const query = knexdb('posts').where({ id: postId }).del();
    const { err } = await this.RunQuery(query);
    if (err) throw new AppError(400, 'Post delete failed');
  }

  async GetPostById(postId: string): Promise<any | null> {
    const knexdb = this.GetKnex();
    const postQuery = knexdb('posts').where({ id: postId }).first();
    const { res: postRes, err: postErr } = await this.RunQuery(postQuery);
    if (postErr) throw new AppError(400, 'Failed to fetch post');
    if (!postRes || postRes.length === 0) return null;
    const post = postRes[0];

    const mediaQuery = knexdb('postsMediaFiles').where({ postId });
    const { res: mediaRes, err: mediaErr } = await this.RunQuery(mediaQuery);
    if (mediaErr) throw new AppError(400, 'Failed to fetch post media');

    return { ...post, mediaFiles: mediaRes ?? [] };
  }

  public async GetAllPostsByFollowedCreator(userId: string): Promise<any[]> {
    const knexdb = this.GetKnex();
  
    const query = knexdb('posts')
      .leftJoin('postComments', 'posts.id', 'postComments.postId')
      .innerJoin('followers', 'posts.creatorId', 'followers.userId') // userId = creator
      .where('followers.followerId', userId) // followerId = viewer
      .where('posts.accessType', 'free')
      .select(
        'posts.*',
        'followers.followerId',
        'postComments.comment'
      )
      .orderBy('posts.createdAt', 'desc');
  
    const { res, err } = await this.RunQuery(query);
    if (err) throw new AppError(400, 'Failed to fetch posts');
    return res ?? [];
  }

  // Membership CRUD methods
  async CreateMembership(membership: Partial<Entities.Membership>): Promise<string> {
    this.logger.info('Db.CreateMembership', { membership });

    const knexdb = this.GetKnex();
    const query = knexdb('memberships').insert(membership, 'id');
    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.CreateMembership failed', err);
      throw new AppError(400, 'Membership not created');
    }

    if (!res || res.length !== 1) {
      this.logger.info('Db.CreateMembership Membership not created', err);
      throw new AppError(400, 'Membership not created');
    }

    const { id } = res[0];
    return id;
  }

  async GetMembershipById(membershipId: string): Promise<Entities.Membership | null> {
    this.logger.info('Db.GetMembershipById', { membershipId });

    const knexdb = this.GetKnex();
    const query = knexdb('memberships').where({ id: membershipId });
    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetMembershipById failed', err);
      throw new AppError(400, 'Failed to fetch membership');
    }

    if (!res || res.length === 0) {
      return null;
    }

    return res[0];
  }

  async GetMembershipsByCreator(creatorId: string): Promise<Entities.Membership[]> {
    this.logger.info('Db.GetMembershipsByCreator', { creatorId });

    const knexdb = this.GetKnex();
    const query = knexdb('memberships').where({ creatorId }).orderBy('createdAt', 'desc');
    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.GetMembershipsByCreator failed', err);
      throw new AppError(400, 'Failed to fetch memberships');
    }

    return res ?? [];
  }

  async UpdateMembership(membershipId: string, updateData: Partial<Entities.Membership>): Promise<Entities.Membership | null> {
    this.logger.info('Db.UpdateMembership', { membershipId, updateData });

    const knexdb = this.GetKnex();
    const query = knexdb('memberships').where({ id: membershipId }).update(updateData).returning('*');
    const { res, err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.UpdateMembership failed', err);
      throw new AppError(400, 'Membership update failed');
    }

    if (!res || res.length !== 1) {
      this.logger.info('Db.UpdateMembership Membership not found or not updated', err);
      return null;
    }

    return res[0];
  }

  async DeleteMembership(membershipId: string): Promise<void> {
    this.logger.info('Db.DeleteMembership', { membershipId });

    const knexdb = this.GetKnex();
    const query = knexdb('memberships').where({ id: membershipId }).del();
    const { err } = await this.RunQuery(query);

    if (err) {
      this.logger.error('Db.DeleteMembership failed', err);
      throw new AppError(400, 'Membership delete failed');
    }
  }
}
