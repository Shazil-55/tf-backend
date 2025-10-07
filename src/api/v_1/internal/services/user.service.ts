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

  public async GetUserById(userId: string): Promise<Omit<User, 'password'>> {
    Logger.info('UserService.GetUserById', { userId });

    const user = await this.db.v1.User.GetUser({ id: userId });

    if (!user) throw new BadRequest('User not found');
    delete user.password;
    return user;
  }

  public async UpdateUser(userId: string, updateData: Partial<User>): Promise<Omit<User, 'password'>> {
    Logger.info('UserService.UpdateUser', { userId, updateData });

    const updatedUser = await this.db.v1.User.UpdateUser(userId, updateData);

    if (!updatedUser) throw new BadRequest('User not found or update failed');

    delete updatedUser.password;
    return updatedUser;
  }
}
