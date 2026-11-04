import { Router } from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleCheck';

const router = Router();

router.use(authenticate);

// Admin-only user management routes
router.get('/', authorizeRoles('admin'), getAllUsers);
router.put('/:userId', authorizeRoles('admin'), updateUserRole);
router.delete('/:userId', authorizeRoles('admin'), deleteUser);

export default router;

