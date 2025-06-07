import { Router } from 'express';
import userRoutes from './userRoutes'
import taskRoutes from './taskRoutes'
import authRoutes from './authRoutes'

const router = Router()

router.use('/tasks',taskRoutes)
router.use('/users',userRoutes)
router.use('/auth',authRoutes)

export default router;