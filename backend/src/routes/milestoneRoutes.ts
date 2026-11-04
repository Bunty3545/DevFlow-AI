import { Router } from 'express';
import { getMilestones, createMilestone, updateMilestone } from '../controllers/milestoneController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleCheck';

const router = Router();

router.use(authenticate);

router.get('/', getMilestones);
router.post('/', authorizeRoles('admin', 'manager'), createMilestone);
router.put('/:id', authorizeRoles('admin', 'manager', 'officer'), updateMilestone);

export default router;

