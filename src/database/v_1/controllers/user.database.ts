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
  }
