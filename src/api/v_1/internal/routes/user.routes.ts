import * as express from 'express';
import { UserController } from '../controller/user.controller';
import { jwtAuth } from '../middlewares/api-auth';

const router = express.Router();
const userController = new UserController();

// User routes
router.use(jwtAuth);

router.get('/', userController.getCurrentUser);
router.put('/', userController.updateUser);

export { router as userRoutes };
