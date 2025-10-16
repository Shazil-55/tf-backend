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
router.get('/creator/page/:pageName', userController.getCreatorByPageName);

// Toggle Follow/Unfollow route
router.post('/creators/:id/follow', userController.toggleFollowCreator);

// Posts CRUD
router.post('/posts', userController.createPost);
router.get('/posts', userController.getAllPosts);
router.get('/posts/:id', userController.getPostById);
router.put('/posts/:id', userController.updatePost);
router.delete('/posts/:id', userController.deletePost);

// Membership CRUD
router.post('/memberships', userController.createMembership);
router.get('/memberships', userController.getMemberships);
router.get('/memberships/:id', userController.getMembershipById);
router.put('/memberships/:id', userController.updateMembership);
router.delete('/memberships/:id', userController.deleteMembership);

export { router as userRoutes };
