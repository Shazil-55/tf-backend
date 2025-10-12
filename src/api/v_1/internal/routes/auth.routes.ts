import * as express from 'express';
import { AuthController } from '../controller/auth.controller';

const router = express.Router();
const authController = new AuthController();

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.sendEmail); // Alias for send-email for forgot password
router.post('/reset-password', authController.resetPassword);
// router.get('/google/url', authController.getGoogleAuthUrl);
// router.get('/google/callback', authController.googleCallback);
router.post('/login/refresh-token', authController.refreshToken);
router.post('/admin/login', authController.adminLogin);

export { router as authRoutes };
