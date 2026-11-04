import { Router } from 'express';
import { handleAiQuery, getProjectAiAudit } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/chat', handleAiQuery);
router.get('/audit/:projectId', getProjectAiAudit);

export default router;

