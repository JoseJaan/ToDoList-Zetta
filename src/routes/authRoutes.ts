import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

router.post('/login', authController.login.bind(authController));

router.post('/logout', authMiddleware.authenticate, authController.logout.bind(authController));

router.get('/me', authMiddleware.authenticate, authController.me.bind(authController));

export default router;