import { Router } from 'express';
import userRoutes from './userRoutes'
import taskRoutes from './taskRoutes'

const router = Router()

//router.use('/tasks',taskRoutes)
router.use('/users',userRoutes)

export default router;