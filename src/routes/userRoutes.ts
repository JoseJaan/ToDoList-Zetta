import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

router.post('/users', userController.create.bind(userController));
router.get('/users', userController.getAll.bind(userController));
router.get('/users/:id', userController.getById.bind(userController));
router.put('/users/:id', userController.update.bind(userController));
router.delete('/users/:id', userController.delete.bind(userController));

export default router;