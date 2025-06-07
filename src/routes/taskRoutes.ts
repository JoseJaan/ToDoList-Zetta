import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = Router();
const taskController = new TaskController();
const authMiddleware = new AuthMiddleware();

router.post('/', authMiddleware.authenticate, taskController.create.bind(taskController));
router.get('/', authMiddleware.authenticate, taskController.getAll.bind(taskController));
router.get('/:id', authMiddleware.authenticate, taskController.getById.bind(taskController));
router.put('/:id', authMiddleware.authenticate, taskController.update.bind(taskController));
router.delete('/:id', authMiddleware.authenticate, taskController.delete.bind(taskController));



export default router;