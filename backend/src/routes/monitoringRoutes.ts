import { Router } from 'express';
import {
  getMonitoringDossier,
  submitProgressUpdate,
  reviewProgressUpdate
} from '../controllers/monitoringController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleCheck';

const router = Router();

router.use(authenticate);

router.get('/:projectId', getMonitoringDossier);
router.post('/:projectId/updates', authorizeRoles('agency', 'manager', 'admin'), submitProgressUpdate);
router.put('/updates/:updateId/review', authorizeRoles('officer', 'admin'), reviewProgressUpdate);

export default router;

