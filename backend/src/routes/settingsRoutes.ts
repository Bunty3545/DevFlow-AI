import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleCheck';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/', authorizeRoles('admin', 'officer'), updateSettings);

export default router;

