import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

router.post('/login', authController.login.bind(authController));
router.post('/logout', authMiddleware.authenticate, authController.logout.bind(authController));

router.get('/me', authMiddleware.authenticate, authController.me.bind(authController));

router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.get('/validate-reset-token/:token', authController.validateResetToken.bind(authController));

export default router;