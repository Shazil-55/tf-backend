import * as express from 'express';
import { UserController } from '../controller/user.controller';
import { jwtAuth } from '../middlewares/api-auth';

const router = express.Router();
const userController = new UserController();

// User routes
router.use(jwtAuth);

router.get('/', userController.getCurrentUser);
router.put('/', userController.updateUser);

// Creator routes
router.get('/creators', userController.getAllCreators);
router.get('/creator/:id', userController.getCreatorById);

// Toggle Follow/Unfollow route
router.post('/creators/:id/follow', userController.toggleFollowCreator);

export { router as userRoutes };
