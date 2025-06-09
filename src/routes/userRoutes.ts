import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { TaskController } from '../controllers/taskController';
import upload from '../config/multer';

const router = Router();
const userController = new UserController();
const taskController = new TaskController();

router.post(
  '/',
  upload.single('profileImage'),
  userController.create.bind(userController)
);
router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.put('/:id', userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

router.post('/:id/profile-image', 
  upload.single('profileImage'), 
  userController.uploadProfileImage.bind(userController)
);

export default router;