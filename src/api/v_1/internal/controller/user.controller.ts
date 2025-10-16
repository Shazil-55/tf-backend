import * as express from 'express';
import { Response, Request } from 'express';
import { Db } from '../../../../database/db';
import { Logger } from '../../../../helpers/logger';
import { genericError, RequestBody, RequestQuery } from '../../../../helpers/utils';
import { UserService } from '../services/user.service';
import { Entities, Hash } from '../../../../helpers';
import { jwtAuth } from '../middlewares/api-auth';
import * as UserModel from '../models/user.model';
import * as PostModel from '../models/post.model';

export class UserController {
  constructor() {
    Logger.info('User controller initialized...');
  }

  // Get current user handler
  public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const userId = req.userId;
      const response = await service.GetUserById(userId);

      body = {
        data: response,
      };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  // Update user handler
  public updateUser = async (req: RequestBody<UserModel.UpdateUserBody>, res: Response): Promise<void> => {
    let body;
    try {
      await UserModel.UpdateUserBodySchema.parseAsync(req.body);
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const userId = req.userId;
      const response = await service.UpdateUser(userId, req.body);

      body = {
        data: response,
      };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  // Get all creators handler
  public getAllCreators = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const currentUserId = req.userId; // From JWT auth middleware
      const response = await service.GetAllCreators(currentUserId);

      body = {
        data: response,
      };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  // Get creator by ID handler
  public getCreatorById = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const creatorId = req.params.id;
      const currentUserId = req.userId; // From JWT auth middleware
      const response = await service.GetCreatorById(creatorId, currentUserId);

      body = {
        data: response,
      };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  // Get creator by pageName handler
  public getCreatorByPageName = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const pageName = req.params.pageName;
      const currentUserId = req.userId; // From JWT auth middleware
      const response = await service.GetCreatorByPageName(pageName, currentUserId);

      body = {
        data: response,
      };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  // Toggle follow creator handler
  public toggleFollowCreator = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const creatorId = req.params.id;
      const followerId = req.userId; // From JWT auth middleware
      
      const result = await service.ToggleFollowCreator(creatorId, followerId);

      body = {
        message: `Successfully ${result.action} creator`,
        data: {
          action: result.action,
          isFollowing: result.isFollowing,
        },
      };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  // Posts
  public createPost = async (req: RequestBody<PostModel.CreatePostBody>, res: Response): Promise<void> => {
    let body;
    try {
      await PostModel.CreatePostBodySchema.parseAsync(req.body);
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const creatorId = req.userId;
      const id = await service.CreatePost(creatorId, req.body);

      body = { data: { id } };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public updatePost = async (req: RequestBody<PostModel.UpdatePostBody>, res: Response): Promise<void> => {
    let body;
    try {
      await PostModel.UpdatePostBodySchema.parseAsync(req.body);
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const postId = req.params.id;
      const row = await service.UpdatePost(postId, req.body);
      body = { data: row };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public deletePost = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const postId = req.params.id;
      await service.DeletePost(postId);
      body = { message: 'Post deleted' };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public getAllPosts = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const userId = req.userId;
      const rows = await service.GetAllPosts(userId);
      body = { data: rows };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public getPostById = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const postId = req.params.id;
      const row = await service.GetPostById(postId, req.userId);
      body = { data: row };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  // Membership CRUD handlers
  public createMembership = async (req: RequestBody<UserModel.CreateMembershipBody>, res: Response): Promise<void> => {
    let body;
    try {
      await UserModel.CreateMembershipBodySchema.parseAsync(req.body);
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const creatorId = req.userId;
      const id = await service.CreateMembership(creatorId, req.body);

      body = { data: { id } };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public getMemberships = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const creatorId = req.userId;
      const memberships = await service.GetMembershipsByCreator(creatorId);
      body = { data: memberships };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public getMembershipById = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const membershipId = req.params.id;
      const membership = await service.GetMembershipById(membershipId);
      body = { data: membership };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public updateMembership = async (req: RequestBody<UserModel.UpdateMembershipBody>, res: Response): Promise<void> => {
    let body;
    try {
      await UserModel.UpdateMembershipBodySchema.parseAsync(req.body);
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const membershipId = req.params.id;
      const creatorId = req.userId;
      const membership = await service.UpdateMembership(membershipId, creatorId, req.body);
      body = { data: membership };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };

  public deleteMembership = async (req: Request, res: Response): Promise<void> => {
    let body;
    try {
      const db = res.locals.db as Db;
      const service = new UserService({ db });
      const membershipId = req.params.id;
      const creatorId = req.userId;
      await service.DeleteMembership(membershipId, creatorId);
      body = { message: 'Membership deleted successfully' };
    } catch (error) {
      genericError(error, res);
    }
    res.json(body);
  };
}
