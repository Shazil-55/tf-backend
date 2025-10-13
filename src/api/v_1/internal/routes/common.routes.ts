import * as express from 'express';
import { CommonController } from '../controller/common.controller';

const router = express.Router();
const commonController = new CommonController();

// Health status route
router.get('/status', commonController.getHealthStatus);
router.get('/categories', commonController.getCategories);

// File upload route
router.post('/upload-file', commonController.uploadFile);

// Convert to base64 route
router.post('/convert-to-base64', commonController.convertToBase64);

export { router as commonRoutes };
