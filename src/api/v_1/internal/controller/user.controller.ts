import * as express from 'express';
import { Response, Request } from 'express';
import { Db } from '../../../../database/db';
import { Logger } from '../../../../helpers/logger';
import { genericError, RequestBody, RequestQuery } from '../../../../helpers/utils';
import { UserService } from '../services/user.service';
import { Entities, Hash } from '../../../../helpers';
import { jwtAuth } from '../middlewares/api-auth';
import * as UserModel from '../models/user.model';

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
}
